const Category = require('../models/Category');

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let query = {
      $or: [
        { isSystem: true },
        { userId: req.user.id }
      ],
      isActive: true
    };

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ isSystem: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, color, icon, parentCategory } = req.body;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      userId: req.user.id,
      name,
      type
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      type,
      color: color || '#3b82f6',
      icon: icon || 'circle',
      userId: req.user.id,
      parentCategory: parentCategory || undefined
    });

    res.status(201).json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id // Only allow updating user's custom categories
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Prevent updating system categories
    if (category.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update system categories'
      });
    }

    category = await Category.findByIdAndUpdate(
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
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id // Only allow deleting user's custom categories
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Prevent deleting system categories
    if (category.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete system categories'
      });
    }

    // Check if category is being used in transactions
    const Transaction = require('../models/Transaction');
    const transactionCount = await Transaction.countDocuments({
      userId: req.user.id,
      category: category.name
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is being used in transactions'
      });
    }

    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Private
exports.getCategoryStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {
      userId: req.user.id,
      isExcluded: { $ne: true }
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const Transaction = require('../models/Transaction');
    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type'
          },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          types: {
            $push: {
              type: '$_id.type',
              totalAmount: '$totalAmount',
              transactionCount: '$transactionCount',
              averageAmount: '$averageAmount'
            }
          },
          totalTransactions: { $sum: '$transactionCount' }
        }
      },
      {
        $project: {
          category: '$_id',
          types: 1,
          totalTransactions: 1,
          _id: 0
        }
      },
      { $sort: { totalTransactions: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};