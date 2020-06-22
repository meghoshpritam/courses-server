import { body, validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';
import Nodes, { Node } from '../entity/Nodes';

class NodeController {
  public static get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.params;

    try {
      const nodes: Node[] = await Nodes.find({}).populate('user').populate('assignments').exec();

      res.status(200).json({ nodes });
    } catch (err) {
      next(err);
    }
  };

  public static post = {
    validate: [
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
      body('markdown').custom((val, { req }) => {
        if (
          (val === undefined || val === '') &&
          (req.body.video === undefined || req.body.video === '') &&
          req.body.resources === undefined &&
          (req.body.exam === undefined || req.body.exam === '') &&
          (req.body.quiz === undefined || req.body.quiz === '') &&
          (req.body.assignment === '' || req.body.assignment === undefined)
        ) {
          throw new Error('A Markdown file is needed');
        }

        // pass the validation
        return true;
      }),
    ],
    controller: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {
        name,
        description,
        img,
        video,
        markdown,
        resources,
        quiz,
        exam,
        updated,
        assignment,
      }: Node = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next({ __src__: 'express-validator', errors });
        return;
      }

      try {
        const node: Node = new Nodes({
          name,
          description,
          img,
          video,
          markdown,
          resources,
          quiz,
          exam,
          updated,
          creator: res.locals.id,
          assignment,
        });

        node.save();

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    },
  };

  public static update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.body;

    try {
      res.status(202).json();
    } catch (err) {
      next(err);
    }
  };

  public static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {} = req.body;

    try {
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}

export default NodeController;
