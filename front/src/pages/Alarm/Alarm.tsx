import { useParams } from 'react-router-dom';
import './alarm.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAlarm, putAlarm } from '../../protocol/api';
import { useDispatch, useSelector } from 'react-redux';
import { globalSelector, State } from '../../store/selector';
import { GlobalState, setAlarm } from '../../store/global';

const Alarm = () => {
    const dispatch = useDispatch();
    const global = useSelector<State, GlobalState>(globalSelector);

    // QUERY
    const { id: idFromUrl } = useParams();

    // REQUESTS
    const alarm = useQuery({
        queryKey: ['getAlarm', idFromUrl],
        queryFn: () => getAlarm(idFromUrl as string),
        enabled: !!idFromUrl,
    });

    const handleActivateAlarm = useMutation({
        mutationFn: () => putAlarm({ userId: idFromUrl as string, enabled: true }),
        onSettled: () => dispatch(setAlarm({ isActivated: true })),
    });

    const handleDeactivateAlarm = useMutation({
        mutationFn: () => putAlarm({ userId: idFromUrl as string, enabled: false }),
        onSettled: () => dispatch(setAlarm({ isActivated: false })),
    });

    return (
        <>
            <h1>Alarm</h1>
            <span>Alarm is activated: {global.alarm.isActivated}</span>
        </>
    );
};

export default Alarm;
