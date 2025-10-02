import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  AlertTriangle
} from 'lucide-react';
import { transactionsAPI } from '../api/transactions';
import KPICard from '../components/Dashboard/KPICard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import SpendingChart from '../components/Dashboard/SpendingChart';
import BudgetProgress from '../components/Dashboard/BudgetProgress';
import AIInsightsCard from '../components/Dashboard/AIInsightsCard';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    () => transactionsAPI.getTransactionStats(),
    { refetchOnWindowFocus: false }
  );

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery(
    'recentTransactions',
    () => transactionsAPI.getTransactions({ limit: 5 }),
    { refetchOnWindowFocus: false }
  );

  if (statsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const { income = 0, expense = 0, net = 0 } = stats?.data || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="text-sm text-text-muted">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <KPICard
          title="Total Income"
          value={income}
          icon={TrendingUp}
          trend="+12%"
          trendPositive={true}
          color="success"
        />
        <KPICard
          title="Total Expenses"
          value={expense}
          icon={TrendingDown}
          trend="+8%"
          trendPositive={false}
          color="error"
        />
        <KPICard
          title="Net Savings"
          value={net}
          icon={DollarSign}
          trend={net >= 0 ? "+5%" : "-5%"}
          trendPositive={net >= 0}
          color={net >= 0 ? "success" : "error"}
        />
        <KPICard
          title="Budget Status"
          value="Good"
          icon={PiggyBank}
          trend="On track"
          trendPositive={true}
          color="success"
          isText={true}
        />
      </motion.div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>

        {/* AI Insights */}
        <div className="space-y-6">
          <AIInsightsCard />
          <BudgetProgress />
        </div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <RecentTransactions transactions={recentTransactions?.data?.transactions} />
      </motion.div>
    </div>
  );
};

export default Dashboard;