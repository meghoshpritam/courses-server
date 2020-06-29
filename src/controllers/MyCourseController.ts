import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import MyCourses, { MyCourse } from '../entity/MyCourses';

interface objType {
  id: string;
  price: number;
  transactionId: string;
  reference?: string;
  orderId: string;
}

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

  public static add = async ({
    user,
    goal,
    project,
    course,
  }: {
    user: string;
    goal?: objType;
    project?: objType;
    course?: objType;
  }) => {
    console.log('...myCourses ', user, course, goal, project);
    try {
      const myCourse: MyCourse = await MyCourses.findOne({ user: user }).exec();
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
              orderId: goal.orderId,
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
              orderId: project.orderId,
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
              orderId: course.orderId,
            },
          ];
        }

        const newMyCourse: MyCourse = new MyCourses({
          user,
          goals,
          projects,
          courses,
        });

        await newMyCourse.save();
      } else {
        // update or add new one
        let goals = [...myCourse.goals];
        if (goal) {
          let add = true;
          goals.forEach((g) => {
            if (g.id.toString() === goal.id) {
              add = false;
            }
          });
          if (add) {
            goals = [
              ...goals,
              {
                id: goal.id,
                date: new Date(),
                price: goal.price,
                transactionId: goal.transactionId,
                reference: goal.reference,
                orderId: goal.orderId,
              },
            ];
          }
        }

        let projects = [...myCourse.projects];
        if (project) {
          let add = true;
          projects.forEach((p) => {
            if (p.id.toString() === goal.id) {
              add = false;
            }
          });
          if (add) {
            projects = [
              ...projects,
              {
                id: project.id,
                date: new Date(),
                price: project.price,
                transactionId: project.transactionId,
                reference: project.reference,
                orderId: project.orderId,
              },
            ];
          }
        }

        let courses = [...myCourse.courses];
        if (course) {
          let add = true;
          courses.forEach((c) => {
            if (c.id.toString() === goal.id) {
              add = false;
            }
          });
          if (add) {
            courses = [
              ...courses,
              {
                id: course.id,
                date: new Date(),
                price: course.price,
                transactionId: course.transactionId,
                reference: course.reference,
                orderId: course.orderId,
              },
            ];
          }
        }
        await MyCourses.update(
          { _id: myCourse._id },
          {
            user,
            goals,
            projects,
            courses,
          }
        ).exec();
      }
    } catch (err) {
      throw err;
    }
  };

  public static alreadyExist = async ({
    user,
    courseId,
    goalId,
    projectId,
  }: {
    user: string;
    courseId?: string;
    projectId?: string;
    goalId?: string;
  }): Promise<boolean> => {
    try {
      const myCourse: MyCourse = await MyCourses.findOne({ user });

      console.log('check available', user, courseId, goalId, projectId);

      if (!myCourse) {
        return false;
      }

      let exist = false;
      if (courseId) {
        myCourse.courses.forEach((course) => {
          if (course.id.toString() === courseId) {
            exist = true;
          }
        });

        if (exist) {
          return true;
        }
      } else if (goalId) {
        myCourse.goals.forEach((goal) => {
          if (goal.id.toString() === goalId) {
            exist = true;
          }
        });

        if (exist) {
          return true;
        }
      } else if (projectId) {
        myCourse.projects.forEach((project) => {
          if (project.id.toString() === projectId) {
            exist = true;
          }
        });
      }

      return exist;
    } catch (err) {
      throw err;
    }
  };
}

export default MyCourseController;
