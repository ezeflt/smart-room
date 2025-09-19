const mqtt = require("mqtt");
require("dotenv").config();
const { saveSensorStat } = require("../service/sensorService.js");
const { insertSensorState } = require("./mqttAlarmController.js");

const broker = process.env.MQTT_BROKER_URL;
const topic = process.env.MQTT_TOPIC;

const client = mqtt.connect(broker);

client.on("connect", () => {
  console.log(`Connecté au broker, abonnement à ${topic} `);
  client.subscribe(topic);
});

client.on("message", async (topic, message) => {
  try {
    console.log(`Ceci est le topic: ${topic} | Message : ${message.toString()}`);
    const data = JSON.parse(message.toString());
    await saveSensorStat(data);

    if (data.data && typeof data.data.state !== 'undefined') {
      await insertSensorState(data);
    }
  } catch (error) {
    console.error("Erreur lors du traitement:", error.message);
  }
});

client.on("error", (error) => {
  console.error("Erreur MQTT:", error);
});

process.on("SIGINT", () => {
  console.log("Arrêt du client MQTT...");
  client.end();
  process.exit(0);
});

const mqttController = (req, res) => {
  res.json({ status: "MQTT client actif et abonné", topic });
};

module.exports = { mqttController };
