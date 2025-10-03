const ImportService = require('../services/importService');
const Transaction = require('../models/Transaction');

// @desc    Get CSV headers for mapping
// @route   POST /api/import/headers
// @access  Private
exports.getCSVHeaders = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const headers = await ImportService.getCSVHeaders(req.file.buffer);

    res.status(200).json({
      success: true,
      data: {
        headers,
        sampleSize: Math.min(headers.length, 10) // Return first 10 headers as sample
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import transactions from CSV
// @route   POST /api/import/transactions
// @access  Private
exports.importTransactions = async (req, res, next) => {
  try {
    const { mapping } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: 'Column mapping is required'
      });
    }

    // Validate mapping
    const headers = await ImportService.getCSVHeaders(req.file.buffer);
    const mappingErrors = ImportService.validateMapping(mapping, headers);
    
    if (mappingErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid column mapping',
        errors: mappingErrors
      });
    }

    const result = await ImportService.importCSV(req.user.id, req.file.buffer, mapping);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get import templates
// @route   GET /api/import/templates
// @access  Private
exports.getTemplates = async (req, res, next) => {
  try {
    const templates = {
      basic: {
        name: 'Basic Template',
        description: 'Simple template with required fields only',
        columns: ['Date', 'Amount', 'Type', 'Description', 'Category'],
        sample: [
          ['2024-01-15', '50.00', 'expense', 'Lunch at restaurant', 'Food'],
          ['2024-01-16', '1000.00', 'income', 'Monthly salary', 'Salary']
        ]
      },
      detailed: {
        name: 'Detailed Template',
        description: 'Template with all available fields',
        columns: ['Date', 'Amount', 'Type', 'Description', 'Category', 'Merchant', 'Payment Method', 'Tags'],
        sample: [
          ['2024-01-15', '50.00', 'expense', 'Lunch', 'Food', 'Restaurant Name', 'Credit Card', 'dining, business'],
          ['2024-01-16', '1000.00', 'income', 'Salary', 'Salary', 'Company Inc', 'Bank Transfer', '']
        ]
      }
    };

    res.status(200).json({
      success: true,
      data: {
        templates
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download import template
// @route   GET /api/import/template/:type
// @access  Private
exports.downloadTemplate = async (req, res, next) => {
  try {
    const { type } = req.params;
    const templates = {
      basic: ['Date', 'Amount', 'Type', 'Description', 'Category'],
      detailed: ['Date', 'Amount', 'Type', 'Description', 'Category', 'Merchant', 'Payment Method', 'Tags']
    };

    const template = templates[type];
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Create CSV content
    const csvContent = template.join(',') + '\n' +
      '2024-01-15,50.00,expense,Lunch at restaurant,Food\n' +
      '2024-01-16,1000.00,income,Monthly salary,Salary';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=template-${type}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};