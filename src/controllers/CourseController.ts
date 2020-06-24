import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Courses, { Course } from '../entity/Courses';

class CourseController {
  static writeValidation = [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('img').custom((val, { req }) => {
      if (
        (val === '' || val === undefined) &&
        (req.body.video === '' || req.body.video === undefined)
      ) {
        throw new Error('An image is required');
      }

      // pass the validation
      return true;
    }),
    body('nodes').custom((val) => {
      if (val !== undefined) {
        if (val?.id !== '' && typeof val.name !== 'string') {
          throw new Error('Name of the resource is required');
        }
        if (val?.chapter !== '' && typeof val.uri !== 'string') {
          throw new Error('URI of the resource is required');
        }
      }

      // pass the validation
      return true;
    }),
    body('exams').custom((val) => {
      if (val !== undefined) {
        if (val?.id !== '' && typeof val.name !== 'string') {
          throw new Error('Name of the resource is required');
        }
        if (val?.chapter !== '' && typeof val.uri !== 'string') {
          throw new Error('URI of the resource is required');
        }
      }

      // pass the validation
      return true;
    }),
    body('projects').custom((val) => {
      if (val !== undefined) {
        if (val?.id !== '' && typeof val.name !== 'string') {
          throw new Error('Name of the resource is required');
        }
        if (val?.chapter !== '' && typeof val.uri !== 'string') {
          throw new Error('URI of the resource is required');
        }
      }

      // pass the validation
      return true;
    }),
    body('assignments').custom((val) => {
      if (val !== undefined) {
        if (val?.id !== '' && typeof val.name !== 'string') {
          throw new Error('Name of the resource is required');
        }
        if (val?.chapter !== '' && typeof val.uri !== 'string') {
          throw new Error('URI of the resource is required');
        }
      }

      // pass the validation
      return true;
    }),
    body('resources').custom((val) => {
      if (val !== undefined) {
        if (val?.name !== '' && typeof val.name !== 'string') {
          throw new Error('Name of the resource is required');
        }
        if (val?.uri !== '' && typeof val.uri !== 'string') {
          throw new Error('URI of the resource is required');
        }
      }

      // pass the validation
      return true;
    }),
    body('price')
      .isEmpty()
      .withMessage('Price is required')
      .toFloat()
      .bail()
      .custom((val) => {
        if (val < 0) {
          throw new Error("Price can't negative");
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

      const courses: Course[] = await Courses.find(query)
        .populate({
          path: 'nodes',
          populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        })
        // .populate({ path: 'exam' })
        // .populate({ path: 'assignment' })
        .exec();
      // TODO: test and fix populate
      res.status(200).json({ courses });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...CourseController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {
        name,
        description,
        img,
        video,
        nodes,
        exams,
        projects,
        assignments,
        weWillCover,
        requirements,
        courseFor,
        resources,
        price,
      }: Course = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const course: Course = new Courses({
          name,
          description,
          img,
          video,
          nodes,
          exams,
          projects,
          assignments,
          weWillCover,
          requirements,
          courseFor,
          resources,
          price,
          creator: res.locals.id,
        });

        course.save();

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [
      ...CourseController.writeValidation,
      body('id').not().isEmpty().withMessage('ID is required'),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {} = req.body;
      const {
        id,
        name,
        description,
        img,
        video,
        nodes,
        exams,
        projects,
        assignments,
        weWillCover,
        requirements,
        courseFor,
        resources,
        price,
      }: Course = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const course: Course = await (await Courses.findOne({ _id: id })).execPopulate();
        if (course === null) {
          const error = {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Invalid ID' }],
          };

          next(error);
          return;
        }

        if (course.creator.toString() !== res.locals.id) {
          console.log('oops!');

          res.status(401).end();
          return;
        }

        await Courses.update(
          { _id: id },
          {
            name,
            description,
            img,
            video,
            nodes,
            exams,
            projects,
            assignments,
            weWillCover,
            requirements,
            courseFor,
            resources,
            price,
          }
        ).exec();

        res.status(202).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.query;

    try {
      const course: Course = await (await Courses.findOne({ _id: id })).execPopulate();

      if (course === null) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid ID' }],
        };

        next(error);
        return;
      }

      if (course.creator.toString() !== res.locals.id) {
        res.status(401).send();
        return;
      }

      await Courses.deleteOne({ _id: id });

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default CourseController;
