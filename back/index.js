const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require("./database/database.js"); 
const routes = require('./routes/routes.js');
const http = require('http');
const server = http.createServer(app);
const mqtt = require('./controllers/mqttController.js');

// Variables d'environnement
require("dotenv").config();
const PORT = process.env.PORT;

connectDB();

// Middlewares - Validation des requête du domaine front
app.use(cors({ origin: process.env.DNS_CLIENT }));

// Middlewares - Parse du contenu json
app.use(express.json());

// Middlewares - Routes
app.use('/', routes);

// Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Initialisation du client MQTT
mqtt.init();
