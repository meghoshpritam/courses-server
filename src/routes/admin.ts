import { Router } from 'express';
import NodeController from '../controllers/NodeController';
import CourseController from '../controllers/CourseController';

const routes: Router = Router();

/************************************ Nodes ******************************************/

// get all nodes
routes.get('/nodes', NodeController.get);

// add a node
routes.post('/nodes', NodeController.post.validate, NodeController.post.controller);

// update a node
routes.put('/nodes', NodeController.update.validate, NodeController.update.controller);

// delete a node
routes.delete('/nodes', NodeController.delete);

/************************************ Courses ******************************************/
// get all courses
routes.get('/courses', CourseController.get);

// add a course
routes.post('/courses', CourseController.post.validate, CourseController.post.controller);

// update a course
routes.put('/courses', CourseController.update.validate, CourseController.update.controller);

// delete a course
routes.delete('/courses', CourseController.delete);

export default routes;
