import * as jwt from 'jsonwebtoken';
import config from '../config/config';

class AuthController {
  static generateAccessToken = ({
    id,
    name,
    role,
  }: {
    id: number;
    name: string;
    role: string | null;
  }): string => {
    return jwt.sign({ id, name, role }, config.accessTokenSecret, { expiresIn: '27h' });
  };

  static generateRefreshToken = ({
    id,
    name,
    role,
  }: {
    id: number;
    name: string;
    role: string;
  }): string => {
    return jwt.sign({ id, name, role }, config.refreshTokenSecret, { expiresIn: '30d' });
  };

  static verifyAccessToken = (token: string): boolean | {} => {
    try {
      jwt.verify(token, config.accessTokenSecret);
      return jwt.decode(token);
    } catch (err) {
      return false;
    }
  };

  static verifyRefreshToken = (token: string): boolean | {} => {
    try {
      jwt.verify(token, config.refreshTokenSecret);
      return jwt.decode(token);
    } catch (err) {
      return false;
    }
  };
}

export default AuthController;
