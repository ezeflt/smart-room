require("dotenv").config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS, 
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


try {
    const maybePromise = connectdb();
    if (maybePromise && typeof maybePromise.then === 'function') {
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

    try {
        if (!sensorData) {
            console.error('[ERROR] sensorData manquant !');
            return;
        }

        const source = sensorData.source_address;
        const incomingState = sensorData.data && sensorData.data.state;

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

        // Vérifier l'état de l'alarme
        const roomSensorForCheck = await RoomSensor.findOne({ sensor_id: source });

        const roomIdForCheck = roomSensorForCheck ? roomSensorForCheck.room_id : null;
        if (!roomIdForCheck) {
            console.log(`[BLOCK] Impossible d'identifier la salle pour le capteur ${source}.`);
            return;
        }

        const lastRoomAlarm = await Alarme.findOne({ room_id: roomIdForCheck }).sort({ timestamp: -1 });
        if (!lastRoomAlarm || lastRoomAlarm.action !== 'active') {
            console.log(`[BLOCK] Alarme désactivée pour la salle ${roomIdForCheck}.`);
            return;
        }

        // Création Sensor
        const sensor = await Sensor.create({
            sensor_id: source,
            state: stateValue
        });

        // Création SensorDetection
        const detectionPayload = { sensor_id: sensor.sensor_id, action: actionValue };
        const detection = await SensorDetection.create(detectionPayload);

        // Envoi d'email si trigger
        if (actionValue === 'trigger') {
            const userSensorLinks = await UserSensor.find({ sensor_id: source }).populate('user_id');

            const recipientMails = userSensorLinks
                .map(link => link?.user_id?.mail)
                .filter(Boolean);

            if (!recipientMails || recipientMails.length === 0) {
                console.log(`[INFO] Aucun utilisateur pour le capteur ${source}.`);
            } else {
                let formattedDate = '';
                if (detection.time_detection) {
                    formattedDate = new Date(detection.time_detection).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
                } else {
                    formattedDate = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
                }

                const roomSensor = await RoomSensor.findOne({ sensor_id: source }).populate('room_id');
                const roomName = roomSensor?.room_id?.name || 'inconnue';

                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: recipientMails.join(','),
                    subject: `Alerte Sécurité : Mouvement Détecté - ${roomName}`,
                    text: `Mouvement détecté\n\n ${formattedDate}\n Salle : ${roomName}\nCapteur : ${source}`
                };
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
    } catch (err) {
        console.error('[ERROR] Problème dans insertSensorState:', err);
        try {
            console.error('[ERROR] Données brutes:', JSON.stringify(sensorData));
        } catch {}
    }
}

async function setAlarmUser(req, res) {
    try {
        setLastAlarmUser(req.user);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
}

module.exports = { insertSensorState, setAlarmUser };
