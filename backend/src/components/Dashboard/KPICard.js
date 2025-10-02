import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendPositive, 
  color = 'primary',
  isText = false 
}) => {
  const formatValue = (val) => {
    if (isText) return val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const colorClasses = {
    primary: 'bg-accent-primary/20 text-accent-primary',
    success: 'bg-accent-success/20 text-accent-success',
    warning: 'bg-accent-warning/20 text-accent-warning',
    error: 'bg-accent-error/20 text-accent-error'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-text-muted text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-text-primary mb-2">
            {formatValue(value)}
          </p>
          <div className={clsx(
            'flex items-center space-x-1 text-sm font-medium',
            trendPositive ? 'text-accent-success' : 'text-accent-error'
          )}>
            <span>{trend}</span>
            <span>•</span>
            <span>vs last month</span>
          </div>
        </div>
        
        <div className={clsx(
          'p-3 rounded-xl transition-colors duration-300 group-hover:scale-110',
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default KPICard;