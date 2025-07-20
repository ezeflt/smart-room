import React from 'react';
import { LargeScreenProps, Page } from '../global.interface';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRoom } from '../store/global';
import { State } from '../store/selector';
import './largeScreen.css';

const LargeScreen = ({ page, degreeCelcius }: LargeScreenProps) => {
    const dispatch = useDispatch();
    const rooms = [1, 2, 3];
    const selectedRoom = useSelector((state: State) => state.global.selectedRoom);

    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setSelectedRoom(Number(e.target.value)));
    };

    return (
        <div className="container">
            <select className="room" value={selectedRoom} onChange={handleRoomChange}>
                {rooms.map((room) => (
                    <option key={room} value={room}>
                        Salle {room}
                    </option>
                ))}
            </select>
            <span className={`text ${page.toLowerCase()}`}>
                {page === Page.Alarm ? 'Activer' : `${degreeCelcius} °C`}
            </span>
        </div>
    );
};

export default LargeScreen;
