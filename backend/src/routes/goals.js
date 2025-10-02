const express = require('express');
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  addContribution
} = require('../controllers/goalController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .get(getGoal)
  .put(updateGoal)
  .delete(deleteGoal);

router.route('/:id/progress')
  .put(updateGoalProgress);

router.route('/:id/contribute')
  .post(addContribution);

module.exports = router;