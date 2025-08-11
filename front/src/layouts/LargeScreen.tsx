import React from 'react';
import { LargeScreenProps, Page } from '../global.interface';
import { useDispatch, useSelector } from 'react-redux';
import { setAlarm, setSelectedRoom } from '../store/global';
import { State } from '../store/selector';
import './largeScreen.css';

const LargeScreen = ({ page, degreeCelcius }: LargeScreenProps) => {
    const dispatch = useDispatch();
    const globalState = useSelector((state: State) => state.global);

    const rooms = [1, 2, 3];
    const alarmToggleLabel = globalState.isActivated ? 'Activer' : 'Désactiver';

    const handleClick = () => {
        if (page === Page.Alarm) {
            dispatch(setAlarm({ isActivated: !globalState.isActivated }));
        }
    };

    return (
        <div className="large-screen-container">
            <div
                className={`screen ${page.toLowerCase()} ${
                    globalState.isActivated ? 'on' : 'off'
                }`}
                onClick={handleClick}
            >
                {page === Page.Weather ? (
                    <div className={`text ${page.toLowerCase()}`}>
                        <div style={{ fontSize: '150px', lineHeight: 1 }}>{degreeCelcius ?? '--'} °C</div>
                    </div>
                ) : (
                    <span className={`text ${page.toLowerCase()}`}>{alarmToggleLabel}</span>
                )}
            </div>
            <div className="room-column">
                {rooms.map((room) => (
                    <button
                        key={room}
                        className={`room-btn${
                            globalState.selectedRoom === room ? ' selected' : ''
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedRoom(room));
                        }}
                    >
                        {room}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LargeScreen;
