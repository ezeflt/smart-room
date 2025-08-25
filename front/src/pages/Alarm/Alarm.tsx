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

    // Utiliser la room sélectionnée depuis le store global
    const selectedRoom = global.rooms.find(room => room._id === global.selectedRoom) || global.rooms[0];
    
    // Trouver le statut d'alarme de la room sélectionnée
    const selectedRoomAlarmStatus = user.alarmStatus.find(status => status.id === selectedRoom?._id);

    console.log('selectedRoomAlarmStatus', user.alarmStatus);
    console.log('selectedRoomAlarmStatus.status', selectedRoomAlarmStatus?.status);

    console.log('user.roomsIdAccess', user.roomsIdAccess);
    console.log('global.rooms', global.rooms);
    console.log('selectedRoom', selectedRoom);
    console.log('selectedRoomAlarmStatus', selectedRoomAlarmStatus);

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
    
    // Debug pour le problème de débordement
    console.log('Room ID sélectionnée:', selectedRoom?._id);
    console.log('Nombre d\'alarmes dans l\'historique:', alarmHistory?.length || 0);
    console.log('Données d\'alarme:', alarmHistory);

    // Utiliser l'ID de la room sélectionnée pour la requête
    const query = selectedRoom ? `room_id=${selectedRoom._id}&token=${user.token}` : '';
    const URI = selectedRoom ? `http://${config.dns}:${config.port}/alarm/stream?${query}` : '';

    // GET ALARM HISTORY (STREAM)
    useEffect(() => {
        if (selectedRoom && URI) {
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
    }, [selectedRoom, URI]);

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
                        const action = item.action === 'on' ? 'activé' : 'désactivé';
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
