import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Ratings, { Rating } from '../entity/Rating';
import MyCourses, { MyCourse } from '../entity/MyCourses';

class RatingController {
  static writeValidation = [
    body('goal').custom((value, { req }) => {
      if (value !== undefined) {
        if (value.id === '' || !value.id) {
          throw new Error('Goal id is required');
        }
        if (value.rating === '' || !value.rating) {
          throw new Error('Rating is required');
        } else {
          if (value.rating < 1) {
            throw new Error('Minimum rating is 1');
          }
          if (value.rating > 5) {
            throw new Error('Maximum rating is 5');
          }
        }
      }

      if (
        (!req.body.project || req.body.project === '') &&
        (!req.body.course || req.body.course === '')
      ) {
        throw new Error('Goal or project or course rating is required');
      }

      // pass the validation
      return true;
    }),
    body('project').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || !value.id) {
          throw new Error('Project id is required');
        }
        if (value.rating === '' || !value.rating) {
          throw new Error('Rating is required');
        } else {
          if (value.rating < 1) {
            throw new Error('Minimum rating is 1');
          }
          if (value.rating > 5) {
            throw new Error('Maximum rating is 5');
          }
        }
      }

      // pass the validation
      return true;
    }),
    body('course').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || !value.id) {
          throw new Error('Courses id is required');
        }
        if (value.rating === '' || !value.rating) {
          throw new Error('Rating is required');
        } else {
          if (value.rating < 1) {
            throw new Error('Minimum rating is 1');
          }
          if (value.rating > 5) {
            throw new Error('Maximum rating is 5');
          }
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

      const rating: Rating[] = await Ratings.find(query)
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

      res.status(200).json({ rating });
    } catch (err) {
      next(err);
    }
  };

  public static postPut = {
    validate: [...RatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { goal, project, course } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const myCourses: MyCourse = await MyCourses.findOne({ user: res.locals.id });

        if (!myCourses) {
          next({
            __src__: 'validator',
            errors: [{ param: 'user', msg: 'You are not enrolled to rating' }],
          });
          return;
        }

        if (goal) {
          let allow = false;
          myCourses.goals.forEach((g) => {
            if (g.id.toString() === goal.id) {
              allow = true;
            }
          });

          if (!allow) {
            next({
              __src__: 'validator',
              errors: [{ param: 'user', msg: 'You are not enrolled for the goal' }],
            });

            return;
          }
        }
        if (course) {
          let allow = false;
          myCourses.courses.forEach((c) => {
            if (c.id.toString() === course.id) {
              allow = true;
            }
          });

          if (!allow) {
            next({
              __src__: 'validator',
              errors: [{ param: 'user', msg: 'You are not enrolled for the course' }],
            });

            return;
          }
        }
        if (project) {
          let allow = false;
          myCourses.projects.forEach((p) => {
            if (p.id.toString() === project.id) {
              allow = true;
            }
          });

          if (!allow) {
            next({
              __src__: 'validator',
              errors: [{ param: 'user', msg: 'You are not enrolled for the project' }],
            });

            return;
          }
        }

        const rating: Rating = await Ratings.findOne({ user: res.locals.id }).exec();
        if (!rating) {
          // create new one
          let goals = [];
          if (goal) {
            goals = [{ id: goal.id, rating: goal.rating, comment: goal.comment, date: new Date() }];
          }

          let projects = [];
          if (project) {
            projects = [
              {
                id: project.id,
                rating: project.rating,
                comment: project.comment,
                date: new Date(),
              },
            ];
          }

          let courses = [];
          if (course) {
            courses = [
              { id: course.id, rating: course.rating, comment: course.comment, date: new Date() },
            ];
          }

          const newRating: Rating = new Ratings({
            user: res.locals.id,
            goals,
            projects,
            courses,
          });

          await newRating.save();
        } else {
          // update or add new one
          let goals = [];
          let alreadyPresent = false;
          if (goal) {
            rating.goals.forEach((g) => {
              if (g.id.toString() !== goal.id) {
                goals = [...goals, g];
              } else {
                alreadyPresent = true;
                goals = [
                  ...goals,
                  {
                    id: goal.id,
                    rating: goal.rating,
                    comment: goal.comment,
                    date: new Date(),
                  },
                ];
              }
            });
            if (!alreadyPresent) {
              goals = [
                ...goals,
                {
                  id: goal.id,
                  rating: goal.rating,
                  comment: goal.comment,
                  date: new Date(),
                },
              ];
            }
          }

          let projects = [];
          alreadyPresent = false;
          if (project) {
            rating.projects.forEach((p) => {
              if (p.id.toString() !== project.id) {
                projects = [...projects, p];
              } else {
                alreadyPresent = true;
                projects = [
                  ...projects,
                  {
                    id: project.id,
                    rating: project.rating,
                    comment: project.comment,
                    date: new Date(),
                  },
                ];
              }
            });
            if (!alreadyPresent) {
              projects = [
                ...projects,
                {
                  id: project.id,
                  rating: project.rating,
                  comment: project.comment,
                  date: new Date(),
                },
              ];
            }
          }

          let courses = [];
          alreadyPresent = false;
          if (course) {
            rating.courses.forEach((c) => {
              if (c.id.toString() !== course.id) {
                courses = [...courses, c];
              } else {
                alreadyPresent = true;
                courses = [
                  ...courses,
                  {
                    id: course.id,
                    rating: course.rating,
                    comment: course.comment,
                    date: new Date(),
                  },
                ];
              }
            });
            if (!alreadyPresent) {
              courses = [
                ...courses,
                {
                  id: course.id,
                  rating: course.rating,
                  comment: course.comment,
                  date: new Date(),
                },
              ];
            }
          }
          await Ratings.update(
            { _id: rating._id },
            {
              user: res.locals.id,
              goals,
              projects,
              courses,
            }
          ).exec();
        }

        res.status(202).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { goalId, projectId, courseId } = req.query;

    try {
      if (!goalId && !projectId && !courseId) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'projectId', msg: 'ProjectId or CourseId or GoalId is required' }],
        };

        next(error);
        return;
      }

      const rating: Rating = await Ratings.findOne({ user: res.locals.id }).exec();

      if (rating === null) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid ID' }],
        };

        next(error);
        return;
      }

      if (goalId) {
        let goals = [];
        rating.goals.forEach((goal) => {
          if (goal.id.toString() !== goalId) {
            goals = [...goals, goal];
          }
        });

        await Ratings.update(
          { _id: rating._id },
          { user: rating.user, goals, projects: rating.projects, courses: rating.courses }
        ).exec();
      }
      if (projectId) {
        let projects = [];
        rating.projects.forEach((project) => {
          if (project.id.toString() !== projectId) {
            projects = [...projects, project];
          }
        });

        await Ratings.update(
          { _id: rating._id },
          { user: rating.user, goals: rating.goals, projects, courses: rating.courses }
        ).exec();
      }
      if (courseId) {
        let courses = [];
        rating.courses.forEach((course) => {
          if (course.id.toString() !== courseId) {
            courses = [...courses, course];
          }
        });

        await Ratings.update(
          { _id: rating._id },
          { user: rating.user, goals: rating.goals, projects: rating.projects, courses }
        ).exec();
      }

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default RatingController;
