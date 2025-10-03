const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

describe('Transactions API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});

    // Create test user and get auth token
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password123!'
    });

    userId = user._id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      await Transaction.create([
        {
          userId,
          type: 'expense',
          amount: 50,
          category: 'Food',
          date: new Date('2024-01-15'),
          description: 'Lunch'
        },
        {
          userId,
          type: 'income',
          amount: 1000,
          category: 'Salary',
          date: new Date('2024-01-01'),
          description: 'Monthly salary'
        }
      ]);
    });

    it('should get all transactions for user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(2);
      expect(response.body.data.transactions[0]).toHaveProperty('amount');
      expect(response.body.data.transactions[0]).toHaveProperty('category');
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions?type=income')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0].type).toBe('income');
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        type: 'expense',
        amount: 25.50,
        category: 'Entertainment',
        date: '2024-01-20',
        description: 'Movie tickets'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction.amount).toBe(25.50);
      expect(response.body.data.transaction.category).toBe('Entertainment');
      expect(response.body.data.transaction.userId).toBe(userId.toString());
    });

    it('should validate transaction data', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});