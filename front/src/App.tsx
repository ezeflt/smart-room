import React, { useEffect } from 'react';
import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './layouts/Header';
import { useDispatch, useSelector } from 'react-redux';
import { State, userSelector } from './store/selector';
import { logout, setRoomsIdAccess, UserState } from './store/user';
import { setRooms, setSelectedRoom } from './store/global';
import { getUser, getRooms } from './protocol/api';
import { Room } from './store/global';
import { initTokenFromLocalStorage } from './store/user';
import { useQuery } from '@tanstack/react-query';

function App() {
    const location = useLocation();

    const isPortfolio = location.pathname === '/';
    const isWeather = location.pathname === '/weather';
    const isLogin = location.pathname === '/login';

    const shouldShowHeader = !(isLogin || isPortfolio);

    const user = useSelector<State, UserState>(userSelector);
    const dispatch = useDispatch();

    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(),
        enabled: !!user.token,
    });

    const { data: roomsData } = useQuery({
        queryKey: ['rooms'],
        queryFn: () => getRooms(),
        enabled: !!user.token,
    });

    const autoLogout = () => {
        const now = Date.now();

        if (!user.token || !user.tokenExpiry) {
            return;
        }

        if (now >= user.tokenExpiry) {
            dispatch(logout());
            return;
        }
    };

    /**
     * 1. Initialiser l'authentification depuis le localStorage au démarrage
     * 2. Logout si le token est expiré
     * 
     * @returns void
     */
    useEffect(() => {
        dispatch(initTokenFromLocalStorage());
        autoLogout();
    }, [dispatch]);

    /**
     * 1. Récupérer les rooms de l'utilisateur
     * 2. Sélectionner la première room par défaut
     * 
     * @returns void
     */
    useEffect(() => {
        if (userData) {
            dispatch(setRoomsIdAccess(userData.user.roomIds as string[]));
        }
        if (userData && userData.user.roomIds && userData.user.roomIds?.length > 0) {
            dispatch(setSelectedRoom(userData.user.roomIds[0]?._id));
        }
    }, [userData]);

    /**
     * 1. Récupérer les rooms de l'application
     * 2. Trier les rooms par id
     * 
     * @returns void
     */
    useEffect(() => {
        if (!roomsData?.rooms) {
            return;
        }

        const orderedRooms = roomsData.rooms.sort((a: Room, b: Room) => a._id.localeCompare(b._id));
        dispatch(setRooms(orderedRooms));
    }, [roomsData]);
    
    return (
        <div className="app">
            {shouldShowHeader && <Header />}
            {!isWeather ? (
                <div id="container">
                    <Outlet />
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    );
}

export default App;