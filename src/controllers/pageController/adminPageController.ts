import Projects, { Project } from './../../entity/Projects';
import Courses, { Course } from './../../entity/Courses';
import { Request, Response, NextFunction } from 'express';
import Nodes, { Node } from '../../entity/Nodes';

class AdminPageController {
  public static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // all nodes
      const nodes: Node[] = await Nodes.find({ creator: res.locals.id })
        .populate({ path: 'creator', select: 'name' })
        .select('name description img video updated creator type');

      // all courses
      const courses: Course[] = await Courses.find({ creator: res.locals.id })
        .populate({
          path: 'creator',
          select: 'name',
        })
        .select('name description price creator img video updated');

      // all projects
      const projects: Project[] = await Projects.find({ creator: res.locals.id })
        .populate({
          path: 'creator',
          select: 'name',
        })
        .select('name description price creator img video updated');

      // all goals
      const goals: Project[] = await Projects.find({ creator: res.locals.id })
        .populate({
          path: 'creator',
          select: 'name',
        })
        .select('name description price creator img video updated');

      // fetch the ratings

      res.status(200).json({ nodes, courses, projects, goals });
    } catch (err) {
      next(err);
    }
  };
}

export default AdminPageController;
