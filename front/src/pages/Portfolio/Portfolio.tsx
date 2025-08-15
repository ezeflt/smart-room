import React from 'react';
import './portfolio.css';

const Portfolio: React.FC = () => {
  return (
    <div className="portfolio-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart Room</h1>
          <p className="hero-subtitle">Système de surveillance et contrôle intelligent pour pièces connectées</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => window.location.href = '/login'}>
              Commencer
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              En savoir plus
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="smart-room-preview">
            <div className="room-element sensor"></div>
            <div className="room-element alarm"></div>
            <div className="room-element weather"></div>
            <div className="room-element office"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Fonctionnalités principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌡️</div>
            <h3>Surveillance météo</h3>
            <p>Surveillez en temps réel les conditions météorologiques avec des capteurs de température, humidité et pression atmosphérique.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚨</div>
            <h3>Système d'alarme intelligent</h3>
            <p>Détection automatique de mouvements et alertes en temps réel pour une sécurité optimale de vos espaces.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Gestion de bureau</h3>
            <p>Contrôlez l'éclairage, la climatisation et l'occupation de vos bureaux pour une efficacité énergétique maximale.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Tableaux de bord</h3>
            <p>Visualisez toutes vos données sur des tableaux de bord interactifs et personnalisables.</p>
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
              <p>Des capteurs intelligents sont installés dans chaque pièce pour collecter les données en temps réel.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Collecte de données</h3>
              <p>Les capteurs transmettent automatiquement les données via MQTT vers notre serveur centralisé.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Traitement intelligent</h3>
              <p>Notre système analyse les données et déclenche des actions automatiques selon vos paramètres.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Interface utilisateur</h3>
              <p>Accédez à toutes les informations et contrôles via notre interface web moderne et responsive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="tech-section">
        <h2 className="section-title">Technologies utilisées</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <h4>Frontend</h4>
            <ul>
              <li>React 19</li>
              <li>TypeScript</li>
              <li>Redux Toolkit</li>
              <li>React Router</li>
            </ul>
          </div>
          <div className="tech-card">
            <h4>Backend</h4>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>MongoDB</li>
              <li>MQTT</li>
            </ul>
          </div>
          <div className="tech-card">
            <h4>Infrastructure</h4>
            <ul>
              <li>Docker</li>
              <li>Docker Compose</li>
              <li>Event Streaming</li>
              <li>REST API</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à transformer votre espace ?</h2>
          <p>Rejoignez l'avenir de la domotique intelligente</p>
          <button className="btn-primary" onClick={() => window.location.href = '/login'}>
            Commencer maintenant
          </button>
        </div>
      </section>
    </div>
  );
};

export default Portfolio; 