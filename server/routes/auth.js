const express = require('express');
const router  = express.Router();

const auth_controller = require('../controllers/authController');

/* POST login. */
router.post('/login', auth_controller.log_in);

/* POST sign-up. */
router.post('/logout', auth_controller.log_out);

module.exports = router;
