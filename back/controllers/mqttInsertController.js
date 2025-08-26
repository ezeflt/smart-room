const mongoose = require("mongoose");
require("dotenv").config();
const SensorStat = require("../models/sensorstat.js");



const mongoURL = process.env.MONGO_URL;

function connectdb() {
    mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connecté à MongoDB"))
    .catch((err) => console.log("Erreur de connexion à MongoDB", err));
}

async function saveSensorStat(payload) {
    const { sensor_id, data, tx_time_ms_epoch, source_address } = payload;
    const timestamp = new Date(Number(tx_time_ms_epoch));

    try {
        const filter = { sensor_id: source_address, get_time: timestamp };
        const update = {};
        if (sensor_id === 112 && data.temperature) {
            update.temperature = data.temperature;
            console.log(`Température enregistrée: ${data.temperature}°C pour le device ${source_address}`);
        }
        if (sensor_id === 114 && data.humidity) {
            update.humidity = data.humidity;
            console.log(`Humidité enregistrée: ${data.humidity}% pour le device ${source_address}`);
        }
        if (sensor_id === 116 && data.atmospheric_pressure) {
            update.pressure = data.atmospheric_pressure;
            console.log(`Pression enregistrée: ${data.atmospheric_pressure} Pa pour le device ${source_address}`);
        }
        if (Object.keys(update).length > 0) {
            await SensorStat.findOneAndUpdate(
                filter,
                { $set: update },
                { upsert: true, new: true }
            );
            // Émission WebSocket à tous les clients
            if (global._io) {
                global._io.emit('sensor_update', {
                    sensor_id: source_address,
                    data: update,
                    timestamp
                });
            }
        }
    } catch (error) {
        console.error(`Erreur lors du traitement du capteur ${sensor_id}:`, error.message);
    }
}

module.exports = {
    connectdb,
    saveSensorStat,
}