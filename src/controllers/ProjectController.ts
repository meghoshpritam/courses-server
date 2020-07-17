import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Projects, { Project } from '../entity/Projects';

class ProjectController {
  static writeValidation = [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('img').custom((val, { req }) => {
      if ((val === '' || !val) && (req.body.video === '' || !req.body.video)) {
        throw new Error('An image is required');
      }

      // pass the validation
      return true;
    }),
    body('nodes').custom((vals) => {
      console.log('notes value: ', vals);
      if (vals !== undefined) {
        vals?.forEach((val: { id?: string; chapter?: string }) => {
          if (val?.id === '' || typeof val?.id !== 'string') {
            throw new Error('Invalid node id type');
          }
          if (val?.chapter === '' || typeof val?.chapter !== 'string') {
            throw new Error('Chapter name is required');
          }
        });
      }

      // pass the validation
      return true;
    }),
    body('exams').custom((vals) => {
      if (vals !== undefined) {
        vals?.forEach((val: { id?: string; chapter?: string }) => {
          if (val?.id === '' || typeof val?.id !== 'string') {
            throw new Error('Invalid exam id type');
          }
          if (val?.chapter === '' || typeof val?.chapter !== 'string') {
            throw new Error('Chapter exam is required');
          }
        });
      }

      // pass the validation
      return true;
    }),
    body('projects').custom((vals) => {
      if (vals !== undefined) {
        vals?.forEach((val: { name?: string; uri?: string; chapter?: string }) => {
          if (val?.name === '' || typeof val?.name !== 'string') {
            throw new Error('Invalid project id type');
          }
          if (val?.uri === '' || typeof val?.uri !== 'string') {
            throw new Error('Invalid project URI type');
          }
          if (val?.chapter === '' || typeof val?.chapter !== 'string') {
            throw new Error('Chapter project is required');
          }
        });
      }

      // pass the validation
      return true;
    }),
    body('assignments').custom((vals) => {
      if (vals !== undefined) {
        vals?.forEach((val: { id?: string; chapter?: string }) => {
          if (val?.id === '' || typeof val?.id !== 'string') {
            throw new Error('Invalid assignment id type');
          }
          if (val?.chapter === '' || typeof val?.chapter !== 'string') {
            throw new Error('Chapter assignment is required');
          }
        });
      }

      // pass the validation
      return true;
    }),
    body('resources').custom((vals) => {
      if (vals !== undefined) {
        vals?.forEach((val: { name?: string; uri?: string }) => {
          if (val?.name === '' || typeof val?.name !== 'string') {
            throw new Error('Invalid resource id type');
          }
          if (val?.uri === '' || typeof val?.uri !== 'string') {
            throw new Error('Resource URI is required');
          }
        });
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

      const projects: Project[] = await Projects.find(query)
        .populate({
          path: 'nodes',
          populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        })
        .populate({
          path: 'exams',
          populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        })
        .populate({
          path: 'assignments',
          populate: { path: 'id', populate: { path: 'creator', select: '-refreshToken -email' } },
        })
        .populate({
          path: 'creator',
          select: '-refreshToken -email',
        })
        .exec();
      // TODO: test and fix populate
      res.status(200).json({ projects });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [...ProjectController.writeValidation],
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
        projectFor,
        resources,
        price,
      }: Project = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }
      console.log('test creator id: ', res.locals);
      try {
        const project: Project = new Projects({
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
          projectFor,
          resources,
          price,
          creator: res.locals.id,
        });

        await project.save();

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = {
    validate: [
      ...ProjectController.writeValidation,
      body('id').not().isEmpty().withMessage('ID is required'),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        projectFor,
        resources,
        price,
      }: Project = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const project: Project = await Projects.findOne({ _id: id }).exec();
        if (project === null) {
          const error = {
            __src__: 'validator',
            errors: [{ param: 'id', msg: 'Invalid ID' }],
          };

          next(error);
          return;
        }

        if (project.creator.toString() !== res.locals.id) {
          console.log('oops!');

          res.status(401).end();
          return;
        }

        await Projects.update(
          { _id: id },
          {
            name,
            description,
            img,
            video,
            nodes: nodes || [],
            exams: exams || [],
            projects: projects || [],
            assignments: assignments || [],
            weWillCover: weWillCover || [],
            requirements: requirements || [],
            projectFor: projectFor || [],
            resources: resources || [],
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
      const project: Project = await Projects.findOne({ _id: id }).exec();

      if (project === null) {
        const error = {
          __src__: 'validator',
          errors: [{ param: 'id', msg: 'Invalid ID' }],
        };

        next(error);
        return;
      }

      if (project.creator.toString() !== res.locals.id) {
        res.status(401).send();
        return;
      }

      await Projects.deleteOne({ _id: id });

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default ProjectController;
