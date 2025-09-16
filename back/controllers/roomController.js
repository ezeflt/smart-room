const UserSensor = require("../models/usersensor");
const RoomSensor = require("../models/roomsensor");
const Room = require("../models/room");
const Alarm = require("../models/alarm");
const { getUserRoomIds } = require("./userController");
const User = require("../models/user");
/**
 * Utilisateur : Client
 * Description : Récupère toutes les salles disponibles
 * 
 * @returns - Liste des salles
 */
const getRooms = async (req, res) => {
    
    try {
        const rooms = await Room.find().select('_id name');

        res.status(200).json({
            rooms: rooms
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des salles :", err);
        res.status(500).json({
            message: "Erreur lors de la récupération des salles",
            type: "danger"
        });
    }
};

/**
 * Utilisateur : Client
 * Description : Récupère les salles assignées à un utilisateur
 * 
 * @returns - Liste des salles assignées à l'utilisateur
 */
const getUserRooms = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const roomIds = await getUserRoomIds(userId);
        
        res.status(200).json({
            roomIds: roomIds
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des salles de l'utilisateur :", err);
        res.status(500).json({
            message: "Erreur lors de la récupération des salles de l'utilisateur",
            type: "danger"
        });
    }
};


/**
 * Utilisateur : Admin
 * Description : Assigne des salles à un utilisateur
 * 
 * @returns - Liste des salles assignées à l'utilisateur
 */
const assignUserRooms = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roomIds } = req.body;
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur non trouvé",
                type: "danger"
            });
        }
        
        // Supprime toutes les assignations existantes pour cet utilisateur
        await UserSensor.deleteMany({ user_id: userId });
        
        for (const roomId of roomIds) {
            const roomSensors = await RoomSensor.find({ room_id: roomId }).select('sensor_id');
            
            // Créer les assignations utilisateur-capteur
            for (const roomSensor of roomSensors) {
                try {
                    await UserSensor.create({
                        user_id: userId,
                        sensor_id: roomSensor.sensor_id
                    });
                } catch (assignmentError) {
                    console.error(`Erreur lors de l'assignation du capteur ${roomSensor.sensor_id}:`, assignmentError);
                }
            }
        }
        
        res.status(200).json({
            message: "Salles assignées avec succès",
            type: "success"
        });
    } catch (err) {
        console.error("Erreur lors de l'assignation des salles :", err);
        res.status(500).json({
            message: "Erreur lors de l'assignation des salles",
            type: "danger"
        });
    }
};

/**
 * Utilisateur : Client
 * Description : Récupère le statut et l'id des salles
 * 
 * @returns - Liste des salles avec leur statut
 */
const getRoomsStatus = async () => {
    try {        
        // Récupérer toutes les salles
        const rooms = await Room.find().select('_id name');
        
        // Pour chaque salle, récupérer le dernier état d'alarme
        const roomStatus = await Promise.all(rooms.map(async (room) => {
            // Récupérer la dernière action d'alarme pour cette salle
            const lastAlarm = await Alarm.findOne({ room_id: room._id })
                .populate("user_id", "username mail")
                .sort({ timestamp: -1 })
                .limit(1);
            
            // Déterminer le statut actuel basé sur la dernière action
            let status = 'off'; // Par défaut, l'alarme est désactivée

            
            if (lastAlarm) {
                status = lastAlarm.action === 'active' ? 'on' : 'off';
            }
            
            return {
                id: room._id,
                name: room.name,
                status: status,
            };
        }));
        
        return roomStatus;
    } catch (error) {
        console.error("Erreur lors de la récupération du statut des salles :", error);
        throw error;
    }
};

module.exports = {
    getRooms,
    getUserRooms,
    assignUserRooms,
    getRoomsStatus,
}; 