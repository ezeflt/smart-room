const express = require("express");
const router = express.Router();
const { register ,getUser,login,  } = require("../controllers/userController.js");
const { mqttController } = require("../controllers/mqttController.js");
const { getTemperatureBySensor, getHumidityBySensor, getPressureBySensor } = require("../controllers/sensorStatController.js");


router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.get("/mqtt", mqttController);
router.get("/sensor/:sensor_id/temperature", getTemperatureBySensor);
router.get("/sensor/:sensor_id/humidity", getHumidityBySensor);
router.get("/sensor/:sensor_id/pressure", getPressureBySensor);

module.exports = router;