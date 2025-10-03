import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { Download, FileText, BarChart3, Calendar, Filter } from 'lucide-react';
import { exportAPI } from '../../api/export';
import Toast from 'react-hot-toast';

const DataExport = () => {
  const [exportType, setExportType] = useState('transactions');
  const [format, setFormat] = useState('csv');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: ''
  });

  const exportMutation = useMutation(exportAPI.exportData, {
    onSuccess: (response, variables) => {
      // Handle file download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = variables.format === 'excel' ? 'xlsx' : variables.format;
      link.download = `${variables.exportType}-${new Date().toISOString().split('T')[0]}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Toast.success('Export completed successfully');
    },
    onError: (error) => {
      Toast.error('Export failed. Please try again.');
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    const exportData = {
      exportType,
      format,
      ...filters
    };

    // Clean up empty filters
    Object.keys(exportData).forEach(key => {
      if (exportData[key] === '') {
        delete exportData[key];
      }
    });

    exportMutation.mutate(exportData);
  };

  const exportTypes = [
    {
      id: 'transactions',
      label: 'Transactions',
      description: 'Export your transaction history',
      icon: FileText,
      formats: ['csv', 'excel', 'pdf']
    },
    {
      id: 'report',
      label: 'Financial Report',
      description: 'Comprehensive financial summary',
      icon: BarChart3,
      formats: ['excel', 'pdf']
    }
  ];

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

  const selectedExport = exportTypes.find(type => type.id === exportType);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-6">Export Data</h3>

        {/* Export Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-3">
            Export Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    exportType === type.id
                      ? 'border-accent-primary bg-accent-primary/5'
                      : 'border-border-color hover:border-accent-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      exportType === type.id
                        ? 'bg-accent-primary text-white'
                        : 'bg-primary-light text-text-muted'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{type.label}</p>
                      <p className="text-sm text-text-muted">{type.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-3">
            Format
          </label>
          <div className="flex space-x-4">
            {selectedExport.formats.map(formatOption => (
              <label key={formatOption} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value={formatOption}
                  checked={format === formatOption}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-accent-primary focus:ring-accent-primary"
                />
                <span className="text-text-primary font-medium uppercase">{formatOption}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-4 h-4 text-text-muted" />
            <label className="block text-sm font-medium text-text-primary">
              Filters (Optional)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-2">Start Date</label>
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
              <label className="block text-sm text-text-muted mb-2">End Date</label>
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
              <label className="block text-sm text-text-muted mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-primary"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-primary"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={exportMutation.isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            {exportMutation.isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {exportMutation.isLoading ? 'Exporting...' : 'Export Data'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Export Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h4 className="font-medium text-text-primary mb-3">Export Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-muted">
          <div>
            <p className="font-medium text-text-primary mb-2">Formats:</p>
            <ul className="space-y-1">
              <li>• CSV: Best for spreadsheet applications</li>
              <li>• Excel: Includes formatting and multiple sheets</li>
              <li>• PDF: Ideal for sharing and printing</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-text-primary mb-2">Usage:</p>
            <ul className="space-y-1">
              <li>• Tax preparation and filing</li>
              <li>• Financial planning and analysis</li>
              <li>• Sharing with financial advisors</li>
              <li>• Personal record keeping</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DataExport;