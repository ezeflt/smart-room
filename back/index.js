const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require("./database/database.js"); 
const routes = require('./routes/routes.js');
const mqttClient = require('./controllers/mqttController.js');
const cron = require('node-cron');
const { sendDailyDetectionReport } = require('./controllers/sendDailyReport.js');

require("dotenv").config();
const PORT = process.env.PORT ;


app.use(cors());
app.use(express.json());


connectDB();


console.log("Initialisation du client MQTT...");

app.use('/',routes);


// Exemple de route GET
app.get('/alarm/:userId', (req, res) => {
  // TODO: logique pour récupérer l'alarme
  res.json({ enabled: true });
});

// Exemple de route POST
app.post('/alarm/:userId', (req, res) => {
  // TODO: logique pour activer/désactiver l'alarme
  res.json({ success: true });
});

// Exemple de route GET météo
app.get('/weather/:userId', (req, res) => {
  // TODO: logique pour récupérer la météo
  res.json({ weather: 'sunny' });
});

app.get("/", (req, res) => {
  res.send("API is running 🟢");
});



cron.schedule('55 0 * * *', () => {
  console.log("⏰ Envoi automatique du rapport quotidien à 00h46 (Europe/Paris)...");
  sendDailyDetectionReport();
}, {
  timezone: "Europe/Paris"
});




app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
