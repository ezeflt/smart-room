const mongoose = require("mongoose");
require("dotenv").config();
const SensorStat = require("../models/sensorstat.js");

/**
 * Utilisateur : MQTT
 * Description : Enregistre les données du capteur dans la base de données
 * 
 * @param {Object} payload - Données du capteur
 */
async function saveSensorStat(payload) {
    const { sensor_id, data, tx_time_ms_epoch, source_address } = payload;
    const timestamp = new Date(Number(tx_time_ms_epoch));

    try {
        const updatedData = {};
        if (sensor_id === 112 && data.temperature) {
            updatedData.temperature = data.temperature;
            console.info(`Température enregistrée: ${data.temperature}°C pour le device ${source_address}`);
        }
        if (sensor_id === 114 && data.humidity) {
            updatedData.humidity = data.humidity;
            console.info(`Humidité enregistrée: ${data.humidity}% pour le device ${source_address}`);
        }
        if (sensor_id === 116 && data.atmospheric_pressure) {
            updatedData.pressure = data.atmospheric_pressure;
            console.info(`Pression enregistrée: ${data.atmospheric_pressure} Pa pour le device ${source_address}`);
        }
        if (Object.keys(updatedData)?.length > 0) {
            const filter = { sensor_id: source_address, get_time: timestamp };

            await SensorStat.findOneAndUpdate(
                filter,
                { $set: updatedData },
                { upsert: true, new: true }
            );
        }
    } catch (error) {
        console.error(`Erreur lors du traitement du capteur ${sensor_id}:`, error.message);
    }
}

module.exports = {
    saveSensorStat,
}