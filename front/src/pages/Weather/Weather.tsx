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
import LargeScreen from '../../layouts/LargeScreen';
import { Page } from '../../global.interface';

const Weather = () => {
    const user = useSelector<State, UserState>(userSelector);
    const [weatherData, setWeatherData] = useState<WeatherProps | null>(null);
    const [lastTemperature, setLastTemperature] = useState<number | null>(null);
    const [lastHumidity, setLastHumidity] = useState<number | null>(null);
    const [lastPressure, setLastPressure] = useState<number | null>(null);
    const [lastSensorId, setLastSensorId] = useState<string | number | null>(null);
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
            try {
                const raw = JSON.parse(event.data);
                const latest = Array.isArray(raw) ? (raw[0] ?? null) : raw;
                if (!latest) return;

                const currentTemp = latest.temperature;
                const currentHumidity = latest.humidity;
                const currentPressure = latest.pressure;
                const currentSensorId = latest.sensor_id;
                const timestamp = latest.get_time || latest.timestamp || new Date().toISOString();

                if (currentTemp !== lastTemperature) setLastTemperature(currentTemp);
                if (currentHumidity !== lastHumidity) setLastHumidity(currentHumidity);
                if (currentPressure !== lastPressure) setLastPressure(currentPressure);
                if (currentSensorId !== lastSensorId) setLastSensorId(currentSensorId);

                setWeatherData({
                    temperature: currentTemp,
                    humidity: currentHumidity,
                    pressure: currentPressure,
                    sensor_id: currentSensorId,
                    timestamp,
                });
            } catch (e) {
                console.error('Erreur de parsing SSE weather:', e);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [uri, lastTemperature, lastHumidity, lastPressure, lastSensorId]);

  return (
    <div className="weather-page">
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage || ''} />
      <div className="weather-large">
        <LargeScreen page={Page.Weather} degreeCelcius={lastTemperature ?? undefined} />
      </div>
      <div className="weather-stats">
        <RowStatistics humidity={lastHumidity} pressure={lastPressure} />
      </div>
    </div>
  );
}

export default Weather;
