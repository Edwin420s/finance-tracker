import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BudgetProgress = () => {
  // Mock data - in real app, this would come from API
  const budgetData = [
    { name: 'Food & Dining', spent: 320, limit: 400, percentage: 80 },
    { name: 'Entertainment', spent: 85, limit: 200, percentage: 42.5 },
    { name: 'Shopping', spent: 210, limit: 300, percentage: 70 },
    { name: 'Transport', spent: 120, limit: 150, percentage: 80 }
  ];

  const pieData = [
    { name: 'Used', value: 735 },
    { name: 'Remaining', value: 265 }
  ];

  const COLORS = ['#ef4444', '#10b981'];

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-accent-error';
    if (percentage >= 70) return 'text-accent-warning';
    return 'text-accent-success';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-accent-error';
    if (percentage >= 70) return 'bg-accent-warning';
    return 'bg-accent-success';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-4">Budget Progress</h3>
      
      {/* Pie Chart */}
      <div className="h-40 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgetData.map((budget, index) => (
          <motion.div
            key={budget.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-primary font-medium">
                {budget.name}
              </span>
              <span className={`text-sm font-medium ${getStatusColor(budget.percentage)}`}>
                {budget.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-primary-light rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-text-muted min-w-12 text-right">
                ${budget.spent}/${budget.limit}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-accent-primary hover:text-blue-400 transition-colors font-medium">
        Manage Budgets →
      </button>
    </motion.div>
  );
};

export default BudgetProgress;