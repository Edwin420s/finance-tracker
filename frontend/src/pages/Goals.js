import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Plus, Target, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { goalsAPI } from '../api/goals';
import GoalForm from '../components/Goals/GoalForm';
import ContributionForm from '../components/Goals/ContributionForm';
import Toast from 'react-hot-toast';

const Goals = () => {
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const queryClient = useQueryClient();

  const { data: goalsData, isLoading } = useQuery(
    'goals',
    goalsAPI.getGoals,
    { refetchOnWindowFocus: false }
  );

  const deleteMutation = useMutation(goalsAPI.deleteGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries('goals');
      Toast.success('Goal deleted successfully');
    },
    onError: (error) => {
      Toast.error(error.response?.data?.message || 'Failed to delete goal');
    }
  });

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setIsGoalFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddContribution = (goal) => {
    setSelectedGoal(goal);
    setIsContributionFormOpen(true);
  };

  const handleFormClose = () => {
    setIsGoalFormOpen(false);
    setIsContributionFormOpen(false);
    setSelectedGoal(null);
    setEditingGoal(null);
  };

  const goals = goalsData?.data?.goals || [];

  const getStatus = (goal) => {
    if (goal.isCompleted) return 'completed';
    if (goal.isOverdue()) return 'overdue';
    if (goal.daysRemaining < 7) return 'urgent';
    if (goal.daysRemaining < 30) return 'warning';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-accent-success';
      case 'overdue':
        return 'text-accent-error';
      case 'urgent':
        return 'text-accent-error';
      case 'warning':
        return 'text-accent-warning';
      default:
        return 'text-accent-success';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-accent-success';
    if (percentage >= 75) return 'bg-accent-warning';
    return 'bg-accent-primary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Goals</h1>
          <p className="text-text-muted mt-1">
            Set and track your financial goals
          </p>
        </div>
        <button
          onClick={() => setIsGoalFormOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Goals Yet
          </h3>
          <p className="text-text-muted mb-6">
            Create your first financial goal to start tracking your progress.
          </p>
          <button
            onClick={() => setIsGoalFormOpen(true)}
            className="btn-primary"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const status = getStatus(goal);
            const progress = goal.progress || 0;
            
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                {/* Goal Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: goal.color || '#3b82f6' }}
                    ></div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {goal.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    {goal.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-accent-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-accent-warning" />
                    )}
                  </div>
                </div>

                {/* Goal Progress */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted text-sm">Progress</span>
                    <span className="text-text-primary font-medium">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-sm">
                        {progress.toFixed(1)}% Complete
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                        {status === 'completed' && 'Completed'}
                        {status === 'overdue' && 'Overdue'}
                        {status === 'urgent' && 'Due Soon'}
                        {status === 'warning' && 'Active'}
                        {status === 'active' && 'Active'}
                      </span>
                    </div>
                    <div className="w-full bg-primary-light rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(progress)}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Goal Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Category</span>
                    <span className="text-text-primary">{goal.category}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-muted">Deadline</span>
                    <span className="text-text-primary">{formatDate(goal.deadline)}</span>
                  </div>
                  
                  {!goal.isCompleted && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Days Left</span>
                      <span className={`font-medium ${goal.daysRemaining < 0 ? 'text-accent-error' : 'text-text-primary'}`}>
                        {goal.daysRemaining < 0 ? 'Overdue' : `${goal.daysRemaining} days`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-4 pt-4 border-t border-border-color">
                  {!goal.isCompleted && (
                    <button
                      onClick={() => handleAddContribution(goal)}
                      className="flex-1 btn-secondary text-xs py-2"
                    >
                      Add Contribution
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(goal)}
                    className="btn-primary text-xs py-2 px-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="btn-secondary text-xs py-2 px-3 text-accent-error hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>

                {/* Recent Contributions */}
                {goal.contributions && goal.contributions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-color">
                    <h4 className="text-sm font-medium text-text-primary mb-2">
                      Recent Contributions
                    </h4>
                    <div className="space-y-2">
                      {goal.contributions.slice(-2).map((contribution, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-text-muted">
                            {new Date(contribution.date).toLocaleDateString()}
                          </span>
                          <span className="text-accent-success font-medium">
                            +{formatCurrency(contribution.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      {isGoalFormOpen && (
        <GoalForm
          goal={editingGoal}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries('goals');
          }}
        />
      )}

      {/* Contribution Form Modal */}
      {isContributionFormOpen && selectedGoal && (
        <ContributionForm
          goal={selectedGoal}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries('goals');
          }}
        />
      )}
    </div>
  );
};

export default Goals;