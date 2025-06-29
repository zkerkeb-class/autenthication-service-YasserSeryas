import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const BDD_SERVICE_URL = process.env.BDD_SERVICE_URL || "http://localhost:3000";

app.use(express.json());

// Route de connexion
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validation des données d'entrée
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    // Récupérer l'utilisateur depuis le Service BDD
    const response = await axios.get(`${BDD_SERVICE_URL}/api/auth/users/${email}`);
    const user = response.data.data;
    
    console.log("Utilisateur récupéré:", user);
    console.log("Password reçu:", password ? "***" : "VIDE");
    console.log("User password:", user.password ? "***" : "VIDE");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier que le mot de passe existe
    if (!user.password) {
      return res.status(500).json({ message: "Mot de passe utilisateur manquant" });
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
    console.error("Erreur complète:", error);
    res.status(500).json({ 
      message: "Erreur lors de la connexion", 
      error: error.message 
    });
  }
});

app.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, address } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà avec cet email
    const existingUser = await axios.get(`${BDD_SERVICE_URL}/api/auth/users/${email}`).catch(() => null);
    console.log(existingUser)
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
        street: address?.street || " ",
        city: address?.city || " ",
        postalCode: address?.postalCode || " ",
        country: address?.country ||  " "
      },
      // role: "client", // Valeur par défaut
      // isVerified: false // Valeur par défaut
    };

    // Enregistrer le nouvel utilisateur
    const response = await axios.post(`${BDD_SERVICE_URL}/api/auth/users`, newUser);

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
///import express from "express";
// import dotenv from "dotenv";
// import axios from "axios";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import session from "express-session";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;
// const BDD_SERVICE_URL = process.env.BDD_SERVICE_URL || "http://localhost:3000";

// app.use(express.json());

// // Configuration de la session (requis pour Passport)
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-session-secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false } // true en production avec HTTPS
// }));

// // Initialisation de Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Configuration de la stratégie Google OAuth2
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "/auth/google/callback"
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     console.log("Profil Google reçu:", profile);
    
//     // Vérifier si l'utilisateur existe déjà
//     const existingUser = await axios.get(
//       `${BDD_SERVICE_URL}/api/auth/users/${profile.emails[0].value}`
//     ).catch(() => null);

//     if (existingUser?.data?.data) {
//       // Utilisateur existant
//       return done(null, existingUser.data.data);
//     }

//     // Créer un nouvel utilisateur OAuth
//     const newUser = {
//       email: profile.emails[0].value,
//       firstName: profile.name.givenName,
//       lastName: profile.name.familyName,
//       googleId: profile.id,
//       isVerified: true, // Les comptes Google sont considérés comme vérifiés
//       provider: 'google',
//       avatar: profile.photos[0]?.value,
//       phoneNumber: " ",
//       address: {
//         street: " ",
//         city: " ",
//         postalCode: " ",
//         country: " "
//       }
//     };

//     const response = await axios.post(`${BDD_SERVICE_URL}/api/auth/users`, newUser);
//     return done(null, response.data.data || response.data);

//   } catch (error) {
//     console.error("Erreur OAuth Google:", error);
//     return done(error, null);
//   }
// }));

// // Sérialisation/désérialisation des utilisateurs pour les sessions
// passport.serializeUser((user, done) => {
//   done(null, user._id || user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const response = await axios.get(`${BDD_SERVICE_URL}/api/auth/users/by-id/${id}`);
//     done(null, response.data.data);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // ===== ROUTES OAUTH2 =====

// // Initialiser l'authentification Google
// app.get("/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Callback de Google OAuth2
// app.get("/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/auth/failure" }),
//   async (req, res) => {
//     try {
//       // Générer un JWT pour l'utilisateur OAuth
//       const token = jwt.sign(
//         { 
//           id: req.user._id || req.user.id, 
//           email: req.user.email,
//           provider: 'google'
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "30d" }
//       );

//       // Rediriger vers le frontend avec le token
//       // Vous pouvez adapter cette URL selon votre frontend
//       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
//     } catch (error) {
//       console.error("Erreur génération token OAuth:", error);
//       res.redirect("/auth/failure");
//     }
//   }
// );

// // Route d'échec OAuth
// app.get("/auth/failure", (req, res) => {
//   res.status(401).json({ 
//     message: "Échec de l'authentification OAuth2",
//     error: "Authentication failed" 
//   });
// });

// // Route pour récupérer les informations utilisateur OAuth
// app.get("/auth/me", async (req, res) => {
//   const token = req.headers.authorization?.replace('Bearer ', '');
  
//   if (!token) {
//     return res.status(401).json({ message: "Token manquant" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const response = await axios.get(`${BDD_SERVICE_URL}/api/auth/users/by-id/${decoded.id}`);
    
//     const { password, ...userWithoutPassword } = response.data.data;
//     res.json({ user: userWithoutPassword });
//   } catch (error) {
//     res.status(401).json({ message: "Token invalide" });
//   }
// });

// // ===== ROUTES CLASSIQUES (CONSERVÉES) =====

// // Route de connexion classique
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email et mot de passe requis" });
//   }

//   try {
//     const response = await axios.get(`${BDD_SERVICE_URL}/api/auth/users/${email}`);
//     const user = response.data.data;
    
//     console.log("Utilisateur récupéré:", user);

//     if (!user) {
//       return res.status(404).json({ message: "Utilisateur non trouvé" });
//     }

//     // Vérifier si c'est un compte OAuth (pas de mot de passe local)
//     if (user.provider && user.provider !== 'local') {
//       return res.status(400).json({ 
//         message: `Ce compte utilise ${user.provider}. Veuillez vous connecter via ${user.provider}.` 
//       });
//     }

//     if (!user.password) {
//       return res.status(500).json({ message: "Mot de passe utilisateur manquant" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Mot de passe incorrect" });
//     }

//     const token = jwt.sign(
//       { 
//         id: user._id, 
//         email: user.email,
//         provider: 'local'
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "30d" }
//     );

//     res.json({ token, message: "Connexion réussie ✅" });
//   } catch (error) {
//     console.error("Erreur complète:", error);
//     res.status(500).json({ 
//       message: "Erreur lors de la connexion", 
//       error: error.message 
//     });
//   }
// });

// // Route d'inscription classique
// app.post("/register", async (req, res) => {
//   const { email, password, firstName, lastName, phoneNumber, address } = req.body;

//   try {
//     const existingUser = await axios.get(`${BDD_SERVICE_URL}/api/auth/users/${email}`).catch(() => null);
    
//     if (existingUser?.data) {
//       return res.status(400).json({ message: "Cet email est déjà utilisé" });
//     }

//     const newUser = {
//       email,
//       password,
//       firstName,
//       lastName,
//       phoneNumber,
//       provider: 'local', // Marquer comme compte local
//       address: {
//         street: address?.street || " ",
//         city: address?.city || " ",
//         postalCode: address?.postalCode || " ",
//         country: address?.country || " "
//       }
//     };

//     const response = await axios.post(`${BDD_SERVICE_URL}/api/auth/users`, newUser);
//     const { password: _, ...userWithoutPassword } = response.data;
    
//     res.status(201).json({ 
//       message: "Utilisateur créé avec succès", 
//       user: userWithoutPassword 
//     });
//   } catch (error) {
//     console.error("Erreur d'inscription:", error);
//     res.status(500).json({ 
//       message: "Erreur lors de l'inscription", 
//       error: error.response?.data?.message || error.message 
//     });
//   }
// });

// app.listen(PORT, () =>
//   console.log(`🔐 Service Auth en écoute sur le port ${PORT}`)
// );
