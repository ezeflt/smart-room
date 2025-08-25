import React from 'react';
import { LargeScreenProps, Page } from '../global.interface';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../store/selector';
import { UserState } from '../store/user';
import './largeScreen.css';


const LargeScreen = ({ page, degreeCelcius, handleClickToScreen, handleRoomSelect }: LargeScreenProps) => {
    const dispatch = useDispatch();
    const globalState = useSelector((state: State) => state.global);
    const user = useSelector((state: State) => state.user) as UserState;

    // Utiliser global.rooms au lieu de user.alarmStatus pour la sélection
    const rooms = globalState.rooms;
    
    // Trouver le statut d'alarme de la room sélectionnée
    const selectedRoomAlarmStatus = user.alarmStatus.find(status => status.id === globalState.selectedRoom);
    
    const alarmToggleLabel = selectedRoomAlarmStatus?.status === 'on' ? 'Activé' : 'Désactivé';
    const alarmStatus = selectedRoomAlarmStatus?.status;

    return (
        <div className="large-screen-container">
            <div
                className={`screen ${page.toLowerCase()} ${alarmStatus}`}
                onClick={() => handleClickToScreen && handleClickToScreen()}
            >
                <span className={`text ${page.toLowerCase()}`}>
                    {page === Page.Alarm ? alarmToggleLabel : `${degreeCelcius} °C`}
                </span>
            </div>
            <div className="room-column">
                {rooms.map((room, i) => {
                    const hasAccess = user.roomsIdAccess.includes(room._id);
                    return (
                        <button
                            key={room._id}
                            className={`room-btn${
                                globalState.selectedRoom === room._id ? ' selected' : ''
                            }${!hasAccess ? ' disabled' : ''}`}
                            disabled={!hasAccess}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasAccess) {
                                    handleRoomSelect && handleRoomSelect(room._id);
                                }
                            }}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LargeScreen;
