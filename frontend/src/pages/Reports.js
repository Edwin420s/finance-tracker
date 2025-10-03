import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Download, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { reportsAPI } from '../api/reports';
import Toast from 'react-hot-toast';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'monthly'
  });

  const { data: reportsData, isLoading } = useQuery(
    ['reports', filters],
    () => reportsAPI.getReports(filters),
    { refetchOnWindowFocus: false }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async (format) => {
    try {
      const response = await reportsAPI.exportReports({ ...filters, format });
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      Toast.error('Failed to export report');
    }
  };

  const reports = reportsData?.data || {};

  const quickDateRanges = [
    { label: 'This Month', start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() },
    { label: 'Last Month', start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), end: new Date(new Date().getFullYear(), new Date().getMonth(), 0) },
    { label: 'This Year', start: new Date(new Date().getFullYear(), 0, 1), end: new Date() },
    { label: 'Last 30 Days', start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-muted mt-1">
            Analyze your financial data with detailed reports
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Report Filters</h3>
          <Filter className="w-5 h-5 text-text-muted" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Report Type
            </label>
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="input-primary"
            >
              <option value="monthly">Monthly Summary</option>
              <option value="category">Category Breakdown</option>
              <option value="trends">Spending Trends</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="input-primary pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="input-primary pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Quick Ranges
            </label>
            <select
              onChange={(e) => {
                const range = quickDateRanges[parseInt(e.target.value)];
                if (range) {
                  setFilters(prev => ({
                    ...prev,
                    startDate: range.start.toISOString().split('T')[0],
                    endDate: range.end.toISOString().split('T')[0]
                  }));
                }
              }}
              className="input-primary"
            >
              <option value="">Select range</option>
              {quickDateRanges.map((range, index) => (
                <option key={index} value={index}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card flex justify-center items-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card text-center"
            >
              <BarChart3 className="w-8 h-8 text-accent-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-text-primary">
                ${reports.totalIncome?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-text-muted text-sm">Total Income</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card text-center"
            >
              <TrendingUp className="w-8 h-8 text-accent-error mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-text-primary">
                ${reports.totalExpenses?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-text-muted text-sm">Total Expenses</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card text-center"
            >
              <PieChart className="w-8 h-8 text-accent-success mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-text-primary">
                ${reports.netSavings?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-text-muted text-sm">Net Savings</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card text-center"
            >
              <Calendar className="w-8 h-8 text-accent-warning mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-text-primary">
                {reports.transactionCount || 0}
              </h3>
              <p className="text-text-muted text-sm">Transactions</p>
            </motion.div>
          </div>

          {/* Category Breakdown */}
          {reports.categoryBreakdown && reports.categoryBreakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Category Breakdown
              </h3>
              <div className="space-y-3">
                {reports.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      ></div>
                      <span className="text-text-primary">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-text-primary font-medium">
                        ${category.amount.toFixed(2)}
                      </span>
                      <span className="text-text-muted text-sm w-12 text-right">
                        {category.percentage.toFixed(1)}%
                      </span>
                      <div className="w-24 bg-primary-light rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-accent-primary"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Monthly Trends */}
          {reports.monthlyTrends && reports.monthlyTrends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Monthly Trends
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-color">
                      <th className="text-left py-3 px-4 text-text-primary font-medium">Month</th>
                      <th className="text-left py-3 px-4 text-text-primary font-medium">Income</th>
                      <th className="text-left py-3 px-4 text-text-primary font-medium">Expenses</th>
                      <th className="text-left py-3 px-4 text-text-primary font-medium">Savings</th>
                      <th className="text-left py-3 px-4 text-text-primary font-medium">Savings Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.monthlyTrends.map((month, index) => (
                      <tr key={index} className="border-b border-border-color hover:bg-primary-light">
                        <td className="py-3 px-4 text-text-primary">{month.month}</td>
                        <td className="py-3 px-4 text-accent-success">${month.income.toFixed(2)}</td>
                        <td className="py-3 px-4 text-accent-error">${month.expenses.toFixed(2)}</td>
                        <td className="py-3 px-4 text-text-primary">${month.savings.toFixed(2)}</td>
                        <td className="py-3 px-4 text-text-primary">{month.savingsRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {(!reports.categoryBreakdown || reports.categoryBreakdown.length === 0) && 
           (!reports.monthlyTrends || reports.monthlyTrends.length === 0) && (
            <div className="card text-center py-12">
              <BarChart3 className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Report Data
              </h3>
              <p className="text-text-muted mb-6">
                No financial data found for the selected period. Try adjusting your filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;