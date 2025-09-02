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
const { connectdb } = require("./mqttInsertController.js");
const SensorDetection = require("../models/sensordetection.js");
const Alarme = require("../models/alarm.js"); // À créer si non existant
const { setLastAlarmUser, getLastAlarmUser } = require('./alarmUserStore');
const mongoURL = process.env.MONGO_URL;
const RoomSensor = require("../models/roomsensor.js");
const Room = require("../models/room.js");
const UserSensor = require("../models/usersensor.js");
const User = require("../models/user.js");

connectdb();


async function insertSensorState(sensorData) {
    const state = sensorData.data.state;
    let stateValue;
    let actionValue;

    if (state === "stop-moving") {
        stateValue = 0;
        actionValue = 'untrigger';
    } else if (state === "start-moving" || state === "moving") {
        stateValue = 1;
        actionValue = 'trigger';
    } else {
        console.log("État du capteur non reconnu :", state);
        return;
    }

    try {
        // Vérifier l'état de l'alarme pour la salle du capteur
        const roomSensorForCheck = await RoomSensor.findOne({ sensor_id: sensorData.source_address });
        const roomIdForCheck = roomSensorForCheck ? roomSensorForCheck.room_id : null;
        if (!roomIdForCheck) {
            console.log(`Insertion bloquée : impossible d'identifier la salle pour le capteur ${sensorData.source_address}.`);
            return;
        }
        const lastRoomAlarm = await Alarme.findOne({ room_id: roomIdForCheck }).sort({ timestamp: -1 });
        if (!lastRoomAlarm || lastRoomAlarm.action !== 'active') {
            console.log(`Insertion bloquée : l'alarme de la salle (${roomIdForCheck}) est désactivée.`);
            return;
        }

       
        const sensor = await Sensor.create({
            sensor_id: sensorData.source_address,
            state: stateValue
        });
        console.log(`État du capteur ${sensorData.source_address} inséré avec valeur ${stateValue} dans Sensor`);

        
        const detection = await SensorDetection.create({
            sensor_id: sensor.sensor_id, 
            action: actionValue
        });
        console.log(`Détection insérée dans SensorDetection pour capteur ${sensor.sensor_id} avec action ${actionValue}`);

        // Envoi d'email si trigger
        if (actionValue === 'trigger') {
            // Récupérer tous les utilisateurs associés à ce capteur
            const userSensorLinks = await UserSensor.find({ sensor_id: sensorData.source_address }).populate('user_id');
            const recipientMails = userSensorLinks
                .map(link => link?.user_id?.mail)
                .filter(Boolean);

            if (!recipientMails || recipientMails.length === 0) {
                console.log(`Aucun utilisateur associé au capteur ${sensorData.source_address} pour recevoir l'alerte.`);
            } else {
                // Formatage personnalisé de la date
                let formattedDate = '';
                if (detection.time_detection) {
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
                }

                // Trouver la salle associée à ce capteur
                const roomSensor = await RoomSensor.findOne({ sensor_id: sensorData.source_address }).populate('room_id');
                const roomName = (roomSensor && roomSensor.room_id && roomSensor.room_id.name) ? roomSensor.room_id.name : 'inconnue';

                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: recipientMails.join(','),
                    subject: `Alerte Sécurité : Mouvement Détecté - ${roomName}`,
                    text: `🚨 ALERTE SÉCURITÉ 🚨\n\nCher utilisateur,\n\nNous vous informons qu'un mouvement a été détecté dans vos locaux.\n\n📅 Date et heure : ${formattedDate}\n📍 Salle : ${roomName}\nCapteur (source_address) : ${sensorData.source_address}\n\n⚠️ Veuillez prendre les mesures nécessaires et vérifier la zone concernée.\n\nCeci est un message automatique, merci de ne pas y répondre.\n\nCordialement,\nVotre système de sécurité Smart Room`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.error('Erreur lors de l\'envoi de l\'email via Gmail :', error);
                    }
                    console.log(`Email d'alerte envoyé à ${recipientMails.length} destinataire(s) :`, info.response);
                });
            }
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'état du capteur ou de la détection :", err);
    }
}

async function setAlarmUser(req, res) {
    setLastAlarmUser(req.user);
    console.log('Utilisateur enregistré pour l\'alerte :', req.user);
    res.json({ success: true });
}


module.exports = { insertSensorState, setAlarmUser };




