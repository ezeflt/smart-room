import React from 'react';
import { Link } from 'react-router-dom';
import './page-not-found.css';

const logo = new URL('../../assets/image/logo.png', import.meta.url).href;

const PageNotFound: React.FC = () => {
    return (
        <div className="pnf-container">
            <div className="pnf-content">
                <img src={logo} alt="Logo" className="pnf-logo" />
                <h1 className="pnf-title">404</h1>
                <p className="pnf-subtitle">Oups, la page que vous cherchez n'existe pas.</p>
                <div className="pnf-actions">
                    <Link to="/weather" className="pnf-button primary">Aller à la météo</Link>
                </div>
            </div>
            <div className="pnf-background" />
        </div>
    );
};

export default PageNotFound;
