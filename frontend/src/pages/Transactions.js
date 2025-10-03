import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Download, Upload, Import } from 'lucide-react';
import { transactionsAPI } from '../api/transactions';
import TransactionForm from '../components/Transactions/TransactionForm';
import CSVImport from '../components/Import/CSVImport';
import ImportTemplates from '../components/Import/ImportTemplates';
import Toast from 'react-hot-toast';

const Transactions = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 10
  });

  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading, error } = useQuery(
    ['transactions', filters],
    () => transactionsAPI.getTransactions(filters),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(transactionsAPI.deleteTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries('transactions');
      Toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      Toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  });

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleImportComplete = () => {
    setIsImportOpen(false);
    queryClient.invalidateQueries('transactions');
    queryClient.invalidateQueries('dashboardStats');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const transactions = transactionsData?.data?.transactions || [];
  const pagination = transactionsData?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transactions</h1>
          <p className="text-text-muted mt-1">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Import className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Import Section */}
      {isImportOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <CSVImport onComplete={handleImportComplete} />
          <ImportTemplates />
        </motion.div>
      )}

      {/* Main Content */}
      {!isImportOpen && (
        <>
          {/* Filters */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input-primary"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-primary"
                  placeholder="Filter by category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="input-primary pl-10"
                    placeholder="Search transactions..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-accent-error">Error loading transactions</p>
                <button 
                  onClick={() => queryClient.refetchQueries('transactions')}
                  className="btn-secondary mt-2"
                >
                  Retry
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted">No transactions found.</p>
                <div className="flex justify-center space-x-3 mt-4">
                  <button 
                    onClick={() => setIsFormOpen(true)}
                    className="btn-primary"
                  >
                    Add Your First Transaction
                  </button>
                  <button 
                    onClick={() => setIsImportOpen(true)}
                    className="btn-secondary"
                  >
                    Import from CSV
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-color">
                        <th className="text-left py-3 px-4 text-text-primary font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-text-primary font-medium">Description</th>
                        <th className="text-left py-3 px-4 text-text-primary font-medium">Category</th>
                        <th className="text-left py-3 px-4 text-text-primary font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-text-primary font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-text-primary font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border-color hover:bg-primary-light transition-colors"
                        >
                          <td className="py-3 px-4 text-text-primary">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            <div>
                              <p className="font-medium">{transaction.description || 'No description'}</p>
                              {transaction.merchant && (
                                <p className="text-xs text-text-muted">{transaction.merchant}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-primary/20 text-accent-primary">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.type === 'income'
                                  ? 'bg-accent-success/20 text-accent-success'
                                  : 'bg-accent-error/20 text-accent-error'
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            <span
                              className={
                                transaction.type === 'income'
                                  ? 'text-accent-success font-medium'
                                  : 'text-accent-error font-medium'
                              }
                            >
                              {transaction.type === 'income' ? '+' : '-'}$
                              {transaction.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(transaction)}
                                className="text-accent-primary hover:text-blue-400 transition-colors p-1"
                                title="Edit transaction"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(transaction._id)}
                                className="text-accent-error hover:text-red-400 transition-colors p-1"
                                title="Delete transaction"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6 px-4 py-3 border-t border-border-color">
                    <div className="text-sm text-text-muted">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Transaction Form Modal */}
      {isFormOpen && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries('transactions');
            queryClient.invalidateQueries('dashboardStats');
          }}
        />
      )}
    </div>
  );
};

export default Transactions;