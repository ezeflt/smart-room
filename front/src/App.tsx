import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import React from 'react';

function App() {
    return (
        <div className="app-root">
            <Navbar />
            <div id="container">
                <div className="page-wrapper">
                    <div className="page-content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;