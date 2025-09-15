import './weather.css';
import { useEffect, useState } from 'react';
import { WeatherProps } from './weather.interface';
import { useSelector, useDispatch } from 'react-redux';
import { globalSelector, State, userSelector } from '../../store/selector';
import { UserState } from '../../store/user';
import React from 'react';
import RowStatistics from './RowStatistics';
import { useLocation } from 'react-router-dom';
import Modal from '../../atoms/Modal';
import { GlobalState, setSelectedRoom } from '../../store/global';
import LargeScreen from '../../layouts/LargeScreen';
import { Page } from '../../global.interface';
import { getApiKey } from '../../utils';

const SERVER_URL = getApiKey();

const Weather = () => {
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);

    const [lastTemperature, setLastTemperature] = useState<number | null>(null);
    const [lastHumidity, setLastHumidity] = useState<number | null>(null);
    const [lastPressure, setLastPressure] = useState<number | null>(null);
    const [lastSensorId, setLastSensorId] = useState<string | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherProps | null>(null);
    const location = useLocation();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [hasShownAlert, setHasShownAlert] = useState(false);
    const rooms = global.rooms;
    const handleRoomSelect = (roomId: string) => {
        dispatch(setSelectedRoom(roomId));
    };

    useEffect(() => {
        if (location.state && location.state.alert && !hasShownAlert) {
            setModalMessage(location.state.alert);
            setModalOpen(true);
            setHasShownAlert(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, hasShownAlert]);

    useEffect(() => {
        if (!global.selectedRoom) {
            return
        };

        const uri = `${SERVER_URL}/weather/stream?room_id=${global.selectedRoom}`;
        console.log('Connexion au flux météo avec URI:', uri);
        const eventSource = new EventSource(uri);
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Données reçues du flux météo:', data);
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
    }, [global.selectedRoom]);

  return (
    <div className="weather-page">
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage || ''} />
        <LargeScreen page={Page.Weather} degreeCelcius={lastTemperature ?? 0} handleRoomSelect={handleRoomSelect} />
      <RowStatistics lastHumidity={lastHumidity} lastPressure={lastPressure} />
    </div>
  );
}

export default Weather;
