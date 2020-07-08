import { Request, Response, NextFunction } from 'express';
import Ratings, { Rating } from '../../entity/Rating';
import { orderBy, find } from 'lodash';
import Courses, { Course } from '../../entity/Courses';
import Projects, { Project } from '../../entity/Projects';
import Goals, { Goal } from '../../entity/Goals';
class HomePageController {
  public static get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // fetch all ratings of projects, goals and courses
      const allRatings: Rating[] = await Ratings.find({})
        .select('courses projects goals')
        .populate({
          path: 'courses',
          populate: {
            path: 'id',
            populate: { path: 'creator', select: 'name' },
            select: 'name description img video price creator updated',
          },
        })
        .populate({
          path: 'projects',
          populate: {
            path: 'id',
            populate: { path: 'creator', select: 'name' },
            select: 'name description img video price creator updated',
          },
        })
        .exec();

      // add all the course & project ratings and count the number of ratings
      let courses = [];
      let projects = [];
      let goals = [];
      let present = false;
      allRatings.forEach((usrObj) => {
        usrObj.courses.forEach((course: any) => {
          present = false;
          for (let idx = 0; idx < courses.length; idx++) {
            if (courses[idx]._id.toString() === course.id._id.toString()) {
              // already course already pushed
              present = true;
              courses[idx].totalRating += course.rating;
              courses[idx].totalUser += 1;
            }
          }
          if (!present) {
            // push the new course rating
            courses.push({ ...course.id._doc, totalRating: course.rating, totalUser: 1 });
          }
        });

        usrObj.projects.forEach((project: any) => {
          present = false;
          for (let idx = 0; idx < projects.length; idx++) {
            if (projects[idx]._id.toString() === project.id._id.toString()) {
              // already course already pushed
              present = true;
              projects[idx].totalRating += project.rating;
              projects[idx].totalUser += 1;
            }
          }
          if (!present) {
            // push the new course rating
            projects.push({ ...project.id._doc, totalRating: project.rating, totalUser: 1 });
          }
        });

        usrObj.goals.forEach((goal: any) => {
          present = false;
          for (let idx = 0; idx < goals.length; idx++) {
            if (goals[idx].id === goal.id._id.toString()) {
              // already course already pushed
              present = true;
              goals[idx].totalRating += goal.rating;
              goals[idx].totalUser += 1;
            }
          }
          if (!present) {
            // push the new course rating
            goals.push({ id: goal.id._id.toString(), totalRating: goal.rating, totalUser: 1 });
          }
        });
      });

      // find the avg rating
      for (let idx = 0; idx < courses.length; idx++) {
        courses[idx].totalRating = (courses[idx].totalRating / courses[idx].totalUser).toFixed(1);
      }
      for (let idx = 0; idx < projects.length; idx++) {
        projects[idx].totalRating = (projects[idx].totalRating / projects[idx].totalUser).toFixed(
          1
        );
      }
      for (let idx = 0; idx < goals.length; idx++) {
        goals[idx].totalRating = (goals[idx].totalRating / goals[idx].totalUser).toFixed(1);
      }

      // sort the rating
      orderBy(courses, ['totalRating', 'totalUser'], ['desc', 'desc']);
      orderBy(projects, ['totalRating', 'totalUser'], ['desc', 'desc']);

      // return top 9
      let returnCourses = [];
      let returnProjects = [];
      for (let idx = 0; idx < (courses.length < 9 ? courses.length : 9); idx++) {
        returnCourses.push(courses[idx]);
      }
      for (let idx = 0; idx < (projects.length < 9 ? projects.length : 9); idx++) {
        returnProjects.push(projects[idx]);
      }
      // if not 9 rated then return any other courses to return all the 9
      if (returnCourses.length < 9) {
        const remainCourses: Course[] | any = await Courses.find({})
          .limit(9)
          .select('name description img video price creator updated')
          .populate({ path: 'creator', select: 'name' })
          .exec();

        for (let idx = 0; returnCourses.length < 9 && idx < remainCourses.length; idx++) {
          if (!find(returnCourses, { _id: remainCourses[idx]._id })) {
            returnCourses.push({ ...remainCourses[idx]._doc, totalRating: 0, totalUser: 0 });
          }
        }
      }
      if (returnProjects.length < 9) {
        const remainProjects: Project[] | any = await Projects.find({})
          .limit(9)
          .select('name description img video price creator updated')
          .populate({ path: 'creator', select: 'name' })
          .exec();

        for (let idx = 0; returnProjects.length < 9 && idx < remainProjects.length; idx++) {
          if (!find(returnProjects, { _id: remainProjects[idx]._id })) {
            returnProjects.push({ ...remainProjects[idx]._doc, totalRating: 0, totalUser: 0 });
          }
        }
      }

      // fetch all goals
      const allGoals: Goal[] = await Goals.find({})
        .populate({ path: 'creator', select: 'name' })
        .select('name description updated price creator')
        .exec();
      // count goal ratings
      const returnGoals = [];
      allGoals.forEach((goal: any) => {
        present = false;
        for (let idx = 0; idx < goals.length; idx++) {
          if (goals[idx].id === goals._id.toString()) {
            returnGoals.push({
              ...goal._doc,
              totalRating: goals[idx].totalRating,
              totalUser: goals[idx].totalUser,
            });
            present = true;
            break;
          }
        }
        if (!present) {
          returnGoals.push({
            ...goal._doc,
            totalRating: 0,
            totalUser: 0,
          });
        }
      });

      res
        .status(200)
        .json({ courses: returnCourses, projects: returnProjects, goals: returnGoals });
    } catch (err) {
      next(err);
    }
  };
}
export default HomePageController;
