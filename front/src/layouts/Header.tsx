import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './header.css';
import logo from '../assets/image/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { State, userSelector } from '../store/selector';
import { logout, setToken, UserState } from '../store/user';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector<State, UserState>(userSelector);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(setToken(null));
        navigate('/weather');
    };

    return (
        <header className="header-header">
            <div className="header-left">
                <img src={logo} alt="Logo" className="header-logo" />
            </div>
            <nav className="header-center">
                <NavLink
                    to="/alarm"
                    className={({ isActive }) => isActive ? "header-link active" : "header-link"}
                >
                    Alarme
                </NavLink>
                <NavLink
                    to="/weather"
                    className={({ isActive }) => isActive ? "header-link active" : "header-link"}
                >
                    Météo
                </NavLink>
            </nav>
            <div className="header-right">
                {user.isAuthenticated ? (
                    <button className="header-link logout-button" onClick={handleLogout}>Déconnexion</button>
                ) : (
                    <NavLink
                        to="/login"
                        className={({ isActive }) => isActive ? "header-link active" : "header-link"}
                    >
                        Compte
                    </NavLink>
                )}
            </div>
        </header>
    );
};

export default Header;
