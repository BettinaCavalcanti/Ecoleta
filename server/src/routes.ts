import express from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const upload = multer(multerConfig);

const points = new PointsController();
const items = new ItemsController();

routes.get('/items', items.index);
routes.get('/points', points.index);
routes.post('/points', upload.single('image') ,points.create);
routes.post('/points/:id', points.show);


export default routes;