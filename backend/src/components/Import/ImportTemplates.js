import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { importAPI } from '../../api/import';

const ImportTemplates = () => {
  const { data: templatesData } = useQuery(
    'importTemplates',
    importAPI.getTemplates,
    { refetchOnWindowFocus: false }
  );

  const templates = templatesData?.data?.templates || {};

  const handleDownloadTemplate = async (type) => {
    try {
      const response = await importAPI.downloadTemplate(type);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `template-${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Import Templates
      </h3>
      <p className="text-text-muted mb-6">
        Download pre-formatted CSV templates to ensure your data imports correctly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(templates).map(([key, template]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border-color rounded-lg p-6 hover:border-accent-primary transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-text-primary mb-2">
                  {template.name}
                </h4>
                <p className="text-text-muted text-sm">
                  {template.description}
                </p>
              </div>
              <FileText className="w-8 h-8 text-accent-primary flex-shrink-0" />
            </div>

            <div className="mb-4">
              <h5 className="font-medium text-text-primary mb-2">Columns:</h5>
              <div className="flex flex-wrap gap-1">
                {template.columns.map((column, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light text-text-primary"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            {template.sample && (
              <div className="mb-4">
                <h5 className="font-medium text-text-primary mb-2">Sample Data:</h5>
                <div className="bg-primary-light rounded p-3 text-xs font-mono">
                  {template.sample.map((row, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-accent-success flex-shrink-0" />
                      <span className="text-text-muted">{row.join(' | ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => handleDownloadTemplate(key)}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary-light rounded-lg">
        <h4 className="font-medium text-text-primary mb-2">Import Tips:</h4>
        <ul className="text-sm text-text-muted space-y-1">
          <li>• Ensure dates are in YYYY-MM-DD format</li>
          <li>• Use positive numbers for amounts</li>
          <li>• Type should be either "income" or "expense"</li>
          <li>• Save your file as CSV (Comma Separated Values)</li>
          <li>• Remove any currency symbols from amount columns</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportTemplates;