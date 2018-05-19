const express = require('express');
const router  = express.Router();

const institution_controller = require('../controllers/institutionController');

/* POST new institution. */
router.post('/', institution_controller.create);

/* GET all institutions. */
router.get('/', institution_controller.list);

/* GET a single institution. */
router.get('/<id>', institution_controller.view);

module.exports = router;
