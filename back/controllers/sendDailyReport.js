require("dotenv").config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const SensorDetection = require("../models/sensordetection");
const RoomSensor = require("../models/roomsensor");
const Room = require("../models/room");
const { getLastAlarmUser } = require('./alarmUserStore');
const { connectdb } = require("./mqttInsertController");


connectdb();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});


async function sendDailyDetectionReport() {
  const alarmUser = getLastAlarmUser();
  if (!alarmUser || !alarmUser.mail) {
    console.log("Aucun utilisateur connecté pour recevoir le rapport.");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 46, 0, 0);

  try {
    const detections = await SensorDetection.find({
      action: "trigger",
      time_detection: { $gte: today, $lt: endOfDay }
    });

    
    const groupedByRoom = {};

    for (const detection of detections) {
      const roomSensor = await RoomSensor.findOne({ sensor_id: detection.sensor_id });
      if (!roomSensor) continue;

      const room = await Room.findById(roomSensor.room_id);
      const roomName = room?.name || "Inconnue";

      if (!groupedByRoom[roomName]) groupedByRoom[roomName] = [];
      groupedByRoom[roomName].push(new Date(detection.time_detection).toLocaleTimeString('fr-FR'));
    }

  
    let emailContent = `🏢 Rapport de Surveillance Quotidien 🏢\n`;
    emailContent += `📅 Date : ${today.toLocaleDateString('fr-FR')}\n`;
    emailContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const allRoomDocs = await Room.find({});
    for (const room of allRoomDocs) {
      emailContent += `🚪 ${room.name.toUpperCase()} 🚪\n`;
      emailContent += `──────────────────────\n`;
      if (groupedByRoom[room.name] && groupedByRoom[room.name].length > 0) {
        emailContent += `📝 Détections enregistrées :\n`;
        groupedByRoom[room.name].forEach(hour => {
          emailContent += `   ⏰ ${hour}\n`;
        });
      } else {
        emailContent += `✨ Aucune activité détectée aujourd'hui\n`;
      }
      emailContent += `\n`;
    }

    emailContent += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    emailContent += `💡 Ce rapport est généré automatiquement par votre système de surveillance intelligent.\n`;
    emailContent += `👉 En cas de question, contactez votre administrateur système.\n`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: alarmUser.mail,
      subject: `📅 Rapport journalier de détection - ${today.toLocaleDateString('fr-FR')}`,
      text: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur d\'envoi email :', error);
      } else {
        console.log('Rapport journalier envoyé :', info.response);
      }
    });

  } catch (err) {
    console.error("Erreur lors de la génération du rapport :", err);
  }
}


module.exports = { sendDailyDetectionReport };
