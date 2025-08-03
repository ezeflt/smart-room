const express = require("express");
const router = express.Router();
const { register ,getUser,login, deleteUser, updateUser,forgotPassword, resetPassword  } = require("../controllers/userController.js");
const { mqttController } = require("../controllers/mqttController.js");
const { getTemperatureBySensor, getHumidityBySensor, getPressureBySensor } = require("../controllers/sensorStatController.js");
const { setAlarmUser } = require("../controllers/mqttAlarmController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { activate, deactivate, historic } = require("../controllers/alarmController.js");


router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.get("/mqtt", mqttController);
router.delete('/user/:userId', authenticateToken, deleteUser);
router.put('/user/:userId', authenticateToken, updateUser);
router.post('/alarm/set-user', authenticateToken, setAlarmUser);
router.post('/alarm/activate',authenticateToken, activate); 
router.post('/alarm/deactivate',authenticateToken, deactivate); 
router.get('/alarm/historic', authenticateToken, historic);
router.get("/sensor/:sensor_id/temperature", getTemperatureBySensor);
router.get("/sensor/:sensor_id/humidity", getHumidityBySensor);
router.get("/sensor/:sensor_id/pressure", getPressureBySensor);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;