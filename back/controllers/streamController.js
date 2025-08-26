const SensorStat = require("../models/sensorstat.js");
const { historic } = require("./alarmController.js");
const { getTemperatureBySensor, getHumidityBySensor, getPressureBySensor } = require("../controllers/sensorStatController.js");
const { getRoomsStatus } = require("../controllers/roomController.js");
const User = require("../models/user.js");

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
            
            // Formatage des données pour le frontend
            const data = [{
                sensor_id: room_id,
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
    }
    console.log(room_id);

    if (!checkRoomAccess(user, room_id)) {
        res.write(`data: ${JSON.stringify({status: "off"})}\n\n`);
        return;
    }

    console.log(user.rooms.includes(room_id));

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

function checkRoomAccess(user, room_id) {
    return user.rooms.includes(room_id);
}

module.exports = {
    weatherStream,
    alarmStream,
    roomStatusStream
}; 