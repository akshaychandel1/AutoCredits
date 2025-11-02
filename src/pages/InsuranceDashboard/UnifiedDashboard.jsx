// src/pages/Dashboard/UnifiedDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart, Scatter,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, Users, FileText, DollarSign, Shield, Download, 
  Filter, Calendar, RefreshCw, Eye, CheckCircle, XCircle,
  AlertCircle, BarChart3, PieChart as PieChartIcon, Activity,
  Car, User, Building, History, Sparkles, Target, Award,
  Clock, Zap, ChevronDown, ChevronUp, Crown, Star, ArrowUpRight,
  ArrowDownRight, CreditCard, FileCheck, Percent, BarChart4
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1";

// Enhanced Indian Number Formatting System
const formatIndianNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  
  const number = Number(num);
  if (number === 0) return '0';
  
  if (number < 1000) {
    return number.toString();
  }
  
  if (number < 100000) {
    return '₹' + (number / 1000).toFixed(1) + 'K';
  }
  
  if (number < 10000000) {
    return '₹' + (number / 100000).toFixed(1) + 'L';
  }
  
  return '₹' + (number / 10000000).toFixed(1) + 'Cr';
};

const formatCompactNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const number = Number(num);
  
  if (number < 1000) return number.toString();
  if (number < 100000) return (number / 1000).toFixed(1) + 'K';
  if (number < 10000000) return (number / 100000).toFixed(1) + 'L';
  return (number / 10000000).toFixed(1) + 'Cr';
};

// Enhanced Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, type = 'default' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xl backdrop-blur-sm bg-white/95">
        <p className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: entry.color }}>
                {entry.dataKey?.includes('revenue') || entry.dataKey?.includes('premium') || entry.dataKey?.includes('amount') ? 
                  formatIndianNumber(entry.value) : 
                  type === 'percentage' ? `${entry.value}%` : formatCompactNumber(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Label for Pie Charts
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-bold drop-shadow-lg"
      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
    >
      {name.length > 12 ? name.substring(0, 10) + '...' : name}
    </text>
  );
};

// Enhanced Radial Label for Donut Charts
const renderRadialLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Enhanced status configurations - MOVED OUTSIDE COMPONENT
const statusConfig = {
  active: { 
    text: 'Active', 
    class: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200',
    icon: CheckCircle,
    color: '#10B981'
  },
  completed: { 
    text: 'Completed', 
    class: 'bg-blue-500/10 text-blue-700 border border-blue-200',
    icon: CheckCircle,
    color: '#3B82F6'
  },
  draft: { 
    text: 'Draft', 
    class: 'bg-amber-500/10 text-amber-700 border border-amber-200',
    icon: Clock,
    color: '#F59E0B'
  },
  pending: { 
    text: 'Pending', 
    class: 'bg-purple-500/10 text-purple-700 border border-purple-200',
    icon: Clock,
    color: '#8B5CF6'
  },
  expired: { 
    text: 'Expired', 
    class: 'bg-rose-500/10 text-rose-700 border border-rose-200',
    icon: AlertCircle,
    color: '#EF4444'
  },
  'payment completed': {
    text: 'Payment Completed',
    class: 'bg-green-500/10 text-green-700 border border-green-200',
    icon: CheckCircle,
    color: '#10B981'
  }
};

// Enhanced payment status configurations - MOVED OUTSIDE COMPONENT
const paymentStatusConfig = {
  'fully paid': {
    text: 'Fully Paid',
    class: 'bg-green-500/10 text-green-700 border border-green-200',
    icon: CheckCircle,
    color: '#10B981'
  },
  'partially paid': {
    text: 'Partially Paid',
    class: 'bg-yellow-500/10 text-yellow-700 border border-yellow-200',
    icon: DollarSign,
    color: '#F59E0B'
  },
  'pending': {
    text: 'Payment Pending',
    class: 'bg-red-500/10 text-red-700 border border-red-200',
    icon: Clock,
    color: '#EF4444'
  }
};

// Insurance companies data - MOVED OUTSIDE COMPONENT
const insuranceCompanies = [
  { 
    name: "ICICI Lombard", 
    color: "#FF6B35", 
    gradient: "linear-gradient(135deg, #FF6B35, #FF8E53)",
    lightColor: "#FFF5F0"
  },
  { 
    name: "HDFC Ergo", 
    color: "#2E8B57", 
    gradient: "linear-gradient(135deg, #2E8B57, #3CB371)",
    lightColor: "#F0FFF4"
  },
  { 
    name: "Bajaj Allianz", 
    color: "#0056B3", 
    gradient: "linear-gradient(135deg, #0056B3, #1E90FF)",
    lightColor: "#F0F8FF"
  },
  { 
    name: "New India Assurance", 
    color: "#FF8C00", 
    gradient: "linear-gradient(135deg, #FF8C00, #FFA500)",
    lightColor: "#FFFBF0"
  },
  { 
    name: "United India", 
    color: "#8B4513", 
    gradient: "linear-gradient(135deg, #8B4513, #A0522D)",
    lightColor: "#FDF6F0"
  },
  { 
    name: "National Insurance", 
    color: "#228B22", 
    gradient: "linear-gradient(135deg, #228B22, #32CD32)",
    lightColor: "#F0FFF0"
  },
  { 
    name: "Oriental Insurance", 
    color: "#DC143C", 
    gradient: "linear-gradient(135deg, #DC143C, #FF4500)",
    lightColor: "#FFF0F0"
  },
  { 
    name: "Tata AIG", 
    color: "#0066CC", 
    gradient: "linear-gradient(135deg, #0066CC, #0080FF)",
    lightColor: "#F0F8FF"
  },
  { 
    name: "Reliance General", 
    color: "#FF4500", 
    gradient: "linear-gradient(135deg, #FF4500, #FF6347)",
    lightColor: "#FFF5F0"
  },
  { 
    name: "Cholamandalam", 
    color: "#800080", 
    gradient: "linear-gradient(135deg, #800080, #9932CC)",
    lightColor: "#F8F0FF"
  }
];

// Beautiful color palettes with enhanced gradients - MOVED OUTSIDE COMPONENT
const chartColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  gradient: {
    blue: ['#3B82F6', '#60A5FA', '#93C5FD'],
    green: ['#10B981', '#34D399', '#6EE7B7'],
    purple: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
    orange: ['#F59E0B', '#FBBF24', '#FCD34D'],
    red: ['#EF4444', '#F87171', '#FCA5A5'],
    indigo: ['#6366F1', '#818CF8', '#A5B4FC']
  }
};

