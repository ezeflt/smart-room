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
    console.log("historique", historique);

    const formatted = historique.map((entry) => ({
      action: entry.action,
      timestamp: entry.timestamp,
      user_id: {
        _id: entry.user_id._id,
        username: entry.user_id.username,
        mail: entry.user_id.mail,
      },
      room_id: {
        _id: entry.room_id._id,
        name: entry.room_id.name,
      },
    }));

    return formatted;
  } catch (err) {
    throw err;
  }
};

module.exports = { activate, deactivate, historic };
