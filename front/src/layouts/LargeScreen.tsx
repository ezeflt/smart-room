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
    const isAlarmpage = page === Page.Alarm;

    // Utiliser global.rooms au lieu de user.alarmStatus pour la sélection
    const rooms = globalState.rooms;
    
    // Trouver le statut d'alarme de la room sélectionnée
    const selectedRoomAlarmStatus = user.alarmStatus.find(status => status.id === globalState.selectedRoom);
    
    const alarmToggleLabel = selectedRoomAlarmStatus?.status === 'on' ? 'Activé' : 'Désactivé';
    const alarmStatus = selectedRoomAlarmStatus?.status;
    const screenClassName = `screen ${page.toLowerCase()}${isAlarmpage && alarmStatus ? ` ${alarmStatus}` : ''}`;
    const screenText = isAlarmpage ? alarmToggleLabel : `${degreeCelcius} °C`;

    return (
        <div className="large-screen-container">
            <div
                className={screenClassName}
                onClick={() => handleClickToScreen && handleClickToScreen()}
            >
                <span className={`text ${page.toLowerCase()}`}>{screenText}</span>
            </div>
            <div className="room-column">
                {rooms.map((room, i) => {
                    const hasAccess = user.roomsIdAccess?.includes(room._id);
                    const disabled = isAlarmpage && !hasAccess;
                    const isSelected = globalState.selectedRoom === room._id;
                    const btnClass = `room-btn${isSelected ? ' selected' : ''}${disabled ? ' disabled' : ''}`;

                    return (
                        <button
                            key={room._id}
                            className={btnClass}
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!disabled) {
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
