const SensorStat = require("../models/sensorstat.js");

// Récupérer seulement la dernière température pour un capteur
async function getTemperatureBySensor(room_id) {
    try {
        const sensor_id = Number(room_id);
        const data = await SensorStat.findOne(
            { sensor_id, temperature: { $exists: true } }, 
            { temperature: 1, get_time: 1, _id: 0 }
        ).sort({ get_time: -1 }); // -1 pour trier par ordre décroissant (plus récent en premier)
        
        return data ? data.temperature : null;
    } catch (err) {
        throw err;
    }
}

// Récupérer seulement la dernière humidité pour un capteur
async function getHumidityBySensor(room_id) {
    try {
        const sensor_id = Number(room_id);
        const data = await SensorStat.findOne(
            { sensor_id, humidity: { $exists: true } }, 
            { humidity: 1, get_time: 1, _id: 0 }
        ).sort({ get_time: -1 }); // -1 pour trier par ordre décroissant (plus récent en premier)
        
        return data ? data.humidity : null;
    } catch (err) {
        throw err;
    }
}

// Récupérer seulement la dernière pression pour un capteur
async function getPressureBySensor(room_id) {
    try {
        const sensor_id = Number(room_id);
        const data = await SensorStat.findOne(
            { sensor_id, pressure: { $exists: true } }, 
            { pressure: 1, get_time: 1, _id: 0 }
        ).sort({ get_time: -1 }); // -1 pour trier par ordre décroissant (plus récent en premier)
        
        return data ? data.pressure : null;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getTemperatureBySensor,
    getHumidityBySensor,
    getPressureBySensor
}; 