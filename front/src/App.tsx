import React, { useEffect } from 'react';
import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layouts/Header';
import { useDispatch, useSelector } from 'react-redux';
import { State, userSelector } from './store/selector';
import { AlarmStatusTuple, logout, setRoomsIdAccess, UserState } from './store/user';
import { setAlarmStatus } from './store/user';
import { getRooms } from './protocol/api';
import { setRooms, setSelectedRoom } from './store/global';
import { Room } from './store/global';
import config from '../config.json';

function App() {
    const isNotLoginPage = useLocation().pathname !== '/login';
    const user = useSelector<State, UserState>(userSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        getRooms()
            .then(res => {
                const orderedRooms = (res.rooms || []).sort((a: Room, b: Room) => a.name.localeCompare(b.name));
                dispatch(setRooms(orderedRooms));
                if (orderedRooms.length > 0) {
                    dispatch(setSelectedRoom(orderedRooms[0]._id));
                }
            })
            .catch(() => {
                dispatch(setRooms([]));
            });
    }, [dispatch]);

    useEffect(() => {
        if (!user.token) return;
        const eventSource = new EventSource(`${config.api}/room/status/stream?token=${user.token}`);
        eventSource.onmessage = (event) => {
            console.log('event.data', JSON.parse(event.data));
            dispatch(setAlarmStatus({ alarmStatus: JSON.parse(event.data) as AlarmStatusTuple }));
        };
        return () => {
            eventSource.close();
        };
    }, [dispatch]);

    useEffect(() => {
        if (!user.token || !user.tokenExpiry) return;

        const now = Date.now();
        if (now >= user.tokenExpiry) {
            dispatch(logout());
            return;
        }

        const msUntilExpiry = user.tokenExpiry - now;
        const timer = setTimeout(() => {
            dispatch(logout());
        }, msUntilExpiry);

        return () => clearTimeout(timer);
    }, [user.token, user.tokenExpiry, dispatch]);

    useEffect(() => {
        if (!user.email) return;
        console.log(user.email);
        fetch(`${config.api}/user/${user.email}`, {
            method: 'GET',
        }).then(res => res.json()).then(data => {
            console.log(data);
            dispatch(setRoomsIdAccess(data.user.rooms as string[]));
        });
    }, [user.email, dispatch]);
    
    return (
        <div className="app">
            {isNotLoginPage && <Header />}
            <div id="container">
                <Outlet />
            </div>
        </div>
    );
}

export default App;