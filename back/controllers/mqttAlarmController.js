require("dotenv").config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS, // mot de passe d'application Google
    },
});
const Sensor = require("../models/sensor.js");
const SensorDetection = require("../models/sensordetection.js");
const Alarme = require("../models/alarm.js"); 
const { setLastAlarmUser } = require('./alarmUserStore');
const mongoURL = process.env.MONGO_URL;
const RoomSensor = require("../models/roomsensor.js");
const Room = require("../models/room.js");
const UserSensor = require("../models/usersensor.js");
const User = require("../models/user.js");

console.log('[INIT] Fichier sensor controller chargé.');
console.log('[INIT] Présence de MONGO_URL :', !!mongoURL);

try {
    console.log('[DB] Tentative d\'appel de connectdb()...');
    const maybePromise = connectdb();
    if (maybePromise && typeof maybePromise.then === 'function') {
        console.log('[DB] connectdb() retourne une promesse...');
        maybePromise
            .then(() => console.log('[DB] Connexion DB établie.'))
            .catch(err => console.error('[DB] Erreur de connexion :', err));
    } else {
        console.log('[DB] connectdb() exécutée (non promesse).');
    }
} catch (err) {
    console.error('[DB] Erreur synchronisée lors de connectdb() :', err);
}

async function insertSensorState(sensorData) {
    console.log('[FUNC] insertSensorState appelé.');

    try {
        if (!sensorData) {
            console.error('[ERROR] sensorData manquant !');
            return;
        }

        const source = sensorData.source_address;
        const incomingState = sensorData.data && sensorData.data.state;
        console.log('[DATA] Données reçues:', { source, incomingState });

        let stateValue;
        let actionValue;

        if (incomingState === "stop-moving") {
            stateValue = 0;
            actionValue = 'untrigger';
        } else if (incomingState === "start-moving" || incomingState === "moving") {
            stateValue = 1;
            actionValue = 'trigger';
        } else {
            console.log('[WARN] État du capteur non reconnu :', incomingState, 'pour', source);
            return;
        }

        console.log(`[STATE] Mappé -> stateValue=${stateValue}, actionValue=${actionValue}`);

        // Vérifier l'état de l'alarme
        console.log(`[CHECK] Recherche RoomSensor pour sensor_id=${source}...`);
        const roomSensorForCheck = await RoomSensor.findOne({ sensor_id: source });
        console.log('[CHECK] Résultat RoomSensor:', roomSensorForCheck ? `room_id=${roomSensorForCheck.room_id}` : 'aucun trouvé');

        const roomIdForCheck = roomSensorForCheck ? roomSensorForCheck.room_id : null;
        if (!roomIdForCheck) {
            console.log(`[BLOCK] Impossible d'identifier la salle pour le capteur ${source}.`);
            return;
        }

        console.log(`[CHECK] Recherche dernière alarme pour room_id=${roomIdForCheck}...`);
        const lastRoomAlarm = await Alarme.findOne({ room_id: roomIdForCheck }).sort({ timestamp: -1 });
        console.log('[CHECK] Dernière alarme :', lastRoomAlarm ? `action=${lastRoomAlarm.action}` : 'aucune trouvée');

        if (!lastRoomAlarm || lastRoomAlarm.action !== 'active') {
            console.log(`[BLOCK] Alarme désactivée pour la salle ${roomIdForCheck}.`);
            return;
        }

        // Création Sensor
        console.log('[INSERT] Création Sensor:', { sensor_id: source, state: stateValue });
        const sensor = await Sensor.create({
            sensor_id: source,
            state: stateValue
        });
        console.log(`[OK] Sensor inséré _id=${sensor._id || 'n/a'}`);

        // Création SensorDetection
        const detectionPayload = { sensor_id: sensor.sensor_id, action: actionValue };
        console.log('[INSERT] Création SensorDetection:', detectionPayload);
        const detection = await SensorDetection.create(detectionPayload);
        console.log(`[OK] SensorDetection inséré _id=${detection._id || 'n/a'}`);

        // Envoi d'email si trigger
        if (actionValue === 'trigger') {
            console.log(`[ALERT] Trigger détecté pour capteur ${source} -> recherche utilisateurs...`);
            const userSensorLinks = await UserSensor.find({ sensor_id: source }).populate('user_id');
            console.log('[ALERT] Nombre d\'utilisateurs liés:', userSensorLinks.length);

            const recipientMails = userSensorLinks
                .map(link => link?.user_id?.mail)
                .filter(Boolean);

            console.log('[ALERT] Emails destinataires:', recipientMails);

            if (!recipientMails || recipientMails.length === 0) {
                console.log(`[INFO] Aucun utilisateur pour le capteur ${source}.`);
            } else {
                let formattedDate = '';
                if (detection.time_detection) {
                    formattedDate = new Date(detection.time_detection).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
                } else {
                    formattedDate = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
                }

                console.log(`[ALERT] Date formatée pour mail: ${formattedDate}`);

                const roomSensor = await RoomSensor.findOne({ sensor_id: source }).populate('room_id');
                const roomName = roomSensor?.room_id?.name || 'inconnue';
                console.log('[ALERT] Salle associée:', roomName);

                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: recipientMails.join(','),
                    subject: `Alerte Sécurité : Mouvement Détecté - ${roomName}`,
                    text: `🚨 Mouvement détecté\n\n📅 ${formattedDate}\n📍 Salle : ${roomName}\nCapteur : ${source}`
                };

                console.log('[MAIL] Préparation envoi mail à', recipientMails.length, 'destinataires...');
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('[MAIL] Erreur envoi Gmail :', error);
                    } else {
                        console.log('[MAIL] Email envoyé avec succès:', info.response);
                    }
                });
            }
        } else {
            console.log(`[INFO] Action '${actionValue}' ne déclenche pas d'email.`);
        }

        console.log('[FUNC] insertSensorState terminé pour', source);
    } catch (err) {
        console.error('[ERROR] Problème dans insertSensorState:', err);
        try {
            console.error('[ERROR] Données brutes:', JSON.stringify(sensorData));
        } catch {}
    }
}

async function setAlarmUser(req, res) {
    try {
        console.log('[FUNC] setAlarmUser appelé. Utilisateur:', req?.user);
        setLastAlarmUser(req.user);
        console.log('[OK] Utilisateur enregistré:', req.user?._id || req.user);
        res.json({ success: true });
    } catch (err) {
        console.error('[ERROR] setAlarmUser:', err);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
}

module.exports = { insertSensorState, setAlarmUser };
