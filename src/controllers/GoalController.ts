import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Goals, { Goal } from '../entity/Goals';

class GoalController {
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
      .not()
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

      const goals: Goal[] = await Goals.find(query)
        .populate({
          path: 'nodes',
          populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        })
        // .populate({
        //   path: 'exams',
        //   populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        // })
        // .populate({
        //   path: 'projects',
        //   populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        // })
        // .populate({
        //   path: 'assignments',
        //   populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        // })
        .populate({
          path: 'creator',
          select: '-refreshToken -email',
        })
        .exec();
      // TODO: test and fix populate
      res.status(200).json({ courses: goals });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...GoalController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {
        name,
        description,
        img,
        video,
        courses,
        exams,
        projects,
        assignments,
        weWillCover,
        requirements,
        courseFor,
        resources,
        price,
      }: Goal = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const goals: Goal = new Goals({
          name,
          description,
          img,
          video,
          courses,
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

        await goals.save();

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [
      ...GoalController.writeValidation,
      body('id').not().isEmpty().withMessage('ID is required'),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {
        id,
        name,
        description,
        img,
        video,
        courses,
        exams,
        projects,
        assignments,
        weWillCover,
        requirements,
        courseFor,
        resources,
        price,
      }: Goal = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const goal: Goal = await Goals.findOne({ _id: id }).exec();
        if (goal === null) {
          const error = {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Invalid ID' }],
          };

          next(error);
          return;
        }

        if (goal.creator.toString() !== res.locals.id) {
          console.log('oops!');

          res.status(401).end();
          return;
        }

        await Goals.update(
          { _id: id },
          {
            name,
            description,
            img,
            video,
            courses,
            exams,
            projects,
            assignments,
            weWillCover,
            requirements,
            courseFor,
            resources,
            price,
            updated: new Date(),
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
      const goal: Goal = await Goals.findOne({ _id: id }).exec();

      if (goal === null) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid ID' }],
        };

        next(error);
        return;
      }

      if (goal.creator.toString() !== res.locals.id) {
        res.status(401).send();
        return;
      }

      await Goals.deleteOne({ _id: id });

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default GoalController;
