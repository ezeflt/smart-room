import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Page } from '../global.interface';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRoom } from '../store/global';
import { State } from '../store/selector';
import './largeScreen.css';

const LargeScreen = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    const rooms = [1, 2, 3];
    const currentPage = location.pathname.split('/')[1] as Page;
    const selectedRoom = useSelector((state: State) => state.global.selectedRoom);

    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setSelectedRoom(Number(e.target.value)));
    };
    console.log(currentPage);

    return (
        <div className="container">
            <select className="room" value={selectedRoom} onChange={handleRoomChange}>
                {rooms.map((room) => (
                    <option key={room} value={room}>
                        Salle {room}
                    </option>
                ))}
            </select>
            <span className={`text ${currentPage.toLowerCase()}`}>
                {currentPage === Page.Alarm ? 'Activer' : '100 °C'}
            </span>
        </div>
    );
};

export default LargeScreen;
