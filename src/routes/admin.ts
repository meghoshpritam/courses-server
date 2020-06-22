import { Router } from 'express';
import NodeController from '../controllers/NodeController';

const routes: Router = Router();

routes.get('/nodes', NodeController.get);
routes.post('/nodes', NodeController.post.validate, NodeController.post.controller);

export default routes;
