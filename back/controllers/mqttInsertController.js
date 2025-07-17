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
        switch (sensor_id) {
            case 112: 
                if (data.temperature) {
                    await SensorStat.findOneAndUpdate(
                        { sensor_id: source_address },
                        { 
                            temperature: data.temperature,
                            get_time: timestamp
                        },
                        { upsert: true, new: true }
                    );
                    console.log(`Température mise à jour: ${data.temperature}°C pour le device ${source_address}`);
                }
                break;

            case 114: 
                if (data.humidity) {
                    await SensorStat.findOneAndUpdate(
                        { sensor_id: source_address },
                        { 
                            humidity: data.humidity,
                            get_time: timestamp
                        },
                        { upsert: true, new: true }
                    );
                    console.log(`Humidité mise à jour: ${data.humidity}% pour le device ${source_address}`);
                }
                break;

            case 116:
                if (data.atmospheric_pressure) {
                    await SensorStat.findOneAndUpdate(
                        { sensor_id: source_address },
                        { 
                            pressure: data.atmospheric_pressure,
                            get_time: timestamp
                        },
                        { upsert: true, new: true }
                    );
                    console.log(`Pression mise à jour: ${data.atmospheric_pressure} Pa pour le device ${source_address}`);
                }
                break;

            default:
                break;
        }
    } catch (error) {
        console.error(`Erreur lors du traitement du capteur ${sensor_id}:`, error.message);
    }
}

module.exports = {
    connectdb,
    saveSensorStat,
}