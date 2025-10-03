# FinanceTracker - AI-Powered Personal Finance Management

A comprehensive full-stack application for tracking expenses, managing budgets, setting financial goals, and getting AI-powered insights into your spending habits.

## 🚀 Features

- **Expense & Income Tracking**: Easily log and categorize transactions
- **Smart Budgeting**: Set budgets with automatic alerts and progress tracking
- **Goal Setting**: Create and track financial goals with visual progress
- **AI Insights**: Get personalized financial recommendations and spending analysis
- **Comprehensive Reports**: Generate detailed financial reports and exports
- **Real-time Notifications**: Stay updated with budget alerts and goal progress
- **Secure Authentication**: JWT-based authentication with security best practices

## 🛠 Tech Stack

### Frontend
- React 18 with Hooks
- Tailwind CSS for styling
- React Query for state management
- React Hook Form for forms
- Recharts for data visualization
- Framer Motion for animations

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Redis for caching and sessions
- Comprehensive validation and error handling

### AI Service
- Python with FastAPI
- Scikit-learn for machine learning
- Pandas for data analysis
- Integration with backend via REST API

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis 7+
- Python 3.9+ (for AI service)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### Docker Setup (Alternative)
```bash
docker-compose up -d
```

## 🗄 Database Schema

The application uses MongoDB with the following main collections:

- **Users**: User accounts and preferences
- **Transactions**: Income and expense records
- **Budgets**: Budget definitions and tracking
- **Goals**: Financial goals and progress
- **Insights**: AI-generated financial insights
- **Notifications**: User notifications and alerts
- **Categories**: Transaction categorization system

## 🔐 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password

### Transaction Endpoints
- `GET /api/transactions` - Get transactions with filtering
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget Endpoints
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `GET /api/budgets/alerts` - Get budget alerts

### Insight Endpoints
- `GET /api/insights` - Get AI insights
- `GET /api/insights/forecast` - Get spending forecast

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Environment Variables
Set the following environment variables in production:

**Backend (.env)**
```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
```

**Frontend (.env.production)**
```
REACT_APP_API_URL=your_production_api_url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🗺 Roadmap

- Mobile app development
- Investment tracking integration
- Multi-currency support
- Bank synchronization
- Advanced AI forecasting
- Tax preparation features

---

This completes the comprehensive Finance Tracker application with ALL necessary files, including:

✅ **Complete Backend** with all models, controllers, services, and utilities  
✅ **Complete Frontend** with all components, pages, hooks, and utilities  
✅ **AI Service** with machine learning capabilities  
✅ **Comprehensive Testing** with test suites  
✅ **Configuration Files** for all environments  
✅ **Documentation** with setup and usage instructions  
✅ **Security** with proper validation and authentication  
✅ **Error Handling** throughout the application  
✅ **Performance** with caching and optimization  

The application is now truly complete and ready for production deployment!
