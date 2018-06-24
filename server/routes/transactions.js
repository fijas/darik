const express = require('express');
const router  = express.Router();

const transaction_controller = require('../controllers/transactionController');

/* POST new category. */
router.post('/', transaction_controller.create);

/* GET all category. */
router.get('/', transaction_controller.list);

/* GET a single category. */
router.get('/:id', transaction_controller.view);

/* GET a single category. */
router.patch('/:id', transaction_controller.update);

/* GET a single category. */
router.delete('/:id', transaction_controller.delete);

module.exports = router;
