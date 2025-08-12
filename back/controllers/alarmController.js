const Alarm = require("../models/alarm.js");

const activate = async (req, res) => {
  try {
    
    const { room_id } = req.body;
    const user_id = req.user.userId;

    if (!user_id || !room_id) {
      return res.status(400).json({
        error: "Champs requis manquants",
        details: "user_id et room_id sont obligatoires",
      });
    }

    const alarm = new Alarm({
      action: "active",
      user_id,
      room_id,
    });

    await alarm.save();
    console.log("Alarm activated:", alarm);
    res.status(201).json({
      message: "Alarme activée avec succès",
      alarm,
    });
  } catch (err) {
    console.error("Erreur lors de l’activation de l’alarme :", err);
    res.status(500).json({
      error: "Erreur serveur",
      details: err.message,
    });
  }
};

const deactivate = async (req, res) => {
  try {
    const { room_id } = req.body;
    const user_id = req.user.userId;

    if (!user_id || !room_id) {
      return res
        .status(400)
        .json({
          error: "Champs manquants",
          details: "user_id et room_id sont requis",
        });
    }
    const alarm = new Alarm({ action: "desactive", user_id, room_id });
    await alarm.save();
    console.log("Alarm deactivated:", alarm);
    return res.status(201).json({ message: "Alarme désactivée", alarm });
  } catch (err) {
    console.error("DEACTIVATE ERROR:", err);

    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: "Erreur serveur", details: err.message });
    }
  }
};

const historic = async () => {
  try {
    const historique = await Alarm.find()
      .populate("user_id", "username mail")
      .populate("room_id", "name")      
      .sort({ timestamp: -1 });
 
    const formatted = historique.map((entry) => ({
      timestamp: entry.timestamp,
      room: entry.room_id?._id,
      action: entry.action,
      userName: entry.user_id?.username
    }));
  
    return formatted;
  } catch (err) {
    throw err;
  }
};

module.exports = { activate, deactivate, historic };
