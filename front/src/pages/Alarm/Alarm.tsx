import { useParams } from 'react-router-dom';
import './alarm.css';
import { useQuery } from '@tanstack/react-query';
import { getAlarm } from '../../protocol/api';

const Alarm = () => {
    // QUERY
    const { id: idFromUrl } = useParams();

    // REQUESTS
    const weather = useQuery({
        queryKey: ['getWeather', idFromUrl],
        queryFn: () => getAlarm(idFromUrl as string),
        enabled: !!idFromUrl,
    });

    return <>Alarm</>;
};

export default Alarm;
