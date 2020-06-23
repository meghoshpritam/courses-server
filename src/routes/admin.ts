import { Router } from 'express';
import NodeController from '../controllers/NodeController';

const routes: Router = Router();

// get all nodes
routes.get('/nodes', NodeController.get);

// add a node
routes.post('/nodes', NodeController.post.validate, NodeController.post.controller);

// update a node
routes.put('/nodes', NodeController.update.validate, NodeController.update.controller);

// delete a node
routes.delete('/nodes', NodeController.delete);

export default routes;
