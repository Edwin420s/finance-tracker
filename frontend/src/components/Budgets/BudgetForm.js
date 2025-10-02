import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { budgetsAPI } from '../../api/budgets';
import Toast from 'react-hot-toast';

const BudgetForm = ({ budget, onClose, onSuccess }) => {
  const isEditing = !!budget;
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: budget ? {
      ...budget,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0]
    } : {
      name: '',
      category: '',
      amount: '',
      period: 'monthly',
      rollover: false,
      alerts: {
        enabled: true,
        thresholds: [70, 90, 100]
      }
    }
  });

  const period = watch('period', 'monthly');

  const mutation = useMutation(
    isEditing 
      ? (data) => budgetsAPI.updateBudget(budget._id, data)
      : budgetsAPI.createBudget,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgets');
        queryClient.invalidateQueries('budgetAlerts');
        Toast.success(
          isEditing 
            ? 'Budget updated successfully' 
            : 'Budget created successfully'
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

  const categories = [
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
  ];

  const getPeriodDates = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const handlePeriodChange = (newPeriod) => {
    const dates = getPeriodDates(newPeriod);
    // In a real app, we would update the form values here
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
            {isEditing ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Budget Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Budget name is required' })}
              className="input-primary"
              placeholder="e.g., Monthly Groceries"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-accent-error">{errors.name.message}</p>
            )}
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
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-accent-error">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Budget Amount
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Period
            </label>
            <select
              {...register('period', { required: 'Period is required' })}
              className="input-primary"
              onChange={(e) => handlePeriodChange(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="input-primary pl-10"
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-accent-error">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  className="input-primary pl-10"
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-accent-error">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('rollover')}
                className="w-4 h-4 text-accent-primary bg-primary-light border-border-color rounded focus:ring-accent-primary focus:ring-2"
              />
              <label className="ml-2 text-sm text-text-muted">
                Allow rollover of unused amount
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('alerts.enabled')}
                className="w-4 h-4 text-accent-primary bg-primary-light border-border-color rounded focus:ring-accent-primary focus:ring-2"
              />
              <label className="ml-2 text-sm text-text-muted">
                Enable budget alerts
              </label>
            </div>
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
                  : (isEditing ? 'Update Budget' : 'Create Budget')
                }
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BudgetForm;