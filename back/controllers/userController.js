const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserSensor = require("../models/usersensor");
const RoomSensor = require("../models/roomsensor");

// Fonction utilitaire pour récupérer les roomIds d'un utilisateur via les tables de liaison
const getUserRoomIds = async (userId) => {
    try {
        // Récupérer les sensors de l'utilisateur
        const userSensors = await UserSensor.find({ user_id: userId }).select('sensor_id');
        const sensorIds = userSensors.map(us => us.sensor_id);

        console.log("@@ @@sensorIds", sensorIds);
        
        // Récupérer les rooms associées à ces sensors
        const roomSensors = await RoomSensor.find({ sensor_id: { $in: sensorIds } }).select('room_id');
        const roomIds = roomSensors.map(rs => rs.room_id);

        console.log("@@ @@roomIds", roomIds);
        
        return roomIds;
    } catch (error) {
        console.error("Erreur lors de la récupération des roomIds:", error);
        return [];
    }
};

// Fonction utilitaire pour récupérer les informations complètes des rooms d'un utilisateur
const getUserRooms = async (userId) => {
    try {
        const Room = require("../models/room");
        
        // Récupérer les roomIds
        const roomIds = await getUserRoomIds(userId);
        
        // Récupérer les informations complètes des rooms
        const rooms = await Room.find({ _id: { $in: roomIds } });
        
        return rooms;
    } catch (error) {
        console.error("Erreur lors de la récupération des rooms:", error);
        return [];
    }
};

const register = async (req, res) => {
    const { username, mail, password, confirmPassword } = req.body;

     console.log("Donnees", req.body);

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Les mots de passe ne correspondent pas",
                type: "danger"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            mail,
            password: hashedPassword,
            role: "client"
        });

        await user.save();
        console.log("Utilisateur enregistré :", user);
        res.status(201).json({
            message: "Utilisateur créé avec succès!",
            type: "success",
            user
        });
    } catch (err) {
        console.error("Erreur lors de l'enregistrement :", err);
        res.status(400).json({
            message: err.message,
            type: "danger"
        });
    }
}

const login = async (req, res) => {
    const { mail, password } = req.body;
    try {
        // Vérification si l'utilisateur existe
        const user = await User.findOne({ mail });
        if (!user) {
            return res.status(400).json({
                message: "Email ou mot de passe incorrect",
                type: "danger"
            });
        }

        // Vérification du mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: "Email ou mot de passe incorrect",
                type: "danger"
            });
        }

        // Récupération des roomIds via les tables de liaison
        const roomIds = await getUserRoomIds(user._id);

        // Création d'un token
        const token = jwt.sign(
            { userId: user._id, mail: user.mail },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log("Token généré :", token);

        res.status(200).json({
            message: "Connexion réussie!",
            type: "success",
            token,
            expiresIn: 24 * 60 * 60 * 1000,
            user: {
                id: user._id,
                username: user.username,
                mail: user.mail,
                roomIds: roomIds
            }
        });
    } catch (err) {
        console.error("Erreur lors de la connexion :", err);
        res.status(500).json({
            message: "Erreur lors de la connexion",
            type: "danger"
        });
    }
}

const getUser = async (req, res) => {
    try {
        
        const users = await User.find({})
        res.status(200).json({
            message: "utilisateurs récupérées avec succès",
            type: "success",
            users
        });
        console.log("Utilisateurs récupérés :", users);
    } catch (err) {
        console.error("Erreur lors de la récupération des users :", err);
        res.status(500).json({
            message: "Erreur lors de la récupération des users",
            type: "danger"
        });
    }
}

const getUserByEmail = async (req, res) => {
    const { mail } = req.params;
    const user = await User.findOne({ mail });
    if (!user) {
        return res.status(404).json({
            message: "Utilisateur non trouvé",
            type: "danger"
        });
    }
    console.log("Utilisateur récupéré :", user);
    res.status(200).json({
        message: "Utilisateur récupéré avec succès",
        type: "success",
        user
    });
}

const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { username, mail, password } = req.body;

    try {
        const updateFields = {};

        if (username) updateFields.username = username;
        if (mail) updateFields.mail = mail;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        // Récupération des roomIds via les tables de liaison
        const roomIds = await getUserRoomIds(updatedUser._id);

        if (!updatedUser) {
            return res.status(404).json({
                message: "Utilisateur non trouvé",
                type: "danger"
            });
        }

        res.status(200).json({
            message: "Utilisateur mis à jour avec succès",
            type: "success",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                mail: updatedUser.mail,
                roomIds: roomIds
            }
        });
    } catch (err) {
        console.error("Erreur lors de la mise à jour :", err);
        res.status(500).json({
            message: "Erreur lors de la mise à jour de l'utilisateur",
            type: "danger"
        });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                message: "Utilisateur non trouvé",
                type: "danger"
            });
        }

        res.status(200).json({
            message: "Utilisateur supprimé avec succès",
            type: "success",
            user: {
                id: deletedUser._id,
                username: deletedUser.username,
                mail: deletedUser.mail
            }
        });
    } catch (err) {
        console.error("Erreur lors de la suppression :", err);
        res.status(500).json({
            message: "Erreur lors de la suppression de l'utilisateur",
            type: "danger"
        });
    }
};


// Fonction logout : côté JWT, il suffit de supprimer le token côté client
const logout = async (req, res) => {
    // Ici, on ne peut pas invalider un JWT côté serveur sans blacklist globale
    // On informe juste le client de supprimer son token
    res.status(200).json({
        message: "Déconnexion réussie !",
        type: "success"
    });
}

const getMe = async (req, res) => {
    try {
        // req.user est défini par le middleware authenticateToken
        const userId = req.user.userId;
        
        // Récupérer l'utilisateur complet depuis la base de données
        const user = await User.findById(userId).select('-password'); // Exclure le mot de passe
        
        if (!user) {
            return res.status(404).json({
                message: "Utilisateur non trouvé",
                type: "danger"
            });
        }

        // Récupération des roomIds via les tables de liaison
        const roomIds = await getUserRoomIds(user._id);

        res.status(200).json({
            message: "Informations utilisateur récupérées avec succès",
            type: "success",
            user: {
                id: user._id,
                username: user.username,
                mail: user.mail,
                role: user.role,
                roomIds: roomIds
            }
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des informations utilisateur :", err);
        res.status(500).json({
            message: "Erreur lors de la récupération des informations utilisateur",
            type: "danger"
        });
    }
};

// Récupérer les informations complètes des rooms d'un utilisateur
const getUserRoomsInfo = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.userId;
        
        // Récupérer les informations complètes des rooms
        const rooms = await getUserRooms(userId);
        
        res.status(200).json({
            message: "Rooms de l'utilisateur récupérées avec succès",
            type: "success",
            rooms: rooms
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des rooms de l'utilisateur :", err);
        res.status(500).json({
            message: "Erreur lors de la récupération des rooms de l'utilisateur",
            type: "danger"
        });
    }
};

module.exports = { register, login, getUser, getUserByEmail, updateUser, deleteUser, logout, getMe, getUserRoomsInfo };
