const SensorStat = require("../models/sensorstat.js");


async function getTemperatureBySensor(room_id) {
    try {
        const sensor_id = Number(room_id);
        const data = await SensorStat.find({ sensor_id, temperature: { $exists: true } }, { temperature: 1, get_time: 1, _id: 0 }).sort({ get_time: 1 });
        return data;
    } catch (err) {
        throw err;
    }
}

async function getHumidityBySensor(room_id) {
    try {
        const sensor_id = Number(room_id);
        const data = await SensorStat.find({ sensor_id, humidity: { $exists: true } }, { humidity: 1, get_time: 1, _id: 0 }).sort({ get_time: 1 });
        return data;
    } catch (err) {
        throw err;
    }
}

async function getPressureBySensor(room_id) {
    try {
        const sensor_id = Number(room_id);
        const data = await SensorStat.find({ sensor_id, pressure: { $exists: true } }, { pressure: 1, get_time: 1, _id: 0 }).sort({ get_time: 1 });
        return data;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getTemperatureBySensor,
    getHumidityBySensor,
    getPressureBySensor
}; 