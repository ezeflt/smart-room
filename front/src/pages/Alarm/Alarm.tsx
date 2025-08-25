import './alarm.css';
import { useMutation } from '@tanstack/react-query';
import { putAlarm } from '../../protocol/api';
import { useDispatch, useSelector } from 'react-redux';
import { globalSelector, State, userSelector } from '../../store/selector';
import { GlobalState } from '../../store/global';
import { AlarmStatusTuple, UserState } from '../../store/user';
import { setAlarmStatus } from '../../store/user';
import { useEffect, useState, useRef } from 'react';
import { AlarmProps } from './alarm.interface';
import { config } from '../../../config';
import React from 'react';
import LargeScreen from '../../layouts/LargeScreen';
import { Page } from '../../global.interface';
import { useNavigate } from 'react-router-dom';

const Alarm = () => {
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);
    const navigate = useNavigate();
    const wasAuthenticated = useRef(user.isAuthenticated);

    useEffect(() => {
        // Vérification de l'authentification via l'état Redux
        if (!user.isAuthenticated || !user.token || !user.tokenExpiry) {
            // Si l'utilisateur était authentifié avant et ne l'est plus, c'est une déconnexion
            if (wasAuthenticated.current) {
                navigate('/weather');
            } else {
                // Sinon, c'est un accès non autorisé
                navigate('/login');
            }
            return;
        }

        // Vérification de l'expiration du token
        if (Date.now() >= user.tokenExpiry) {
            navigate('/login');
            return;
        }

        // Mise à jour de l'état précédent
        wasAuthenticated.current = user.isAuthenticated;
    }, [user.isAuthenticated, user.token, user.tokenExpiry, navigate]);

    // Retirer toute la logique d'erreur et de redirection liée au token

    const [alarmHistory, setAlarmHistory] = useState<AlarmProps[] | null>(null);
    const URI = `http://${config.dns}:${config.port}/alarm/stream?room_id=${user.alarmStatus[global.selectedRoom-1].id}`;

    // GET ALARM HISTORY (STREAM)
    useEffect(() => {
        if (user.alarmStatus[global.selectedRoom-1].status === 'on') {
            const eventSource = new EventSource(URI);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setAlarmHistory(data);
            };

            return () => {
                eventSource.close();
            };
        }
    }, [user.alarmStatus[global.selectedRoom-1].status, global.selectedRoom]);

    // HANDLE ALARM
    const handleActivateAlarm = useMutation({
        // mutationFn: async () => {
        //     return putAlarm({ room_id: global.selectedRoom, enabled: true });
        // },
        // onSettled: () => dispatch(
        //     setAlarmStatus({ 
        //         alarmStatus: user.alarmStatus.map((room, index) => ({ ...room, status: index + 1 === global.selectedRoom ? 'on' : 'off' })) as AlarmStatusTuple 
        //     })
        // ),
    });

    const handleDesactivateAlarm = useMutation({
        // mutationFn: () => putAlarm({ room_id: global.selectedRoom, enabled: false }),
        // onSettled: () => dispatch(
        //     setAlarmStatus({ alarmStatus: user.alarmStatus.map((room, index) => ({ ...room, status: index + 1 === global.selectedRoom ? 'on' : 'off' })) as AlarmStatusTuple })
        // ),
    });

    return (
        <>
        <div className="container-wrapper">
            <LargeScreen page={Page.Alarm} onClick={() => {
                if (user.alarmStatus[global.selectedRoom-1].status === 'on') {
                    handleDesactivateAlarm.mutate();
                } else {
                    handleActivateAlarm.mutate();
                }
            }} />
            <div className={`alarm-history-container ${user.alarmStatus[global.selectedRoom-1].status === 'on' ? 'on' : 'off'}`}>
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
                                {`${heure} ${jour} - L'alarme de la salle ${item.room} a été ${action} par ${item.userName}`}
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
