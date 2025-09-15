const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require("./database/database.js"); 
const routes = require('./routes/routes.js');
const http = require('http');
const server = http.createServer(app);

// Variables d'environnement
require("dotenv").config();
const PORT = process.env.PORT;

// Middlewares - Validation des requête du domaine front
app.use(cors());

// Middlewares - Parse du contenu json
app.use(express.json());

// Middlewares - Connexion à la base de données
connectDB();

// Middlewares - Routes
app.use('/', routes);

// Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
