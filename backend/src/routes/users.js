const express = require('express');
const { updatePreferences } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/preferences')
  .put(updatePreferences);

module.exports = router;