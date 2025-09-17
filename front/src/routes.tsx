import React from 'react';
import App from './App';
import { createBrowserRouter } from 'react-router-dom';
import Weather from './pages/Weather/Weather';
import Alarm from './pages/Alarm/Alarm';
import Login from './pages/Login/Login';
import BackOffice from './pages/Back-office/Backoffice';
import Portfolio from './pages/Portfolio/Portfolio';
import PageNotFound from './pages/PageNotFound/PageNotFound';

const AppRoutes = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <Portfolio />,
            },
            {
                path: '/alarm',
                element: <Alarm />,
            },
            {
                path: '/weather',
                element: <Weather />,
            },
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/admin',
                element: <BackOffice />,
            },

            {
                path: '*',
                element: <PageNotFound />,
            },
        ],
    },
]);

export default AppRoutes;
