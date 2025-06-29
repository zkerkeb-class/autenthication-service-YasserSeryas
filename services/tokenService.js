import jwt from 'jsonwebtoken';

class TokenService {
  generateToken(payload, expiresIn = '30d') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

export default new TokenService();
