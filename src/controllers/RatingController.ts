import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Ratings, { Rating } from '../entity/Rating';

class RatingController {
  static writeValidation = [
    body('goals').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || value.id === undefined) {
          throw new Error('Goal id is required');
        }
        if (value.rating === '' || value.rating === undefined) {
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
    body('projects').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || value.id === undefined) {
          throw new Error('Project id is required');
        }
        if (value.rating === '' || value.rating === undefined) {
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
    body('courses').custom((value) => {
      if (value !== undefined) {
        if (value.id === '' || value.id === undefined) {
          throw new Error('Courses id is required');
        }
        if (value.rating === '' || value.rating === undefined) {
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

      res.status(200).json({ courses: rating });
    } catch (err) {
      next(err);
    }
  };

  public static postPut = {
    validate: [...RatingController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { user, goal, project, course } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const rating: Rating = await Ratings.findOne({ user: res.locals.id }).exec();
        if (!rating) {
          // create new one
          let goals = [];
          if (goal) {
            goals = [{ id: goal.id, rating: goal.rating, comment: goal.raring, date: new Date() }];
          }

          let projects = [];
          if (project) {
            projects = [
              { id: project.id, rating: project.rating, comment: project.raring, date: new Date() },
            ];
          }

          let courses = [];
          if (course) {
            courses = [
              { id: course.id, rating: course.rating, comment: course.raring, date: new Date() },
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
              if (g.id !== goal.id) {
                goals = [...goals, g];
              } else {
                alreadyPresent = true;
                goals = [
                  ...goals,
                  {
                    id: goal.id,
                    rating: goal.rating,
                    comment: goal.raring,
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
                  comment: goal.raring,
                  date: new Date(),
                },
              ];
            }
          }

          let projects = [];
          alreadyPresent = false;
          if (project) {
            rating.projects.forEach((p) => {
              if (p.id !== project.id) {
                projects = [...projects, p];
              } else {
                alreadyPresent = true;
                projects = [
                  ...projects,
                  {
                    id: project.id,
                    rating: project.rating,
                    comment: project.raring,
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
                  comment: project.raring,
                  date: new Date(),
                },
              ];
            }
          }

          let courses = [];
          alreadyPresent = false;
          if (course) {
            rating.courses.forEach((c) => {
              if (c.id !== course.id) {
                courses = [...courses, c];
              } else {
                alreadyPresent = true;
                courses = [
                  ...courses,
                  {
                    id: course.id,
                    rating: course.rating,
                    comment: course.raring,
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
                  comment: course.raring,
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

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { goalId, projectId, courseId } = req.query;

    try {
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
          if (goal.id !== goalId) {
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
          if (project.id !== projectId) {
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
          if (course.id !== courseId) {
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
