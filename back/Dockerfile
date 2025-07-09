# Utilise une image Node officielle
FROM node:20-alpine

# Dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste du code
COPY . .

# Expose le port de l'API
EXPOSE 3000

# Commande de lancement
CMD ["npm", "start"] 

#pour lancer le container : docker compose up --build