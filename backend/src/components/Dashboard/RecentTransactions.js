import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';

const RecentTransactions = ({ transactions = [] }) => {
  // Mock data - in real app, this would come from props
  const mockTransactions = [
    {
      _id: '1',
      description: 'Grocery Store',
      amount: 85.75,
      type: 'expense',
      category: 'Food & Dining',
      date: '2024-01-15'
    },
    {
      _id: '2',
      description: 'Salary Deposit',
      amount: 2500.00,
      type: 'income',
      category: 'Income',
      date: '2024-01-14'
    },
    {
      _id: '3',
      description: 'Netflix Subscription',
      amount: 15.99,
      type: 'expense',
      category: 'Entertainment',
      date: '2024-01-13'
    },
    {
      _id: '4',
      description: 'Gas Station',
      amount: 45.50,
      type: 'expense',
      category: 'Transport',
      date: '2024-01-12'
    },
    {
      _id: '5',
      description: 'Freelance Work',
      amount: 500.00,
      type: 'income',
      category: 'Income',
      date: '2024-01-10'
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatAmount = (amount, type) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(type === 'income' ? amount : -amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Recent Transactions</h3>
        <button className="text-accent-primary hover:text-blue-400 text-sm font-medium transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {displayTransactions.map((transaction, index) => (
          <motion.div
            key={transaction._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-primary-light transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                transaction.type === 'income' 
                  ? 'bg-accent-success/20 text-accent-success' 
                  : 'bg-accent-error/20 text-accent-error'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium text-sm truncate">
                  {transaction.description}
                </p>
                <p className="text-text-muted text-xs">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${
                transaction.type === 'income' 
                  ? 'text-accent-success' 
                  : 'text-accent-error'
              }`}>
                {formatAmount(transaction.amount, transaction.type)}
              </span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-text-muted hover:text-text-primary">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {displayTransactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-text-muted">No transactions found.</p>
          <button className="mt-2 text-accent-primary hover:text-blue-400 text-sm font-medium">
            Add your first transaction
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecentTransactions;