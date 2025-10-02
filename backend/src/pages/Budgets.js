import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Plus, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { budgetsAPI } from '../api/budgets';
import BudgetForm from '../components/Budgets/BudgetForm';
import Toast from 'react-hot-toast';

const Budgets = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const queryClient = useQueryClient();

  const { data: budgetsData, isLoading } = useQuery(
    'budgets',
    budgetsAPI.getBudgets,
    { refetchOnWindowFocus: false }
  );

  const { data: alertsData } = useQuery(
    'budgetAlerts',
    budgetsAPI.getBudgetAlerts,
    { refetchOnWindowFocus: false }
  );

  const deleteMutation = useMutation(budgetsAPI.deleteBudget, {
    onSuccess: () => {
      queryClient.invalidateQueries('budgets');
      queryClient.invalidateQueries('budgetAlerts');
      Toast.success('Budget deleted successfully');
    },
    onError: (error) => {
      Toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  });

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const budgets = budgetsData?.data?.budgets || [];
  const alerts = alertsData?.data?.alerts || [];

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-accent-error';
    if (percentage >= 80) return 'text-accent-warning';
    return 'text-accent-success';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-accent-error';
    if (percentage >= 80) return 'bg-accent-warning';
    return 'bg-accent-success';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Budgets</h1>
          <p className="text-text-muted mt-1">
            Set and track your spending limits
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {alerts.map((alert, index) => (
            <div
              key={alert.budgetId}
              className={`p-4 rounded-lg border ${
                alert.type === 'exceeded'
                  ? 'bg-accent-error/10 border-accent-error/20'
                  : alert.type === 'critical'
                  ? 'bg-accent-warning/10 border-accent-warning/20'
                  : 'bg-accent-primary/10 border-accent-primary/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`w-5 h-5 ${
                  alert.type === 'exceeded'
                    ? 'text-accent-error'
                    : alert.type === 'critical'
                    ? 'text-accent-warning'
                    : 'text-accent-primary'
                }`} />
                <div className="flex-1">
                  <p className="text-text-primary font-medium">{alert.message}</p>
                  <p className="text-text-muted text-sm">
                    ${alert.spent.toFixed(2)} of ${alert.limit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Budgets Yet
          </h3>
          <p className="text-text-muted mb-6">
            Create your first budget to start tracking your spending limits.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget, index) => (
            <motion.div
              key={budget._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {budget.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="text-accent-primary hover:text-blue-400 transition-colors p-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="text-accent-error hover:text-red-400 transition-colors p-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Category</span>
                  <span className="text-text-primary font-medium">
                    {budget.category}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Period</span>
                  <span className="text-text-primary font-medium capitalize">
                    {budget.period}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Spent</span>
                  <span className="text-text-primary font-medium">
                    ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted text-sm">Progress</span>
                    <span className={`text-sm font-medium ${getStatusColor(budget.percentageUsed)}`}>
                      {budget.percentageUsed.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-primary-light rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(budget.percentageUsed)}`}
                      style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-text-muted text-sm">Remaining</span>
                  <span className="text-text-primary font-medium">
                    ${Math.max(0, budget.amount - budget.spent).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      {isFormOpen && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries('budgets');
            queryClient.invalidateQueries('budgetAlerts');
          }}
        />
      )}
    </div>
  );
};

export default Budgets;