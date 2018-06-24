const express = require('express');
const router  = express.Router();

const category_controller = require('../controllers/categoryController');

/* POST new category. */
router.post('/', category_controller.create);

/* GET all category. */
router.get('/', category_controller.list);

/* GET a single category. */
router.get('/:id', category_controller.view);

/* GET a single category. */
router.patch('/:id', category_controller.update);

/* GET a single category. */
router.delete('/:id', category_controller.delete);

module.exports = router;
