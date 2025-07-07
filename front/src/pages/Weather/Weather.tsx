import { useParams } from 'react-router-dom';
import './weather.css';
import { getWeather } from '../../protocol/api';
import { useQuery } from '@tanstack/react-query';

const Weather = () => {
    // QUERY
    const { id: idFromUrl } = useParams();

    // REQUESTS
    const weather = useQuery({
        queryKey: ['getWeather', idFromUrl],
        queryFn: () => getWeather(idFromUrl as string),
        enabled: !!idFromUrl
    });

    return <>Weather</>;
};

export default Weather;
