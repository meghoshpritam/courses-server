import { Router } from 'express';
import UserController from '../controllers/UserController';

const routes: Router = Router();

routes.get('/', UserController.get);
routes.post('/', UserController.signUp.validate, UserController.signUp.controller);
routes.post('/reg', UserController.register);

export default routes;
