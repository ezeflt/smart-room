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

    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setSelectedRoom(Number(e.target.value)));
    };

    const handleClick = () => {
        if (page === Page.Alarm) {
            dispatch(setAlarm({ isActivated: !globalState.isActivated }));
        }
    };

    return (
        <div
            className={`container ${page.toLowerCase()} ${globalState.isActivated ? 'on' : 'off'}`}
            onClick={handleClick}
        >
            <select className="room" value={globalState.selectedRoom} onChange={handleRoomChange}>
                {rooms.map((room) => (
                    <option key={room} value={room}>
                        Salle {room}
                    </option>
                ))}
            </select>
            <span className={`text ${page.toLowerCase()}`}>
                {page === Page.Alarm ? alarmToggleLabel : `${degreeCelcius} °C`}
            </span>
        </div>
    );
};

export default LargeScreen;
