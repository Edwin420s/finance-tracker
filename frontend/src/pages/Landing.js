import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Target, 
  Brain, 
  Shield, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Smart Budgeting',
      description: 'Set and track budgets with intelligent alerts and progress tracking.'
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get personalized financial insights and recommendations powered by AI.'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set financial goals and track your progress with visual indicators.'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with enterprise-grade security.'
    },
    {
      icon: TrendingUp,
      title: 'Investment Tracking',
      description: 'Monitor your investments and portfolio performance in one place.'
    },
    {
      icon: DollarSign,
      title: 'Expense Analysis',
      description: 'Deep insights into your spending patterns and optimization opportunities.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '$2.5B+', label: 'Tracked Assets' },
    { number: '98%', label: 'User Satisfaction' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Navigation */}
      <nav className="border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">FinanceTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-text-primary hover:text-accent-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-text-primary mb-6"
            >
              Take Control of Your
              <span className="text-accent-primary"> Financial Future</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-text-muted mb-8 max-w-3xl mx-auto"
            >
              AI-powered financial tracking that helps you save more, spend wisely, and achieve your financial goals faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-3 flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-3">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-accent-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need to Master Your Finances
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Powerful features designed to give you complete control and insight into your financial life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="p-3 bg-accent-primary/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-accent-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
          >
            Ready to Transform Your Financial Life?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted mb-8"
          >
            Join thousands of users who have already taken control of their finances with FinanceTracker.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/register" className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2">
              <span>Start Your Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-color py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">FinanceTracker</span>
            </div>
            <div className="text-text-muted">
              © 2024 FinanceTracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;