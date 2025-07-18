const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

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

        // Création d'un token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );
        console.log("Token généré :", token);
        // Envoi du token et des informations utilisateur
        res.status(200).json({
            message: "Connexion réussie!",
            type: "success",
            token,
            expiresIn: 24 * 60 * 60 * 1000,
            user: {
                id: user._id,
                username: user.username,
                mail: user.mail
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

module.exports = { register, login, getUser, deleteUser };