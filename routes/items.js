const express = require('express');
const router = express.Router();
const controller = require('../controllers/items.controller.js');

router.get('/items', controller.getItems);
router.get('/selected', controller.getSelected);
router.post('/select', controller.selectItem);
router.post('/deselect', controller.deselectItem);
router.post('/reorder', controller.reorderItems);
router.post('/add', controller.addItem);

module.exports = router;