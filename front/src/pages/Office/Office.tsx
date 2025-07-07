import { useParams } from 'react-router-dom';
import './office.css';
import { useQuery } from '@tanstack/react-query';

const Office = () => {
    // QUERY
    const { id: idFromUrl } = useParams();

    // REQUESTS
    const office = useQuery({
        queryKey: ['getWeather', idFromUrl],
        queryFn: () => () => '',
        enabled: !!idFromUrl
    });

    return (
        <>Office</>
    )
}

export default Office;