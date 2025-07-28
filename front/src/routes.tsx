import React from 'react';
import App from './App';
import { createBrowserRouter } from 'react-router-dom';
import Weather from './pages/Weather/Weather';
import Alarm from './pages/Alarm/Alarm';
import Office from './pages/Office/Office';
import Login from './pages/Login/Login';

const AppRoutes = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                path: '/alarm',
                element: <Alarm/>,
            },
            {
                path: '/weather',
                element: <Weather/>,
            },
            {
                path: '/office',
                element: <Office/>,
            },
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '*',
                element: <></>,
            },
        ],
    },
]);

export default AppRoutes;
