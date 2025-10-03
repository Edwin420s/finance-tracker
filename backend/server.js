const app = require('./src/app');
const mongoose = require('mongoose');
const redis = require('redis');
require('dotenv').config();

// Import jobs
const InsightGenerationJob = require('./src/jobs/insightGeneration');
const BudgetAlertsJob = require('./src/jobs/budgetAlerts');
const WeeklySummariesJob = require('./src/jobs/weeklySummaries');

const PORT = process.env.PORT || 5000;

// Initialize jobs
const insightJob = new InsightGenerationJob();
const budgetAlertsJob = new BudgetAlertsJob();
const weeklySummariesJob = new WeeklySummariesJob();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Redis Connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  console.log('❌ Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});
redisClient.connect();

// Make redisClient available globally
global.redisClient = redisClient;

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  
  // Start background jobs in production, or in development when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.START_JOBS_IN_DEV === 'true') {
    insightJob.start();
    budgetAlertsJob.start();
    weeklySummariesJob.start();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');

  // Stop jobs
  insightJob.stop();
  budgetAlertsJob.stop();
  weeklySummariesJob.stop();

  server.close(() => {
    mongoose.connection.close();
    redisClient.quit();
    process.exit(0);
  });
});

module.exports = server;