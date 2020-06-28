import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Exams, { Exam } from '../entity/Exams';

class ExamController {
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

      const exams: Exam[] = await Exams.find(query)
        .populate({
          path: 'creator',
          select: '-refreshToken -email',
        })
        .exec();

      res.status(200).json({ exams });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...ExamController.writeValidation],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { name, description, uri, time, marks }: Exam = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const exam: Exam = new Exams({
          name,
          description,
          uri,
          time,
          marks,
          creator: res.locals.id,
        });

        await exam.save();

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [
      ...ExamController.writeValidation,
      body('id').not().isEmpty().withMessage('ID is required'),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { id, name, description, uri, time, marks }: Exam = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const exam: Exam = await Exams.findOne({ _id: id }).exec();
        if (exam === null) {
          const error = {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Invalid ID' }],
          };

          next(error);
          return;
        }

        if (exam.creator.toString() !== res.locals.id) {
          console.log('oops!');

          res.status(401).end();
          return;
        }

        await Exams.update(
          { _id: id },
          {
            name,
            description,
            uri,
            time,
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
      const exam: Exam = await Exams.findOne({ _id: id }).exec();

      if (exam === null) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid ID' }],
        };

        next(error);
        return;
      }

      if (exam.creator.toString() !== res.locals.id) {
        res.status(401).send();
        return;
      }

      await Exams.deleteOne({ _id: id });

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default ExamController;
