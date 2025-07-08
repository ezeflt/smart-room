import './alarm.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAlarmHistory, getListIdQuery, putAlarm } from '../../protocol/api';
import { useDispatch, useSelector } from 'react-redux';
import { globalSelector, State, userSelector } from '../../store/selector';
import { GlobalState, setAlarm } from '../../store/global';
import { UserState } from '../../store/user';
import { useEffect, useState } from 'react';
import { AlarmProps } from './alarm.interface';
import { config } from '../../../../config';

const Alarm = () => {
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);

    const [alarm, setAlarAlarm] = useState<AlarmProps| null>(null);
    const URI = `http://${config.dns}:${config.port}/alarm/stream?${getListIdQuery(user.listId)}`;

    const alarmHistory = useQuery({
        queryKey: ['getAlarm', user.listId],
        queryFn: () => getAlarmHistory(user.listId),
    });

    useEffect(() => {
        const eventSource = new EventSource(URI);
        eventSource.onmessage = (event) => setAlarAlarm(JSON.parse(event.data));

        return () => {
            eventSource.close();
        };
    }, []);

    const handleActivateAlarm = useMutation({
        mutationFn: () => putAlarm({ sensorList: user.listId, enabled: true }),
        onSettled: () => dispatch(setAlarm({ isActivated: true })),
    });

    const handleDeactivateAlarm = useMutation({
        mutationFn: () => putAlarm({ sensorList: user.listId, enabled: false }),
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
