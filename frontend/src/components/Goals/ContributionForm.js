import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X, DollarSign } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { goalsAPI } from '../../api/goals';
import Toast from 'react-hot-toast';

const ContributionForm = ({ goal, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      amount: '',
      description: ''
    }
  });

  const mutation = useMutation(
    (data) => goalsAPI.addContribution(goal._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('goals');
        Toast.success('Contribution added successfully');
        onSuccess();
      },
      onError: (error) => {
        Toast.error(error.response?.data?.message || 'Failed to add contribution');
      }
    }
  );

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const amount = watch('amount');
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const suggestedAmounts = [
    remainingAmount * 0.1, // 10%
    remainingAmount * 0.25, // 25%
    remainingAmount * 0.5, // 50%
    remainingAmount // 100%
  ].filter(amount => amount > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary-medium rounded-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">
            Add Contribution
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Goal Info */}
          <div className="p-4 rounded-lg bg-primary-light">
            <h3 className="font-medium text-text-primary mb-2">{goal.title}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Progress:</span>
              <span className="text-text-primary">
                ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Remaining:</span>
              <span className="text-accent-success">
                ${remainingAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Contribution Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="number"
                step="0.01"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                  max: { 
                    value: remainingAmount, 
                    message: `Amount cannot exceed remaining goal amount ($${remainingAmount.toFixed(2)})` 
                  }
                })}
                className="input-primary pl-10"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-accent-error">{errors.amount.message}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          {suggestedAmounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Quick Amounts
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedAmounts.map((suggestedAmount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => document.querySelector('input[name="amount"]').value = suggestedAmount.toFixed(2)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    ${suggestedAmount.toFixed(0)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              {...register('description')}
              className="input-primary"
              placeholder="e.g., Monthly savings contribution"
            />
          </div>

          {/* Contribution Preview */}
          {amount && !errors.amount && (
            <div className="p-3 rounded-lg bg-accent-success/10 border border-accent-success/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">New Progress:</span>
                <span className="text-accent-success font-medium">
                  {(((goal.currentAmount + parseFloat(amount)) / goal.targetAmount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-text-muted">Remaining After:</span>
                <span className="text-text-primary">
                  ${(remainingAmount - parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

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
                {mutation.isLoading ? 'Adding...' : 'Add Contribution'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ContributionForm;