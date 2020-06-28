import { Request, Response, NextFunction } from 'express';
import Goals, { Goal } from '../entity/Goals';
import Projects from '../entity/Projects';
import Ratings, { Rating } from '../entity/Rating';

class PageController {
  public static homePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goals: Goal[] = await Goals.find({})
        .populate({ path: 'creator', select: '-refreshToken -email' })
        .exec();

      const reviews: Rating[] = await Ratings.find();

      // const projects = await Projects.find({})
      //   .populate({ path: 'creator', select: '-refreshToken -email' })
      //   .exec();
      res.status(200).json({ goals });
    } catch (err) {
      next(err);
    }
  };
}

export default PageController;
