// MongoDB initialization script
db = db.getSiblingDB('finance-tracker');

// Create collections
db.createCollection('users');
db.createCollection('transactions');
db.createCollection('budgets');
db.createCollection('insights');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.transactions.createIndex({ userId: 1, date: -1 });
db.transactions.createIndex({ userId: 1, category: 1 });
db.transactions.createIndex({ userId: 1, type: 1 });
db.budgets.createIndex({ userId: 1, startDate: 1, endDate: 1 });
db.insights.createIndex({ userId: 1, createdAt: -1 });

// Insert default categories
db.categories.insertMany([
  // Expense Categories
  { name: 'Food & Dining', type: 'expense', isSystem: true, color: '#ef4444', icon: 'utensils' },
  { name: 'Shopping', type: 'expense', isSystem: true, color: '#8b5cf6', icon: 'shopping-bag' },
  { name: 'Transportation', type: 'expense', isSystem: true, color: '#3b82f6', icon: 'car' },
  { name: 'Entertainment', type: 'expense', isSystem: true, color: '#f59e0b', icon: 'film' },
  { name: 'Bills & Utilities', type: 'expense', isSystem: true, color: '#10b981', icon: 'file-text' },
  { name: 'Healthcare', type: 'expense', isSystem: true, color: '#06b6d4', icon: 'heart' },
  { name: 'Travel', type: 'expense', isSystem: true, color: '#f97316', icon: 'plane' },
  { name: 'Education', type: 'expense', isSystem: true, color: '#84cc16', icon: 'book-open' },
  { name: 'Personal Care', type: 'expense', isSystem: true, color: '#ec4899', icon: 'user' },
  { name: 'Other', type: 'expense', isSystem: true, color: '#6b7280', icon: 'more-horizontal' },
  
  // Income Categories
  { name: 'Salary', type: 'income', isSystem: true, color: '#10b981', icon: 'dollar-sign' },
  { name: 'Freelance', type: 'income', isSystem: true, color: '#3b82f6', icon: 'briefcase' },
  { name: 'Investments', type: 'income', isSystem: true, color: '#f59e0b', icon: 'trending-up' },
  { name: 'Business', type: 'income', isSystem: true, color: '#8b5cf6', icon: 'building' },
  { name: 'Gifts', type: 'income', isSystem: true, color: '#ec4899', icon: 'gift' },
  { name: 'Rental Income', type: 'income', isSystem: true, color: '#06b6d4', icon: 'home' },
  { name: 'Other Income', type: 'income', isSystem: true, color: '#84cc16', icon: 'more-horizontal' }
]);

print('✅ Finance Tracker database initialized successfully!');