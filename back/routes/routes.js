const express = require("express");
const router = express.Router();
const { register ,getUser,login, deleteUser, updateUser,forgotPassword, resetPassword, logout, getUserByEmail  } = require("../controllers/userController.js");
const { getRooms, getUserRooms, assignUserRooms } = require("../controllers/roomController.js");
const { mqttController } = require("../controllers/mqttController.js");
const { setAlarmUser } = require("../controllers/mqttAlarmController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { activate, deactivate } = require("../controllers/alarmController.js");
const { weatherStream, alarmStream, roomStatusStream } = require("../controllers/streamController.js");

router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.get("/user/me", authenticateToken, getMe);
router.get("/mqtt", mqttController);
router.delete('/user/:userId', authenticateToken, deleteUser);
router.put('/user/:userId', authenticateToken, updateUser);
router.post('/alarm/set-user', authenticateToken, setAlarmUser);
router.post('/alarm/activate',authenticateToken, activate); 
router.post('/alarm/deactivate',authenticateToken, deactivate); 
router.get("/user/:mail",authenticateToken, getUserByEmail);

// Stream endpoints
router.get("/weather/stream", weatherStream);
router.get("/alarm/stream", alarmStream);
router.get("/room/status/stream", roomStatusStream);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

// Routes pour la gestion des salles
router.get("/rooms", getRooms);
router.get("/user/:userId/rooms", authenticateToken, getUserRooms);
router.post("/user/:userId/rooms", authenticateToken, assignUserRooms);

module.exports = router;