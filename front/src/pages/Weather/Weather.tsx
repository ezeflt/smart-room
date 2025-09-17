import './weather.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { globalSelector, State } from '../../store/selector';
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
    const global = useSelector<State, GlobalState>(globalSelector);

    const [lastTemperature, setLastTemperature] = useState<number | null>(null);
    const [lastHumidity, setLastHumidity] = useState<number | null>(null);
    const [lastPressure, setLastPressure] = useState<number | null>(null);
    const location = useLocation();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [hasShownAlert, setHasShownAlert] = useState(false);
    const handleRoomSelect = (roomId: string) => {
        dispatch(setSelectedRoom(roomId));
    };

    useEffect(() => {
        const state = location.state as { alert?: string } | null;
        if (state?.alert && !hasShownAlert) {
            setModalMessage(state.alert);
            setModalOpen(true);
            setHasShownAlert(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, hasShownAlert]);

    useEffect(() => {
        if (!global.selectedRoom || !SERVER_URL) {
            return
        };

        const uri = `${SERVER_URL}/weather/stream?room_id=${global.selectedRoom}`;
        const eventSource = new EventSource(uri);
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data) && data.length > 0) {
                    const firstSensor = data[0];
                    setLastTemperature(firstSensor?.temperature ?? null);
                    setLastHumidity(firstSensor?.humidity ?? null);
                    setLastPressure(firstSensor?.pressure ?? null);
                }
            } catch (_e) {
                // Ignore malformed events
            }
        };
        eventSource.onerror = () => {
            // Minimal error handling: log and let EventSource retry automatically
            console.warn('SSE weather stream error. The browser will attempt to reconnect.');
        };

        return () => {
            eventSource.close();
        };
    }, [global.selectedRoom]);

  const degreeText = lastTemperature == null ? '--' : String(Math.round(lastTemperature));

  return (
    <div className="weather-page">
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage || ''} />
        <LargeScreen page={Page.Weather} degreeCelcius={degreeText} handleRoomSelect={handleRoomSelect} />
      <RowStatistics lastHumidity={lastHumidity} lastPressure={lastPressure} />
    </div>
  );
}

export default Weather;
