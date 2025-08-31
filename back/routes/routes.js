const express = require("express");
const router = express.Router();
const { register ,getUser,login, deleteUser, updateUser, logout, getUserByEmail, getMe  } = require("../controllers/userController.js");
const { getRooms, getUserRooms, assignUserRooms } = require("../controllers/roomController.js");
const { mqttController } = require("../controllers/mqttController.js");
const { setAlarmUser } = require("../controllers/mqttAlarmController.js");
const { authenticateToken, authenticateStreamToken } = require("../middleware/auth.js");
const { activate, deactivate } = require("../controllers/alarmController.js");
const { weatherStream, alarmStream, roomStatusStream } = require("../controllers/streamController.js");
const User = require("../models/user.js");

router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.get("/user/me", authenticateToken, getMe);
router.get("/mqtt", mqttController);
router.delete('/user/:userId', authenticateToken, deleteUser);
router.put('/user/:userId', authenticateToken, updateUser);
router.post('/alarm/set-user', authenticateToken, setAlarmUser);
router.put('/alarm/activate',authenticateToken, activate); 
router.put('/alarm/deactivate',authenticateToken, deactivate); 
router.get("/user/:mail",authenticateToken, getUserByEmail);

// Stream endpoints
router.get("/weather/stream", weatherStream);
router.get("/alarm/stream", authenticateStreamToken, alarmStream);
router.get("/room/status/stream", authenticateStreamToken, roomStatusStream);
router.post("/logout", logout);

// Routes pour la gestion des salles
router.get("/rooms", getRooms);
router.get("/user/:userId/rooms", authenticateToken, getUserRooms);
router.post("/user/:userId/rooms", authenticateToken, assignUserRooms);

router.get("/user/", async (req, res) => {
    try {
        // update ezechiel.
        const user = await User.findOne({ mail: "ezechiel@gmail.com" });
        user.rooms = ["687eb3c3eb272f2317b151b0", "687eb3c3eb272f2317b151b1"];
        await user.save();
        res.json({
            user: user
        });
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
});

router.get("/ezechiel", async (req, res) => {
    try {
        const user = await User.findOne({ mail: "ezechiel@gmail.com" });
        console.log(user);
        res.json({
            user: user
        });
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
});

module.exports = router;