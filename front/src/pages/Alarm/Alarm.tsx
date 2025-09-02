import './alarm.css';
import { useMutation } from '@tanstack/react-query';
import { putAlarm } from '../../protocol/api';
import { useDispatch, useSelector } from 'react-redux';
import { globalSelector, State, userSelector } from '../../store/selector';
import { GlobalState, setSelectedRoom } from '../../store/global';
import { AlarmStatusTuple, UserState } from '../../store/user';
import { setAlarmStatus } from '../../store/user';
import { useEffect, useState, useRef } from 'react';
import { AlarmProps } from './alarm.interface';
import React from 'react';
import LargeScreen from '../../layouts/LargeScreen';
import { Page } from '../../global.interface';
import { useNavigate } from 'react-router-dom';
const SERVER_URL = import.meta.env.VITE_API as string;

const Alarm = () => {
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);
    const global = useSelector<State, GlobalState>(globalSelector);
    const navigate = useNavigate();

    const selectedRoom = global.rooms.find(room => room._id === global.selectedRoom) || global.rooms[0];
    const selectedRoomAlarmStatus = user.alarmStatus.find(status => status.id === selectedRoom?._id);

    const [alarmHistory, setAlarmHistory] = useState<AlarmProps[] | null>(null);
    const isValidUser = user.isAuthenticated && user.token && user.tokenExpiry;

    // PROTECT ALARM PAGE
    useEffect(() => {
        console.log('Alarm protection check:', { 
            isInitialized: user.isInitialized, 
            isAuthenticated: user.isAuthenticated, 
            hasToken: !!user.token,
            tokenExpiry: user.tokenExpiry 
        });
        
        // Attendre que l'initialisation soit terminée
        if (!user.isInitialized) return;

        // Vérification de l'authentification via l'état Redux
        if (!isValidUser) {
            navigate('/login');
            return;
        }

        // Vérification de l'expiration du token
        if (user.tokenExpiry && Date.now() >= user.tokenExpiry) {
            navigate('/login');
            return;
        }

    }, [isValidUser, user.tokenExpiry, user.isInitialized, navigate]);

    // GET ALARM HISTORY (STREAM)
    useEffect(() => {
        if (selectedRoom && user.token) {
            if (!isValidUser) {
                return;
            }
            // Utiliser l'ID de la room sélectionnée pour la requête
            const query = selectedRoom ? `room_id=${selectedRoom._id}&token=${user.token}` : '';
            const URI = selectedRoom ? `${SERVER_URL}/alarm/stream?${query}` : '';

            const eventSource = new EventSource(URI);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('data', data);
                setAlarmHistory(data);
            };

            return () => {
                eventSource.close();
            };
        }
    }, [selectedRoom, user.token]);

    // Déplacer useMutation au niveau du composant
    const activateAlarmMutation = useMutation({
        mutationFn: async () => {
            return putAlarm({ room_id: selectedRoom?._id || '', enabled: true });
        },
        onSuccess: () => {
            // Mettre à jour le statut localement
            dispatch(
                setAlarmStatus({ 
                    alarmStatus: user.alarmStatus.map(status => ({ 
                        ...status, 
                        status: status.id === selectedRoom?._id ? 'on' : status.status
                    })) as AlarmStatusTuple 
                })
            );
        },
        onError: (error) => {
            console.error('Erreur lors de l\'activation de l\'alarme:', error);
        }
    });

    const deactivateAlarmMutation = useMutation({
        mutationFn: async () => {
            return putAlarm({ room_id: selectedRoom?._id || '', enabled: false });
        },
        onSuccess: () => {
            // Mettre à jour le statut localement
            dispatch(
                setAlarmStatus({ 
                    alarmStatus: user.alarmStatus.map(status => ({ 
                        ...status, 
                        status: status.id === selectedRoom?._id ? 'off' : status.status
                    })) as AlarmStatusTuple 
                })
            );
        },
        onError: (error) => {
            console.error('Erreur lors de la désactivation de l\'alarme:', error);
        }
    });

    // Fonction pour sélectionner une room
    const handleRoomSelect = (roomId: string) => {
        dispatch(setSelectedRoom(roomId));
        // Réinitialiser l'historique des alarmes lors du changement de room
        setAlarmHistory(null);
    };

    // Fonction pour gérer le clic sur l'écran
    const handleClickToScreen = () => {
        if (selectedRoom) {
            const currentStatus = selectedRoomAlarmStatus?.status;
            console.log('currentStatus', currentStatus);
            if (currentStatus === 'on') {
                deactivateAlarmMutation.mutate();
            } else {
                activateAlarmMutation.mutate();
            }
        }
    };

    return (
        <>
        <div className="container-wrapper">
            <LargeScreen 
                page={Page.Alarm} 
                handleClickToScreen={handleClickToScreen}
                handleRoomSelect={handleRoomSelect}
            />
            
            <div className={`alarm-history-container ${selectedRoomAlarmStatus?.status}`}>
                {alarmHistory && alarmHistory.length > 0 ? (
                    alarmHistory.map((item, idx) => {
                        const date = new Date(item.timestamp);
                        const heure = date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                        const jour = date.toLocaleDateString();
                        const action = item.action === 'active' ? 'activé' : 'désactivé';
                        return (
                            <span key={idx} className="alarm-history-item">
                                {`${heure} ${jour} - L'alarme de la salle ${item.room} a été ${action} par ${item.userName}`}
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
