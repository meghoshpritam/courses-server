import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import MyCourses, { MyCourse } from '../entity/MyCourses';

class MyCourseController {
  static writeValidation = [
    body('goals').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || value.id === undefined) {
          throw new Error('Goal id is required');
        }
        if (value.price === '' || value.rating === undefined) {
          throw new Error('Price id required');
        } else {
          if (value.price < 1) {
            throw new Error('Minimum rating is 0');
          }
        }
        if (value.transactionId === '' || value.transactionId === undefined) {
          throw new Error('Transaction id is required');
        }
      }

      // pass the validation
      return true;
    }),
    body('courses').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || value.id === undefined) {
          throw new Error('Courses id is required');
        }
        if (value.price === '' || value.rating === undefined) {
          throw new Error('Price id required');
        } else {
          if (value.price < 1) {
            throw new Error('Minimum rating is 0');
          }
        }
        if (value.transactionId === '' || value.transactionId === undefined) {
          throw new Error('Transaction id is required');
        }
      }

      // pass the validation
      return true;
    }),
    body('projects').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || value.id === undefined) {
          throw new Error('Project id is required');
        }
        if (value.price === '' || value.rating === undefined) {
          throw new Error('Price id required');
        } else {
          if (value.price < 1) {
            throw new Error('Minimum rating is 0');
          }
        }
        if (value.transactionId === '' || value.transactionId === undefined) {
          throw new Error('Transaction id is required');
        }
      }

      // pass the validation
      return true;
    }),
  ];

  public static get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.query;
    console.log('id', id);
    try {
      let query = {};
      if (id) {
        query = { ...query, _id: id };
      }

      const myCourse: MyCourse[] = await MyCourses.find(query)
        .populate({
          path: 'user',
          select: '-refreshToken -email',
        })
        .populate({
          path: 'goals',
          populate: {
            path: 'id',
          },
        })
        .populate({
          path: 'projects',
          populate: {
            path: 'id',
          },
        })
        .populate({
          path: 'courses',
          populate: {
            path: 'id',
          },
        })
        .exec();

      res.status(200).json({ courses: myCourse });
    } catch (err) {
      next(err);
    }
  };

  public static add = {
    validate: [...MyCourseController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { goal, project, course } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const myCourse: MyCourse = await MyCourses.findOne({ user: res.locals.id }).exec();
        if (!myCourse) {
          // create new one
          let goals = [];
          if (goal) {
            goals = [
              {
                id: goal.id,
                date: new Date(),
                price: goal.price,
                transactionId: goal.transactionId,
                reference: goal.reference,
              },
            ];
          }

          let projects = [];
          if (project) {
            projects = [
              {
                id: project.id,
                date: new Date(),
                price: project.price,
                transactionId: project.transactionId,
                reference: project.reference,
              },
            ];
          }

          let courses = [];
          if (course) {
            courses = [
              {
                id: course.id,
                date: new Date(),
                price: course.price,
                transactionId: course.transactionId,
                reference: course.reference,
              },
            ];
          }

          const newMyCourse: MyCourse = new MyCourses({
            user: res.locals.id,
            goals,
            projects,
            courses,
          });

          await newMyCourse.save();
        } else {
          // update or add new one
          let goals = [...myCourse.goals];
          if (goal) {
            goals = [
              ...goals,
              {
                id: goal.id,
                date: new Date(),
                price: goal.price,
                transactionId: goal.transactionId,
                reference: goal.reference,
              },
            ];
          }

          let projects = [...myCourse.projects];
          if (project) {
            projects = [
              ...projects,
              {
                id: project.id,
                date: new Date(),
                price: project.price,
                transactionId: project.transactionId,
                reference: project.reference,
              },
            ];
          }

          let courses = [...myCourse.courses];
          if (course) {
            courses = [
              ...courses,
              {
                id: course.id,
                date: new Date(),
                price: course.price,
                transactionId: course.transactionId,
                reference: course.reference,
              },
            ];
          }
          await MyCourses.update(
            { _id: myCourse._id },
            {
              user: res.locals.id,
              goals,
              projects,
              courses,
            }
          ).exec();
        }

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };
}

export default MyCourseController;
