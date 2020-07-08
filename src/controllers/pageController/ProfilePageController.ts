import { Response, Request, NextFunction } from 'express';
import Users, { User } from '../../entity/Users';
import Courses, { Course } from '../../entity/Courses';
import RatingController from '../RatingController';
import CourseRatingController from '../CourseRatingController';
import MyCourses, { MyCourse } from '../../entity/MyCourses';

class ProfilePageController {
  public static get = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;

    let selectField = '-__v -refreshToken';

    try {
      if (!id === res.locals.id) {
        selectField += ' -email';
      }

      const user: User = await Users.findOne({ _id: id }).select(selectField).exec();

      if (!user) {
        next({
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid user id' }],
        });
        return;
      }

      const myCourses: MyCourse = await MyCourses.findOne({ user: res.locals.id });

      let enrollCourses = [];
      if (myCourses?.courses) {
        const courseIds = [];

        myCourses.courses.forEach((course) => {
          courseIds.push(course.id);
        });

        const ratings = await CourseRatingController.getController({
          courseIds,
          courseDetails: true,
          withRatings: false,
        });

        enrollCourses = ratings;
      }

      res.status(200).json({ user, courses: enrollCourses });
      // }
    } catch (err) {
      next(err);
    }
  };
}

export default ProfilePageController;
