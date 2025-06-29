import userService from './userService.js';
import tokenService from './tokenService.js';
import bcrypt from 'bcrypt';

class AuthError extends Error {
  constructor(message, name = 'AuthenticationError') {
    super(message);
    this.name = name;
  }
}

class AuthService {
  async loginUser(email, password) {
    if (!email || !password) {
      throw new AuthError("Email et mot de passe requis", 'ValidationError');
    }

    const user = await userService.getUserByEmail(email);
    
    if (!user) {
      throw new AuthError("Utilisateur non trouvé", 'NotFoundError');
    }

    // Vérifier si c'est un compte OAuth
    if (user.provider && user.provider !== 'local') {
      throw new AuthError(
        `Ce compte utilise ${user.provider}. Veuillez vous connecter via ${user.provider}.`,
        'ValidationError'
      );
    }

    if (!user.password) {
      throw new AuthError("Mot de passe utilisateur manquant");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthError("Mot de passe incorrect");
    }

    const token = tokenService.generateToken({
      id: user._id,
      email: user.email,
      provider: 'local'
    });

    return { token, user };
  }

  async registerUser(userData) {
    const { email, password, firstName, lastName, phoneNumber, address } = userData;

    const existingUser = await userService.getUserByEmail(email);
    
    if (existingUser) {
      throw new AuthError("Cet email est déjà utilisé", 'ConflictError');
    }

    const newUser = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      provider: 'local',
      address: {
        street: address?.street || " ",
        city: address?.city || " ",
        postalCode: address?.postalCode || " ",
        country: address?.country || " "
      }
    };

    const user = await userService.createUser(newUser);
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  async getUserFromToken(token) {
    const decoded = tokenService.verifyToken(token);
    const user = await userService.getUserById(decoded.id);
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async handleGoogleAuth(profile) {
    try {
      console.log("Profil Google reçu:", profile);
      
      const existingUser = await userService.getUserByEmail(profile.emails[0].value);

      if (existingUser) {
        return existingUser;
      }

      const newUser = {
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        googleId: profile.id,
        isVerified: true,
        provider: 'google',
        avatar: profile.photos[0]?.value,
        phoneNumber: " ",
        address: {
          street: " ",
          city: " ",
          postalCode: " ",
          country: " "
        }
      };

      return await userService.createUser(newUser);
    } catch (error) {
      console.error("Erreur OAuth Google:", error);
      throw error;
    }
  }
}

export default new AuthService();
