smart-room

## Description
Smart Room est une application web permettant de superviser une pièce intelligente : 
- Consultation des capteurs (météo/température/humidité)
- Gestion des alarmes (activation/désactivation)
- Détecteur de mouvement en temps réel (alerte mail)
- Back‑office pour l’administration

## Technologies utilisées
- **Frontend**
  - React + Vite
  - TypeScript
  - React Router
  - Redux Toolkit
  - Axios

- **Backend**
  - Node.js / Express
  - Mongoose (MongoDB)
  - MQTT
  - JSON Web Token (auth)
  - bcryptjs, nodemailer

- **Base de données**
  - MongoDB

## Prérequis
Docker et Docker Compose (recommandé pour un démarrage rapide)

## Lancer l’application en local (avec Docker)
1. Construire et démarrer les services :
   ```bash
   docker compose up --build
   ```
2. Accéder au frontend : `http://localhost:5173`
3. API backend disponible sur : `http://localhost:3000`

Commandes utiles :
- Arrêter : `docker compose down`
- Logs en continu : `docker compose logs -f`

## URL par défaut
- Frontend : `http://localhost:5173`
- API : `http://localhost:3000`

## DevOps & Conteneurisation
- Deux Dockerfiles sont fournis (frontend et backend), plus des versions `Dockerfile.dev` pour le développement.
- `docker-compose.yml` orchestre les deux services pour un lancement local unifié.
- Un fichier `render.yaml` est présent côté frontend, facilitant un déploiement sur Render si souhaité.