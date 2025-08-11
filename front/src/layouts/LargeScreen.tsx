import React from 'react';
import { LargeScreenProps, Page } from '../global.interface';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../store/selector';
import { AlarmStatusTuple, setAlarmStatus, UserState } from '../store/user';
import { setSelectedRoom } from '../store/global';
import './largeScreen.css';


const LargeScreen = ({ page, degreeCelcius, onClick }: LargeScreenProps) => {
    const dispatch = useDispatch();
    const globalState = useSelector((state: State) => state.global);
    const user = useSelector((state: State) => state.user) as UserState;

    const rooms = user.alarmStatus;
    const alarmToggleLabel = rooms[globalState.selectedRoom - 1].status === 'on' ? 'Activer' : 'Désactiver';
    const alarmStatus = rooms[globalState.selectedRoom - 1].status;
    const handleClick = () => {
        if (page === Page.Alarm) {
            dispatch(setAlarmStatus({ 
                alarmStatus: rooms.map((room, index) => ({ 
                    ...room, 
                    status: index + 1 === globalState.selectedRoom ? 'on' : 'off' 
                })) as AlarmStatusTuple
            }));
        }
    };

    return (
        <div className="large-screen-container"
            onClick={onClick}
        >
            <div
                className={`screen ${page.toLowerCase()} ${alarmStatus}`}
                onClick={handleClick}
            >
                <span className={`text ${page.toLowerCase()}`}>
                    {page === Page.Alarm ? alarmToggleLabel : `${degreeCelcius} °C`}
                </span>
            </div>
            <div className="room-column">
                {rooms.map((room, index) => (
                    <button
                        key={index}
                        className={`room-btn${
                            globalState.selectedRoom === index + 1 ? ' selected' : ''
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedRoom(index + 1));
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LargeScreen;
