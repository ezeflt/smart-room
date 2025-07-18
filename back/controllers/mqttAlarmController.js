require("dotenv").config();
const Sensor = require("../models/sensor.js");
const { connectdb } = require("./mqttInsertController.js");

const mongoURL = process.env.MONGO_URL;

connectdb();


async function insertSensorState(sensorData) {
    const state = sensorData.data.state;
    let stateValue;

    if (state === "stop-moving") {
        stateValue = 0;
    } else if (state === "start-moving") {
        stateValue = 1;
    } else {
        console.log("État du capteur non reconnu :", state);
        return;
    }

    try {
        await Sensor.create({
            sensor_id: sensorData.source_address,
            state: stateValue
        });
        console.log(`État du capteur ${sensorData.source_address} inséré avec valeur ${stateValue} dans Sensor`);
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'état du capteur dans Sensor :", err);
    }
}



module.exports = { insertSensorState };




