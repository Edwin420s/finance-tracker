const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// @desc    Export transactions
// @route   POST /api/export/transactions
// @access  Private
exports.exportTransactions = async (req, res, next) => {
  try {
    const { format, startDate, endDate, type, category } = req.body;
    const userId = req.user.id;

    // Build query
    const query = { userId, isExcluded: { $ne: true } };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .select('date amount type category description merchant paymentMethod');

    if (format === 'csv') {
      await exportToCSV(transactions, res);
    } else if (format === 'excel') {
      await exportToExcel(transactions, res);
    } else if (format === 'pdf') {
      await exportToPDF(transactions, res);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Export financial report
// @route   POST /api/export/report
// @access  Private
exports.exportFinancialReport = async (req, res, next) => {
  try {
    const { format, startDate, endDate } = req.body;
    const userId = req.user.id;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get transactions for the period
    const transactions = await Transaction.find({
      userId,
      date: { $gte: start, $lte: end },
      isExcluded: { $ne: true }
    });

    // Get budgets
    const budgets = await Budget.find({
      userId,
      startDate: { $lte: end },
      endDate: { $gte: start }
    });

    // Get goals
    const goals = await Goal.find({
      userId,
      deadline: { $gte: start }
    });

    // Calculate financial summary
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    // Category breakdown
    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const reportData = {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      summary: {
        income,
        expenses,
        net,
        savingsRate,
        transactionCount: transactions.length
      },
      categoryBreakdown,
      budgets: budgets.length,
      goals: goals.length
    };

    if (format === 'pdf') {
      await exportReportToPDF(reportData, res);
    } else if (format === 'excel') {
      await exportReportToExcel(reportData, res);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported export format for reports'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Helper functions for different export formats
async function exportToCSV(transactions, res) {
  const headers = ['Date', 'Amount', 'Type', 'Category', 'Description', 'Merchant', 'Payment Method'];
  const csvData = transactions.map(t => [
    t.date.toISOString().split('T')[0],
    t.amount,
    t.type,
    t.category,
    t.description || '',
    t.merchant || '',
    t.paymentMethod || ''
  ]);

  let csv = headers.join(',') + '\n';
  csvData.forEach(row => {
    csv += row.map(field => `"${field}"`).join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
}

async function exportToExcel(transactions, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transactions');

  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Description', key: 'description', width: 25 },
    { header: 'Merchant', key: 'merchant', width: 20 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 }
  ];

  // Add data
  transactions.forEach(transaction => {
    worksheet.addRow({
      date: transaction.date.toISOString().split('T')[0],
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      merchant: transaction.merchant || '',
      paymentMethod: transaction.paymentMethod || ''
    });
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
}

async function exportToPDF(transactions, res) {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.pdf`);
  
  doc.pipe(res);

  // Add title
  doc.fontSize(20).text('Transaction Export', { align: 'center' });
  doc.moveDown();

  // Add summary
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  doc.fontSize(12).text(`Total Income: $${income.toFixed(2)}`);
  doc.text(`Total Expenses: $${expenses.toFixed(2)}`);
  doc.text(`Net: $${(income - expenses).toFixed(2)}`);
  doc.text(`Transactions: ${transactions.length}`);
  doc.moveDown();

  // Add transactions table
  let yPosition = doc.y;
  const tableTop = yPosition;
  const rowHeight = 20;
  const columns = [
    { name: 'Date', width: 80 },
    { name: 'Type', width: 60 },
    { name: 'Category', width: 80 },
    { name: 'Amount', width: 70 },
    { name: 'Description', width: 150 }
  ];

  // Draw table headers
  doc.fontSize(10).font('Helvetica-Bold');
  let xPosition = 50;
  columns.forEach(column => {
    doc.text(column.name, xPosition, yPosition, { width: column.width, align: 'left' });
    xPosition += column.width;
  });

  // Draw table rows
  doc.font('Helvetica');
  transactions.slice(0, 50).forEach((transaction, index) => { // Limit to 50 rows for PDF
    yPosition = tableTop + (index + 1) * rowHeight;
    xPosition = 50;
    
    const row = [
      transaction.date.toISOString().split('T')[0],
      transaction.type,
      transaction.category,
      `$${transaction.amount.toFixed(2)}`,
      transaction.description || ''
    ];

    columns.forEach((column, colIndex) => {
      doc.fontSize(8).text(row[colIndex], xPosition, yPosition, { 
        width: column.width, 
        align: 'left' 
      });
      xPosition += column.width;
    });
  });

  doc.end();
}

async function exportReportToPDF(reportData, res) {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  
  doc.pipe(res);

  // Title
  doc.fontSize(20).text('Financial Report', { align: 'center' });
  doc.moveDown();

  // Period
  doc.fontSize(12).text(`Period: ${reportData.period.start} to ${reportData.period.end}`);
  doc.moveDown();

  // Summary
  doc.fontSize(14).text('Financial Summary', { underline: true });
  doc.fontSize(10);
  doc.text(`Total Income: $${reportData.summary.income.toFixed(2)}`);
  doc.text(`Total Expenses: $${reportData.summary.expenses.toFixed(2)}`);
  doc.text(`Net Savings: $${reportData.summary.net.toFixed(2)}`);
  doc.text(`Savings Rate: ${reportData.summary.savingsRate.toFixed(1)}%`);
  doc.text(`Transactions: ${reportData.summary.transactionCount}`);
  doc.moveDown();

  // Category Breakdown
  doc.fontSize(14).text('Expense Categories', { underline: true });
  doc.fontSize(10);
  Object.entries(reportData.categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, amount]) => {
      doc.text(`${category}: $${amount.toFixed(2)}`);
    });

  doc.end();
}

async function exportReportToExcel(reportData, res) {
  const workbook = new ExcelJS.Workbook();

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];

  summarySheet.addRows([
    { metric: 'Total Income', value: reportData.summary.income },
    { metric: 'Total Expenses', value: reportData.summary.expenses },
    { metric: 'Net Savings', value: reportData.summary.net },
    { metric: 'Savings Rate', value: reportData.summary.savingsRate + '%' },
    { metric: 'Transaction Count', value: reportData.summary.transactionCount },
    { metric: 'Active Budgets', value: reportData.budgets },
    { metric: 'Active Goals', value: reportData.goals }
  ]);

  // Category breakdown sheet
  const categorySheet = workbook.addWorksheet('Categories');
  categorySheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 }
  ];

  Object.entries(reportData.categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, amount]) => {
      categorySheet.addRow({ category, amount });
    });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
}