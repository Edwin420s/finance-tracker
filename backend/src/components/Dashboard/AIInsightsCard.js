import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const AIInsightsCard = () => {
  const insights = [
    {
      type: 'trend',
      icon: TrendingUp,
      title: 'Spending Increase',
      message: 'Your dining out expenses increased by 25% this month.',
      confidence: 0.85,
      color: 'warning'
    },
    {
      type: 'savings',
      icon: Lightbulb,
      title: 'Savings Opportunity',
      message: 'You could save $120/month by reducing subscription services.',
      confidence: 0.92,
      color: 'success'
    },
    {
      type: 'alert',
      icon: AlertTriangle,
      title: 'Budget Alert',
      message: 'Entertainment budget is 85% used with 10 days remaining.',
      confidence: 0.78,
      color: 'error'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'success':
        return 'bg-accent-success/20 text-accent-success';
      case 'warning':
        return 'bg-accent-warning/20 text-accent-warning';
      case 'error':
        return 'bg-accent-error/20 text-accent-error';
      default:
        return 'bg-accent-primary/20 text-accent-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-accent-primary/20 rounded-lg">
          <Brain className="w-5 h-5 text-accent-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-3 rounded-lg border border-border-color hover:border-accent-primary/50 transition-colors duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className={getColorClasses(insight.color) + ' p-2 rounded-lg flex-shrink-0'}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text-primary mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-text-muted mb-2">
                    {insight.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-text-muted">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="w-16 bg-primary-light rounded-full h-1">
                      <div 
                        className="h-1 rounded-full bg-accent-primary"
                        style={{ width: `${insight.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-accent-primary hover:text-blue-400 transition-colors font-medium">
        View All Insights →
      </button>
    </motion.div>
  );
};

export default AIInsightsCard;