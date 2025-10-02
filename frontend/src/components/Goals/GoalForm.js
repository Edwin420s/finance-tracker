import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, Calendar, Target } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { goalsAPI } from '../../api/goals';
import Toast from 'react-hot-toast';

const GoalForm = ({ goal, onClose, onSuccess }) => {
  const isEditing = !!goal;
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: goal ? {
      ...goal,
      deadline: new Date(goal.deadline).toISOString().split('T')[0]
    } : {
      title: '',
      category: '',
      targetAmount: '',
      currentAmount: 0,
      deadline: '',
      color: '#3b82f6',
      icon: 'target'
    }
  });

  const mutation = useMutation(
    isEditing 
      ? (data) => goalsAPI.updateGoal(goal._id, data)
      : goalsAPI.createGoal,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('goals');
        Toast.success(
          isEditing 
            ? 'Goal updated successfully' 
            : 'Goal created successfully'
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
    'Emergency Fund',
    'Vacation',
    'Home Down Payment',
    'Car Purchase',
    'Education',
    'Retirement',
    'Debt Payment',
    'Investment',
    'Wedding',
    'Other'
  ];

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary-medium rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-border-color sticky top-0 bg-primary-medium">
          <h2 className="text-xl font-bold text-text-primary">
            {isEditing ? 'Edit Goal' : 'Create Goal'}
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
              Goal Title
            </label>
            <input
              type="text"
              {...register('title', { required: 'Goal title is required' })}
              className="input-primary"
              placeholder="e.g., Emergency Fund"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-accent-error">{errors.title.message}</p>
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
              Target Amount
            </label>
            <input
              type="number"
              step="0.01"
              {...register('targetAmount', {
                required: 'Target amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
              className="input-primary"
              placeholder="0.00"
            />
            {errors.targetAmount && (
              <p className="mt-1 text-sm text-accent-error">{errors.targetAmount.message}</p>
            )}
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Current Amount
              </label>
              <input
                type="number"
                step="0.01"
                {...register('currentAmount', {
                  min: { value: 0, message: 'Amount cannot be negative' }
                })}
                className="input-primary"
                placeholder="0.00"
              />
              {errors.currentAmount && (
                <p className="mt-1 text-sm text-accent-error">{errors.currentAmount.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Deadline
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="date"
                {...register('deadline', { required: 'Deadline is required' })}
                className="input-primary pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.deadline && (
              <p className="mt-1 text-sm text-accent-error">{errors.deadline.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {colors.map(color => (
                <label key={color} className="relative">
                  <input
                    type="radio"
                    {...register('color')}
                    value={color}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      watch('color') === color ? 'border-white ring-2 ring-accent-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  ></div>
                </label>
              ))}
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
                  : (isEditing ? 'Update Goal' : 'Create Goal')
                }
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default GoalForm;