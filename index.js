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
  const { email, password } = req.body;

  try {
    // Récupérer l'utilisateur depuis le Service BDD
    const response = await axios.get(`${BDD_SERVICE_URL}/users/${email}`);
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
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, message: "Connexion réussie ✅" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la connexion", error: error.message });
  }
});
app.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, address } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà avec cet email
    const existingUser = await axios.get(`${BDD_SERVICE_URL}/users/${email}`).catch(() => null);
    if (existingUser?.data) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Créer le nouvel utilisateur avec les champs du modèle
    const newUser = {
      email,
      password, // Le hachage sera fait par le middleware pre-save dans le modèle
      firstName,
      lastName,
      phoneNumber,
      address: {
        street: address?.street || "",
        city: address?.city || "",
        postalCode: address?.postalCode || "",
        country: address?.country || ""
      },
      role: "client", // Valeur par défaut
      isVerified: false // Valeur par défaut
    };

    // Enregistrer le nouvel utilisateur
    const response = await axios.post(`${BDD_SERVICE_URL}/users`, newUser);

    // Retourner la réponse sans le mot de passe
    const { password: _, ...userWithoutPassword } = response.data;
    
    res.status(201).json({ 
      message: "Utilisateur créé avec succès", 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({ 
      message: "Erreur lors de l'inscription", 
      error: error.response?.data?.message || error.message 
    });
  }
});


app.listen(PORT, () =>
  console.log(`🔐 Service Auth en écoute sur le port ${PORT}`)
);
