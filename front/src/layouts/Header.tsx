import React from 'react';
import { NavLink } from 'react-router-dom';
import './header.css';
import logo from '../assets/image/logo.png';

const Header = () => {
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
                <NavLink
                    to="/account"
                    className={({ isActive }) => isActive ? "header-link active" : "header-link"}
                >
                    Compte
                </NavLink>
            </div>
        </header>
    );
};

export default Header;
