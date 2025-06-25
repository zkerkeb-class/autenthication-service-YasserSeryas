import oauthService from '../services/authService.js';
import tokenService from '../services/tokenService.js';

class OAuthController {
  async googleCallback(req, res) {
    try {
      const token = tokenService.generateToken({
        id: req.user._id || req.user.id,
        email: req.user.email,
        provider: 'google'
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);
    } catch (error) {
      console.error("Erreur génération token OAuth:", error);
      res.redirect("/auth/failure");
    }
  }

  authFailure(req, res) {
    res.status(401).json({ 
      message: "Échec de l'authentification OAuth2",
      error: "Authentication failed" 
    });
  }
}

export default new OAuthController();
