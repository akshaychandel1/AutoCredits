import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ComposedChart, Scatter
} from 'recharts';
import { Download, Filter, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    quotes: [],
    policies: [],
    payments: []
  });
  const [filters, setFilters] = useState({
    dateRange: '90days',
    insuranceCompany: 'all',
    coverageType: 'all',
    vehicleType: 'all'
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API calls
    const mockData = {
      quotes: generateMockQuotes(1000),
      policies: generateMockPolicies(300),
      payments: generateMockPayments(400)
    };
    setAnalyticsData(mockData);
  }, []);

  // Advanced analytics calculations
  const calculateAdvancedMetrics = () => {
    const { quotes, policies, payments } = analyticsData;
    
    // Conversion funnel
    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.accepted).length;
    const convertedPolicies = policies.length;
    
    // Revenue metrics
    const totalRevenue = policies.reduce((sum, policy) => 
      sum + (policy.policy_info?.totalPremium || 0), 0
    );
    const averagePremium = totalRevenue / Math.max(convertedPolicies, 1);
    
    // Time-based metrics
    const quoteToPolicyTime = calculateAverageTimeToConversion(quotes, policies);
    
    // Company performance
    const companyPerformance = calculateCompanyPerformance(quotes, policies);
    
    return {
      funnel: {
        totalQuotes,
        acceptedQuotes,
        convertedPolicies,
        quoteToAcceptanceRate: (acceptedQuotes / totalQuotes) * 100,
        acceptanceToPolicyRate: (convertedPolicies / acceptedQuotes) * 100,
        overallConversionRate: (convertedPolicies / totalQuotes) * 100
      },
      revenue: {
        totalRevenue,
        averagePremium,
        monthlyRecurringRevenue: calculateMRR(policies)
      },
      timing: {
        averageQuoteToPolicyTime: quoteToPolicyTime,
        seasonalTrends: calculateSeasonalTrends(quotes)
      },
      companyPerformance
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-2">Deep insights into insurance performance metrics</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 1 Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Company</label>
            <select
              value={filters.insuranceCompany}
              onChange={(e) => setFilters(prev => ({ ...prev, insuranceCompany: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Companies</option>
              <option value="ICICI Lombard">ICICI Lombard</option>
              <option value="HDFC Ergo">HDFC Ergo</option>
              <option value="Bajaj Allianz">Bajaj Allianz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Type</label>
            <select
              value={filters.coverageType}
              onChange={(e) => setFilters(prev => ({ ...prev, coverageType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="comprehensive">Comprehensive</option>
              <option value="thirdParty">Third Party</option>
              <option value="standalone">Standalone OD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={filters.vehicleType}
              onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              <option value="new">New Vehicles</option>
              <option value="used">Used Vehicles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <AdvancedMetrics metrics={calculateAdvancedMetrics()} />
      
      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ConversionFunnelChart metrics={calculateAdvancedMetrics()} />
        <RevenueTrendChart data={analyticsData} />
        <CompanyPerformanceChart performance={calculateAdvancedMetrics().companyPerformance} />
        <TimeToConversionChart data={analyticsData} />
      </div>
    </div>
  );
};

// Helper components for advanced analytics
const AdvancedMetrics = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <MetricCard
      title="Overall Conversion"
      value={`${metrics.funnel.overallConversionRate.toFixed(1)}%`}
      description="Quote to Policy"
      trend="up"
    />
    <MetricCard
      title="Avg. Premium"
      value={`₹${(metrics.revenue.averagePremium / 1000).toFixed(0)}K`}
      description="Per Policy"
      trend="neutral"
    />
    <MetricCard
      title="Avg. Time to Convert"
      value={`${metrics.timing.averageQuoteToPolicyTime} days`}
      description="Quote to Policy"
      trend="down"
    />
    <MetricCard
      title="Monthly Revenue"
      value={`₹${(metrics.revenue.monthlyRecurringRevenue / 100000).toFixed(1)}L`}
      description="Recurring"
      trend="up"
    />
  </div>
);

const MetricCard = ({ title, value, description, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <TrendingUp className={`w-5 h-5 ${
        trend === 'up' ? 'text-green-500' : 
        trend === 'down' ? 'text-red-500' : 'text-gray-500'
      }`} />
    </div>
  </div>
);

const ConversionFunnelChart = ({ metrics }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={[
        { stage: 'Quotes Generated', value: metrics.funnel.totalQuotes },
        { stage: 'Quotes Accepted', value: metrics.funnel.acceptedQuotes },
        { stage: 'Policies Issued', value: metrics.funnel.convertedPolicies }
      ]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stage" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Add other chart components similarly...

export default AdvancedAnalytics;