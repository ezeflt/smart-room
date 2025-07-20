require("dotenv").config();
const Sensor = require("../models/sensor.js");
const { connectdb } = require("./mqttInsertController.js");
const SensorDetection = require("../models/sensordetection.js");
const Alarme = require("../models/alarm.js"); // À créer si non existant

const mongoURL = process.env.MONGO_URL;

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
        // Vérifier l'état de l'alarme
        const alarme = await Alarme.findOne();
        if (!alarme || alarme.action !== 'active') {
            console.log("Insertion bloquée : l'alarme est désactivée.");
            return;
        }

        // Insérer dans Sensor
        const sensor = await Sensor.create({
            sensor_id: sensorData.source_address,
            state: stateValue
        });
        console.log(`État du capteur ${sensorData.source_address} inséré avec valeur ${stateValue} dans Sensor`);

        // Insérer dans SensorDetection
        await SensorDetection.create({
            sensor_id: sensor.sensor_id, // Utilise l'id du capteur réel
            action: actionValue
        });
        console.log(`Détection insérée dans SensorDetection pour capteur ${sensor.sensor_id} avec action ${actionValue}`);
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'état du capteur ou de la détection :", err);
    }
}



module.exports = { insertSensorState };




