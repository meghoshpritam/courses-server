import { Request, Response, NextFunction } from 'express';
import Courses, { Course } from '../../entity/Courses';
import Projects, { Project } from '../../entity/Projects';
import Goals, { Goal } from '../../entity/Goals';
class HomePageController {
  public static get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: send according to the rating

      const courses: Course[] = await Courses.find({})
        .limit(11)
        .select('name description img video creator price updated')
        .populate({ path: 'creator', select: 'name' })
        .exec();

      const goals: Goal[] = await Goals.find({})
        .limit(11)
        .select('name description img video creator price updated')
        .populate({ path: 'creator', select: 'name' })
        .exec();

      const projects: Project[] = await Projects.find({})
        .limit(11)
        .select('name description img video creator price updated')
        .populate({ path: 'creator', select: 'name' })
        .exec();
      res.status(200).json({ courses, projects, goals });
    } catch (err) {
      next(err);
    }
  };
}
export default HomePageController;
