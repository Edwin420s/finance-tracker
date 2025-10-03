const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/stats')
  .get(getCategoryStats);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;