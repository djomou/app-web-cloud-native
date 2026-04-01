const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');

const app = express();
const SECRET_KEY = "ma_cle_secrete_hyper_complexe_pour_school_manager";

// URLs des microservices Docker
const SERVICES = {
    professeurs:  'http://127.0.0.1:3000',
    matieres:     'http://127.0.0.1:3001',
    attributions: 'http://127.0.0.1:3002'
};

app.use(cors({ origin: '*', allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// ─── 1. LOGIN ────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@ecole.com" && password === "admin123") {
        const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: '24h' });
        return res.json({ token });
    }
    res.status(401).json({ message: "Identifiants incorrects" });
});

// ─── 2. VERIFY TOKEN ─────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(403).json({ message: "Accès refusé. Aucun token." });
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err) => {
        if (err) return res.status(401).json({ message: "Token invalide ou expiré." });
        next();
    });
};

// ─── 3. FONCTION PROXY UNIVERSELLE ───────────────────────────────────────────
// Cette fonction reçoit la requête du frontend et la transmet au bon microservice
const proxy = (serviceName, resourcePath) => async (req, res) => {
    try {
        const baseUrl = SERVICES[serviceName];
        
        // Construction de l'URL finale vers le microservice
        // Ex: GET /api/professeurs/5 → http://127.0.0.1:3000/professeurs/5
        const idPart = req.params.id ? `/${req.params.id}` : '';
        const url = `${baseUrl}/${resourcePath}${idPart}`;
        
        console.log(`[PROXY] ${req.method} ${req.path} → ${url}`);

        const response = await axios({
            method: req.method,
            url: url,
            data: req.body,
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true  // on gère nous-mêmes les erreurs
        });

        res.status(response.status).json(response.data);

    } catch (err) {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.status(502).json({ message: "Microservice injoignable.", detail: err.message });
    }
};

// ─── 4. ROUTES PROFESSEURS ───────────────────────────────────────────────────
app.get   ('/api/professeurs',     verifyToken, proxy('professeurs', 'professeurs'));
app.post  ('/api/professeurs',     verifyToken, proxy('professeurs', 'professeurs'));
app.delete('/api/professeurs/:id', verifyToken, proxy('professeurs', 'professeurs'));

// ─── 5. ROUTES MATIERES ──────────────────────────────────────────────────────
app.get   ('/api/matieres',     verifyToken, proxy('matieres', 'matieres'));
app.post  ('/api/matieres',     verifyToken, proxy('matieres', 'matieres'));
app.delete('/api/matieres/:id', verifyToken, proxy('matieres', 'matieres'));

// ─── 6. ROUTES ATTRIBUTIONS ──────────────────────────────────────────────────
app.get   ('/api/attributions',     verifyToken, proxy('attributions', 'attributions'));
app.post  ('/api/attributions',     verifyToken, proxy('attributions', 'attributions'));
app.delete('/api/attributions/:id', verifyToken, proxy('attributions', 'attributions'));

// ─── 7. DÉMARRAGE ────────────────────────────────────────────────────────────
app.listen(8080, '0.0.0.0', () => {
    console.log("🚀 Gateway (axios) opérationnelle sur le port 8080");
    console.log("   POST   /api/auth/login");
    console.log("   GET    /api/professeurs");
    console.log("   GET    /api/matieres");
    console.log("   GET    /api/attributions");
});
