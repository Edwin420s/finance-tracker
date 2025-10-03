const express = require('express');
const {
  getReports,
  exportReports
} = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getReports);

router.route('/export')
  .post(exportReports);

module.exports = router;