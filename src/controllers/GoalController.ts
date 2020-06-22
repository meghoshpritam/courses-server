import { Response, Request, NextFunction } from 'express';

class GoalController {
  public static get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.body;

    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  };

  public static post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.body;

    try {
      res.status(201).json();
    } catch (err) {
      next(err);
    }
  };

  public static update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.body;

    try {
      res.status(202).json();
    } catch (err) {
      next(err);
    }
  };

  public static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.body;

    try {
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default GoalController;
