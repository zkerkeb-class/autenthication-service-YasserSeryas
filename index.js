import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globaux
app.use(express.json());

// Configuration de la session (requis pour Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true en production avec HTTPS
}));

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      services: "connected",
      health:"good"
      
    }
  });
});
app.use('/auth', authRoutes);
app.use('/auth', oauthRoutes);

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () =>
  console.log(`🔐 Service Auth en écoute sur le port ${PORT}`)
);

export default app;
