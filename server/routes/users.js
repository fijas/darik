const express = require('express');
const router  = express.Router();

const auth_controller = require('../controllers/authController');

/* POST sign-up. */
router.post('/', auth_controller.sign_up);

module.exports = router;
