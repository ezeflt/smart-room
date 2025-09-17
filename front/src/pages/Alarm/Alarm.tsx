import './alarm.css';
import { useMutation } from '@tanstack/react-query';
import { putAlarm } from '../../protocol/api';
import { useDispatch, useSelector } from 'react-redux';
import { globalSelector, State, userSelector } from '../../store/selector';
import { GlobalState, setSelectedRoom } from '../../store/global';
import { AlarmStatusTuple, UserState } from '../../store/user';
import { setAlarmStatus } from '../../store/user';
import { useEffect, useState } from 'react';
import { AlarmProps } from './alarm.interface';
import React from 'react';
import LargeScreen from '../../layouts/LargeScreen';
import { Page } from '../../global.interface';
import { useNavigate } from 'react-router-dom';
import { getApiKey } from '../../utils';

const SERVER_URL = getApiKey();

const Alarm = () => {
    // Redux
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);
    const navigate = useNavigate();

    // Room
    const selectedRoom = global.rooms.find(room => room._id === global.selectedRoom);
    const selectedRoomAlarmStatus = user.alarmStatus.find(status => status.id === selectedRoom?._id);

    // Alarm History
    const [alarmHistory, setAlarmHistory] = useState<AlarmProps[] | null>(null);

    // Utils
    const isValidUser = user.isAuthenticated && user.token && user.tokenExpiry;
    const isAlarmActivated = selectedRoomAlarmStatus?.status === 'on';

    const protectAlarmPage = () => {
        // Attendre que l'initialisation soit terminée
        if (!user.isInitialized) {
            return;
        }
        
        // Verification de l'authentification via l'état Redux
        if (!isValidUser) {
            navigate('/login');
            return;
        }

        // Verification de l'expiration du token
        if (user.tokenExpiry && Date.now() >= user.tokenExpiry) {
            navigate('/login');
            return;
        }
    }

    /**
     * Description: Récupérer l'état de l'alarme via le stream
     * (seulement au démarrage du composant)
     * @returns void
     */
    const getAlarmStatusByStream = () => {
        if (!user.token) {
            return
        };
        const eventSource = new EventSource(`${SERVER_URL}/room/status/stream?token=${user.token}`);
        eventSource.onmessage = (event) => {
            dispatch(setAlarmStatus({ alarmStatus: JSON.parse(event.data) as AlarmStatusTuple }));
        };
        return () => {
            eventSource.close();
        };

    }

    /**
     * Description: Récupérer l'historique des alarmes via le stream
     * @returns void
     */
    const getAlarmHistoryByStream = () => {
        if (!selectedRoom?._id || !user.token) {
            return;
        }

        // Utiliser l'ID de la room sélectionnée pour la requête
        const query =`room_id=${selectedRoom._id}&token=${user.token}`;
        const URI = `${SERVER_URL}/alarm/stream?${query}`;

        const eventSource = new EventSource(URI);
        
        eventSource.onmessage = (event) => {
            const alarmHistory = JSON.parse(event.data);
            setAlarmHistory(alarmHistory);
        };

        return () => {
            eventSource.close();
        };
    }

    // Mutation paramétrée: on passe l'état désiré (true = activer, false = désactiver)
    const alarmMutation = useMutation({
        mutationFn: async (enabled: boolean) => {
            return putAlarm({ room_id: selectedRoom?._id || '', enabled });
        },
        onSuccess: (_data, enabled) => {
            const updatedAlarmStatus = user.alarmStatus.map((status) => {
                const newStatus = status.id === selectedRoom?._id ? (enabled ? 'on' : 'off') : status.status;
                return { ...status, status: newStatus };
            });

            dispatch(setAlarmStatus({ alarmStatus: updatedAlarmStatus as AlarmStatusTuple }));
        },
        onError: (error, enabled) => {
            console.error(
                `Erreur lors de ${enabled ? "l'activation" : "la désactivation"} de l'alarme:`,
                error
            );
        },
    });

    /**
     * Description: Gestion du clic sur l'écran pour activer ou désactiver l'alarme
     * @returns void
     */
    const handleClickToScreen = () => {
        const nextEnabled = !isAlarmActivated;
        alarmMutation.mutate(nextEnabled);
    };

    /**
     * Description: Gestion du clic sur l'écran pour activer ou désactiver l'alarme
     * Vider l'historique lors du changement de room
     * @returns void
     */
    const handleRoomSelect = (roomId: string) => {
        dispatch(setSelectedRoom(roomId));
        setAlarmHistory(null);
    };

    useEffect(() => getAlarmStatusByStream(), []);
    useEffect(() => protectAlarmPage(), [user]);
    useEffect(() => getAlarmHistoryByStream(), [selectedRoom, user]);

    return (
        <>
        <div className="container-wrapper">
            <LargeScreen 
                page={Page.Alarm} 
                handleClickToScreen={handleClickToScreen}
                handleRoomSelect={handleRoomSelect}
            />
            
            <div className={`alarm-history-container ${selectedRoomAlarmStatus?.status || 'off'}`}>
                {alarmHistory && alarmHistory.length > 0 ? (
                    alarmHistory.map((item, idx) => {
                        // Date
                        const date = new Date(item.timestamp);
                        const hour = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const day = date.toLocaleDateString();

                        // Action
                        const action = item.action === 'active' ? 'activé' : 'désactivé';

                        // Return
                        return (
                            <span key={idx} className="alarm-history-item">
                                {`${hour} ${day} - L'alarme de la ${selectedRoom?.name?.toLocaleLowerCase()} a été ${action} par ${item.userName}`}
                            </span>
                        );
                    })
                ) : (
                    <div className="alarm-history-empty">
                        {selectedRoom ? 'Aucune alarme enregistrée pour cette salle' : 'Sélectionnez une salle pour voir l\'historique des alarmes'}
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default Alarm;
