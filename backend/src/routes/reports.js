const express = require('express');
const {
  getSummaryReport,
  exportTransactions
} = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/summary')
  .get(getSummaryReport);

router.route('/export')
  .get(exportTransactions);

module.exports = router;