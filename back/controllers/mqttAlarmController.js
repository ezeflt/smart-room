require("dotenv").config();
const nodemailer = require('nodemailer');
const Sensor = require("../models/sensor.js");
const SensorDetection = require("../models/sensordetection.js");
const Alarme = require("../models/alarm.js");
const { setLastAlarmUser } = require('./alarmUserStore');
const RoomSensor = require("../models/roomsensor.js");
const UserSensor = require("../models/usersensor.js");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS, // mot de passe d'application Google (NE PAS LOGGER)
    },
});
const Sensor = require("../models/sensor.js");
const { connectdb } = require("./mqttInsertController.js");
const SensorDetection = require("../models/sensordetection.js");
const Alarme = require("../models/alarm.js"); // À créer si non existant
const { setLastAlarmUser, getLastAlarmUser } = require('./alarmUserStore');
const mongoURL = process.env.MONGO_URL;
const RoomSensor = require("../models/roomsensor.js");
const Room = require("../models/room.js");
const UserSensor = require("../models/usersensor.js");
const User = require("../models/user.js");

// utilitaires de log avec timestamp
const log = (...args) => console.log(new Date().toISOString(), '[INFO]', ...args);
const errorLog = (...args) => console.error(new Date().toISOString(), '[ERROR]', ...args);

log('Fichier sensor controller chargé.');
log('Présence de MONGO_URL :', !!mongoURL);

// Connexion DB : gère sync/async selon l'implémentation de connectdb
try {
    log('Tentative d\'appel de connectdb()...');
    const maybePromise = connectdb();
    if (maybePromise && typeof maybePromise.then === 'function') {
        log('connectdb() a retourné une promesse — on surveille sa résolution.');
        maybePromise
            .then(() => log('connectdb() résolue : connexion DB établie.'))
            .catch(err => errorLog('connectdb() rejetée :', err));
    } else {
        log('connectdb() exécutée (retour non-promesse présumé).');
    }
} catch (err) {
    errorLog('connectdb() a throw une erreur synchronisée :', err);
}

/**
 * Insert state flow:
 * - log entrée
 * - map state -> stateValue/actionValue
 * - check room association et alarme active
 * - create Sensor
 * - create SensorDetection
 * - si trigger -> récupérer users, formatter date, préparer mail, envoyer mail
 */
