const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const UserSensor = require("../models/usersensor");
const RoomSensor = require("../models/roomsensor");
const Room = require("../models/room");

// Fonction utilitaire pour récupérer les roomIds d'un utilisateur via les tables de liaison
const getUserRoomIds = async (userId) => {
    try {
        // Récupérer les sensors de l'utilisateur
        const userSensors = await UserSensor.find({ user_id: userId }).select('sensor_id');
        const sensorIds = userSensors.map(us => us.sensor_id);
        
        // Récupérer les rooms associées à ces sensors
        const roomSensors = await RoomSensor.find({ sensor_id: { $in: sensorIds } }).select('room_id');
        const roomIds = roomSensors.map((roomSensor) => roomSensor.room_id);
        
        return roomIds;
    } catch (error) {
        console.error("Erreur lors de la récupération des roomIds:", error);
        return [];
    }
};

/**
 * Utilisateur : Register
 * Description : Enregistrement d'un nouvel utilisateur
 * 
 * @returns - Utilisateur enregistré
 */
const register = async (req, res) => {
    const { username, mail, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Les mots de passe ne correspondent pas",
                type: "danger"
            });
        }

        // Hashage de mot de passe(aléatoire) avec une complexité de 10
        const rehashCount = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, rehashCount);

        const user = new User({
            username,
            mail,
            password: hashedPassword,
            role: "client"
        });

        await user.save();
        console.info("Utilisateur enregistré :", user);

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

/**
 * Utilisateur : Client
 * Description : Connexion d'un utilisateur
 * 
 * @returns - Utilisateur connecté
 */
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

        const expiresIn = 24 * 60 * 60 * 1000; // 24 heures

        res.status(200).json({
            message: "Connexion réussie!",
            type: "success",
            token,
            expiresIn,
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

/**
 * Utilisateur : Admin (back-office)
 * Description : Récupération de tous les utilisateurs
 * 
 * @returns - Utilisateurs
 */
const getUsers = async (req, res) => {
    try {
        
        const users = await User.find({})
        res.status(200).json({
            message: "utilisateurs récupérées avec succès",
            type: "success",
            users
        });
        console.info("Utilisateurs récupérés :", users);
    } catch (err) {
        console.error("Erreur lors de la récupération des users :", err);
        res.status(500).json({
            message: "Erreur lors de la récupération des users",
            type: "danger"
        });
    }
}

/**
 * Utilisateur : Client
 * Description : Récupération d'un utilisateur par email
 * 
 * @returns - Utilisateur
 */
const getUserByEmail = async (req, res) => {
    const { mail } = req.params;
    const user = await User.findOne({ mail });
    if (!user) {
        return res.status(404).json({
            message: "Utilisateur non trouvé",
            type: "danger"
        });
    }
    console.info("Utilisateur récupéré :", user);
    res.status(200).json({
        message: "Utilisateur récupéré avec succès",
        type: "success",
        user
    });
}

/**
 * Utilisateur : Admin
 * Description : Mise à jour d'un utilisateur par ID
 * 
 * @returns - Utilisateur mis à jour
 */
const updateUserById = async (req, res) => {
    const { userId } = req.params;
    const updatedUserBody = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedUserBody },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "Utilisateur non trouvé",
                type: "danger"
            });
        }

        // Récupération des roomIds via les tables de liaison
        const roomIds = await getUserRoomIds(updatedUser._id);

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

/**
 * Utilisateur : Admin
 * Description : Suppression d'un utilisateur par ID
 * 
 * @returns - Utilisateur supprimé
 */
const deleteUserById = async (req, res) => {
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


/**
 * Utilisateur : Client
 * Description : Ici, on ne peut pas invalider un JWT côté serveur sans blacklist globale.
 * Log deconnexion réussie.
 * 
 * @returns - Déconnexion réussie
 */
const logout = async (req, res) => {
    console.debug("Déconnexion réussie !");
    res.status(200).json({
        message: "Déconnexion réussie !",
        type: "success"
    });
}

/**
 * Utilisateur : Client
 * Description : Récupération des informations utilisateur
 * 
 * @returns - Informations utilisateur
 */
const getUser = async (req, res) => {
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

module.exports = { register, login, getUser, getUserByEmail, updateUserById, deleteUserById, logout, getUsers, getUserRoomIds };