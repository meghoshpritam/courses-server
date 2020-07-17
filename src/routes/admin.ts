import { Router } from 'express';
import NodeController from '../controllers/NodeController';
import CourseController from '../controllers/CourseController';
import AssignmentController from '../controllers/AssignmentController';
import ExamController from '../controllers/ExamController';
import ProjectController from '../controllers/ProjectController';
import GoalController from '../controllers/GoalController';
import AdminPageController from '../controllers/pageController/adminPageController';

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

/************************************ Assignments ******************************************/
// get all assignments
routes.get('/assignments', AssignmentController.get);

// add a assignment
routes.post(
  '/assignments',
  AssignmentController.post.validate,
  AssignmentController.post.controller
);

// update a assignment
routes.put(
  '/assignments',
  AssignmentController.update.validate,
  AssignmentController.update.controller
);

// delete a assignment
routes.delete('/assignments', AssignmentController.delete);

/************************************ Exams ******************************************/
// get all exams
routes.get('/exams', ExamController.get);

// add a exam
routes.post('/exams', AssignmentController.post.validate, ExamController.post.controller);

// update a exam
routes.put('/exams', ExamController.update.validate, ExamController.update.controller);

// delete a exam
routes.delete('/exams', ExamController.delete);

/************************************ Projects ******************************************/
// get all projects
routes.get('/projects', ProjectController.get);

// add a project
routes.post('/projects', ProjectController.post.validate, ProjectController.post.controller);

// update a project
routes.put('/projects', ProjectController.update.validate, ProjectController.update.controller);

// delete a project
routes.delete('/projects', ProjectController.delete);

/************************************ Goals ******************************************/
// get all goals
routes.get('/goals', GoalController.get);

// add a goal
routes.post('/goals', GoalController.post.validate, GoalController.post.controller);

// update a goal
routes.put('/goals', GoalController.update.validate, GoalController.update.controller);

// delete a goal
routes.delete('/goals', GoalController.delete);

/************************************ Page routes ******************************************/
// get all nodes, courses, goals, projects
routes.get('/get-all', AdminPageController.getAll);
export default routes;
