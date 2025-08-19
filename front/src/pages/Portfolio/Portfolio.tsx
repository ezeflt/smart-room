import React from 'react';
import './portfolio.css';
import LogoImage from '../../assets/image/logo.png';

const Portfolio: React.FC = () => {
    return (
        <div className="portfolio-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Smart Room</h1>
                    <p className="hero-subtitle">
                        Système de surveillance et contrôle intelligent pour pièces connectées
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="btn-primary"
                            onClick={() => (window.location.href = '/weather')}
                        >
                            Commencer
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() =>
                                document
                                    .getElementById('features')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            En savoir plus
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <img src={LogoImage} alt="" className="hero-image" />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <h2 className="section-title">Fonctionnalités principales</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🌡️</div>
                        <h3>Surveillance météo</h3>
                        <p>
                            Surveillez en temps réel les conditions météorologiques avec des
                            capteurs de température, humidité et pression atmosphérique.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚨</div>
                        <h3>Système d'alarme intelligent</h3>
                        <p>
                            Détection automatique de mouvements et alertes en temps réel pour une
                            sécurité optimale de vos espaces.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works Section */}
            <section className="how-it-works-section">
                <h2 className="section-title">Comment ça fonctionne</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Installation des capteurs</h3>
                            <p>
                                Des capteurs intelligents sont installés dans chaque pièce pour
                                collecter les données en temps réel.
                            </p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Collecte de données</h3>
                            <p>
                                Les capteurs transmettent automatiquement les données via MQTT vers
                                notre serveur centralisé.
                            </p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Traitement intelligent</h3>
                            <p>
                                Notre système analyse les données et déclenche des actions
                                automatiques selon vos paramètres.
                            </p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Interface utilisateur</h3>
                            <p>
                                Accédez à toutes les informations et contrôles via notre interface
                                web moderne et responsive.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Prêt à transformer votre espace ?</h2>
                    <p>Rejoignez l'avenir de la domotique intelligente</p>
                    <button
                        className="btn-primary"
                        onClick={() => (window.location.href = '/weather')}
                    >
                        Commencer maintenant
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Portfolio;
