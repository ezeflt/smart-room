const User = require("../models/user");
const bcrypt = require("bcryptjs");


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
            role: "employé"
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


module.exports = {register};