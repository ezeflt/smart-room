const express = require("express");
const router = express.Router();
const { register ,getUser,login, deleteUser, updateUser,forgotPassword, resetPassword, logout  } = require("../controllers/userController.js");
const { mqttController } = require("../controllers/mqttController.js");
const { setAlarmUser } = require("../controllers/mqttAlarmController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { activate, deactivate } = require("../controllers/alarmController.js");
const { weatherStream, alarmStream, roomStatusStream } = require("../controllers/streamController.js");


router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.get("/mqtt", mqttController);
router.delete('/user/:userId', authenticateToken, deleteUser);
router.put('/user/:userId', authenticateToken, updateUser);
router.post('/alarm/set-user', authenticateToken, setAlarmUser);
router.post('/alarm/activate',authenticateToken, activate); 
router.post('/alarm/deactivate',authenticateToken, deactivate); 

// Stream endpoints
router.get("/weather/stream", weatherStream);
router.get("/alarm/stream", alarmStream);
router.get("/room/status/stream", roomStatusStream);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

module.exports = router;