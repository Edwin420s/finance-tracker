const express = require('express');
const {
  getInsights,
  getForecast
} = require('../controllers/insightController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getInsights);

router.route('/forecast')
  .get(getForecast);

module.exports = router;