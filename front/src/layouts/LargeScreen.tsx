import React from 'react';
import { LargeScreenProps, Page } from '../global.interface';
import { useSelector } from 'react-redux';
import { State } from '../store/selector';
import { UserState } from '../store/user';
import './largeScreen.css';

const LargeScreen = ({ page, degreeCelcius, handleClickToScreen, handleRoomSelect }: LargeScreenProps) => {
    // Redux
    const globalState = useSelector((state: State) => state.global);
    const user = useSelector((state: State) => state.user) as UserState;

    // Rooms
    const rooms = globalState.rooms;
    
    // Alarm status (on/off)
    const selectedRoomAlarmStatus = user.alarmStatus.find(status => status.id === globalState.selectedRoom);

    const isAlarmpage = page === Page.Alarm;
    const alarmPageStatus = isAlarmpage && selectedRoomAlarmStatus?.status;

    /**
     * Description: Get screen text by page, 
     * - if page is alarm -> 'Activé' or 'Désactivé'
     * - if page is not alarm -> ...°C
     * @returns {string}
     */
    const getScrenText = () => {
        const alarmToggleLabel = alarmPageStatus === 'on' ? 'Activé' : 'Désactivé';
        return isAlarmpage ? alarmToggleLabel : `${degreeCelcius} °C`;
    }
    const getScreenClassName = () => {
        return `screen ${page.toLowerCase()}${alarmPageStatus ? ` ${alarmPageStatus}` : ' off'}`;
    }

    return (
        <div className="large-screen-container">
            <div
                className={getScreenClassName()}
                onClick={() => handleClickToScreen && handleClickToScreen()}
            >
                <span className={`text ${page.toLowerCase()}`}>{getScrenText()}</span>
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
                            onClick={() => {
                                if (disabled) {
                                    return;
                                }
                                handleRoomSelect && handleRoomSelect(room._id);
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
