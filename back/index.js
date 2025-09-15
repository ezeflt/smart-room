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

// Middlewares
// Check CORS policy
app.use(cors());
app.use(express.json());

connectDB();

app.use('/',routes);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
