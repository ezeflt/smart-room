import React, { useEffect } from 'react';
import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layouts/Header';
import { config } from '../config';
import { useDispatch, useSelector } from 'react-redux';
import { setAlarmStatus } from './store/user';
import { AlarmStatusTuple } from './store/user';
import { State, userSelector } from './store/selector';
import { logout, UserState } from './store/user';

function App() {
    const isNotLoginPage = useLocation().pathname !== '/login';
    const user = useSelector<State, UserState>(userSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        const eventSource = new EventSource(`http://${config.dns}:${config.port}/room/status/stream`);
        eventSource.onmessage = (event) => {
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