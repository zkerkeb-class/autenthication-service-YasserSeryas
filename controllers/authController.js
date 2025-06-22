import authService from '../services/authService.js';
import tokenService from '../services/tokenService.js';

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.loginUser(email, password);
      
      res.json({
        token: result.token,
        message: "Connexion réussie ✅"
      });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      
      if (error.name === 'AuthenticationError') {
        return res.status(401).json({ message: error.message });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      if (error.name === 'NotFoundError') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ 
        message: "Erreur lors de la connexion", 
        error: error.message 
      });
    }
  }

  async register(req, res) {
    try {
      const userData = req.body;
      
      const user = await authService.registerUser(userData);
      
      res.status(201).json({ 
        message: "Utilisateur créé avec succès", 
        user 
      });
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      
      if (error.name === 'ConflictError') {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ 
        message: "Erreur lors de l'inscription", 
        error: error.message 
      });
    }
  }

  async getProfile(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const user = await authService.getUserFromToken(token);
      
      res.json({ user });
    } catch (error) {
      res.status(401).json({ message: "Token invalide" });
    }
  }
}

export default new AuthController();
