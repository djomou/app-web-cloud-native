# 1. Image de base
FROM node:20-alpine

# 2. Dossier de travail dans le conteneur
WORKDIR /usr/src/app

# 3. Copie des fichiers de dépendances
COPY package*.json ./

# 4. Installation des dépendances
RUN npm install

# 5. Copie du reste du code
COPY . .

# 6. Compilation du projet NestJS
RUN npm run build

# 7. Exposition du port (à adapter selon le service : 3000, 3001 ou 3002)
EXPOSE 3002

# 8. Commande de lancement
CMD ["npm", "run", "start:prod"]
