const UserSensor = require("../models/usersensor.js");
const RoomSensor = require("../models/roomsensor.js");

// Vérifie l'accès d'un utilisateur à une room via les tables de liaison
const checkRoomAccess = async (user_id, room_id) => {
    try {
        const userSensors = await UserSensor.find({ user_id }).select('sensor_id');
        const sensorIds = userSensors.map(us => us.sensor_id);

        const roomSensor = await RoomSensor.findOne({
            sensor_id: { $in: sensorIds },
            room_id: room_id
        });

        return !!roomSensor;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'accès à la room:", error);
        return false;
    }
};

module.exports = { checkRoomAccess };