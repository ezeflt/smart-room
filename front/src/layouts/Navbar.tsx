import React from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css';
import logo from '../assets/image/logo.png';

const Navbar = () => {
    return (
        <header className="navbar-header">
            <div className="navbar-left">
                <img src={logo} alt="Logo" className="navbar-logo" style={{ width: '75px', height: '75px' }} />
            </div>
            <nav className="navbar-center">
                <NavLink
                    to="/alarm"
                    className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}
                >
                    Alarme
                </NavLink>
                <NavLink
                    to="/weather"
                    className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}
                >
                    Météo
                </NavLink>
            </nav>
            <div className="navbar-right">
                <NavLink to="/account" className="navbar-link" activeClassName="active">Compte</NavLink>
            </div>
        </header>
    );
};

export default Navbar;
