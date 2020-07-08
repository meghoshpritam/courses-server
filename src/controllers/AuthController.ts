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
    index,
  }: {
    id: number;
    name: string;
    role: string;
    index: number;
  }): string => {
    return jwt.sign({ id, name, role, index }, config.refreshTokenSecret, { expiresIn: '30d' });
  };

  static verifyAccessToken = (token: string): boolean | {} => {
    try {
      const decode = jwt.verify(token, config.accessTokenSecret);
      return decode;
    } catch (err) {
      return false;
    }
  };

  static verifyRefreshToken = (token: string): boolean | {} => {
    try {
      const decode = jwt.verify(token, config.refreshTokenSecret);
      return decode;
    } catch (err) {
      return false;
    }
  };
}

export default AuthController;
