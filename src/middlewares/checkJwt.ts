import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';

export const checkAccessToken = (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the head
  const token = <string>req.headers['authorization'];

  try {
  } catch (error) {
    res.status(401).send();
    return;
  }

  next();
};
