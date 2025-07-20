import './alarm.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAlarmHistory, getListIdQuery, putAlarm } from '../../protocol/api';
import { useDispatch, useSelector } from 'react-redux';
import { globalSelector, State, userSelector } from '../../store/selector';
import { GlobalState, setAlarm } from '../../store/global';
import { UserState } from '../../store/user';
import { useEffect, useState } from 'react';
import { AlarmProps } from './alarm.interface';
import { config } from '../../../config';
import React from 'react';
import LargeScreen from '../../layouts/LargeScreen';
import { Page } from '../../global.interface';

const Alarm = () => {
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);

    const [alarm, setAlarAlarm] = useState<AlarmProps | null>(null);
    const URI = `http://${config.dns}:${config.port}/alarm/stream?${getListIdQuery(user.listId)}`;

    // GET ALARM HISTORY (STREAM)
    useEffect(() => {
        if (global.isActivated) {
            const eventSource = new EventSource(URI);
            eventSource.onmessage = (event) => setAlarAlarm(JSON.parse(event.data));

            return () => {
                eventSource.close();
            };
        }
    }, [global.isActivated]);



    return (
        <>
            <LargeScreen page={Page.Alarm} />
        </>
    );
};

export default Alarm;
