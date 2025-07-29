const SensorStat = require("../models/sensorstat.js");


async function getTemperatureBySensor(req, res) {
    try {
        const sensor_id = Number(req.params.sensor_id);
        const data = await SensorStat.find({ sensor_id, temperature: { $exists: true } }, { temperature: 1, get_time: 1, _id: 0 }).sort({ get_time: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getHumidityBySensor(req, res) {
    try {
        const sensor_id = Number(req.params.sensor_id);
        const data = await SensorStat.find({ sensor_id, humidity: { $exists: true } }, { humidity: 1, get_time: 1, _id: 0 }).sort({ get_time: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getPressureBySensor(req, res) {
    try {
        const sensor_id = Number(req.params.sensor_id);
        const data = await SensorStat.find({ sensor_id, pressure: { $exists: true } }, { pressure: 1, get_time: 1, _id: 0 }).sort({ get_time: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getTemperatureBySensor,
    getHumidityBySensor,
    getPressureBySensor
}; 