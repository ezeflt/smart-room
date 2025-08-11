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
import { useNavigate } from 'react-router-dom';

const Alarm = () => {
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        let alert = '';
        if (!token) {
            alert = 'Veuillez vous connecter pour accéder à la page Alarme.';
        } else {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    alert = 'Votre session a expiré, veuillez vous reconnecter.';
                }
            } catch {
                alert = 'Token invalide, veuillez vous reconnecter.';
            }
        }
        if (alert) {
            navigate('/weather', { state: { alert } });
        }
    }, [navigate]);

    // Retirer toute la logique d'erreur et de redirection liée au token

    const [alarmHistory, setAlarmHistory] = useState<AlarmProps[] | null>(null);
    const URI = `http://${config.dns}:${config.port}/alarm/stream?${getListIdQuery(user.listId)}`;

    // GET ALARM HISTORY (STREAM)
    useEffect(() => {
        if (global.isActivated) {
            const eventSource = new EventSource(URI);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setAlarmHistory(data);
            };

            return () => {
                eventSource.close();
            };
        }
    }, [global.isActivated]);

    // HANDLE ALARM
    const handleActivateAlarm = useMutation({
        mutationFn: async () => {
            // Envoie l'utilisateur connecté au backend
            const token = localStorage.getItem('token');
            await fetch(`http://${config.dns}:${config.port}/alarm/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            return putAlarm({ sensorList: user.listId, enabled: true });
        },
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
