import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { transactionsAPI } from '../../api/transactions';
import Toast from 'react-hot-toast';

const TransactionForm = ({ transaction, onClose, onSuccess }) => {
  const isEditing = !!transaction;
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: transaction ? {
      ...transaction,
      date: new Date(transaction.date).toISOString().split('T')[0]
    } : {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      description: '',
      merchant: ''
    }
  });

  const transactionType = watch('type', 'expense');

  const mutation = useMutation(
    isEditing 
      ? (data) => transactionsAPI.updateTransaction(transaction._id, data)
      : transactionsAPI.createTransaction,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('transactions');
        queryClient.invalidateQueries('dashboardStats');
        Toast.success(
          isEditing 
            ? 'Transaction updated successfully' 
            : 'Transaction created successfully'
        );
        onSuccess();
      },
      onError: (error) => {
        Toast.error(error.response?.data?.message || 'Something went wrong');
      }
    }
  );

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const categories = {
    expense: [
      'Food & Dining',
      'Shopping',
      'Transportation',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Travel',
      'Education',
      'Personal Care',
      'Other'
    ],
    income: [
      'Salary',
      'Freelance',
      'Investments',
      'Business',
      'Gifts',
      'Rental Income',
      'Other Income'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary-medium rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-border-color sticky top-0 bg-primary-medium">
          <h2 className="text-xl font-bold text-text-primary">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Type
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="input-primary"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-accent-error">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                className="input-primary"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-accent-error">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="input-primary"
            >
              <option value="">Select a category</option>
              {categories[transactionType].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-accent-error">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="input-primary"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-accent-error">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <input
              type="text"
              {...register('description')}
              className="input-primary"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Merchant
            </label>
            <input
              type="text"
              {...register('merchant')}
              className="input-primary"
              placeholder="Optional merchant name"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={mutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {mutation.isLoading && <div className="loading-spinner"></div>}
              <span>
                {mutation.isLoading
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update' : 'Create')
                }
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TransactionForm;