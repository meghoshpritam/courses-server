import Assignments, { Assignment } from './../entity/Assignments';
import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';

class AssignmentController {
  static writeValidation = [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('uri').not().isEmpty().withMessage('URI is required'),
  ];

  public static get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.query;
    console.log('id', id);
    try {
      let query = {};
      if (id) {
        query = { ...query, _id: id };
      }

      const courses: Assignment[] = await Assignments.find(query)
        .populate({
          path: 'creator',
          select: '-refreshToken -email',
        })
        .exec();

      res.status(200).json({ courses });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...AssignmentController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { name, description, uri, deadline, marks }: Assignment = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const assignment: Assignment = new Assignments({
          name,
          description,
          uri,
          deadline,
          marks,
          creator: res.locals.id,
        });

        await assignment.save();

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [
      ...AssignmentController.writeValidation,
      body('id').not().isEmpty().withMessage('ID is required'),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, name, description, uri, deadline, marks }: Assignment = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const assignment: Assignment = await Assignments.findOne({ _id: id }).exec();
        if (assignment === null) {
          const error = {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Invalid ID' }],
          };

          next(error);
          return;
        }

        if (assignment.creator.toString() !== res.locals.id) {
          console.log('oops!');

          res.status(401).end();
          return;
        }

        await Assignments.update(
          { _id: id },
          {
            name,
            description,
            uri,
            deadline,
            marks,
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
      const assignment: Assignment = await Assignments.findOne({ _id: id }).exec();

      if (assignment === null) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid ID' }],
        };

        next(error);
        return;
      }

      if (assignment.creator.toString() !== res.locals.id) {
        res.status(401).send();
        return;
      }

      await Assignments.deleteOne({ _id: id });

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default AssignmentController;