// Enhanced Table Card Component - MOVED BEFORE MAIN COMPONENT
const EnhancedTableCard = ({ title, subtitle, data, type }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <Eye className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="space-y-3">
        {type === 'kpis' ? (
          data.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-700 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <div className="text-lg font-bold text-blue-600">{item.value}</div>
            </div>
          ))
        ) : type === 'companies' ? (
          data.map((company, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: company.color }}
                />
                <span className="font-medium text-sm text-gray-900">{company.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 text-sm">
                  ₹{(company.revenue / 1000).toFixed(0)}K
                </div>
                <div className={`text-xs font-medium ${
                  company.conversionRate >= 50 ? 'text-green-600' : 
                  company.conversionRate >= 30 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {company.conversionRate}%
                </div>
              </div>
            </div>
          ))
        ) : (
          data.map((policy, index) => {
            const customer = policy.customer_details || {};
            const statusDisplay = policy.status ? 
              (statusConfig[policy.status] || { text: policy.status, class: 'bg-gray-100 text-gray-800' }) : 
              { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {policy.buyer_type === 'corporate' ? 
                      (customer.companyName || customer.contactPersonName || 'N/A') : 
                      (customer.name || 'N/A')
                    }
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {policy.vehicle_details?.make} {policy.vehicle_details?.model} • 
                    {policy.vehicleType === 'new' ? ' New' : ' Used'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-sm">
                    ₹{(
                      policy.policy_info?.totalPremium || 
                      policy.insurance_quote?.premium || 
                      0
                    ).toLocaleString('en-IN')}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusDisplay.class}`}>
                    {statusDisplay.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Enhanced Summary Card Component
const EnhancedSummaryCard = ({ title, value, total, icon, color, trend, change }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const trendIcons = {
    up: <ArrowUpRight className="w-4 h-4 text-green-500" />,
    down: <ArrowDownRight className="w-4 h-4 text-red-500" />
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {total && (
              <p className="text-sm text-gray-500">/ {total}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {trendIcons[trend]}
            <p className="text-xs text-gray-500">{change}</p>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const EnhancedStatCard = ({ title, value, change, icon, color, trend, percentage, percentageLabel }) => {
  const colorClasses = {
    blue: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600', 
      iconBg: 'bg-blue-100',
      percentageBg: 'bg-blue-500/10',
      percentageText: 'text-blue-700'
    },
    green: { 
      bg: 'bg-green-50', 
      text: 'text-green-600', 
      iconBg: 'bg-green-100',
      percentageBg: 'bg-green-500/10',
      percentageText: 'text-green-700'
    },
    purple: { 
      bg: 'bg-purple-50', 
      text: 'text-purple-600', 
      iconBg: 'bg-purple-100',
      percentageBg: 'bg-purple-500/10',
      percentageText: 'text-purple-700'
    },
    orange: { 
      bg: 'bg-orange-50', 
      text: 'text-orange-600', 
      iconBg: 'bg-orange-100',
      percentageBg: 'bg-orange-500/10',
      percentageText: 'text-orange-700'
    },
    indigo: { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      iconBg: 'bg-indigo-100',
      percentageBg: 'bg-indigo-500/10',
      percentageText: 'text-indigo-700'
    }
  };

  const trendIcons = {
    up: <ArrowUpRight className="w-4 h-4 text-green-500" />,
    down: <ArrowDownRight className="w-4 h-4 text-red-500" />,
    stable: <div className="w-4 h-4 text-gray-500">•</div>
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].iconBg} ${colorClasses[color].text} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-gray-500">
          {trendIcons[trend]}
          <span>{change}</span>
        </div>
      </div>
      
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-3">{value}</p>
      
      {percentage !== undefined && (
        <div className="flex items-center justify-between">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${colorClasses[color].percentageBg} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <span className={`text-xs font-semibold ml-2 ${colorClasses[color].percentageText}`}>
            {percentageLabel}
          </span>
        </div>
      )}
    </div>
  );
};

// Enhanced Chart Card Component
const EnhancedChartCard = ({ title, subtitle, icon, action, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        {action && (
          <div className="flex gap-2">
            {action}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

// Summary Highlight Component
const SummaryHighlight = ({ value, label, description, color, icon }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className={`text-center p-6 bg-gradient-to-br rounded-2xl border shadow-sm ${colorClasses[color]}`}>
      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-white flex items-center justify-center ${iconColors[color]} shadow-sm`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-sm font-medium text-gray-800 mb-1">{label}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </div>
  );
};

// Main UnifiedDashboard Component
const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    policies: [],
    quotes: [],
    payments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedInsurance, setSelectedInsurance] = useState('all');
  const [filters, setFilters] = useState({
    coverageType: 'all',
    vehicleType: 'all',
    buyerType: 'all',
    policyStatus: 'all'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});

  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    totalRevenue: 0,
    averagePremium: 0,
    totalQuotes: 0,
    conversionRate: 0,
    renewalRate: 0,
    totalCustomers: 0,
    corporateCustomers: 0,
    individualCustomers: 0
  });

  // Animation for number counting
  const animateValue = (start, end, duration, key) => {
    const startTime = performance.now();
    
    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(start + (end - start) * easeOutQuart);
      
      setAnimatedValues(prev => ({
        ...prev,
        [key]: currentValue
      }));
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };
    
    requestAnimationFrame(updateValue);
  };

  // Enhanced data fetching with error handling and animations
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      console.log('📊 Fetching dashboard data from APIs...');
      
      const [policiesResponse, quotesResponse, paymentsResponse] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/policies`),
        axios.get(`${API_BASE_URL}/quotes`),
        axios.get(`${API_BASE_URL}/payments`)
      ]);

      const policiesData = policiesResponse.status === 'fulfilled' 
        ? (policiesResponse.value.data?.data || []) 
        : [];
      
      const quotesData = quotesResponse.status === 'fulfilled' 
        ? (quotesResponse.value.data?.data || []) 
        : [];
      
      const paymentsData = paymentsResponse.status === 'fulfilled' 
        ? (paymentsResponse.value.data?.data || []) 
        : [];

      console.log(`✅ Fetched: ${policiesData.length} policies, ${quotesData.length} quotes, ${paymentsData.length} payments`);

      setDashboardData({
        policies: policiesData,
        quotes: quotesData,
        payments: paymentsData
      });

      calculateStats(policiesData, quotesData, paymentsData);
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Unable to load live data. Please check your connection and try again.');
      
      setDashboardData({
        policies: [],
        quotes: [],
        payments: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Enhanced statistics calculation with customer segmentation
  const calculateStats = (policies, quotes, payments) => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(policy => 
      policy.status === 'active' || policy.status === 'completed'
    ).length;

    // Calculate total revenue from payments
    const totalRevenue = payments.reduce((sum, payment) => 
      sum + (parseFloat(payment.amount) || 0), 0
    );

    // Calculate total premium from policies
    const totalPremium = policies.reduce((sum, policy) => {
      const premium = policy.policy_info?.totalPremium || 
                     policy.insurance_quote?.premium || 0;
      return sum + (parseFloat(premium) || 0);
    }, 0);

    const averagePremium = totalPolicies > 0 ? totalPremium / totalPolicies : 0;
    
    const totalQuotes = quotes.length;
    
    // Calculate conversion rate (quotes to policies)
    const convertedQuotes = quotes.filter(quote => 
      quote.accepted === true
    ).length;
    const conversionRate = totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0;

    // Calculate renewal rate
    const renewalPolicies = policies.filter(policy => 
      policy.isRenewal === true
    ).length;
    const renewalRate = totalPolicies > 0 ? (renewalPolicies / totalPolicies) * 100 : 0;

    // Customer segmentation
    const corporateCustomers = policies.filter(policy => 
      policy.buyer_type === 'corporate'
    ).length;
    const individualCustomers = policies.filter(policy => 
      policy.buyer_type === 'individual'
    ).length;

    const newStats = {
      totalPolicies,
      activePolicies,
      totalRevenue,
      averagePremium,
      totalQuotes,
      conversionRate,
      renewalRate,
      totalCustomers: policies.length,
      corporateCustomers,
      individualCustomers
    };

    setStats(newStats);

    // Animate the values
    Object.keys(newStats).forEach(key => {
      animateValue(0, newStats[key], 1500, key);
    });
  };

  // Enhanced data filtering with more options
  const getFilteredData = () => {
    let filteredPolicies = [...dashboardData.policies];
    let filteredQuotes = [...dashboardData.quotes];

    // Filter by insurance company
    if (selectedInsurance !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.policy_info?.insuranceCompany === selectedInsurance ||
        policy.insurance_quote?.insurer === selectedInsurance
      );
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.insuranceCompany === selectedInsurance
      );
    }

    // Filter by coverage type
    if (filters.coverageType !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.policy_info?.policyType === filters.coverageType ||
        policy.insurance_quote?.coverageType === filters.coverageType
      );
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.coverageType === filters.coverageType
      );
    }

    // Filter by vehicle type
    if (filters.vehicleType !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.vehicleType === filters.vehicleType
      );
    }

    // Filter by buyer type
    if (filters.buyerType !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.buyer_type === filters.buyerType
      );
    }

    // Filter by policy status
    if (filters.policyStatus !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.status === filters.policyStatus
      );
    }

    // Enhanced time range filtering
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
      case '6months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      default:
        filterDate.setFullYear(now.getFullYear() - 1);
    }

    filteredPolicies = filteredPolicies.filter(policy => 
      new Date(policy.ts || policy.created_at) >= filterDate
    );
    filteredQuotes = filteredQuotes.filter(quote =>
      new Date(quote.createdAt || quote.ts) >= filterDate
    );

    return { filteredPolicies, filteredQuotes };
  };

  // Enhanced advanced analytics with more metrics
  const calculateAdvancedMetrics = () => {
    const { filteredPolicies, filteredQuotes } = getFilteredData();
    
    // Enhanced status distribution
    const statusDistribution = {
      active: filteredPolicies.filter(p => p.status === 'active').length,
      completed: filteredPolicies.filter(p => p.status === 'completed').length,
      draft: filteredPolicies.filter(p => p.status === 'draft').length,
      pending: filteredPolicies.filter(p => p.status === 'pending').length,
      expired: filteredPolicies.filter(p => p.status === 'expired').length,
      'payment completed': filteredPolicies.filter(p => p.status === 'payment completed').length
    };

    // Vehicle type distribution
    const vehicleTypeDistribution = {
      new: filteredPolicies.filter(p => p.vehicleType === 'new').length,
      used: filteredPolicies.filter(p => p.vehicleType === 'used').length
    };

    // Buyer type distribution
    const buyerTypeDistribution = {
      individual: filteredPolicies.filter(p => p.buyer_type === 'individual').length,
      corporate: filteredPolicies.filter(p => p.buyer_type === 'corporate').length
    };

    // Enhanced revenue metrics
    const totalRevenue = filteredPolicies.reduce((sum, policy) => {
      const premium = policy.policy_info?.totalPremium || 
                     policy.insurance_quote?.premium || 0;
      return sum + (parseFloat(premium) || 0);
    }, 0);

    const monthlyRevenue = totalRevenue / (timeRange === '7days' ? 0.23 : 
                          timeRange === '30days' ? 1 : 
                          timeRange === '90days' ? 3 : 12);

    // Enhanced renewal metrics
    const renewalPolicies = filteredPolicies.filter(p => p.isRenewal === true).length;
    const newPolicies = filteredPolicies.filter(p => !p.isRenewal).length;

    // Payment metrics
    const totalPayments = dashboardData.payments.length;
    const successfulPayments = dashboardData.payments.filter(p => p.status === 'success').length;
    const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      statusDistribution,
      vehicleTypeDistribution,
      buyerTypeDistribution,
      revenue: {
        totalRevenue,
        monthlyRevenue,
        averageRevenuePerPolicy: filteredPolicies.length > 0 ? totalRevenue / filteredPolicies.length : 0,
        projectedAnnualRevenue: monthlyRevenue * 12
      },
      renewal: {
        renewalPolicies,
        newPolicies,
        renewalRate: filteredPolicies.length > 0 ? (renewalPolicies / filteredPolicies.length) * 100 : 0
      },
      payments: {
        totalPayments,
        successfulPayments,
        paymentSuccessRate
      }
    };
  };

  // Enhanced chart data preparation
  const getChartData = () => {
    const { filteredPolicies, filteredQuotes } = getFilteredData();
    const advancedMetrics = calculateAdvancedMetrics();

    console.log('📈 Preparing chart data from', filteredPolicies.length, 'policies and', filteredQuotes.length, 'quotes');

    // Enhanced policies by company with revenue
    const policiesByCompany = insuranceCompanies.map(company => {
      const companyPolicies = filteredPolicies.filter(policy => 
        policy.policy_info?.insuranceCompany === company.name ||
        policy.insurance_quote?.insurer === company.name
      );
      
      const count = companyPolicies.length;
      const revenue = companyPolicies.reduce((sum, policy) => {
        const premium = policy.policy_info?.totalPremium || 
                       policy.insurance_quote?.premium || 0;
        return sum + (parseFloat(premium) || 0);
      }, 0);

      return { 
        name: company.name, 
        policies: count,
        revenue: revenue,
        color: company.color,
        gradient: company.gradient,
        lightColor: company.lightColor
      };
    }).filter(item => item.policies > 0);

    // Enhanced quotes by company with conversion data
    const quotesByCompany = insuranceCompanies.map(company => {
      const companyQuotes = filteredQuotes.filter(quote => 
        quote.insuranceCompany === company.name
      );
      
      const count = companyQuotes.length;
      const acceptedQuotes = companyQuotes.filter(q => q.accepted === true).length;
      const conversionRate = count > 0 ? (acceptedQuotes / count) * 100 : 0;

      return { 
        name: company.name, 
        quotes: count,
        accepted: acceptedQuotes,
        conversionRate: conversionRate,
        color: company.color 
      };
    }).filter(item => item.quotes > 0);

    // Enhanced performance metrics by company
    const performanceByCompany = insuranceCompanies.map(company => {
      const companyPolicies = filteredPolicies.filter(policy =>
        policy.policy_info?.insuranceCompany === company.name ||
        policy.insurance_quote?.insurer === company.name
      );
      
      const companyQuotes = filteredQuotes.filter(quote => 
        quote.insuranceCompany === company.name
      );
      
      const acceptedQuotes = companyQuotes.filter(q => q.accepted === true).length;
      const conversionRate = companyQuotes.length > 0 ? (acceptedQuotes / companyQuotes.length) * 100 : 0;
      
      const revenue = companyPolicies.reduce((sum, policy) => {
        const premium = policy.policy_info?.totalPremium || 
                       policy.insurance_quote?.premium || 0;
        return sum + (parseFloat(premium) || 0);
      }, 0);

      const averagePremium = companyPolicies.length > 0 ? revenue / companyPolicies.length : 0;

      return {
        name: company.name,
        policies: companyPolicies.length,
        quotes: companyQuotes.length,
        accepted: acceptedQuotes,
        conversionRate: Math.round(conversionRate * 100) / 100,
        revenue: revenue,
        averagePremium: averagePremium,
        color: company.color,
        gradient: company.gradient
      };
    }).filter(item => item.policies > 0 || item.quotes > 0);

    // Enhanced monthly trends with more data points
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach((month, index) => {
      const monthPolicies = filteredPolicies.filter(policy => {
        const policyDate = new Date(policy.ts || policy.created_at);
        return policyDate.getMonth() === index;
      });
      
      const monthQuotes = filteredQuotes.filter(quote => {
        const quoteDate = new Date(quote.createdAt || quote.ts);
        return quoteDate.getMonth() === index;
      });

      const monthRevenue = monthPolicies.reduce((sum, policy) => {
        const premium = policy.policy_info?.totalPremium || 
                       policy.insurance_quote?.premium || 0;
        return sum + (parseFloat(premium) || 0);
      }, 0);

      const activePolicies = monthPolicies.filter(p => 
        p.status === 'active' || p.status === 'completed'
      ).length;

      monthlyData.push({
        month,
        policies: monthPolicies.length,
        quotes: monthQuotes.length,
        revenue: monthRevenue,
        activePolicies: activePolicies,
        conversionRate: monthQuotes.length > 0 ? 
          (monthPolicies.length / monthQuotes.length) * 100 : 0
      });
    });

    // Enhanced coverage type distribution
    const coverageDistribution = [
      { 
        name: 'Comprehensive', 
        value: filteredPolicies.filter(p => 
          p.policy_info?.policyType === 'comprehensive' ||
          p.insurance_quote?.coverageType === 'comprehensive'
        ).length,
        color: chartColors.gradient.blue[0]
      },
      { 
        name: 'Third Party', 
        value: filteredPolicies.filter(p => 
          p.policy_info?.policyType === 'thirdParty' ||
          p.insurance_quote?.coverageType === 'thirdParty'
        ).length,
        color: chartColors.gradient.green[0]
      },
      { 
        name: 'Standalone OD', 
        value: filteredPolicies.filter(p => 
          p.policy_info?.policyType === 'standalone' ||
          p.insurance_quote?.coverageType === 'standalone'
        ).length,
        color: chartColors.gradient.purple[0]
      }
    ].filter(item => item.value > 0);

    // Enhanced status distribution for pie chart
    const statusDistributionData = Object.entries(advancedMetrics.statusDistribution)
      .map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusConfig[status]?.color || chartColors.primary
      }))
      .filter(item => item.value > 0);

    // Enhanced vehicle type distribution
    const vehicleTypeData = Object.entries(advancedMetrics.vehicleTypeDistribution)
      .map(([type, count]) => ({
        name: type === 'new' ? 'New Vehicles' : 'Used Vehicles',
        value: count,
        color: type === 'new' ? chartColors.success : chartColors.info
      }))
      .filter(item => item.value > 0);

    // Enhanced buyer type distribution
    const buyerTypeData = Object.entries(advancedMetrics.buyerTypeDistribution)
      .map(([type, count]) => ({
        name: type === 'individual' ? 'Individual' : 'Corporate',
        value: count,
        color: type === 'individual' ? chartColors.primary : chartColors.accent
      }))
      .filter(item => item.value > 0);

    // Payment status distribution
    const paymentStatusData = filteredPolicies.map(policy => {
      const components = calculatePaymentComponents(policy, policy.payment_ledger || []);
      return components.paymentProgress === 100 ? 'fully paid' :
             components.paymentProgress > 0 ? 'partially paid' : 'pending';
    }).reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const paymentDistributionData = Object.entries(paymentStatusData).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: count,
      color: paymentStatusConfig[status]?.color || chartColors.primary
    }));

    return {
      policiesByCompany,
      quotesByCompany,
      performanceByCompany,
      monthlyData,
      coverageDistribution,
      statusDistribution: statusDistributionData,
      vehicleTypeDistribution: vehicleTypeData,
      buyerTypeDistribution: buyerTypeData,
      paymentDistribution: paymentDistributionData,
      advancedMetrics
    };
  };

  // Calculate payment components (from your PolicyTable)
  const calculatePaymentComponents = (policy, paymentLedger = []) => {
    const totalPremium = policy.policy_info?.totalPremium || policy.insurance_quote?.premium || 0;
    
    const subventionRefundAmount = paymentLedger
      .filter(payment => payment.type === "subvention_refund")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const customerPaidAmount = paymentLedger
      .filter(payment => 
        payment.paymentMadeBy === "Customer" && 
        payment.type !== "subvention_refund" &&
        !payment.mode?.toLowerCase().includes('subvention') &&
        !payment.description?.toLowerCase().includes('subvention refund')
      )
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const effectivePayable = Math.max(totalPremium - subventionRefundAmount, 0);
    const remainingCustomerAmount = Math.max(effectivePayable - customerPaidAmount, 0);
    const paymentProgress = effectivePayable > 0 
      ? Math.min((customerPaidAmount / effectivePayable) * 100, 100)
      : 100;

    const hasCustomerPayments = customerPaidAmount > 0;
    const hasInHousePayments = paymentLedger.some(payment => payment.paymentMadeBy === "In House");
    const paymentMadeBy = hasInHousePayments ? 'In House' : 
                         hasCustomerPayments ? 'Customer' : 'Not Paid';

    const autoCreditEntry = paymentLedger.find(payment => payment.type === "auto_credit");
    const autoCreditAmount = autoCreditEntry ? autoCreditEntry.amount : 0;

    return {
      totalPremium,
      subventionRefundAmount,
      customerPaidAmount,
      remainingCustomerAmount,
      effectivePayable,
      paymentProgress,
      paymentMadeBy,
      hasInHousePayments,
      totalCustomerPayments: customerPaidAmount,
      autoCreditAmount,
      netPremiumAfterDiscounts: effectivePayable
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const { filteredPolicies, filteredQuotes } = getFilteredData();
  const chartData = getChartData();
  const advancedMetrics = calculateAdvancedMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
            <Sparkles className="w-8 h-8 text-blue-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-gray-700 font-medium text-lg mb-2">Loading Dashboard</p>
          <p className="text-gray-500 text-sm">Fetching real-time insurance data...</p>
          <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutoCredit Analytics
                </h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Live data from insurance APIs • Real-time insights • Updated just now
                </p>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-3 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl max-w-2xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Connection Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {dashboardData.policies.length === 0 && !loading && (
              <div className="flex items-center gap-3 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-2xl">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-blue-700 font-medium">No Data Available</p>
                  <p className="text-blue-600 text-sm">Please check your API endpoints and try again.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-w-[140px]"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last 1 Year</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={selectedInsurance}
                onChange={(e) => setSelectedInsurance(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm min-w-[180px]"
              >
                <option value="all">All Insurance Companies</option>
                {insuranceCompanies.map(company => (
                  <option key={company.name} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 min-w-[120px] justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Data Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <EnhancedSummaryCard
          title="Total Policies"
          value={animatedValues.totalPolicies || 0}
          total={dashboardData.policies.length}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
          trend="+12%"
          change={`${filteredPolicies.length} filtered`}
        />
        <EnhancedSummaryCard
          title="Total Quotes"
          value={animatedValues.totalQuotes || 0}
          total={dashboardData.quotes.length}
          icon={<FileCheck className="w-5 h-5" />}
          color="green"
          trend="+8%"
          change={`${filteredQuotes.length} filtered`}
        />
        <EnhancedSummaryCard
          title="Total Revenue"
          value={formatIndianNumber(animatedValues.totalRevenue || 0)}
          total={formatIndianNumber(stats.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
          trend="+15%"
          change="All policies"
        />
        <EnhancedSummaryCard
          title="Active Insurers"
          value={insuranceCompanies.filter(company => 
            dashboardData.policies.some(policy => 
              policy.policy_info?.insuranceCompany === company.name ||
              policy.insurance_quote?.insurer === company.name
            )
          ).length}
          total={insuranceCompanies.length}
          icon={<Building className="w-5 h-5" />}
          color="orange"
          trend="+2"
          change="Partner companies"
        />
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-2 mb-8">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" />, color: 'blue' },
            { id: 'analytics', label: 'Advanced Analytics', icon: <Activity className="w-4 h-4" />, color: 'green' },
            { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" />, color: 'purple' },
            { id: 'companies', label: 'Insurance Companies', icon: <Building className="w-4 h-4" />, color: 'orange' },
            { id: 'customers', label: 'Customer Insights', icon: <Users className="w-4 h-4" />, color: 'indigo' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/25`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Advanced Filters */}
      {(activeTab === 'analytics' || activeTab === 'performance' || activeTab === 'customers') && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Advanced Filters
            </h3>
            <button
              onClick={() => setFilters({ coverageType: 'all', vehicleType: 'all', buyerType: 'all', policyStatus: 'all' })}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Type</label>
              <select
                value={filters.coverageType}
                onChange={(e) => setFilters(prev => ({ ...prev, coverageType: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Coverage Types</option>
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Vehicle Types</option>
                <option value="new">New Vehicles</option>
                <option value="used">Used Vehicles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Type</label>
              <select
                value={filters.buyerType}
                onChange={(e) => setFilters(prev => ({ ...prev, buyerType: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Buyer Types</option>
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Policy Status</label>
              <select
                value={filters.policyStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, policyStatus: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Results</div>
                <div className="text-sm font-semibold text-gray-900">
                  {filteredPolicies.length} policies
                </div>
                <div className="text-xs text-gray-500">
                  {filteredQuotes.length} quotes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {activeTab === 'overview' && (
          <>
            <EnhancedStatCard
              title="Total Policies"
              value={animatedValues.totalPolicies || 0}
              change={`${filteredPolicies.length} filtered`}
              icon={<FileText className="w-6 h-6" />}
              color="blue"
              trend="up"
              percentage={Math.round((stats.activePolicies / Math.max(stats.totalPolicies, 1)) * 100)}
              percentageLabel="Active"
            />
            <EnhancedStatCard
              title="Active Policies"
              value={animatedValues.activePolicies || 0}
              change={`${Math.round((stats.activePolicies / Math.max(stats.totalPolicies, 1)) * 100)}% active`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
              trend="up"
              percentage={Math.round((stats.activePolicies / Math.max(stats.totalPolicies, 1)) * 100)}
              percentageLabel="Rate"
            />
            <EnhancedStatCard
              title="Total Revenue"
              value={formatIndianNumber(animatedValues.totalRevenue || 0)}
              change="All policies"
              icon={<DollarSign className="w-6 h-6" />}
              color="purple"
              trend="up"
              percentage={Math.round((stats.totalRevenue / Math.max(stats.totalRevenue, 1)) * 100)}
              percentageLabel="Growth"
            />
            <EnhancedStatCard
              title="Avg. Premium"
              value={formatIndianNumber(animatedValues.averagePremium || 0)}
              change="Per policy"
              icon={<Shield className="w-6 h-6" />}
              color="orange"
              trend="stable"
              percentage={Math.round((stats.averagePremium / Math.max(stats.averagePremium, 1)) * 100)}
              percentageLabel="Value"
            />
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <EnhancedStatCard
              title="Total Quotes"
              value={animatedValues.totalQuotes || 0}
              change={`${filteredQuotes.length} filtered`}
              icon={<FileText className="w-6 h-6" />}
              color="blue"
              trend="up"
              percentage={stats.conversionRate}
              percentageLabel="Conversion"
            />
            <EnhancedStatCard
              title="Conversion Rate"
              value={`${stats.conversionRate.toFixed(1)}%`}
              change="Quote to Policy"
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
              trend="up"
              percentage={stats.conversionRate}
              percentageLabel="Rate"
            />
            <EnhancedStatCard
              title="Renewal Rate"
              value={`${stats.renewalRate.toFixed(1)}%`}
              change="Policy renewals"
              icon={<History className="w-6 h-6" />}
              color="purple"
              trend="up"
              percentage={stats.renewalRate}
              percentageLabel="Retention"
            />
            <EnhancedStatCard
              title="Monthly Revenue"
              value={formatIndianNumber(advancedMetrics.revenue.monthlyRevenue)}
              change="Estimated"
              icon={<DollarSign className="w-6 h-6" />}
              color="orange"
              trend="up"
              percentage={Math.round((advancedMetrics.revenue.monthlyRevenue / Math.max(advancedMetrics.revenue.totalRevenue, 1)) * 100)}
              percentageLabel="Monthly"
            />
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <EnhancedStatCard
              title="Individual Buyers"
              value={advancedMetrics.buyerTypeDistribution.individual}
              change={`${Math.round((advancedMetrics.buyerTypeDistribution.individual / Math.max(filteredPolicies.length, 1)) * 100)}%`}
              icon={<User className="w-6 h-6" />}
              color="blue"
              trend="up"
              percentage={Math.round((advancedMetrics.buyerTypeDistribution.individual / Math.max(filteredPolicies.length, 1)) * 100)}
              percentageLabel="Share"
            />
            <EnhancedStatCard
              title="Corporate Buyers"
              value={advancedMetrics.buyerTypeDistribution.corporate}
              change={`${Math.round((advancedMetrics.buyerTypeDistribution.corporate / Math.max(filteredPolicies.length, 1)) * 100)}%`}
              icon={<Building className="w-6 h-6" />}
              color="green"
              trend="up"
              percentage={Math.round((advancedMetrics.buyerTypeDistribution.corporate / Math.max(filteredPolicies.length, 1)) * 100)}
              percentageLabel="Share"
            />
            <EnhancedStatCard
              title="New Vehicles"
              value={advancedMetrics.vehicleTypeDistribution.new}
              change={`${Math.round((advancedMetrics.vehicleTypeDistribution.new / Math.max(filteredPolicies.length, 1)) * 100)}%`}
              icon={<Car className="w-6 h-6" />}
              color="purple"
              trend="up"
              percentage={Math.round((advancedMetrics.vehicleTypeDistribution.new / Math.max(filteredPolicies.length, 1)) * 100)}
              percentageLabel="New Cars"
            />
            <EnhancedStatCard
              title="Used Vehicles"
              value={advancedMetrics.vehicleTypeDistribution.used}
              change={`${Math.round((advancedMetrics.vehicleTypeDistribution.used / Math.max(filteredPolicies.length, 1)) * 100)}%`}
              icon={<Car className="w-6 h-6" />}
              color="orange"
              trend="stable"
              percentage={Math.round((advancedMetrics.vehicleTypeDistribution.used / Math.max(filteredPolicies.length, 1)) * 100)}
              percentageLabel="Used Cars"
            />
          </>
        )}

        {activeTab === 'customers' && (
          <>
            <EnhancedStatCard
              title="Total Customers"
              value={animatedValues.totalCustomers || 0}
              change="All policy holders"
              icon={<Users className="w-6 h-6" />}
              color="blue"
              trend="up"
              percentage={Math.round((stats.totalCustomers / Math.max(stats.totalCustomers, 1)) * 100)}
              percentageLabel="Growth"
            />
            <EnhancedStatCard
              title="Corporate Clients"
              value={stats.corporateCustomers}
              change={`${Math.round((stats.corporateCustomers / Math.max(stats.totalCustomers, 1)) * 100)}% share`}
              icon={<Building className="w-6 h-6" />}
              color="green"
              trend="up"
              percentage={Math.round((stats.corporateCustomers / Math.max(stats.totalCustomers, 1)) * 100)}
              percentageLabel="Corporate"
            />
            <EnhancedStatCard
              title="Individual Clients"
              value={stats.individualCustomers}
              change={`${Math.round((stats.individualCustomers / Math.max(stats.totalCustomers, 1)) * 100)}% share`}
              icon={<User className="w-6 h-6" />}
              color="purple"
              trend="up"
              percentage={Math.round((stats.individualCustomers / Math.max(stats.totalCustomers, 1)) * 100)}
              percentageLabel="Individual"
            />
            <EnhancedStatCard
              title="Payment Success"
              value={`${advancedMetrics.payments.paymentSuccessRate.toFixed(1)}%`}
              change="Successful transactions"
              icon={<CreditCard className="w-6 h-6" />}
              color="orange"
              trend="up"
              percentage={advancedMetrics.payments.paymentSuccessRate}
              percentageLabel="Success Rate"
            />
          </>
        )}

        {activeTab === 'companies' && (
          <>
            <EnhancedStatCard
              title="Partner Companies"
              value={insuranceCompanies.filter(company => 
                dashboardData.policies.some(policy => 
                  policy.policy_info?.insuranceCompany === company.name ||
                  policy.insurance_quote?.insurer === company.name
                )
              ).length}
              change="Active insurers"
              icon={<Building className="w-6 h-6" />}
              color="blue"
              trend="up"
              percentage={Math.round((insuranceCompanies.filter(company => 
                dashboardData.policies.some(policy => 
                  policy.policy_info?.insuranceCompany === company.name ||
                  policy.insurance_quote?.insurer === company.name
                )
              ).length / insuranceCompanies.length) * 100)}
              percentageLabel="Active"
            />
            <EnhancedStatCard
              title="Top Performer"
              value={chartData.performanceByCompany.length > 0 ? 
                chartData.performanceByCompany.reduce((max, company) => 
                  company.revenue > max.revenue ? company : max
                ).name.split(' ')[0] : 'N/A'
              }
              change="Highest revenue"
              icon={<Crown className="w-6 h-6" />}
              color="green"
              trend="up"
              percentage={chartData.performanceByCompany.length > 0 ? 
                Math.round((chartData.performanceByCompany.reduce((max, company) => 
                  company.revenue > max.revenue ? company : max
                ).revenue / Math.max(advancedMetrics.revenue.totalRevenue, 1)) * 100) : 0
              }
              percentageLabel="Market Share"
            />
            <EnhancedStatCard
              title="Best Conversion"
              value={chartData.performanceByCompany.length > 0 ? 
                chartData.performanceByCompany.reduce((max, company) => 
                  company.conversionRate > max.conversionRate ? company : max
                ).name.split(' ')[0] : 'N/A'
              }
              change="Highest conversion rate"
              icon={<TrendingUp className="w-6 h-6" />}
              color="purple"
              trend="up"
              percentage={chartData.performanceByCompany.length > 0 ? 
                chartData.performanceByCompany.reduce((max, company) => 
                  company.conversionRate > max.conversionRate ? company : max
                ).conversionRate : 0
              }
              percentageLabel="Conversion"
            />
            <EnhancedStatCard
              title="Total Quotes"
              value={dashboardData.quotes.length}
              change="All insurance quotes"
              icon={<FileCheck className="w-6 h-6" />}
              color="orange"
              trend="up"
              percentage={stats.conversionRate}
              percentageLabel="Converted"
            />
          </>
        )}
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Overview Tab Charts */}
        {activeTab === 'overview' && (
          <>
            <EnhancedChartCard 
              title="Policies by Insurance Company" 
              subtitle="Distribution across partner companies"
              icon={<Building className="w-5 h-5" />}
              action={<Download className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.policiesByCompany} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <defs>
                    {chartData.policiesByCompany.map((entry, index) => (
                      <linearGradient key={index} id={`colorPolicies${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.2}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="policies" 
                    name="Policies Issued" 
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {chartData.policiesByCompany.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorPolicies${index})`}
                        stroke={entry.color}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </EnhancedChartCard>

            <EnhancedChartCard 
              title="Monthly Performance Trends" 
              subtitle="Policies, quotes and revenue overview"
              icon={<TrendingUp className="w-5 h-5" />}
              action={<Eye className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff7300" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPolicies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#413ea0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#413ea0" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="policies" 
                    fill="url(#colorPolicies)" 
                    name="Policies" 
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="url(#colorRevenue)" 
                    name="Revenue" 
                    strokeWidth={3}
                    dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ff7300', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </EnhancedChartCard>
          </>
        )}

        {/* Analytics Tab Charts */}
        {activeTab === 'analytics' && (
          <>
            <EnhancedChartCard 
              title="Policy Status Distribution" 
              subtitle="Current policy status overview"
              icon={<PieChartIcon className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={1}
                  >
                    {chartData.statusDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Policies']} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ right: -20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </EnhancedChartCard>

            <EnhancedChartCard 
              title="Coverage Type Analysis" 
              subtitle="Policy coverage distribution"
              icon={<Shield className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <RadialBarChart 
                  innerRadius="20%" 
                  outerRadius="100%" 
                  data={chartData.coverageDistribution} 
                  startAngle={180} 
                  endAngle={0}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <RadialBar
                    label={{ fill: '#666', position: 'insideStart' }}
                    background
                    dataKey="value"
                    cornerRadius={10}
                    minAngle={15}
                  >
                    {chartData.coverageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RadialBar>
                  <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ right: -20 }}
                  />
                  <Tooltip formatter={(value) => [value, 'Policies']} />
                </RadialBarChart>
              </ResponsiveContainer>
            </EnhancedChartCard>
          </>
        )}

        {/* Performance Tab Charts */}
        {activeTab === 'performance' && (
          <>
            <EnhancedChartCard 
              title="Buyer Type Distribution" 
              subtitle="Individual vs Corporate customers"
              icon={<Users className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData.buyerTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderRadialLabel}
                    outerRadius={120}
                    innerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {chartData.buyerTypeDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Policies']} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ right: -20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </EnhancedChartCard>

            <EnhancedChartCard 
              title="Vehicle Type Analysis" 
              subtitle="New vs Used vehicle policies"
              icon={<Car className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.vehicleTypeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    {chartData.vehicleTypeDistribution.map((entry, index) => (
                      <linearGradient key={index} id={`colorVehicle${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.2}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Vehicle Policies" 
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                  >
                    {chartData.vehicleTypeDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorVehicle${index})`}
                        stroke={entry.color}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </EnhancedChartCard>
          </>
        )}

        {/* Companies Tab Charts */}
        {activeTab === 'companies' && (
          <>
            <EnhancedChartCard 
              title="Revenue by Insurance Company" 
              subtitle="Total revenue generated per insurer"
              icon={<DollarSign className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.performanceByCompany} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <defs>
                    {chartData.performanceByCompany.map((entry, index) => (
                      <linearGradient key={index} id={`colorRevenue${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.2}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue (₹)" 
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {chartData.performanceByCompany.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorRevenue${index})`}
                        stroke={entry.color}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </EnhancedChartCard>

            <EnhancedChartCard 
              title="Conversion Rate by Company" 
              subtitle="Quote to policy conversion performance"
              icon={<Percent className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.performanceByCompany} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <defs>
                    {chartData.performanceByCompany.map((entry, index) => (
                      <linearGradient key={index} id={`colorConversion${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.2}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip type="percentage" />} />
                  <Legend />
                  <Bar 
                    dataKey="conversionRate" 
                    name="Conversion Rate %" 
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {chartData.performanceByCompany.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorConversion${index})`}
                        stroke={entry.color}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </EnhancedChartCard>
          </>
        )}

        {/* Customers Tab Charts */}
        {activeTab === 'customers' && (
          <>
            <EnhancedChartCard 
              title="Payment Status Distribution" 
              subtitle="Customer payment completion status"
              icon={<CreditCard className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData.paymentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={1}
                  >
                    {chartData.paymentDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Policies']} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ right: -20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </EnhancedChartCard>

            <EnhancedChartCard 
              title="Customer Growth Trends" 
              subtitle="Monthly customer acquisition"
              icon={<Users className="w-5 h-5" />}
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="policies" 
                    stroke="#8884d8" 
                    fill="url(#colorCustomers)" 
                    name="New Customers"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </EnhancedChartCard>
          </>
        )}

        {/* Additional common charts */}
        <EnhancedChartCard 
          title="Policy Conversion Funnel" 
          subtitle="Quote to policy conversion journey"
          icon={<BarChart4 className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={[
              { stage: 'Quotes Generated', value: dashboardData.quotes.length, color: chartColors.gradient.blue[0] },
              { stage: 'Quotes Accepted', value: dashboardData.quotes.filter(q => q.accepted).length, color: chartColors.gradient.green[0] },
              { stage: 'Policies Issued', value: dashboardData.policies.length, color: chartColors.gradient.purple[0] },
              { stage: 'Active Policies', value: stats.activePolicies, color: chartColors.success }
            ]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Count" 
                radius={[6, 6, 0, 0]}
                barSize={40}
              >
                {[
                  { stage: 'Quotes Generated', value: dashboardData.quotes.length, color: chartColors.gradient.blue[0] },
                  { stage: 'Quotes Accepted', value: dashboardData.quotes.filter(q => q.accepted).length, color: chartColors.gradient.green[0] },
                  { stage: 'Policies Issued', value: dashboardData.policies.length, color: chartColors.gradient.purple[0] },
                  { stage: 'Active Policies', value: stats.activePolicies, color: chartColors.success }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </EnhancedChartCard>

        <EnhancedChartCard 
          title="Monthly Revenue Trends" 
          subtitle="Revenue growth over time"
          icon={<TrendingUp className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorRevenueLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff7300" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="url(#colorRevenueLine)" 
                name="Revenue (₹)" 
                strokeWidth={3}
                dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ff7300', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </EnhancedChartCard>
      </div>

      {/* Enhanced Performance Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Performance Highlights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-800 font-medium">Overall Conversion Rate</div>
            <div className="text-xs text-blue-600 mt-1">From quote to policy</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {chartData.performanceByCompany.length > 0 ? 
                chartData.performanceByCompany.reduce((max, company) => 
                  company.revenue > max.revenue ? company : max
                ).name.split(' ')[0] : 'No data'
              }
            </div>
            <div className="text-sm text-green-800 font-medium">Top Performing Company</div>
            <div className="text-xs text-green-600 mt-1">Highest revenue generated</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 shadow-sm">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatIndianNumber(stats.totalRevenue)}
            </div>
            <div className="text-sm text-purple-800 font-medium">Total Revenue Generated</div>
            <div className="text-xs text-purple-600 mt-1">Across all policies</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 shadow-sm">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {stats.renewalRate.toFixed(1)}%
            </div>
            <div className="text-sm text-orange-800 font-medium">Customer Retention Rate</div>
            <div className="text-xs text-orange-600 mt-1">Policy renewal success</div>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EnhancedTableCard 
          title={activeTab === 'companies' ? 'Insurance Company Performance' : 'Recent Policies'}
          subtitle={activeTab === 'companies' ? 'Top performing insurance partners' : 'Latest policy transactions'}
          data={activeTab === 'companies' ? 
            chartData.performanceByCompany.sort((a, b) => b.revenue - a.revenue).slice(0, 5) : 
            filteredPolicies.slice(0, 5)
          }
          type={activeTab === 'companies' ? 'companies' : 'policies'}
        />
        
        <EnhancedTableCard 
          title="Key Performance Indicators"
          subtitle="Critical business metrics at a glance"
          data={[
            { label: 'Overall Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, description: 'From quote to policy issuance' },
            { label: 'Average Policy Value', value: formatIndianNumber(stats.averagePremium), description: 'Across all issued policies' },
            { label: 'Renewal Rate', value: `${stats.renewalRate.toFixed(1)}%`, description: 'Percentage of renewal policies' },
            { label: 'Active Policy Rate', value: `${Math.round((stats.activePolicies / Math.max(stats.totalPolicies, 1)) * 100)}%`, description: 'Active policies vs total policies' },
            { label: 'Payment Success Rate', value: `${advancedMetrics.payments.paymentSuccessRate.toFixed(1)}%`, description: 'Successful payment transactions' }
          ]}
          type="kpis"
        />
      </div>

      {/* Enhanced Summary Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          {activeTab === 'overview' ? 'Performance Summary' : 
           activeTab === 'analytics' ? 'Analytics Insights' :
           activeTab === 'performance' ? 'Business Insights' : 
           activeTab === 'companies' ? 'Company Insights' : 'Customer Insights'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTab === 'overview' ? (
            <>
              <SummaryHighlight 
                value={`${stats.conversionRate.toFixed(1)}%`}
                label="Overall Conversion Rate"
                description="From quote to policy"
                color="blue"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={chartData.performanceByCompany.length > 0 ? 
                  chartData.performanceByCompany.reduce((max, company) => 
                    company.revenue > max.revenue ? company : max
                  ).name.split(' ')[0] : 'No data'
                }
                label="Top Performing Company"
                description="Highest revenue generated"
                color="green"
                icon={<Crown className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={formatIndianNumber(stats.totalRevenue)}
                label="Total Revenue Generated"
                description="Across all policies"
                color="purple"
                icon={<DollarSign className="w-5 h-5" />}
              />
            </>
          ) : activeTab === 'analytics' ? (
            <>
              <SummaryHighlight 
                value={chartData.coverageDistribution.length > 0 ? 
                  chartData.coverageDistribution.reduce((max, item) => 
                    item.value > max.value ? item : max
                  ).name : 'No data'
                }
                label="Most Popular Coverage"
                description="Preferred policy type"
                color="blue"
                icon={<Shield className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={`${Math.round((filteredPolicies.filter(p => p.vehicleType === 'new').length / Math.max(filteredPolicies.length, 1)) * 100)}%`}
                label="New Vehicle Policies"
                description="Percentage of new cars"
                color="green"
                icon={<Car className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={formatIndianNumber(advancedMetrics.revenue.projectedAnnualRevenue)}
                label="Annual Revenue Projection"
                description="Based on current trends"
                color="purple"
                icon={<DollarSign className="w-5 h-5" />}
              />
            </>
          ) : activeTab === 'performance' ? (
            <>
              <SummaryHighlight 
                value={`${Math.round((advancedMetrics.buyerTypeDistribution.individual / Math.max(filteredPolicies.length, 1)) * 100)}%`}
                label="Individual Customers"
                description="Percentage of individual buyers"
                color="blue"
                icon={<User className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={`${Math.round((advancedMetrics.buyerTypeDistribution.corporate / Math.max(filteredPolicies.length, 1)) * 100)}%`}
                label="Corporate Customers"
                description="Percentage of corporate buyers"
                color="green"
                icon={<Building className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={`${advancedMetrics.renewal.renewalRate.toFixed(1)}%`}
                label="Customer Retention Rate"
                description="Policy renewal success"
                color="purple"
                icon={<History className="w-5 h-5" />}
              />
            </>
          ) : activeTab === 'companies' ? (
            <>
              <SummaryHighlight 
                value={chartData.performanceByCompany.length > 0 ? 
                  chartData.performanceByCompany.reduce((max, company) => 
                    company.conversionRate > max.conversionRate ? company : max
                  ).name.split(' ')[0] : 'No data'
                }
                label="Best Conversion Rate"
                description="Highest quote to policy conversion"
                color="blue"
                icon={<Percent className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={chartData.performanceByCompany.length > 0 ? 
                  chartData.performanceByCompany.reduce((max, company) => 
                    company.policies > max.policies ? company : max
                  ).name.split(' ')[0] : 'No data'
                }
                label="Most Policies Issued"
                description="Highest policy volume"
                color="green"
                icon={<FileText className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={chartData.performanceByCompany.length > 0 ? 
                  chartData.performanceByCompany.reduce((max, company) => 
                    company.quotes > max.quotes ? company : max
                  ).name.split(' ')[0] : 'No data'
                }
                label="Most Quotes Generated"
                description="Highest quote volume"
                color="purple"
                icon={<FileCheck className="w-5 h-5" />}
              />
            </>
          ) : (
            <>
              <SummaryHighlight 
                value={stats.totalCustomers}
                label="Total Customers"
                description="All policy holders"
                color="blue"
                icon={<Users className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={`${Math.round((stats.corporateCustomers / Math.max(stats.totalCustomers, 1)) * 100)}%`}
                label="Corporate Clients"
                description="Business customers"
                color="green"
                icon={<Building className="w-5 h-5" />}
              />
              <SummaryHighlight 
                value={`${advancedMetrics.payments.paymentSuccessRate.toFixed(1)}%`}
                label="Payment Success Rate"
                description="Successful transactions"
                color="purple"
                icon={<CreditCard className="w-5 h-5" />}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;