import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const BDD_SERVICE_URL = process.env.BDD_SERVICE_URL || "http://localhost:6000";

app.use(express.json());

// Route de connexion
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Récupérer l'utilisateur depuis le Service BDD
    const response = await axios.get(`${BDD_SERVICE_URL}/users/${username}`);
    const user = response.data;

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Connexion réussie ✅" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la connexion", error: error.message });
  }
});

app.listen(PORT, () =>
  console.log(`🔐 Service Auth en écoute sur le port ${PORT}`)
);
