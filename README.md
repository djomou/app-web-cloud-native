Ce Projet developper par nos soin peut se résumer en quelques lignes, ce qui sera fait pour que vous ayez une appréhension concrète de la chose et que par la suite vous puissez vous aussi le mettre en place. Voici la feuille de route que je vous propose pour mener ce projet à bien sans perdre du temps:

    • Les Fondations du Serveur : Mise à jour d'Ubuntu et installation de l'environnement d'exécution (Node.js, npm/yarn) qui fera tourner NestJS et Next.js.

    • La Couche Données : l'installation de PostgreSql, créer la base de données du projet et s'assurer que tu peux t'y connecter (insérer, modifier, supprimer).

    • Le Premier Microservice (NestJS) : Créer le service "Professeurs", le connecter à PostgreSql et tester son fonctionnement (CRUD).

    • Les Autres Microservices : Déployer les autres microservices "Matières" et "Assignation".

    • L'API Gateway : Mettre en place la passerelle qui va unifier les trois microservices derrière un seul port d'accès et ainsi ajouter une certaine couche de sécurité.

    • Le Frontend (Next.js) : Initialiser le projet Next.js avec Tailwind CSS et le connecter à l'API Gateway.

1. 🖥️ Les Fondations du Serveur :

La première étape consiste à préparer l'environnement d'exécution sur une machine **Ubuntu Server** déployée via VirtualBox, cela n'empeche que vous pouvez faire le projet sur OS qui vous plaira:

    - Mise à jour complète du système (`apt update && apt upgrade`)
    - Installation de "Node.js" et "npm" — l'environnement qui fait tourner NestJS et Next.js.
    - Installation de "Docker" et "Docker Compose" — pour conteneuriser les microservices et la base de données.
    - Configuration du réseau "host-only" VirtualBox pour accéder à la VM depuis la machine hôte.

> Technologies : Ubuntu Server 22.04, Node.js, npm, Docker, Docker Compose, VirtualBox

2. 🗄️ La Couche Données :

Mise en place de la base de données relationnelle partagée entre tous les microservices :

    - Déploiement de "PostgreSQL 15 Alpine" via un conteneur Docker.
    - Création de la base de données du projet.
    - Vérification de la connectivité (insert, select, delete)
    - "TypeORM" intégré dans NestJS gère la création automatique des tables via 'synchronize: true'.

> Technologies : PostgreSQL 15 Alpine, Docker, TypeORM.

3. 👤 Le Premier Microservice — Professeurs :

Création du premier service NestJS indépendant, responsable de la gestion des Professeurs :

    - Initialisation d'un projet "NestJS" avec le CLI (`nest new ms-professeurs`).
    - Connexion à PostgreSQL via "TypeORM".
    - Définition de l'entité `Professeur` : `id`, `nom`, `prenom`, `specialite`, `email`.
    - Implémentation du "CRUD complet" : GET, POST, PATCH, DELETE.
    - Conteneurisation via "Docker" et exposition sur le port "3000".
    - Tests des endpoints via `curl`.

> Technologies : NestJS, TypeORM, PostgreSQL, Docker, TypeScript.

4. 📚 Les Autres Microservices — Matières & Attributions :

Duplication de l'architecture du premier microservice pour les deux services restants.

    - "ms-matieres" (port `3001`) — entité `Matière` : `id`, `intitule`, `code`, `credits`.
    - "ms-attributions" (port `3002`) — entité `Attribution` : `id`, `professeurId`, `matiereId`, `anneeAcademique`.
    - Chaque microservice est "indépendant" : son propre conteneur Docker, son propre port, ses propres routes.
    - Orchestration de l'ensemble via "Docker Compose" (3 microservices + PostgreSQL).

> Technologies : NestJS, TypeORM, Docker Compose, TypeScript.

5. 🛡️ L'API Gateway :

Mise en place de la passerelle centrale qui unifie les trois microservices derrière un **port unique** (`8080`) tout en ajoutant une couche de sécurité.

    - Serveur "Express.js" qui intercepte toutes les requêtes du frontend.
    - Authentification JWT : endpoint `/api/auth/login` qui génère un token signé (HS256, 24h).
    - Middleware `verifyToken` appliqué à toutes les routes protégées.
    - "Proxy axios" : redirige chaque requête vers le bon microservice selon la route :
      + `/api/professeurs` → `ms-professeurs:3000`
      + `/api/matieres` → `ms-matieres:3001`
      + `/api/attributions` → `ms-attributions:3002`
    - "CORS" configuré pour autoriser les requêtes cross-origin du frontend.

> Technologies : Node.js, Express.js, jsonwebtoken, axios, cors.

6. 🎨 Le Frontend — Next.js :

Initialisation de l'application cliente connectée à l'API Gateway, avec un design soigné et une expérience utilisateur fluide.

    - Projet "Next.js" avec App Router et "Turbopack"
    - Intégration de "TailwindCSS v4" et design system custom "Dark Elite"
    - Connexion exclusive à l'API Gateway.
    - Composant `ProtectedRoute` — redirige vers `/login` si le token JWT est absent du cookie.
    - Polices : "DM Sans" (corps) + "Playfair Display" (titres) via Google Fonts.

 Page + Route + Description :
 
     Login  `/login` : Authentification, génération et stockage du token JWT.
     Professeurs  `/` : Liste, ajout, suppression, recherche en temps réel.
     Matières  `/matieres` : Liste, ajout, suppression avec badges crédits |
     Affectations `/attributions` : Liaison prof–matière, filtres, aperçu avant validation |

> Technologies : Next.js, TailwindCSS v4, TypeScript, DM Sans, Playfair Display.

🚀 Lancement :


    1. Conteneurs Docker (microservices + base de données) :
    docker-compose up -d

    2. API Gateway — terminal 1 :
    cd api-gateway && node server.js

    3. Frontend — terminal 2 :
    cd frontend-school && npm run dev -- -p 3003 -H 0.0.0.0
    
Flux de communication :

Frontend → Gateway:8080 → verifyToken → proxy axios → Microservice:300x → PostgreSQL.
