const SensorStat = require("../models/sensorstat.js");
const { historic } = require("./alarmController.js");
const { getTemperatureBySensor, getHumidityBySensor, getPressureBySensor } = require("../controllers/sensorStatController.js");

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
            const temperature = await getTemperatureBySensor(room_id);
            const humidity = await getHumidityBySensor(room_id);
            const pressure = await getPressureBySensor(room_id);
            const data = {
                temperature,
                humidity,
                pressure
            }
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
const alarmStream = (req, res) => {
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
            // Mock data instead of database query
            const data = await historic(room_id);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
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
            // Récupérer l'historique des alarmes pour toutes les rooms
            const Alarm = require("../models/alarm.js");
            const Room = require("../models/room.js");
            
            // Récupérer toutes les rooms
            const rooms = await Room.find({});
            
            // Pour chaque room, récupérer la dernière alarme
            const roomStatuses = await Promise.all(
                rooms.map(async (room) => {
                    const lastAlarm = await Alarm.findOne({ room_id: room._id })
                        .sort({ timestamp: -1 })
                        .populate('user_id', 'username');
                    
                    return {
                        room_id: room._id,
                        status: getOnOff(lastAlarm ? lastAlarm.action : "off"),
                        id: room._id
                    };
                })
            );
            
            res.write(`data: ${JSON.stringify(roomStatuses)}\n\n`);
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

function getOnOff(action) {
    if (action === "active") {
        return "on";
    } else {
        return "off";
    }
}

module.exports = {
    weatherStream,
    alarmStream,
    roomStatusStream
}; 