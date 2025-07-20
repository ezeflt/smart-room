const express = require("express");
const router = express.Router();
const { register ,getUser,login, deleteUser, updateUser  } = require("../controllers/userController.js");
const { mqttController } = require("../controllers/mqttController.js");
const { getTemperatureBySensor, getHumidityBySensor, getPressureBySensor } = require("../controllers/sensorStatController.js");


router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.get("/mqtt", mqttController);
router.delete('/user/:userId', deleteUser);
router.put('/user/:userId', updateUser);
router.get("/sensor/:sensor_id/temperature", getTemperatureBySensor);
router.get("/sensor/:sensor_id/humidity", getHumidityBySensor);
router.get("/sensor/:sensor_id/pressure", getPressureBySensor);

module.exports = router;