async function insertSensorState(sensorData) {
    log('insertSensorState appelé.');
    try {
        if (!sensorData) {
            errorLog('insertSensorState: sensorData manquant!');
            return;
        }
        const source = sensorData.source_address;
        const incomingState = sensorData.data && sensorData.data.state;
        log('Données reçues:', { source, incomingState });

        let stateValue;
        let actionValue;

        if (incomingState === "stop-moving") {
            stateValue = 0;
            actionValue = 'untrigger';
        } else if (incomingState === "start-moving" || incomingState === "moving") {
            stateValue = 1;
            actionValue = 'trigger';
        } else {
            log("État du capteur non reconnu :", incomingState, "pour source :", source);
            return;
        }
        log(`État mappé -> stateValue: ${stateValue}, actionValue: ${actionValue}`);

        // Vérifier l'état de l'alarme pour la salle du capteur
        log(`Recherche de RoomSensor pour sensor_id=${source}...`);
        const roomSensorForCheck = await RoomSensor.findOne({ sensor_id: source });
        log('Résultat RoomSensor.findOne:', roomSensorForCheck ? `trouvé (room_id=${roomSensorForCheck.room_id})` : 'aucun lien trouvé');

        const roomIdForCheck = roomSensorForCheck ? roomSensorForCheck.room_id : null;
        if (!roomIdForCheck) {
            log(`Insertion bloquée : impossible d'identifier la salle pour le capteur ${source}.`);
            return;
        }

        log(`Recherche de la dernière alarme pour room_id=${roomIdForCheck}...`);
        const lastRoomAlarm = await Alarme.findOne({ room_id: roomIdForCheck }).sort({ timestamp: -1 });
        log('Résultat Alarme.findOne (dernière):', lastRoomAlarm ? `trouvée (action=${lastRoomAlarm.action})` : 'aucune alarme trouvée');

        if (!lastRoomAlarm || lastRoomAlarm.action !== 'active') {
            log(`Insertion bloquée : l'alarme de la salle (${roomIdForCheck}) est désactivée ou absente.`);
            return;
        }

        // Création d'une entrée Sensor
        log('Création d\'un document Sensor avec:', { sensor_id: source, state: stateValue });
        const sensor = await Sensor.create({
            sensor_id: source,
            state: stateValue
        });
        log(`État du capteur ${source} inséré dans Sensor : _id=${sensor._id || sensor.id || 'n/a'}`);

        // Création d'une entrée SensorDetection
        const detectionPayload = {
            sensor_id: sensor.sensor_id,
            action: actionValue
            // ajouter d'autres champs si nécessaire
        };
        log('Création d\'un document SensorDetection avec:', detectionPayload);
        const detection = await SensorDetection.create(detectionPayload);
        log(`Détection insérée dans SensorDetection : _id=${detection._id || detection.id || 'n/a'}`, detectionPayload);

        // Envoi d'email si trigger
        if (actionValue === 'trigger') {
            log(`Action 'trigger' détectée pour ${source} — récupération des utilisateurs liés...`);
            const userSensorLinks = await UserSensor.find({ sensor_id: source }).populate('user_id');
            log('Nombre de liens user-sensor trouvés :', (userSensorLinks && userSensorLinks.length) || 0);

            const recipientMails = userSensorLinks
                .map(link => link?.user_id?.mail)
                .filter(Boolean);

            log('Emails destinataires extraits :', recipientMails);

            if (!recipientMails || recipientMails.length === 0) {
                log(`Aucun utilisateur associé au capteur ${source} pour recevoir l'alerte.`);
            } else {
                // Formatage personnalisé de la date
                let formattedDate = '';
                if (detection.time_detection) {
                    try {
                        const d = new Date(detection.time_detection);
                        formattedDate = d.toLocaleString('fr-FR', {
                            timeZone: 'Europe/Paris',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        }).replace(',', '');
                    } catch (dateErr) {
                        errorLog('Erreur lors du formatage de detection.time_detection :', dateErr);
                    }
                } else {
                    log('detection.time_detection absent, utilisation de la date actuelle.');
                    formattedDate = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
                }

                // Trouver la salle associée à ce capteur (détails)
                log(`Recherche RoomSensor (populate room_id) pour sensor_id=${source}...`);
                const roomSensor = await RoomSensor.findOne({ sensor_id: source }).populate('room_id');
                const roomName = (roomSensor && roomSensor.room_id && roomSensor.room_id.name) ? roomSensor.room_id.name : 'inconnue';
                log('Salle associée trouvée :', roomName);

                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: recipientMails.join(','),
                    subject: `Alerte Sécurité : Mouvement Détecté - ${roomName}`,
                    text: `🚨 ALERTE SÉCURITÉ 🚨\n\nCher utilisateur,\n\nNous vous informons qu'un mouvement a été détecté dans vos locaux.\n\n📅 Date et heure : ${formattedDate}\n📍 Salle : ${roomName}\nCapteur (source_address) : ${source}\n\n⚠️ Veuillez prendre les mesures nécessaires et vérifier la zone concernée.\n\nCeci est un message automatique, merci de ne pas y répondre.\n\nCordialement,\nVotre système de sécurité Smart Room`
                };

                log('Préparation à l\'envoi d\'email. Résumé mailOptions:', {
                    from: mailOptions.from,
                    toCount: recipientMails.length,
                    subject: mailOptions.subject,
                    // ne pas logger le corps complet si tu veux éviter trop de texte
                });

                try {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            errorLog('Erreur lors de l\'envoi de l\'email via Gmail :', error);
                        } else {
                            log(`Email d'alerte envoyé à ${recipientMails.length} destinataire(s). Response:`, info && info.response);
                        }
                    });
                } catch (sendErr) {
                    errorLog('sendMail a throw une erreur :', sendErr);
                }
            }
        } else {
            log(`Action '${actionValue}' ne déclenche pas d'email. Fin du traitement pour ${source}.`);
        }

        log('insertSensorState terminé sans erreur pour source:', source);
    } catch (err) {
        errorLog("Erreur lors de la mise à jour de l'état du capteur ou de la détection :", err);
        try {
            errorLog('Données ayant causé l\'erreur :', JSON.stringify(sensorData));
        } catch (jsonErr) {
            errorLog('Impossible de stringify sensorData pour le log :', jsonErr);
        }
    }
}

async function setAlarmUser(req, res) {
    try {
        log('setAlarmUser appelé. Utilisateur en session :', req && req.user ? req.user : 'aucun user dans req');
        setLastAlarmUser(req.user);
        log('Utilisateur enregistré pour l\'alerte :', req.user && req.user._id ? `id=${req.user._id}` : req.user);
        res.json({ success: true });
    } catch (err) {
        errorLog('Erreur dans setAlarmUser :', err);
        res.status(500).json({ success: false, error: 'Erreur serveur lors de l\'enregistrement de l\'utilisateur' });
    }
}

module.exports = { insertSensorState, setAlarmUser };
