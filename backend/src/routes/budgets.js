const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.route('/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;