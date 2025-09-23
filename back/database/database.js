const mongoose = require("mongoose");
require("dotenv").config();

// Configuration globale de Mongoose pour les timeouts
mongoose.set('bufferCommands', false);

const debugTimeout = {
  serverSelectionTimeoutMS: 60000, // 60 secondes
  connectTimeoutMS: 60000, // 60 secondes pour la connexion initiale
  bufferCommands: false, // Désactive le buffering des commandes
  maxPoolSize: 10, // Augmente le pool de connexions
  minPoolSize: 5, // Pool minimum
  maxIdleTimeMS: 30000, // 30 secondes d'inactivité
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, debugTimeout);
    console.debug("MongoDB connected → smart_room");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;