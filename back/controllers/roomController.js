const UserSensor = require("../models/usersensor");
const RoomSensor = require("../models/roomsensor");

// Récupérer toutes les salles disponibles
const getRooms = async (req, res) => {
    try {
        const Room = require("../models/room");
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

// Récupérer les salles assignées à un utilisateur
const getUserRooms = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Récupérer les sensor_id associés à l'utilisateur
        const userSensors = await UserSensor.find({ user_id: userId }).select('sensor_id');
        const sensorIds = userSensors.map(us => us.sensor_id);
        
        // Récupérer les room_id correspondants
        const roomSensors = await RoomSensor.find({ sensor_id: { $in: sensorIds } }).select('room_id');
        const roomIds = roomSensors.map(rs => rs.room_id);
        
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

// Assigner des salles à un utilisateur
const assignUserRooms = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roomIds } = req.body;
        
        const User = require("../models/user");
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Utilisateur non trouvé",
                type: "danger"
            });
        }
        
        // Supprimer toutes les assignations existantes pour cet utilisateur
        const deletedCount = await UserSensor.deleteMany({ user_id: userId });
        console.log(`Suppression de ${deletedCount.deletedCount} assignations existantes pour l'utilisateur ${userId}`);
        
        // Pour chaque salle assignée, récupérer ses capteurs et créer les assignations
        const Room = require("../models/room");
        const Sensor = require("../models/sensor");
        
        let totalAssignments = 0;
        
        for (const roomId of roomIds) {
            const roomSensors = await RoomSensor.find({ room_id: roomId }).select('sensor_id');
            console.log(`Salle ${roomId} a ${roomSensors.length} capteurs`);
            
            // Créer les assignations utilisateur-capteur
            for (const roomSensor of roomSensors) {
                try {
                    await UserSensor.create({
                        user_id: userId,
                        sensor_id: roomSensor.sensor_id
                    });
                    totalAssignments++;
                } catch (assignmentError) {
                    console.error(`Erreur lors de l'assignation du capteur ${roomSensor.sensor_id}:`, assignmentError);
                }
            }
        }
        
        console.log(`Total d'assignations créées: ${totalAssignments}`);
        
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

// recupere le status et l'id des 3 rooms
const getRoomsStatus = async () => {
    try {
        const Room = require("../models/room");
        const Alarm = require("../models/alarm");
        
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