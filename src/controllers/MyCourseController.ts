import { find } from 'lodash';
import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import MyCourses, { MyCourse } from '../entity/MyCourses';

interface ObjType {
  id: string;
  price: number;
  transactionId: string;
  reference?: string;
  orderId: string;
}

class MyCourseController {
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
    goal?: ObjType;
    project?: ObjType;
    course?: ObjType;
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

        if (goal && find(myCourse.goals, (obj) => obj.id.toString() === goal.id)) {
          throw {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Goal is already enrolled' }],
          };
        }
        if (course && find(myCourse.courses, (obj) => obj.id.toString() === course.id)) {
          throw {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Course is already enrolled' }],
          };
        }
        if (project && find(myCourse.projects, (obj) => obj.id.toString() === project.id)) {
          throw {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Project is already enrolled' }],
          };
        }

        if (goal) {
          await MyCourses.updateOne(
            { user: user },
            {
              $set: {
                'goals.$.id': goal.id,
                'goals.$.price': goal.price,
                'goals.$.transactionId': goal.transactionId,
                'goals.$.orderId': goal.orderId,
                'goals.$.reference': goal.reference,
              },
            }
          ).exec();
        }
        if (course) {
          await MyCourses.updateOne(
            { user: user },
            {
              $set: {
                'courses.$.id': course.id,
                'courses.$.price': course.price,
                'courses.$.transactionId': course.transactionId,
                'courses.$.orderId': course.orderId,
                'courses.$.reference': course.reference,
              },
            }
          ).exec();
        }
        if (project) {
          await MyCourses.updateOne(
            { user: user },
            {
              $set: {
                'projects.$.id': project.id,
                'projects.$.price': project.price,
                'projects.$.transactionId': project.transactionId,
                'projects.$.orderId': project.orderId,
                'projects.$.reference': project.reference,
              },
            }
          ).exec();
        }
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
