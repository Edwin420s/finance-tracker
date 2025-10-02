const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: {
        goals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        goal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.userId = req.user.id;

    const goal = await Goal.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        goal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        goal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
exports.updateGoalProgress = async (req, res, next) => {
  try {
    const { amount } = req.body;

    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    goal.currentAmount = amount;

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    } else if (goal.currentAmount < goal.targetAmount && goal.isCompleted) {
      goal.isCompleted = false;
      goal.completedAt = undefined;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      data: {
        goal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
exports.addContribution = async (req, res, next) => {
  try {
    const { amount, description } = req.body;

    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Create contribution record
    const contribution = {
      date: new Date(),
      amount,
      description: description || 'Manual contribution'
    };

    goal.currentAmount += amount;
    goal.contributions.push(contribution);

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    await goal.save();

    res.status(200).json({
      success: true,
      data: {
        goal,
        contribution
      }
    });
  } catch (error) {
    next(error);
  }
};