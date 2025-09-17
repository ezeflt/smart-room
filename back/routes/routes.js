const express = require("express");
const router = express.Router();
const { register ,getUsers,login, deleteUserById, updateUserById, logout, getUser  } = require("../controllers/userController.js");
const { getRooms, getUserRooms, assignUserRooms } = require("../controllers/roomController.js");
const { authenticateToken, authenticateStreamToken } = require("../middleware/auth.js");
const { activate, deactivate } = require("../controllers/alarmController.js");
const { weatherStream, alarmStream, roomStatusStream } = require("../controllers/streamController.js");

// CRUD - Auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// CRUD - User
router.get("/users", getUsers);
router.get("/user", authenticateToken, getUser);
router.put('/user/:userId', authenticateToken, updateUserById);
router.delete('/user/:userId', authenticateToken, deleteUserById);

// CRUD - Alarm
router.put('/alarm/activate',authenticateToken, activate); 
router.put('/alarm/deactivate',authenticateToken, deactivate); 
router.get("/alarm/stream", authenticateStreamToken, alarmStream);

// CRUD - Weather
router.get("/weather/stream", weatherStream);

// CRUD - Room
router.get("/rooms", getRooms);
router.get("/user/:userId/rooms", authenticateToken, getUserRooms);
router.post("/user/:userId/rooms", authenticateToken, assignUserRooms);
router.get("/room/status/stream", authenticateStreamToken, roomStatusStream);

module.exports = router;