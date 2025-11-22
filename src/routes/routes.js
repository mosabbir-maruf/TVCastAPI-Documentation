import { Hono } from 'hono';
import documentationController from '../controllers/documentation.controller.js';
import handler from '../utils/handler.js';

// controllers
import homepageController from '../controllers/homepage.controller.js';
import detailpageController from '../controllers/detailpage.controller.js';
import listpageController from '../controllers/listpage.controller.js';
import searchController from '../controllers/search.controller.js';
import serversController from '../controllers/serversController.js';
import streamController from '../controllers/streamController.js';

const router = new Hono();

router.get('/', handler(documentationController));
router.get('/home', handler(homepageController));
router.get('/channel/:id', handler(detailpageController));
router.get('/channels/:query', handler(listpageController));
router.get('/categories/:query', handler(listpageController));
router.get('/search', handler(searchController));
router.get('/stream', handler(streamController));
router.get('/servers', handler(serversController));

export default router;
