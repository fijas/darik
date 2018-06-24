const express = require('express');
const router  = express.Router();

const subcategory_controller = require('../controllers/subcategoryController');

/* POST new subcategory. */
router.post('/', subcategory_controller.create);

/* GET all subcategory. */
router.get('/', subcategory_controller.list);

/* GET a single subcategory. */
router.get('/:id', subcategory_controller.view);

/* GET a single subcategory. */
router.patch('/:id', subcategory_controller.update);

/* GET a single subcategory. */
router.delete('/:id', subcategory_controller.delete);

module.exports = router;
