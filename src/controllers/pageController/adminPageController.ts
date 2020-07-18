import Users, { User } from './../../entity/Users';
import Assignments, { Assignment } from './../../entity/Assignments';
import Exams, { Exam } from './../../entity/Exams';
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
        .select('name description img video updated creator type')
        .exec();

      // all courses
      const courses: Course[] = await Courses.find({ creator: res.locals.id })
        .populate({
          path: 'creator',
          select: 'name',
        })
        .select('name description price creator img video updated')
        .exec();

      // all projects
      const projects: Project[] = await Projects.find({ creator: res.locals.id })
        .populate({
          path: 'creator',
          select: 'name',
        })
        .select('name description price creator img video updated')
        .exec();

      // all goals
      const goals: Project[] = await Projects.find({ creator: res.locals.id })
        .populate({
          path: 'creator',
          select: 'name',
        })
        .select('name description price creator img video updated')
        .exec();

      // all exams
      const exams: Exam[] = await Exams.find({ creator: res.locals.id })
        .populate({
          path: 'creator',
          select: 'name',
        })
        .exec();

      // all assignments
      const assignments: Assignment[] = await Assignments.find({ creator: res.locals.id })
        .populate({ path: 'creator', select: 'name' })
        .exec();

      // fetch the ratings

      if (res.locals.type === 'admin') {
        const instructors: User[] = await Users.find({ type: 'instructor' })
          .select('name active inactiveMsg role join about avatar')
          .exec();

        res.status(200).json({ nodes, courses, projects, goals, exams, assignments, instructors });
        return;
      }

      res.status(200).json({ nodes, courses, projects, goals, exams, assignments });
    } catch (err) {
      next(err);
    }
  };
}

export default AdminPageController;
