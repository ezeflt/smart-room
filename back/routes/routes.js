const express = require("express");
const router = express.Router();
const { register ,getUser,login, deleteUser, updateUser  } = require("../controllers/userController.js");
const { mqttController } = require("../controllers/mqttController.js");


router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.get("/mqtt", mqttController);
router.delete('/user/:userId', deleteUser);
router.put('/user/:userId', updateUser);

module.exports = router;