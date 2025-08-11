import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layouts/Header';
import { config } from '../config';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';  
import { AlarmStatusTuple, setAlarmStatus } from './store/user';

function App() {
    const isNotLoginPage = useLocation().pathname !== '/login';
    const isConnected = true;
    const dispatch = useDispatch();

    useEffect(() => {
        const eventSource = new EventSource(`http://${config.dns}:${config.port}/room/status/stream`);
        eventSource.onmessage = (event) => {
            dispatch(setAlarmStatus({ alarmStatus: JSON.parse(event.data) as AlarmStatusTuple }));
        };
        return () => {
            eventSource.close();
        };
    }, []);
    
    return (
        <div className="app">
            {isConnected && isNotLoginPage && <Header />}
            <div id="container">
                <Outlet />
            </div>
        </div>
    );
}

export default App;