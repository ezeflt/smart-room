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

const Weather = () => {
    const user = useSelector<State, UserState>(userSelector);
    const [weatherData, setWeatherData] = useState<WeatherProps | null>(null);
    const uri = `http://${config.dns}:${config.port}/weather/stream?${getListIdQuery(user.listId)}`;

    useEffect(() => {
        const eventSource = new EventSource(uri);
        eventSource.onmessage = (event) => setWeatherData(JSON.parse(event.data));

        return () => {
            eventSource.close();
        };
    }, []);

  return (
    <div style={{ padding: '2rem' }}>
        <h1> Météo :</h1>
      <RowStatistics />
    </div>
  );
}

export default Weather;
