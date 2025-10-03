const csv = require('csv-parser');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

class ImportService {
  static async importCSV(userId, fileBuffer, mapping) {
    return new Promise((resolve, reject) => {
      const transactions = [];
      const errors = [];
      let rowCount = 0;

      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      bufferStream
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          try {
            const transaction = this.parseRow(row, mapping, userId);
            if (transaction) {
              transactions.push(transaction);
            }
          } catch (error) {
            errors.push({
              row: rowCount,
              error: error.message,
              data: row
            });
          }
        })
        .on('end', async () => {
          try {
            const savedTransactions = await this.saveTransactions(transactions);
            resolve({
              success: true,
              imported: savedTransactions.length,
              totalRows: rowCount,
              errors: errors
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static parseRow(row, mapping, userId) {
    const requiredFields = ['amount', 'date', 'type'];
    
    for (const field of requiredFields) {
      if (!mapping[field]) {
        throw new Error(`Missing mapping for required field: ${field}`);
      }
    }

    const amount = parseFloat(row[mapping.amount]);
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${row[mapping.amount]}`);
    }

    const date = new Date(row[mapping.date]);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${row[mapping.date]}`);
    }

    const type = row[mapping.type].toLowerCase();
    if (!['income', 'expense'].includes(type)) {
      throw new Error(`Invalid type: ${row[mapping.type]}`);
    }

    const transaction = {
      userId,
      amount,
      type,
      date,
      category: mapping.category ? row[mapping.category] : 'Uncategorized',
      description: mapping.description ? row[mapping.description] : '',
      merchant: mapping.merchant ? row[mapping.merchant] : '',
      paymentMethod: mapping.paymentMethod ? row[mapping.paymentMethod] : ''
    };

    return transaction;
  }

  static async saveTransactions(transactions) {
    // Check for duplicates
    const uniqueTransactions = await this.filterDuplicates(transactions);
    
    // Save to database
    return await Transaction.insertMany(uniqueTransactions, { ordered: false });
  }

  static async filterDuplicates(transactions) {
    const uniqueTransactions = [];
    const seen = new Set();

    for (const transaction of transactions) {
      const key = `${transaction.userId}-${transaction.amount}-${transaction.date.toISOString()}-${transaction.description}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        
        // Check if transaction already exists in database
        const exists = await Transaction.findOne({
          userId: transaction.userId,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description
        });

        if (!exists) {
          uniqueTransactions.push(transaction);
        }
      }
    }

    return uniqueTransactions;
  }

  static async getCSVHeaders(fileBuffer) {
    return new Promise((resolve, reject) => {
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      bufferStream
        .pipe(csv())
        .on('headers', (headers) => {
          resolve(headers);
        })
        .on('error', (error) => {
          reject(error);
        })
        .on('data', () => {
          // We only need headers, so we break after first row
          bufferStream.destroy();
          resolve(headers);
        });
    });
  }

  static validateMapping(mapping, headers) {
    const requiredFields = ['amount', 'date', 'type'];
    const errors = [];

    for (const field of requiredFields) {
      if (!mapping[field]) {
        errors.push(`Required field '${field}' is not mapped`);
      } else if (!headers.includes(mapping[field])) {
        errors.push(`Mapped column '${mapping[field]}' for '${field}' not found in CSV`);
      }
    }

    // Validate optional fields
    const optionalFields = ['category', 'description', 'merchant', 'paymentMethod'];
    for (const field of optionalFields) {
      if (mapping[field] && !headers.includes(mapping[field])) {
        errors.push(`Mapped column '${mapping[field]}' for '${field}' not found in CSV`);
      }
    }

    return errors;
  }
}

module.exports = ImportService;