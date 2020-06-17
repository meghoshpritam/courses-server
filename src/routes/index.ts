import { Router } from 'express';
import Public from './public';

const routes: Router = Router();

routes.use(Public);

export default routes;
