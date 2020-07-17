import { Request, Response, NextFunction } from 'express';

class CoursePageController {
  public static publicCourseGet = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;

    try {
      if (!id) {
        next({
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Course id is required' }],
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export default CoursePageController;
