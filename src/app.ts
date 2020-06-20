import * as express from 'express';
import * as helmet from 'helmet';
import * as cors from 'cors';
import routes from './routes';
import { Request, Response, NextFunction } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';

const bootstrap = async () => {
  config();

  try {
    await connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const app = express();

    app.use(cors());
    app.use(helmet());
    app.use(express.json());

    app.use('/', routes);

    app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
      console.log('errrorrrr: ', err);
      if (err.__src__ === 'express-validator') {
        console.log(err);
        res.status(422).json({ errors: err.errors.array() });
      } else if (err.__src__ === 'validator') {
        res.status(422).json({ errors: err.errors });
      } else {
        res.sendStatus(500);
      }
    });
    app.listen(4000, () => {
      console.log('Server started on port 4000!');
    });
  } catch (err) {
    console.log(err);
  }
};

bootstrap();
