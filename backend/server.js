const app = require('./src/app');
const mongoose = require('mongoose');
const redis = require('redis');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

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
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    redisClient.quit();
    process.exit(0);
  });
});

module.exports = server;