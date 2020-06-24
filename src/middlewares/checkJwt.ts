import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import AuthController from '../controllers/AuthController';

export const checkAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const token = <string>req.headers['authorization'];

  const decode: any = AuthController.verifyAccessToken(token);

  if (!decode) {
    res.status(401).end();
    return;
  }

  res.locals = { ...decode };
  next();
};
