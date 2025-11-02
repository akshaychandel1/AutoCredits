// src/pages/Dashboard/InsuranceDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, FileText, DollarSign, Shield, Download, 
  Filter, Calendar, RefreshCw, Eye, CheckCircle, XCircle,
  AlertCircle
} from 'lucide-react';

const InsuranceDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    quotes: [],
    policies: [],
    payments: [],
    documents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedInsurance, setSelectedInsurance] = useState('all');
  const [stats, setStats] = useState({
    totalQuotes: 0,
    acceptedQuotes: 0,
    conversionRate: 0,
    totalPremium: 0,
    policiesIssued: 0,
    activePolicies: 0
  });

  // API endpoints - using mock data since APIs are not responding correctly
  const API_ENDPOINTS = {
    quotes: 'https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/quotes',
    policies: 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/policies',
    payments: 'https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/payments',
    documents: 'https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/documents',
    payouts: 'https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/payouts'
  };

  // Insurance companies data
  const insuranceCompanies = [
    { name: "ICICI Lombard", color: "#FF6B35" },
    { name: "HDFC Ergo", color: "#2E8B57" },
    { name: "Bajaj Allianz", color: "#0056B3" },
    { name: "New India Assurance", color: "#FF8C00" },
    { name: "United India", color: "#8B4513" },
    { name: "National Insurance", color: "#228B22" },
    { name: "Oriental Insurance", color: "#DC143C" },
    { name: "Tata AIG", color: "#0066CC" },
    { name: "Reliance General", color: "#FF4500" },
    { name: "Cholamandalam", color: "#800080" }
  ];

  // Generate mock data for demonstration
  const generateMockData = () => {
    const mockQuotes = [];
    const mockPolicies = [];
    const mockPayments = [];
    const mockDocuments = [];

    // Generate mock quotes
    for (let i = 0; i < 50; i++) {
      const company = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
      const premium = Math.floor(Math.random() * 50000) + 5000;
      const idv = Math.floor(Math.random() * 1000000) + 500000;
      const accepted = Math.random() > 0.7; // 30% acceptance rate
      
      mockQuotes.push({
        id: `quote_${i}`,
        insuranceCompany: company.name,
        coverageType: ['comprehensive', 'thirdParty', 'standalone'][Math.floor(Math.random() * 3)],
        idv: idv,
        premium: premium,
        totalPremium: premium * 1.18, // Including GST
        ncbDiscount: [0, 20, 25, 35, 45, 50][Math.floor(Math.random() * 6)],
        accepted: accepted,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        policyDuration: "1yr OD + 3yr TP",
        odAmount: premium * 0.7,
        thirdPartyAmount: premium * 0.3
      });
    }

    // Generate mock policies from accepted quotes
    const acceptedQuotes = mockQuotes.filter(q => q.accepted);
    acceptedQuotes.forEach((quote, index) => {
      mockPolicies.push({
        id: `policy_${index}`,
        policy_info: {
          insuranceCompany: quote.insuranceCompany,
          policyNumber: `POL${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          totalPremium: quote.totalPremium,
          policyStartDate: new Date().toISOString(),
          policyType: quote.coverageType,
          ncbDiscount: quote.ncbDiscount,
          idvAmount: quote.idv,
          insuranceDuration: quote.policyDuration
        },
        customer_details: {
          name: `Customer ${index + 1}`,
          mobile: `9${Math.random().toString().substr(2, 9)}`,
          vehicle_details: {
            regNo: `DL${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            make: ['Maruti', 'Hyundai', 'Honda', 'Toyota', 'Tata'][Math.floor(Math.random() * 5)],
            model: ['Swift', 'i20', 'City', 'Innova', 'Nexon'][Math.floor(Math.random() * 5)]
          }
        },
        status: ['draft', 'completed', 'active'][Math.floor(Math.random() * 3)],
        ts: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: "ADMIN123"
      });
    });

    // Generate mock payments
    mockPolicies.forEach((policy, index) => {
      const amount = policy.policy_info.totalPremium;
      mockPayments.push({
        id: `payment_${index}`,
        policyId: policy.id,
        amount: amount,
        status: 'completed',
        paymentDate: new Date().toISOString(),
        paymentMode: ['Cash', 'UPI', 'Card', 'Net Banking'][Math.floor(Math.random() * 4)]
      });
    });

    // Generate mock documents
    mockPolicies.forEach((policy, index) => {
      mockDocuments.push({
        id: `doc_${index}`,
        policyId: policy.id,
        type: 'policy_document',
        url: '#',
        uploadedAt: new Date().toISOString()
      });
    });

    return {
      quotes: mockQuotes,
      policies: mockPolicies,
      payments: mockPayments,
      documents: mockDocuments
    };
  };

  // Fetch all data with error handling
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from APIs first, fall back to mock data if APIs fail
      let quotesData = [];
      let policiesData = [];
      let paymentsData = [];
      let documentsData = [];

      try {
        const policiesRes = await fetch(API_ENDPOINTS.policies);
        if (policiesRes.ok) {
          const policiesResult = await policiesRes.json();
          policiesData = policiesResult.data || [];
        } else {
          throw new Error('Policies API not available');
        }
      } catch (policiesError) {
        console.log('Using mock data for policies');
        const mockData = generateMockData();
        quotesData = mockData.quotes;
        policiesData = mockData.policies;
        paymentsData = mockData.payments;
        documentsData = mockData.documents;
      }

      setDashboardData({
        quotes: quotesData,
        policies: policiesData,
        payments: paymentsData,
        documents: documentsData
      });

      calculateStats(quotesData, policiesData, paymentsData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Unable to load live data. Showing demo data.');
      // Fallback to mock data
      const mockData = generateMockData();
      setDashboardData(mockData);
      calculateStats(mockData.quotes, mockData.policies, mockData.payments);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (quotes, policies, payments) => {
    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(quote => quote.accepted).length;
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    
    const totalPremium = policies.reduce((sum, policy) => 
      sum + (parseFloat(policy.policy_info?.totalPremium) || 0), 0
    );
    
    const policiesIssued = policies.length;
    const activePolicies = policies.filter(policy => 
      policy.status === 'completed' || policy.status === 'active'
    ).length;

    setStats({
      totalQuotes,
      acceptedQuotes,
      conversionRate,
      totalPremium,
      policiesIssued,
      activePolicies
    });
  };

  // Filter data based on selected filters
  const getFilteredData = () => {
    let filteredQuotes = [...dashboardData.quotes];
    let filteredPolicies = [...dashboardData.policies];

    // Filter by insurance company
    if (selectedInsurance !== 'all') {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.insuranceCompany === selectedInsurance
      );
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.policy_info?.insuranceCompany === selectedInsurance
      );
    }

    // Filter by time range
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        filterDate.setFullYear(now.getFullYear() - 1);
    }

    filteredQuotes = filteredQuotes.filter(quote => 
      new Date(quote.createdAt) >= filterDate
    );
    filteredPolicies = filteredPolicies.filter(policy =>
      new Date(policy.ts) >= filterDate
    );

    return { filteredQuotes, filteredPolicies };
  };

  // Prepare chart data
  const getChartData = () => {
    const { filteredQuotes, filteredPolicies } = getFilteredData();

    // Quotes by company
    const quotesByCompany = insuranceCompanies.map(company => {
      const count = filteredQuotes.filter(quote => 
        quote.insuranceCompany === company.name
      ).length;
      return { name: company.name, quotes: count, color: company.color };
    }).filter(item => item.quotes > 0);

    // Accepted quotes by company
    const acceptedByCompany = insuranceCompanies.map(company => {
      const accepted = filteredQuotes.filter(quote => 
        quote.insuranceCompany === company.name && quote.accepted
      ).length;
      const total = filteredQuotes.filter(quote => 
        quote.insuranceCompany === company.name
      ).length;
      const rate = total > 0 ? (accepted / total) * 100 : 0;
      
      return { 
        name: company.name, 
        accepted, 
        total, 
        rate: Math.round(rate * 100) / 100,
        color: company.color 
      };
    }).filter(item => item.total > 0);

    // Policies by company
    const policiesByCompany = insuranceCompanies.map(company => {
      const count = filteredPolicies.filter(policy =>
        policy.policy_info?.insuranceCompany === company.name
      ).length;
      return { name: company.name, policies: count, color: company.color };
    }).filter(item => item.policies > 0);

    // Monthly trends
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach((month, index) => {
      const monthQuotes = filteredQuotes.filter(quote => 
        new Date(quote.createdAt).getMonth() === index
      ).length;
      
      const monthPolicies = filteredPolicies.filter(policy =>
        new Date(policy.ts).getMonth() === index
      ).length;

      monthlyData.push({
        month,
        quotes: monthQuotes,
        policies: monthPolicies
      });
    });

    return {
      quotesByCompany,
      acceptedByCompany,
      policiesByCompany,
      monthlyData
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const { filteredQuotes, filteredPolicies } = getFilteredData();
  const chartData = getChartData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AutoCredit Insurance Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of insurance quotes and policies</p>
            {error && (
              <div className="flex items-center gap-2 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700 text-sm">{error}</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last 1 Year</option>
            </select>
            
            <select
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Insurance Companies</option>
              {insuranceCompanies.map(company => (
                <option key={company.name} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Quotes"
          value={stats.totalQuotes}
          change={`${filteredQuotes.length} filtered`}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Accepted Quotes"
          value={stats.acceptedQuotes}
          change={`${Math.round(stats.conversionRate)}% conversion`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Premium"
          value={`₹${(stats.totalPremium / 100000).toFixed(1)}L`}
          change="All policies"
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Active Policies"
          value={stats.activePolicies}
          change={`${stats.policiesIssued} total issued`}
          icon={<Shield className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quotes by Company */}
        <ChartCard title="Quotes by Insurance Company">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.quotesByCompany}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quotes" name="Quotes Generated">
                {chartData.quotesByCompany.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Acceptance Rate by Company */}
        <ChartCard title="Quote Acceptance Rate by Company">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.acceptedByCompany}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => 
                  name === 'rate' ? [`${value}%`, 'Acceptance Rate'] : [value, name]
                }
              />
              <Legend />
              <Bar dataKey="rate" name="Acceptance Rate %">
                {chartData.acceptedByCompany.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Policies by Company */}
        <ChartCard title="Policies Issued by Company">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.policiesByCompany}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="policies"
              >
                {chartData.policiesByCompany.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Trends */}
        <ChartCard title="Monthly Trends - Quotes vs Policies">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="quotes" stackId="1" stroke="#8884d8" fill="#8884d8" name="Quotes" />
              <Area type="monotone" dataKey="policies" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Policies" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accepted Quotes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Accepted Quotes</h3>
            <Eye className="w-5 h-5 text-gray-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Company</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Premium</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">IDV</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">NCB</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes
                  .filter(quote => quote.accepted)
                  .slice(0, 5)
                  .map((quote, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: insuranceCompanies.find(c => c.name === quote.insuranceCompany)?.color || '#ccc'
                            }}
                          />
                          <span className="font-medium text-sm">{quote.insuranceCompany}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm">₹{quote.totalPremium?.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-sm">₹{quote.idv?.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-sm">{quote.ncbDiscount}%</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Accepted
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insurance Company Performance</h3>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Company</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Quotes</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Accepted</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Rate</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Policies</th>
                </tr>
              </thead>
              <tbody>
                {chartData.acceptedByCompany
                  .sort((a, b) => b.rate - a.rate)
                  .map((company, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: company.color }}
                          />
                          <span className="font-medium text-sm">{company.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm">{company.total}</td>
                      <td className="py-3 text-sm">{company.accepted}</td>
                      <td className="py-3 text-sm">
                        <span className={`font-medium ${
                          company.rate >= 50 ? 'text-green-600' : 
                          company.rate >= 30 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {company.rate}%
                        </span>
                      </td>
                      <td className="py-3 text-sm">
                        {chartData.policiesByCompany.find(p => p.name === company.name)?.policies || 0}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-blue-800">Overall Conversion Rate</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartData.acceptedByCompany.length > 0 ? 
                chartData.acceptedByCompany.reduce((max, company) => 
                  company.rate > max.rate ? company : max
                ).name : 'No data'
              }
            </div>
            <div className="text-sm text-green-800">Best Performing Company</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ₹{(stats.totalPremium / Math.max(stats.policiesIssued, 1)).toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-purple-800">Average Policy Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Chart Card Component
const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default InsuranceDashboard;