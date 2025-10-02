const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
} = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/stats/summary')
  .get(getTransactionStats);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;