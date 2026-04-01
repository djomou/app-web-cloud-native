const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const SECRET_KEY = "ma_cle_secrete_hyper_complexe_pour_school_manager";

app.use(cors({
    origin: '*', 
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 1. ROUTE DE CONNEXION (Génère le Token)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@ecole.com" && password === "admin123") {
        const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: '24h' });
        return res.json({ token });
    }
    res.status(401).json({ message: "Identifiants incorrects" });
});

// 2. LE GARDIEN (Vérifie le Token)
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(403).json({ message: "Accès refusé. Aucun token." });
    
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err) => {
        if (err) return res.status(401).json({ message: "Token invalide ou expiré." });
        next();
    });
};

// 3. LES PROXIES VERS DOCKER (Avec traduction des routes validée)
app.use('/api/professeurs', verifyToken, createProxyMiddleware({
    target: 'http://127.0.0.1:3000',
    changeOrigin: true,
    pathRewrite: { '^/api/professeurs': '/professeurs' } // Traduit /api/professeurs en /professeurs
}));

app.use('/api/matieres', verifyToken, createProxyMiddleware({
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
    pathRewrite: { '^/api/matieres': '/matieres' }
}));

app.use('/api/attributions', verifyToken, createProxyMiddleware({
    target: 'http://127.0.0.1:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/attributions': '/attributions' }
}));

app.listen(8080, '0.0.0.0', () => {
    console.log("🚀 Gateway SÉCURISÉE opérationnelle sur le port 8080");
});
