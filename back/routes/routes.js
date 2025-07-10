const express = require("express");
const router = express.Router();
const { register ,getUser,login } = require("../controllers/userController.js");


router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);

module.exports = router;