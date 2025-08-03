import './weather.css';
import { getListIdQuery } from '../../protocol/api';
import { useEffect, useState } from 'react';
import { WeatherProps } from './weather.interface';
import { useSelector } from 'react-redux';
import { State, userSelector } from '../../store/selector';
import { UserState } from '../../store/user';
import { config } from '../../../config';
import React from 'react';
import RowStatistics from './RowStatistics';
import { useLocation } from 'react-router-dom';
import Modal from '../../atoms/Modal';

const Weather = () => {
    const user = useSelector<State, UserState>(userSelector);
    const [weatherData, setWeatherData] = useState<WeatherProps | null>(null);
    const [lastTemperature, setLastTemperature] = useState<number | null>(null);
    const [lastHumidity, setLastHumidity] = useState<number | null>(null);
    const [lastPressure, setLastPressure] = useState<number | null>(null);
    const [lastSensorId, setLastSensorId] = useState<string | null>(null);
    const uri = `http://${config.dns}:${config.port}/weather/stream?${getListIdQuery(user.listId)}`;
    const location = useLocation();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [hasShownAlert, setHasShownAlert] = useState(false);

    useEffect(() => {
        if (location.state && location.state.alert && !hasShownAlert) {
            setModalMessage(location.state.alert);
            setModalOpen(true);
            setHasShownAlert(true);
            // Nettoie l'alerte après affichage pour éviter de la revoir au prochain accès
            window.history.replaceState({}, document.title);
        }
    }, [location.state, hasShownAlert]);

    useEffect(() => {
        const eventSource = new EventSource(uri);
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data && data.length > 0) {
                // Traitement des données pour chaque capteur
                data.forEach((sensorData, index) => {
                    const currentTemp = sensorData.temperature;
                    const currentHumidity = sensorData.humidity;
                    const currentPressure = sensorData.pressure;
                    const currentSensorId = sensorData.sensor_id;
                    
                    // Console.log pour le premier capteur seulement, et seulement si les valeurs changent
                    if (index === 0) {
                        // Log pour la température
                        if (currentTemp !== lastTemperature) {
                            const temp = currentTemp !== undefined ? currentTemp : 'N/A';
                            console.log('🌡️ Capteur', currentSensorId, '- Température:', temp, '°C');
                            setLastTemperature(currentTemp);
                        }
                        
                        // Log pour l'humidité
                        if (currentHumidity !== lastHumidity) {
                            const humidity = currentHumidity !== undefined ? currentHumidity : 'N/A';
                            console.log('💧 Capteur', currentSensorId, '- Humidité:', humidity, '%');
                            setLastHumidity(currentHumidity);
                        }
                        
                        // Log pour la pression
                        if (currentPressure !== lastPressure) {
                            const pressure = currentPressure !== undefined ? currentPressure : 'N/A';
                            console.log('🌪️ Capteur', currentSensorId, '- Pression:', pressure, 'Pa');
                            setLastPressure(currentPressure);
                        }
                        
                        setLastSensorId(currentSensorId);
                    }
                });
            }
            setWeatherData(data);
        };

        return () => {
            eventSource.close();
        };
    }, [lastTemperature, lastHumidity, lastPressure, lastSensorId]);

  return (
    <div style={{ padding: '2rem' }}>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage || ''} />
        <h1> Météo :</h1>
      <RowStatistics />
    </div>
  );
}

export default Weather;
