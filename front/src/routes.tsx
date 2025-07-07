import React from 'react';
import App from './App';
import { createBrowserRouter } from 'react-router-dom';
import Weather from './pages/Weather/Weather';
import Alarm from './pages/Alarm/Alarm';
import Office from './pages/Office/Office';

const AppRoutes = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                path: '/alarm/:id',
                element: <Alarm/>,
            },
            {
                path: '/weather/:id',
                element: <Weather/>,
            },
            {
                path: '/office/:id',
                element: <Office/>,
            },
            {
                path: '*',
                element: <></>,
            },
        ],
    },
]);

export default AppRoutes;
