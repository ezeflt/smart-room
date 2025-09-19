const SensorStat = require("../models/sensorstat.js");
const { historic } = require("./alarmController.js");
const { getRoomsStatus } = require("../controllers/roomController.js");
const User = require("../models/user.js");
const RoomSensor = require("../models/roomsensor.js");
const { checkRoomAccess } = require("../service/userService.js");

const streamHeadersOptions = {
    // Content-Type - Permet de définir le type de contenu et de définir le format des données
    'Content-Type': 'text/event-stream',
    // Cache-Control - Permet de désactiver le cache du navigateur
    'Cache-Control': 'no-cache',
    // Keep-alive - Permet de maintenir la connexion ouverte
    'Connection': 'keep-alive',

    // Headers CORS - Permet de définir les origines autorisées pour les requêtes CORS
    'Access-Control-Allow-Origin': process.env.DNS_CLIENT,
};

// Endpoint SSE pour les données météo en temps réel
const weatherStream = (req, res) => {
    res.writeHead(200, streamHeadersOptions);

    const room_id = req.query.room_id;

    // Envoi initial des données
    const sendData = async () => {
        try {
            // Récupérer le sensor_id lié à la room
            const room = await RoomSensor.findOne({ room_id });

            if (!room) {
                // Aucune correspondance room -> sensor, renvoyer tableau vide
                res.write(`data: ${JSON.stringify([])}\n\n`);
                return;
            }

            const sensorId = room.sensor_id;

            // Récupérer chaque mesure avec son datetime individuel
            // Recpere que les champs temperature, humidity, pressure
            // Trier par le 
            const tempData = await SensorStat.findOne(
                { sensor_id: sensorId, temperature: { $exists: true } }, 
                { temperature: 1, get_time: 1 }
            ).sort({ get_time: -1 });
            
            const humidityData = await SensorStat.findOne(
                { sensor_id: sensorId, humidity: { $exists: true } }, 
                { humidity: 1, get_time: 1 }
            ).sort({ get_time: -1 });
            
            const pressureData = await SensorStat.findOne(
                { sensor_id: sensorId, pressure: { $exists: true } }, 
                { pressure: 1, get_time: 1 }
            ).sort({ get_time: -1 });
            
            // Formatage des données pour le frontend avec datetime individuel pour chaque mesure
            const data = [{
                sensor_id: sensorId,
                temperature: tempData?.temperature ?? null,
                temperature_datetime: tempData?.get_time.toISOString() ?? null,
                humidity: humidityData?.humidity ?? null,
                humidity_datetime: humidityData?.get_time.toISOString() ?? null,
                pressure: pressureData?.pressure ?? null,
                pressure_datetime: pressureData?.get_time.toISOString() ?? null
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
    const room_id = req.query.room_id;

    if (!room_id) {
        res.status(400).json({ error: "Room ID is required" });
        return;
    }

    const user =  await User.findOne({ mail: req.user.mail });

    if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // Vérifier l'accès à la room via les tables de liaison
    const hasAccess = await checkRoomAccess(user._id, room_id);

    if (!hasAccess) {
        res.status(403).json({ error: "Access denied" });
        return;
    }

    // Démarre le flux SSE uniquement après validation
    res.writeHead(200, streamHeadersOptions);

    // Envoi initial des données
    const sendData = async () => {
        try {
            const alarmData = await historic(room_id);

            console.log('alarmData', alarmData);

            res.write(`data: ${JSON.stringify(alarmData)}\n\n`);
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
    res.writeHead(200, streamHeadersOptions);

    // Envoi initial des données
    const sendData = async () => {
        try {
            // Recupere le statut de la room depuis la base de données
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
    roomStatusStream,
    checkRoomAccess
}; 