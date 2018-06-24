const express = require('express');
const router  = express.Router();

const account_controller = require('../controllers/accountController');

/* POST new institution. */
router.post('/', account_controller.create);

/* GET all institutions. */
router.get('/', account_controller.list);

/* GET a single institution. */
router.get('/:id', account_controller.view);

/* GET a single institution. */
router.patch('/:id', account_controller.update);

/* GET a single institution. */
router.delete('/:id', account_controller.delete);

module.exports = router;
