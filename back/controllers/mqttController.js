const mqtt = require("mqtt");
const { connectdb, saveSensorStat } = require("./mqttInsertController.js");

const broker = "mqtt://admin-hetic.arcplex.tech:8828";
const topic = "pws-packet/202481597308186/#";

connectdb();

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
    
  } catch (error) {
    console.error("❌ Erreur lors du traitement:", error.message);
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
