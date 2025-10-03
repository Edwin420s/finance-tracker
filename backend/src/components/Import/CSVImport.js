import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { Upload, FileText, Map, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { importAPI } from '../../api/import';
import Toast from 'react-hot-toast';

const CSVImport = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importResult, setImportResult] = useState(null);

  const getHeadersMutation = useMutation(importAPI.getCSVHeaders, {
    onSuccess: (data) => {
      setHeaders(data.data.headers);
      setStep(2);
    },
    onError: (error) => {
      Toast.error('Failed to read CSV file');
    }
  });

  const importMutation = useMutation(importAPI.importTransactions, {
    onSuccess: (data) => {
      setImportResult(data.data);
      setStep(3);
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      Toast.error('Import failed');
    }
  });

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      getHeadersMutation.mutate(formData);
    }
  };

  const handleMappingChange = (field, column) => {
    setMapping(prev => ({
      ...prev,
      [field]: column
    }));
  };

  const handleImport = () => {
    if (!file) return;

    const requiredFields = ['amount', 'date', 'type'];
    const missingFields = requiredFields.filter(field => !mapping[field]);

    if (missingFields.length > 0) {
      Toast.error(`Please map required fields: ${missingFields.join(', ')}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    importMutation.mutate(formData);
  };

  const requiredFields = [
    { key: 'date', label: 'Date', description: 'Transaction date' },
    { key: 'amount', label: 'Amount', description: 'Transaction amount' },
    { key: 'type', label: 'Type', description: 'Income or expense' }
  ];

  const optionalFields = [
    { key: 'description', label: 'Description', description: 'Transaction description' },
    { key: 'category', label: 'Category', description: 'Transaction category' },
    { key: 'merchant', label: 'Merchant', description: 'Merchant name' },
    { key: 'paymentMethod', label: 'Payment Method', description: 'Payment method used' }
  ];

  return (
    <div className="space-y-6">
      {/* Step 1: File Upload */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <Upload className="w-16 h-16 text-accent-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Upload CSV File
          </h3>
          <p className="text-text-muted mb-6">
            Select a CSV file containing your transaction data
          </p>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="btn-primary inline-flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Choose CSV File</span>
            </div>
          </label>

          <div className="mt-6 text-sm text-text-muted">
            <p>Supported format: CSV</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </motion.div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Map className="w-6 h-6 text-accent-primary" />
            <h3 className="text-xl font-semibold text-text-primary">Map Columns</h3>
          </div>

          <div className="space-y-6">
            {/* Required Fields */}
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-4">Required Fields</h4>
              <div className="space-y-4">
                {requiredFields.map(field => (
                  <div key={field.key} className="flex items-center justify-between p-4 border border-border-color rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{field.label}</p>
                      <p className="text-sm text-text-muted">{field.description}</p>
                    </div>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="input-primary w-48"
                    >
                      <option value="">Select column</option>
                      {headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-4">Optional Fields</h4>
              <div className="space-y-4">
                {optionalFields.map(field => (
                  <div key={field.key} className="flex items-center justify-between p-4 border border-border-color rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{field.label}</p>
                      <p className="text-sm text-text-muted">{field.description}</p>
                    </div>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="input-primary w-48"
                    >
                      <option value="">Select column</option>
                      {headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={importMutation.isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {importMutation.isLoading && <div className="loading-spinner"></div>}
                <span>Import Transactions</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Import Results */}
      {step === 3 && importResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <CheckCircle className="w-16 h-16 text-accent-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Import Complete
          </h3>

          <div className="bg-accent-success/10 border border-accent-success/20 rounded-lg p-4 mb-6">
            <p className="text-accent-success font-medium">
              Successfully imported {importResult.imported} transactions
            </p>
            <p className="text-text-muted text-sm">
              Processed {importResult.totalRows} rows total
            </p>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="bg-accent-error/10 border border-accent-error/20 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-accent-error" />
                <h4 className="font-medium text-text-primary">Import Errors</h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-accent-error">Row {error.row}:</span>
                    <span className="text-text-muted ml-2">{error.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-3">
            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setHeaders([]);
                setMapping({});
                setImportResult(null);
              }}
              className="btn-primary"
            >
              Import Another File
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CSVImport;