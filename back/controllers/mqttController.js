const mqtt = require("mqtt");

const broker = "mqtt://admin-hetic.arcplex.tech:8828";
const topic = "pws-packet/202481597308186/#";

const client = mqtt.connect(broker);

client.on("connect", () => {
  console.log(`Connecté au broker, abonnement à ${topic} `);
  client.subscribe(topic);
});

client.on("message", (topic, message) => {
  console.log(`Ceci est le topic: ${topic} | Message : ${message.toString()}`);
});
