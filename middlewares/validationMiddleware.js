export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email et mot de passe requis" 
      });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        message: "Format d'email invalide" 
      });
    }
    
    next();
  };
  
  export const validateRegister = (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        message: "Tous les champs requis doivent être remplis" 
      });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        message: "Format d'email invalide" 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Le mot de passe doit contenir au moins 6 caractères" 
      });
    }
    
    next();
  };
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  