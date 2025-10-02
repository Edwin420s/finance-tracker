import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, BarChart3 } from 'lucide-react';
import { insightsAPI } from '../api/insights';
import Toast from 'react-hot-toast';

const Insights = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: insightsData, isLoading, error, refetch } = useQuery(
    'insights',
    insightsAPI.getInsights,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      Toast.success('Insights refreshed');
    } catch (error) {
      Toast.error('Failed to refresh insights');
    } finally {
      setRefreshing(false);
    }
  };

  const insights = insightsData?.data || {
    insights: [],
    trends: {},
    anomalies: [],
    recommendations: []
  };

  const getIcon = (type) => {
    switch (type) {
      case 'trend':
        return TrendingUp;
      case 'anomaly':
        return AlertTriangle;
      case 'recommendation':
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getColorClasses = (type) => {
    switch (type) {
      case 'trend':
        return 'bg-accent-primary/20 text-accent-primary';
      case 'anomaly':
        return 'bg-accent-error/20 text-accent-error';
      case 'recommendation':
        return 'bg-accent-success/20 text-accent-success';
      default:
        return 'bg-accent-warning/20 text-accent-warning';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-accent-error';
      case 'medium':
        return 'text-accent-warning';
      case 'low':
        return 'text-accent-success';
      default:
        return 'text-text-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">AI Insights</h1>
          <p className="text-text-muted mt-1">
            Intelligent analysis of your spending patterns
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
          className="btn-primary flex items-center space-x-2"
        >
          {isLoading || refreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Refresh Insights</span>
        </button>
      </div>

      {isLoading ? (
        <div className="card flex justify-center items-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-accent-primary mx-auto mb-4 animate-pulse" />
            <p className="text-text-muted">Analyzing your financial data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <AlertTriangle className="w-16 h-16 text-accent-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Unable to Generate Insights
          </h3>
          <p className="text-text-muted mb-6">
            We're having trouble analyzing your data. Please try again later.
          </p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Key Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-accent-primary/20 rounded-lg">
                  <Brain className="w-5 h-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Key Insights</h3>
              </div>

              <div className="space-y-4">
                {insights.insights.length > 0 ? (
                  insights.insights.map((insight, index) => {
                    const Icon = getIcon(insight.type);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-border-color hover:border-accent-primary/50 transition-colors duration-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={getColorClasses(insight.type) + ' p-2 rounded-lg flex-shrink-0'}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-text-primary mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-text-muted mb-2">
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
                  })
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <p className="text-text-muted">No insights available yet.</p>
                    <p className="text-text-muted text-sm">
                      Add more transactions to generate personalized insights.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recommendations & Anomalies */}
            <div className="space-y-6">
              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-accent-success/20 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-accent-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">Recommendations</h3>
                </div>

                <div className="space-y-3">
                  {insights.recommendations.length > 0 ? (
                    insights.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-accent-success/10 border border-accent-success/20"
                      >
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-accent-success mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-text-primary mb-1">
                              {rec.title}
                            </h4>
                            <p className="text-sm text-text-muted mb-2">
                              {rec.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                                {rec.priority} priority
                              </span>
                              {rec.action && (
                                <button className="text-xs text-accent-primary hover:text-blue-400">
                                  {rec.action} →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">
                      No recommendations at this time.
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Anomalies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-accent-error/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-accent-error" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">Anomalies Detected</h3>
                </div>

                <div className="space-y-3">
                  {insights.anomalies.length > 0 ? (
                    insights.anomalies.map((anomaly, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-accent-error/10 border border-accent-error/20"
                      >
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-accent-error mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-text-primary mb-1">
                              Unusual Transaction
                            </h4>
                            <p className="text-sm text-text-muted mb-1">
                              {anomaly.reason}
                            </p>
                            <div className="text-xs text-text-muted">
                              Amount: ${anomaly.amount.toFixed(2)} • {anomaly.category}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-text-muted">
                                Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                              </span>
                              <button className="text-xs text-accent-primary hover:text-blue-400">
                                Review →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">
                      No anomalies detected. Your spending looks normal.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Trends Section */}
          {Object.keys(insights.trends).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-accent-warning/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-accent-warning" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Spending Trends</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(insights.trends).map(([key, trend], index) => (
                  <div
                    key={key}
                    className="p-4 rounded-lg border border-border-color"
                  >
                    <h4 className="text-sm font-medium text-text-primary mb-2 capitalize">
                      {key.replace('_', ' ')}
                    </h4>
                    <div className={`text-lg font-bold ${
                      trend.direction === 'up' ? 'text-accent-error' : 'text-accent-success'
                    }`}>
                      {trend.direction === 'up' ? '+' : ''}{trend.change_percent.toFixed(1)}%
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      ${trend.current_month.toFixed(2)} this month
                    </p>
                    <p className="text-xs text-text-muted">
                      vs ${trend.previous_month.toFixed(2)} last month
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Insights;