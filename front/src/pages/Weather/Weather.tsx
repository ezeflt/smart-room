import './weather.css';
import { useEffect, useState } from 'react';
import { WeatherProps } from './weather.interface';
import { useSelector } from 'react-redux';
import { globalSelector, State, userSelector } from '../../store/selector';
import { UserState } from '../../store/user';
import React from 'react';
import RowStatistics from './RowStatistics';
import { useLocation } from 'react-router-dom';
import Modal from '../../atoms/Modal';
import { GlobalState } from '../../store/global';
import config from '../../../config.json';

const Weather = () => {
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);
    const [weatherData, setWeatherData] = useState<WeatherProps | null>(null);
    const [lastTemperature, setLastTemperature] = useState<number | null>(null);
    const [lastHumidity, setLastHumidity] = useState<number | null>(null);
    const [lastPressure, setLastPressure] = useState<number | null>(null);
    const [lastSensorId, setLastSensorId] = useState<string | null>(null);
    const uri = `${config.api}/weather/stream?room_id=${user.alarmStatus[global.selectedRoom ?? 0-1]?.id}`;
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
                    
                    // Mise à jour des dernières valeurs pour le premier capteur
                    if (index === 0) {
                        if (currentTemp !== lastTemperature) {
                            setLastTemperature(currentTemp);
                        }
                        
                        if (currentHumidity !== lastHumidity) {
                            setLastHumidity(currentHumidity);
                        }
                        
                        if (currentPressure !== lastPressure) {
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
