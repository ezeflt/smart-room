const Alarm = require("../models/alarm.js");
const { checkRoomAccess } = require("../service/userService.js");

/**
 * Utilisateur : Client
 * Description : Insére une alarme activée dans la base de données
 * 
 * @returns - Alarme insérée avec succès
 */
const activate = async (req, res) => {
  try {
    
    const { room_id } = req.query;
    const user_id = req.user.userId;

    if (!user_id || !room_id) {
      return res.status(400).json({
        error: "Champs requis manquants",
        details: "user_id et room_id sont obligatoires",
      });
    }

    const hasAccess = await checkRoomAccess(user_id, room_id);

    if (!hasAccess) {
      return res.status(403).json({ error: "Vous n'avez pas accès à cette salle" });
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

/**
 * Utilisateur : Client
 * Description : Insére une alarme désactivée dans la base de données
 * 
 * @returns - Alarme désactivée avec succès
 */
const deactivate = async (req, res) => {
  try {
    const { room_id } = req.query;
    const user_id = req.user.userId;

    if (!user_id || !room_id) {
      return res
        .status(400)
        .json({
          error: "Champs manquants",
          details: "user_id et room_id sont requis",
        });
    }

    const hasAccess = await checkRoomAccess(user_id, room_id);
 
    if (!hasAccess) {
      console.log('hasAccess false', hasAccess);
      return res.status(403).json({ error: "Vous n'avez pas accès à cette salle" });
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

// Recupere l'historique des alarmes pour une room
const historic = async (room_id) => {
  try {
    // Recupere l'historique des alarmes pour une room
    const historique = await Alarm.find({ room_id })
      .populate("user_id", "username mail")
      .populate("room_id", "name")      
      .sort({ timestamp: -1 });
 
    // Formate les données pour le frontend
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
