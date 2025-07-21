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

    const [alarmHistory, setAlarmHistory] = useState<AlarmProps[] | null>(null);
    const URI = `http://${config.dns}:${config.port}/alarm/stream?${getListIdQuery(user.listId)}`;

    // GET ALARM HISTORY (STREAM)
    useEffect(() => {
        if (global.isActivated) {
            const eventSource = new EventSource(URI);
            eventSource.onmessage = (event) => setAlarmHistory(JSON.parse(event.data));

            return () => {
                eventSource.close();
            };
        }
    }, [global.isActivated]);

    // HANDLE ALARM
    const handleActivateAlarm = useMutation({
        mutationFn: () => putAlarm({ sensorList: user.listId, enabled: true }),
        onSettled: () => dispatch(setAlarm({ isActivated: true })),
    });

    const handleDesactivateAlarm = useMutation({
        mutationFn: () => putAlarm({ sensorList: user.listId, enabled: false }),
        onSettled: () => dispatch(setAlarm({ isActivated: false })),
    });

    return (
        <>
        <div className="container-wrapper">
            <LargeScreen page={Page.Alarm} />
            <div className={`alarm-history-container ${global.isActivated ? 'on' : 'off'}`}>
                {alarmHistory && alarmHistory.length > 0 ? (
                    alarmHistory.map((item, idx) => {
                        const date = new Date(item.timestamp);
                        const heure = date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                        const jour = date.toLocaleDateString();
                        const action = item.action === 'on' ? 'activé' : 'désactivé';
                        return (
                            <span key={idx} className="alarm-history-item">
                                {`${heure} ${jour} - L’alarme de la salle ${item.room} a été ${action} par ${item.userName}`}
                            </span>
                        );
                    })
                ) : (
                    <div className="alarm-history-empty">Aucune alarme enregistrée</div>
                )}
            </div>
        </div>
        </>
    );
};

export default Alarm;
