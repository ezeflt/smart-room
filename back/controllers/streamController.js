const SensorStat = require("../models/sensorstat.js");
const { historic } = require("./alarmController.js");
const { getTemperatureBySensor, getHumidityBySensor, getPressureBySensor } = require("../controllers/sensorStatController.js");
const { getRoomsStatus } = require("../controllers/roomController.js");
const User = require("../models/user.js");
const UserSensor = require("../models/usersensor.js");
const RoomSensor = require("../models/roomsensor.js");

// Fonction utilitaire pour vérifier l'accès d'un utilisateur à une room via les tables de liaison
const checkRoomAccess = async (user, room_id) => {
    try {
        // Récupérer les sensors de l'utilisateur
        const userSensors = await UserSensor.find({ user_id: user._id }).select('sensor_id');
        const sensorIds = userSensors.map(us => us.sensor_id);
        
        // Vérifier si un de ces sensors est associé à la room demandée
        const roomSensor = await RoomSensor.findOne({ 
            sensor_id: { $in: sensorIds }, 
            room_id: room_id 
        });
        
        return !!roomSensor; // Retourne true si un sensor est trouvé, false sinon
    } catch (error) {
        console.error("Erreur lors de la vérification de l'accès à la room:", error);
        return false;
    }
};

// Endpoint SSE pour les données météo en temps réel
const weatherStream = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const room_id = req.query.room_id;

    // Envoi initial des données
    const sendData = async () => {
        try {
            // Récupérer le sensor_id lié à la room
            const link = await RoomSensor.findOne({ room_id });

            if (!link) {
                // Aucune correspondance room -> sensor, renvoyer tableau vide
                res.write(`data: ${JSON.stringify([])}\n\n`);
                return;
            }

            const sensorId = link.sensor_id;

            const temperature = await getTemperatureBySensor(sensorId);
            const humidity = await getHumidityBySensor(sensorId);
            const pressure = await getPressureBySensor(sensorId);
            
            // Formatage des données pour le frontend
            const data = [{
                sensor_id: sensorId,
                temperature: temperature,
                humidity: humidity,
                pressure: pressure
            }];
            
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi des données SSE:', error);
        }
    };

    sendData();

    // Envoi périodique des données (toutes les 5 secondes)
    const interval = setInterval(sendData, 5000);

    // Nettoyage lors de la déconnexion
    req.on('close', () => {
        clearInterval(interval);
    });
};

// Endpoint SSE pour les données d'alarme en temps réel
const alarmStream = async (req, res) => {
    console.log(req.user);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const room_id = req.query.room_id;
    const user =  await User.findOne({ mail: req.user.mail });
    
    if (!room_id) {
        res.write(`data: ${JSON.stringify({status: "off"})}\n\n`);
        return;
    }
    console.log(room_id);

    // Vérifier l'accès à la room via les tables de liaison
    const hasAccess = await checkRoomAccess(user, room_id);
    if (!hasAccess) {
        res.write(`data: ${JSON.stringify({status: "off"})}\n\n`);
        return;
    }

    console.log("Accès autorisé à la room:", room_id);

    // Envoi initial des données
    const sendData = async () => {
        try {
            // Mock data instead of database query
            const allData = await historic(room_id);

            res.write(`data: ${JSON.stringify(allData)}\n\n`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi des données SSE alarme:', error);
        }
    };

    sendData();

    // Envoi périodique des données (toutes les 5 secondes)
    const interval = setInterval(sendData, 5000);

    // Nettoyage lors de la déconnexion
    req.on('close', () => {
        clearInterval(interval);
    });
};

// Endpoint SSE pour le statut des alarmes par salle
const roomStatusStream = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Envoi initial des données
    const sendData = async () => {
        try {
            // Get status of rooms from database
            const data = await getRoomsStatus();
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi des données SSE statut alarme:', error);
        }
    };

    sendData();

    // Envoi périodique des données (toutes les 3 secondes)
    const interval = setInterval(sendData, 3000);

    // Nettoyage lors de la déconnexion
    req.on('close', () => {
        clearInterval(interval);
    });
};

module.exports = {
    weatherStream,
    alarmStream,
    roomStatusStream
}; 