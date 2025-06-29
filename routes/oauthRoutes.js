import express from 'express';
import passport from '../config/passport.js';
import oauthController from '../controllers/oauthController.js';

const router = express.Router();

// Initialiser l'authentification Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google OAuth2
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  oauthController.googleCallback
);

// Route d'échec OAuth
router.get('/failure', oauthController.authFailure);

export default router;
