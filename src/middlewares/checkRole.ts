import { Request, Response, NextFunction } from 'express';

export const checkRole = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let authenticate = false;

    roles.forEach((role) => {
      if (role === res.locals.role) {
        authenticate = true;
      }
    });

    if (!authenticate) {
      res.status(401).send();
      return;
    }

    next();
  };
};
