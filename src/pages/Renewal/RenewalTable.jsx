// src/pages/RenewalsPage/RenewalTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PolicyModal from '../PoliciesPage/PolicyModal.jsx';
import {
  FaCar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaTag,
  FaBuilding,
  FaMoneyBillWave,
  FaCreditCard,
  FaHistory,
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaExclamationCircle,
  FaCalendarCheck,
  FaBell,
  FaSync,
  FaCheck,
  FaBan,
  FaExternalLinkAlt,
  FaCalendarPlus,
  FaDownload,
  FaIndustry,
  FaUserTie,
  FaList,
  FaTh,
  FaFileExport,
  FaShieldAlt,
  FaIdCard,
  FaChartBar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCog,
  FaPrint,
  FaUserCheck,
  FaUserClock,
  FaUserPlus,
  FaFileAlt,
  FaPercentage,
  FaReceipt
} from 'react-icons/fa';

// ================== API CONFIGURATION ==================
const API_BASE_URL = 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ================== ENHANCED RENEWAL UTILITY FUNCTIONS ==================

// FIXED: Enhanced expiry date calculation from policy data - MATCHES POLICY TABLE LOGIC
const getExpiryDate = (policy) => {
  const policyInfo = policy.policy_info || {};
  const policyType = getPolicyType(policy).toLowerCase();
  
  // For Third Party policies, use tpExpiryDate
  if (policyType.includes('third party') || policyType.includes('tp')) {
    return policyInfo.tpExpiryDate || policyInfo.dueDate || null;
  }
  
  // For Standalone OD, Comprehensive, and all other policies, use odExpiryDate
  return policyInfo.odExpiryDate || policyInfo.dueDate || null;
};

// FIXED: Get detailed expiry information for expanded view
const getDetailedExpiryInfo = (policy) => {
  const policyInfo = policy.policy_info || {};
  const policyType = getPolicyType(policy).toLowerCase();
  
  return {
    odExpiryDate: policyInfo.odExpiryDate || null,
    tpExpiryDate: policyInfo.tpExpiryDate || null,
    dueDate: policyInfo.dueDate || null,
    policyType: policyType,
    primaryExpiry: getExpiryDate(policy)
  };
};

// FIXED: Calculate actual days until expiry (removes Infinity)
const calculateDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculating days until expiry:', error);
    return null;
  }
};

// NEW: Calculate days until next year renewal reminder
const calculateDaysUntilNextYearRenewal = (policy) => {
  if (!policy.next_renewal_date) return null;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const renewalDate = new Date(policy.next_renewal_date);
    renewalDate.setHours(0, 0, 0, 0);
    
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculating days until next year renewal:', error);
    return null;
  }
};

// FIXED: Enhanced batch categorization with null handling
const categorizeRenewalBatch = (daysUntilExpiry) => {
  if (daysUntilExpiry === null) return 'no_expiry';
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return '7_days';
  if (daysUntilExpiry <= 14) return '14_days';
  if (daysUntilExpiry <= 30) return '30_days';
  if (daysUntilExpiry <= 60) return '60_days';
  return 'beyond_60_days';
};

// NEW: Categorize next year renewal batches
const categorizeNextYearRenewalBatch = (daysUntilRenewal) => {
  if (daysUntilRenewal === null) return 'no_reminder';
  if (daysUntilRenewal <= 0) return 'due_now';
  if (daysUntilRenewal <= 7) return 'next_year_7_days';
  if (daysUntilRenewal <= 14) return 'next_year_14_days';
  if (daysUntilRenewal <= 30) return 'next_year_30_days';
  return 'next_year_future';
};

// FIXED: Enhanced batch info with no_expiry case
const getBatchInfo = (batch) => {
  const batchConfig = {
    '7_days': {
      text: '7 Days',
      class: 'bg-red-100 text-red-800 border border-red-200',
      icon: FaExclamationCircle,
      priority: 1,
      badgeClass: 'bg-red-500 text-white',
      color: 'red'
    },
    '14_days': {
      text: '14 Days',
      class: 'bg-orange-100 text-orange-800 border border-orange-200',
      icon: FaCalendarCheck,
      priority: 2,
      badgeClass: 'bg-orange-500 text-white',
      color: 'orange'
    },
    '30_days': {
      text: '30 Days',
      class: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: FaBell,
      priority: 3,
      badgeClass: 'bg-yellow-500 text-white',
      color: 'yellow'
    },
    '60_days': {
      text: '60 Days',
      class: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: FaClock,
      priority: 4,
      badgeClass: 'bg-blue-500 text-white',
      color: 'blue'
    },
    'beyond_60_days': {
      text: 'Future',
      class: 'bg-green-100 text-green-800 border border-green-200',
      icon: FaCalendarAlt,
      priority: 5,
      badgeClass: 'bg-green-500 text-white',
      color: 'green'
    },
    'expired': {
      text: 'Expired',
      class: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: FaTimes,
      priority: 0,
      badgeClass: 'bg-gray-500 text-white',
      color: 'gray'
    },
    'no_expiry': {
      text: 'No Expiry',
      class: 'bg-purple-100 text-purple-800 border border-purple-200',
      icon: FaBan,
      priority: 6,
      badgeClass: 'bg-purple-500 text-white',
      color: 'purple'
    },
    // NEW: Next year renewal batches
    'next_year_7_days': {
      text: 'Next Year - 7 Days',
      class: 'bg-pink-100 text-pink-800 border border-pink-200',
      icon: FaCalendarPlus,
      priority: 1,
      badgeClass: 'bg-pink-500 text-white',
      color: 'pink'
    },
    'next_year_14_days': {
      text: 'Next Year - 14 Days',
      class: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      icon: FaCalendarPlus,
      priority: 2,
      badgeClass: 'bg-indigo-500 text-white',
      color: 'indigo'
    },
    'next_year_30_days': {
      text: 'Next Year - 30 Days',
      class: 'bg-teal-100 text-teal-800 border border-teal-200',
      icon: FaCalendarPlus,
      priority: 3,
      badgeClass: 'bg-teal-500 text-white',
      color: 'teal'
    },
    'next_year_future': {
      text: 'Next Year - Future',
      class: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
      icon: FaCalendarPlus,
      priority: 4,
      badgeClass: 'bg-cyan-500 text-white',
      color: 'cyan'
    },
    'due_now': {
      text: 'Renewal Due',
      class: 'bg-amber-100 text-amber-800 border border-amber-200',
      icon: FaExclamationCircle,
      priority: 0,
      badgeClass: 'bg-amber-500 text-white',
      color: 'amber'
    },
    'no_reminder': {
      text: 'No Reminder',
      class: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: FaBan,
      priority: 5,
      badgeClass: 'bg-gray-500 text-white',
      color: 'gray'
    }
  };
  
  return batchConfig[batch] || batchConfig['no_expiry'];
};

// ================== PAYMENT CALCULATION FUNCTIONS ==================

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
    netPremiumAfterDiscounts: effectivePayable
  };
};

const getPaymentStatus = (policy) => {
  if (policy.payment_info?.paymentStatus) {
    return policy.payment_info.paymentStatus.toLowerCase();
  }
  
  const components = calculatePaymentComponents(policy, policy.payment_ledger || []);
  
  if (components.customerPaidAmount >= components.effectivePayable && components.effectivePayable > 0) {
    return 'fully paid';
  } else if (components.customerPaidAmount > 0) {
    return 'partially paid';
  } else {
    return 'pending';
  }
};

// ================== ENHANCED HELPER FUNCTIONS ==================

// FIXED: Get proper customer name with company name for corporate buyers
const getCustomerDetails = (policy) => {
  const customer = policy.customer_details || {};
  const isCorporate = policy.buyer_type === 'corporate';
  
  const displayName = isCorporate 
    ? (customer.companyName || customer.contactPersonName || 'N/A')
    : (customer.name || 'N/A');
  
  return {
    name: displayName,
    mobile: customer.mobile || 'N/A',
    email: customer.email || 'N/A',
    city: customer.city || 'N/A',
    pincode: customer.pincode || 'N/A',
    address: customer.address || 'N/A',
    buyerType: policy.buyer_type || 'individual',
    isCorporate: isCorporate,
    contactPersonName: customer.contactPersonName || 'N/A',
    companyName: customer.companyName || 'N/A'
  };
};

// FIXED: Get policy type consistently - MATCHES POLICY TABLE LOGIC
const getPolicyType = (policy) => {
  if (policy.insurance_quote?.coverageType) {
    return policy.insurance_quote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party';
  }
  return policy.insurance_category || 'Insurance';
};

// FIXED: Enhanced vehicle info
const getVehicleInfo = (policy) => {
  if (policy.vehicle_details) {
    const make = policy.vehicle_details.make || '';
    const model = policy.vehicle_details.model || '';
    const variant = policy.vehicle_details.variant || '';
    const regNo = policy.vehicle_details.regNo || '';
    const manufacturingYear = policy.vehicle_details.manufacturingYear || '';
    const fuelType = policy.vehicle_details.fuelType || '';
    const chassisNo = policy.vehicle_details.chassisNo || '';
    const engineNo = policy.vehicle_details.engineNo || '';
    
    return {
      main: `${make} ${model}`.trim() || 'No Vehicle Info',
      variant: variant,
      regNo: regNo,
      manufacturingYear: manufacturingYear,
      fuelType: fuelType,
      chassisNo: chassisNo,
      engineNo: engineNo,
      make: make,
      model: model
    };
  }
  return {
    main: 'No Vehicle',
    variant: '',
    regNo: '',
    manufacturingYear: '',
    fuelType: '',
    chassisNo: '',
    engineNo: '',
    make: '',
    model: ''
  };
};

const getStatusDisplay = (status) => {
  const statusConfig = {
    active: { 
      text: 'Active', 
      class: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      icon: FaCheckCircle
    },
    completed: { 
      text: 'Completed', 
      class: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: FaCheckCircle
    },
    draft: { 
      text: 'Draft', 
      class: 'bg-amber-100 text-amber-800 border border-amber-200',
      icon: FaClock
    },
    pending: { 
      text: 'Pending', 
      class: 'bg-purple-100 text-purple-800 border border-purple-200',
      icon: FaClock
    },
    expired: { 
      text: 'Expired', 
      class: 'bg-rose-100 text-rose-800 border border-rose-200',
      icon: FaExclamationTriangle
    },
    external: { 
      text: 'External', 
      class: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: FaExternalLinkAlt
    },
    closed: { 
      text: 'Closed', 
      class: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: FaBan
    },
    'payment completed': {
      text: 'Paid',
      class: 'bg-green-100 text-green-800 border border-green-200',
      icon: FaCheckCircle
    },
    'renewal_scheduled': {
      text: 'Renewal Scheduled',
      class: 'bg-teal-100 text-teal-800 border border-teal-200',
      icon: FaCalendarPlus
    }
  };

  return statusConfig[status] || { 
    text: status, 
    class: 'bg-gray-100 text-gray-800 border border-gray-200',
    icon: FaTag
  };
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const getPremiumInfo = (policy) => {
  if (policy.policy_info?.totalPremium) {
    return `₹${parseInt(policy.policy_info.totalPremium).toLocaleString('en-IN')}`;
  }
  if (policy.insurance_quote?.premium) {
    return `₹${parseInt(policy.insurance_quote.premium).toLocaleString('en-IN')}`;
  }
  return 'N/A';
};

const getInsuranceCompany = (policy) => {
  if (policy.policy_info?.insuranceCompany) {
    return policy.policy_info.insuranceCompany;
  }
  if (policy.insurance_quote?.insurer) {
    return policy.insurance_quote.insurer;
  }
  return 'N/A';
};

const getPolicyNumber = (policy) => {
  if (policy.policy_info?.policyNumber) {
    return policy.policy_info.policyNumber;
  }
  if (policy.policy_info?.covernoteNumber) {
    return policy.policy_info.covernoteNumber;
  }
  return 'N/A';
};

const getPolicyId = (policy) => policy._id || policy.id || 'N/A';

const getIdvAmount = (policy) => {
  if (policy.policy_info?.idvAmount) {
    return `₹${parseInt(policy.policy_info.idvAmount).toLocaleString('en-IN')}`;
  }
  if (policy.insurance_quote?.idv) {
    return `₹${parseInt(policy.insurance_quote.idv).toLocaleString('en-IN')}`;
  }
  return 'N/A';
};

const getNcbDiscount = (policy) => {
  if (policy.policy_info?.ncbDiscount) {
    return `${policy.policy_info.ncbDiscount}%`;
  }
  if (policy.insurance_quote?.ncb) {
    return `${policy.insurance_quote.ncb}%`;
  }
  return '0%';
};

const getVehicleType = (policy) => policy.vehicleType || 'used';

// FIXED: Professional summary generator
const generatePolicySummary = (policy) => {
  const customer = getCustomerDetails(policy);
  const vehicle = getVehicleInfo(policy);
  const policyInfo = policy.policy_info || {};
  const insuranceQuote = policy.insurance_quote || {};
  
  const expiryDate = getExpiryDate(policy);
  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
  const batch = categorizeRenewalBatch(daysUntilExpiry);
  
  const parts = [];
  
  // Customer information
  if (customer.isCorporate) {
    parts.push(`Corporate client ${customer.companyName}`);
    if (customer.contactPersonName && customer.contactPersonName !== 'N/A') {
      parts.push(`(Contact: ${customer.contactPersonName})`);
    }
  } else {
    parts.push(`Individual customer ${customer.name}`);
  }
  
  // Vehicle information
  if (vehicle.regNo && vehicle.regNo !== 'N/A') {
    parts.push(`with vehicle ${vehicle.make} ${vehicle.model} (${vehicle.regNo})`);
  } else {
    parts.push(`with vehicle ${vehicle.make} ${vehicle.model}`);
  }
  
  // Policy information
  const insuranceCompany = policyInfo.insuranceCompany || insuranceQuote.insurer || 'N/A';
  const policyNumber = policyInfo.policyNumber || 'N/A';
  if (policyNumber !== 'N/A') {
    parts.push(`holds policy ${policyNumber} from ${insuranceCompany}`);
  } else {
    parts.push(`insured with ${insuranceCompany}`);
  }
  
  // Renewal status
  if (daysUntilExpiry !== null) {
    if (daysUntilExpiry < 0) {
      parts.push(`which expired ${Math.abs(daysUntilExpiry)} days ago`);
    } else if (daysUntilExpiry === 0) {
      parts.push(`expiring today`);
    } else {
      parts.push(`expiring in ${daysUntilExpiry} days`);
    }
  } else {
    parts.push(`with no expiry date set`);
  }
  
  // Next year renewal information
  if (policy.renewal_scheduled && policy.next_renewal_date) {
    const renewalDate = new Date(policy.next_renewal_date);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal <= 30) {
      parts.push(`(Next year renewal in ${daysUntilRenewal} days)`);
    }
  }
  
  // Premium information
  const premium = policyInfo.totalPremium || insuranceQuote.premium;
  if (premium) {
    parts.push(`at premium ₹${parseInt(premium).toLocaleString('en-IN')}`);
  }
  
  return parts.join(' ');
};

// ================== ADVANCED COMPONENTS ==================

const CompactPaymentBreakdown = ({ policy, paymentLedger = [] }) => {
  const components = calculatePaymentComponents(policy, paymentLedger);
  const paymentStatus = getPaymentStatus(policy);

  return (
    <div className="space-y-1.5 p-1.5 bg-gray-50 rounded border border-gray-200 text-xs">
      <div className="flex items-center justify-between">
        <span className={`font-medium px-1 py-0.5 rounded text-xs ${
          paymentStatus === 'fully paid' ? 'bg-green-100 text-green-800' :
          paymentStatus === 'partially paid' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {paymentStatus === 'fully paid' ? 'Paid' :
           paymentStatus === 'partially paid' ? 'Partial' : 'Pending'}
        </span>
        
        <div className={`px-1 py-0.5 rounded text-xs ${
          components.paymentMadeBy === 'In House' ? 'bg-purple-100 text-purple-800' :
          components.paymentMadeBy === 'Customer' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {components.paymentMadeBy === 'In House' ? 'In House' :
           components.paymentMadeBy === 'Customer' ? 'Customer' : 'Not Paid'}
        </div>
      </div>
      
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span className="text-gray-600">Premium:</span>
          <span className="font-medium">₹{components.totalPremium.toLocaleString('en-IN')}</span>
        </div>
        
        {components.subventionRefundAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Subvention:</span>
            <span className="text-purple-600 font-medium">
              -₹{components.subventionRefundAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600">Paid:</span>
          <span className="text-green-600 font-medium">
            ₹{components.customerPaidAmount.toLocaleString('en-IN')}
          </span>
        </div>
        
        {components.remainingCustomerAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Due:</span>
            <span className="text-red-600 font-medium">
              ₹{components.remainingCustomerAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
      
      <div className="pt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Payment Progress {components.subventionRefundAmount > 0 ? '(After Subvention)' : ''}</span>
          <span>{components.paymentProgress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              components.paymentProgress === 100 ? 'bg-green-500' : 
              components.paymentProgress > 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(components.paymentProgress, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const CompactPolicySummary = ({ policy, onView, onEdit }) => {
  const summary = generatePolicySummary(policy);
  const customer = getCustomerDetails(policy);
  const vehicle = getVehicleInfo(policy);
  const expiryDate = getExpiryDate(policy);
  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
  const batch = categorizeRenewalBatch(daysUntilExpiry);
  const batchInfo = getBatchInfo(batch);
  const BatchIcon = batchInfo.icon;
  const premium = getPremiumInfo(policy);
  const paymentStatus = getPaymentStatus(policy);
  
  // Next year renewal info
  const daysUntilNextYearRenewal = calculateDaysUntilNextYearRenewal(policy);
  const nextYearBatch = categorizeNextYearRenewalBatch(daysUntilNextYearRenewal);
  const nextYearBatchInfo = getBatchInfo(nextYearBatch);
  const NextYearBatchIcon = nextYearBatchInfo.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {customer.isCorporate ? (
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <FaBuilding className="text-orange-600 text-sm" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FaUser className="text-purple-600 text-sm" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {customer.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">{customer.mobile}</p>
              {customer.isCorporate && customer.companyName && customer.companyName !== 'N/A' && (
                <p className="text-xs text-orange-600 truncate">{customer.companyName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {policy.renewal_scheduled && daysUntilNextYearRenewal !== null && daysUntilNextYearRenewal <= 30 && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${nextYearBatchInfo.badgeClass}`}>
                <NextYearBatchIcon className="inline mr-1" />
                {nextYearBatchInfo.text}
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${batchInfo.badgeClass}`}>
              <BatchIcon className="inline mr-1" />
              {batchInfo.text}
            </span>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded">
          <FaCar className="text-blue-600 text-sm flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{vehicle.main}</p>
            {vehicle.regNo && vehicle.regNo !== 'N/A' && (
              <p className="text-xs text-gray-600 truncate">Reg: {vehicle.regNo}</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {summary}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900 truncate">{premium}</div>
            <div className="text-gray-500">Premium</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className={`font-semibold ${
              daysUntilExpiry === null ? 'text-purple-600' :
              daysUntilExpiry < 0 ? 'text-red-600' :
              daysUntilExpiry <= 7 ? 'text-red-600' :
              daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {daysUntilExpiry === null ? 'No Expiry' : 
               daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)}d ago` :
               `${daysUntilExpiry}d`}
            </div>
            <div className="text-gray-500">Days Left</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className={`font-semibold ${
              paymentStatus === 'fully paid' ? 'text-green-600' :
              paymentStatus === 'partially paid' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {paymentStatus === 'fully paid' ? 'Paid' :
               paymentStatus === 'partially paid' ? 'Partial' : 'Pending'}
            </div>
            <div className="text-gray-500">Payment</div>
          </div>
        </div>

        {/* Next Year Renewal Info */}
        {policy.renewal_scheduled && policy.next_renewal_date && (
          <div className="mb-3 p-2 bg-teal-50 rounded border border-teal-200">
            <div className="flex items-center gap-2 mb-1">
              <FaCalendarPlus className="text-teal-600 text-xs" />
              <span className="text-xs font-semibold text-teal-800">Next Year Renewal</span>
            </div>
            <div className="text-xs text-teal-700">
              <div>Reminder: {formatDate(policy.next_renewal_date)}</div>
              {daysUntilNextYearRenewal !== null && (
                <div className="font-medium">
                  {daysUntilNextYearRenewal <= 0 ? 'Due now' : `In ${daysUntilNextYearRenewal} days`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(policy)}
            className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium py-2 px-3 rounded transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <FaEye className="text-xs" />
            View
          </button>
          <button
            onClick={() => onEdit(policy)}
            className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium py-2 px-3 rounded transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <FaEdit className="text-xs" />
            Renew
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ 
  policy, 
  onStatusUpdate,
  onMoveToExternal 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (status) => {
    try {
      setLoading(true);
      
      if (status === 'car_sold') {
        await api.put(`/policies/${policy._id}`, {
          status: 'closed',
          closure_reason: 'car_sold',
          updated_at: new Date().toISOString()
        });
        alert('Policy marked as Car Sold and moved to closed status');
      } 
      else if (status === 'car_expired') {
        await api.put(`/policies/${policy._id}`, {
          status: 'closed',
          closure_reason: 'car_expired',
          updated_at: new Date().toISOString()
        });
        alert('Policy marked as Car Expired and moved to closed status');
      }
      else if (status === 'policy_from_somewhere_else') {
        await onMoveToExternal(policy);
        return;
      }
      else if (status === 'renew_next_year') {
        const nextYearDate = new Date();
        nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
        nextYearDate.setDate(nextYearDate.getDate() - 30); // 30 days before next year
        
        await api.put(`/policies/${policy._id}`, {
          renewal_scheduled: true,
          next_renewal_date: nextYearDate.toISOString(),
          status: 'active',
          updated_at: new Date().toISOString()
        });
        alert('Policy scheduled for renewal next year with 30-day reminder.');
      }

      setShowOptions(false);
      onStatusUpdate();
      
    } catch (error) {
      console.error('Error updating policy status:', error);
      alert('Failed to update policy status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={loading}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium hover:bg-blue-50 px-2 py-1.5 rounded transition-colors border border-blue-200 justify-center w-full"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
            Updating...
          </>
        ) : (
          <>
            <FaCheck className="text-xs" />
            Update Status
          </>
        )}
      </button>

      {showOptions && !loading && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleStatusUpdate('car_sold')}
              className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
            >
              <FaCar className="text-red-500" />
              <div>
                <div className="font-medium">Car Sold</div>
                <div className="text-gray-500 text-xs">Close policy</div>
              </div>
            </button>

            <button
              onClick={() => handleStatusUpdate('car_expired')}
              className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded transition-colors"
            >
              <FaBan className="text-orange-500" />
              <div>
                <div className="font-medium">Car Expired</div>
                <div className="text-gray-500 text-xs">Close policy</div>
              </div>
            </button>

            <button
              onClick={() => handleStatusUpdate('policy_from_somewhere_else')}
              className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded transition-colors"
            >
              <FaExternalLinkAlt className="text-purple-500" />
              <div>
                <div className="font-medium">Policy from Elsewhere</div>
                <div className="text-gray-500 text-xs">Move to external</div>
              </div>
            </button>

            <button
              onClick={() => handleStatusUpdate('renew_next_year')}
              className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 rounded transition-colors"
            >
              <FaCalendarPlus className="text-green-500" />
              <div>
                <div className="font-medium">Renew Next Year</div>
                <div className="text-gray-500 text-xs">Schedule reminder</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {showOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

// ================== BATCH STATISTICS COMPONENT ==================

const BatchStatistics = ({ stats, onBatchClick, activeFilter }) => {
  const batchConfig = [
    { key: '7_days', label: '7 Days', subLabel: 'Urgent', color: 'red' },
    { key: '14_days', label: '14 Days', subLabel: 'High Priority', color: 'orange' },
    { key: '30_days', label: '30 Days', subLabel: 'Medium', color: 'yellow' },
    { key: '60_days', label: '60 Days', subLabel: 'Low Priority', color: 'blue' },
    { key: 'beyond_60_days', label: 'Future', subLabel: 'Beyond 60', color: 'green' },
    { key: 'expired', label: 'Expired', subLabel: 'Overdue', color: 'gray' },
    { key: 'no_expiry', label: 'No Expiry', subLabel: 'Check Required', color: 'purple' },
    // NEW: Next year renewal stats
    { key: 'next_year_30_days', label: 'Next Year', subLabel: '30 Days', color: 'teal' },
    { key: 'next_year_14_days', label: 'Next Year', subLabel: '14 Days', color: 'indigo' },
    { key: 'next_year_7_days', label: 'Next Year', subLabel: '7 Days', color: 'pink' },
    { key: 'total', label: 'Total', subLabel: 'Policies', color: 'indigo' }
  ];

  const getActiveStyles = (batchKey) => {
    if (!activeFilter) return '';
    
    const isActive = 
      (batchKey === activeFilter) ||
      (batchKey === 'total' && activeFilter === 'all') ||
      (batchKey.startsWith('next_year_') && activeFilter === batchKey);
    
    if (!isActive) return '';
    
    return 'ring-2 ring-offset-2 ring-opacity-60 ' + (
      batchKey === '7_days' ? 'ring-red-500' :
      batchKey === '14_days' ? 'ring-orange-500' :
      batchKey === '30_days' ? 'ring-yellow-500' :
      batchKey === '60_days' ? 'ring-blue-500' :
      batchKey === 'beyond_60_days' ? 'ring-green-500' :
      batchKey === 'expired' ? 'ring-gray-500' :
      batchKey === 'no_expiry' ? 'ring-purple-500' :
      batchKey === 'next_year_30_days' ? 'ring-teal-500' :
      batchKey === 'next_year_14_days' ? 'ring-indigo-500' :
      batchKey === 'next_year_7_days' ? 'ring-pink-500' :
      'ring-indigo-500'
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-3">
      {batchConfig.map((batch) => (
        <button
          key={batch.key}
          onClick={() => onBatchClick(batch.key)}
          className={`text-center p-3 transition-all duration-200 transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getActiveStyles(batch.key)} ${
            batch.color === 'red' ? 'bg-red-50 border-red-200 hover:bg-red-100 focus:ring-red-500' :
            batch.color === 'orange' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100 focus:ring-orange-500' :
            batch.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 focus:ring-yellow-500' :
            batch.color === 'blue' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 focus:ring-blue-500' :
            batch.color === 'green' ? 'bg-green-50 border-green-200 hover:bg-green-100 focus:ring-green-500' :
            batch.color === 'gray' ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 focus:ring-gray-500' :
            batch.color === 'purple' ? 'bg-purple-50 border-purple-200 hover:bg-purple-100 focus:ring-purple-500' :
            batch.color === 'teal' ? 'bg-teal-50 border-teal-200 hover:bg-teal-100 focus:ring-teal-500' :
            batch.color === 'indigo' ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 focus:ring-indigo-500' :
            batch.color === 'pink' ? 'bg-pink-50 border-pink-200 hover:bg-pink-100 focus:ring-pink-500' :
            'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 focus:ring-indigo-500'
          } border rounded-lg cursor-pointer`}
        >
          <div className={`text-xl font-bold ${
            batch.color === 'red' ? 'text-red-600' :
            batch.color === 'orange' ? 'text-orange-600' :
            batch.color === 'yellow' ? 'text-yellow-600' :
            batch.color === 'blue' ? 'text-blue-600' :
            batch.color === 'green' ? 'text-green-600' :
            batch.color === 'gray' ? 'text-gray-600' :
            batch.color === 'purple' ? 'text-purple-600' :
            batch.color === 'teal' ? 'text-teal-600' :
            batch.color === 'indigo' ? 'text-indigo-600' :
            batch.color === 'pink' ? 'text-pink-600' :
            'text-indigo-600'
          }`}>
            {stats[batch.key] || 0}
          </div>
          <div className={`text-xs font-medium ${
            batch.color === 'red' ? 'text-red-700' :
            batch.color === 'orange' ? 'text-orange-700' :
            batch.color === 'yellow' ? 'text-yellow-700' :
            batch.color === 'blue' ? 'text-blue-700' :
            batch.color === 'green' ? 'text-green-700' :
            batch.color === 'gray' ? 'text-gray-700' :
            batch.color === 'purple' ? 'text-purple-700' :
            batch.color === 'teal' ? 'text-teal-700' :
            batch.color === 'indigo' ? 'text-indigo-700' :
            batch.color === 'pink' ? 'text-pink-700' :
            'text-indigo-700'
          }`}>
            {batch.label}
          </div>
          <div className={`text-xs ${
            batch.color === 'red' ? 'text-red-500' :
            batch.color === 'orange' ? 'text-orange-500' :
            batch.color === 'yellow' ? 'text-yellow-500' :
            batch.color === 'blue' ? 'text-blue-500' :
            batch.color === 'green' ? 'text-green-500' :
            batch.color === 'gray' ? 'text-gray-500' :
            batch.color === 'purple' ? 'text-purple-500' :
            batch.color === 'teal' ? 'text-teal-500' :
            batch.color === 'indigo' ? 'text-indigo-500' :
            batch.color === 'pink' ? 'text-pink-500' :
            'text-indigo-500'
          }`}>
            {batch.subLabel}
          </div>
        </button>
      ))}
    </div>
  );
};

// ================== NEXT YEAR RENEWAL FILTER BUTTON ==================

const NextYearRenewalFilter = ({ onFilterChange, activeFilter }) => {
  const [showOptions, setShowOptions] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'All Policies', description: 'Show all policies' },
    { key: 'next_year_30_days', label: 'Next Year - 30 Days', description: 'Policies with next year renewal in 30 days' },
    { key: 'next_year_14_days', label: 'Next Year - 14 Days', description: 'Policies with next year renewal in 14 days' },
    { key: 'next_year_7_days', label: 'Next Year - 7 Days', description: 'Policies with next year renewal in 7 days' },
    { key: 'next_year_due', label: 'Next Year - Due Now', description: 'Policies with next year renewal due' }
  ];

  const handleFilterSelect = (filterKey) => {
    onFilterChange(filterKey);
    setShowOptions(false);
  };

  const getActiveFilterLabel = () => {
    const active = filterOptions.find(opt => opt.key === activeFilter);
    return active ? active.label : 'Next Year Renewal';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FaCalendarPlus className="text-xs" />
        {getActiveFilterLabel()}
        {showOptions ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
      </button>

      {showOptions && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Next Year Renewal Filters
            </div>
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleFilterSelect(option.key)}
                className={`flex flex-col w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  activeFilter === option.key 
                    ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showOptions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

// ================== ADVANCED SEARCH COMPONENT ==================

const AdvancedSearch = ({ 
  isOpen, 
  onClose, 
  searchFilters, 
  onFilterChange,
  onApplyFilters,
  onResetFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(searchFilters);

  useEffect(() => {
    setLocalFilters(searchFilters);
  }, [searchFilters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      customerName: '',
      mobile: '',
      regNo: '',
      vehicleMake: '',
      policyNumber: '',
      insuranceCompany: '',
      city: '',
      batch: 'all',
      nextYearRenewal: 'all'
    };
    setLocalFilters(resetFilters);
    onResetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Search - Renewals</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                value={localFilters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                placeholder="Search by customer name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="text"
                value={localFilters.mobile}
                onChange={(e) => handleFilterChange('mobile', e.target.value)}
                placeholder="Search by mobile"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Registration No</label>
              <input
                type="text"
                value={localFilters.regNo}
                onChange={(e) => handleFilterChange('regNo', e.target.value)}
                placeholder="Search by registration number"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vehicle Make</label>
              <input
                type="text"
                value={localFilters.vehicleMake}
                onChange={(e) => handleFilterChange('vehicleMake', e.target.value)}
                placeholder="Search by vehicle make"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Policy Number</label>
              <input
                type="text"
                value={localFilters.policyNumber}
                onChange={(e) => handleFilterChange('policyNumber', e.target.value)}
                placeholder="Search by policy number"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Insurance Company</label>
              <input
                type="text"
                value={localFilters.insuranceCompany}
                onChange={(e) => handleFilterChange('insuranceCompany', e.target.value)}
                placeholder="Search by insurance company"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={localFilters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Search by city"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Renewal Batch</label>
              <select
                value={localFilters.batch}
                onChange={(e) => handleFilterChange('batch', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Batches</option>
                <option value="7_days">7 Days (Urgent)</option>
                <option value="14_days">14 Days (High Priority)</option>
                <option value="30_days">30 Days (Medium Priority)</option>
                <option value="60_days">60 Days (Low Priority)</option>
                <option value="beyond_60_days">Beyond 60 Days (Future)</option>
                <option value="expired">Expired (Overdue)</option>
                <option value="no_expiry">No Expiry Date</option>
              </select>
            </div>

            {/* NEW: Next Year Renewal Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Next Year Renewal</label>
              <select
                value={localFilters.nextYearRenewal}
                onChange={(e) => handleFilterChange('nextYearRenewal', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Policies</option>
                <option value="has_reminder">Has Next Year Reminder</option>
                <option value="next_year_30_days">Next Year - 30 Days</option>
                <option value="next_year_14_days">Next Year - 14 Days</option>
                <option value="next_year_7_days">Next Year - 7 Days</option>
                <option value="next_year_due">Next Year - Due Now</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded hover:bg-purple-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// ================== CSV EXPORT UTILITY ==================

const exportToCSV = (policies, selectedRows = []) => {
  const policiesToExport = selectedRows.length > 0 
    ? policies.filter(policy => selectedRows.includes(policy._id || policy.id))
    : policies;

  if (policiesToExport.length === 0) {
    alert('No policies to export');
    return;
  }

  const headers = [
    'Policy ID',
    'Customer Name',
    'Mobile',
    'Email',
    'City',
    'Vehicle Make',
    'Vehicle Model',
    'Registration No',
    'Insurance Company',
    'Policy Number',
    'Policy Type',
    'Total Premium',
    'IDV Amount',
    'NCB Discount',
    'Expiry Date',
    'Days Until Expiry',
    'Renewal Batch',
    'Payment Status',
    'Policy Status',
    'Buyer Type',
    'Company Name',
    'Contact Person',
    'Next Year Renewal Scheduled',
    'Next Renewal Date',
    'Days Until Next Renewal'
  ];

  const csvData = policiesToExport.map(policy => {
    const customer = getCustomerDetails(policy);
    const vehicle = getVehicleInfo(policy);
    const policyInfo = policy.policy_info || {};
    const insuranceQuote = policy.insurance_quote || {};
    
    const expiryDate = getExpiryDate(policy);
    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
    const batch = categorizeRenewalBatch(daysUntilExpiry);
    const batchInfo = getBatchInfo(batch);

    const daysUntilNextYearRenewal = calculateDaysUntilNextYearRenewal(policy);

    return [
      policy._id || policy.id || 'N/A',
      customer.name,
      customer.mobile || 'N/A',
      customer.email || 'N/A',
      customer.city || 'N/A',
      vehicle.make || 'N/A',
      vehicle.model || 'N/A',
      vehicle.regNo || 'N/A',
      policyInfo.insuranceCompany || insuranceQuote.insurer || 'N/A',
      policyInfo.policyNumber || 'N/A',
      getPolicyType(policy),
      `₹${(policyInfo.totalPremium || insuranceQuote.premium || 0).toLocaleString('en-IN')}`,
      `₹${(policyInfo.idvAmount || insuranceQuote.idv || 0).toLocaleString('en-IN')}`,
      `${policyInfo.ncbDiscount || insuranceQuote.ncb || 0}%`,
      expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN') : 'N/A',
      daysUntilExpiry !== null ? daysUntilExpiry : 'N/A',
      batchInfo.text,
      getPaymentStatus(policy),
      policy.status || 'N/A',
      policy.buyer_type || 'individual',
      customer.companyName || 'N/A',
      customer.contactPersonName || 'N/A',
      policy.renewal_scheduled ? 'Yes' : 'No',
      policy.next_renewal_date ? new Date(policy.next_renewal_date).toLocaleDateString('en-IN') : 'N/A',
      daysUntilNextYearRenewal !== null ? daysUntilNextYearRenewal : 'N/A'
    ];
  });

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `renewal-policies-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ================== MAIN RENEWAL TABLE COMPONENT ==================

const RenewalTable = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [batchFilter, setBatchFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchFilters, setSearchFilters] = useState({
    customerName: '',
    mobile: '',
    regNo: '',
    vehicleMake: '',
    policyNumber: '',
    insuranceCompany: '',
    city: '',
    batch: 'all',
    nextYearRenewal: 'all'
  });
  const [renewalDays, setRenewalDays] = useState(0); // Default to ALL policies
  const [viewMode, setViewMode] = useState('table');
  const [sortConfig, setSortConfig] = useState({ key: 'daysUntilExpiry', direction: 'asc' });
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [nextYearFilter, setNextYearFilter] = useState('all'); // NEW: Next year filter state
  const [activeBatchFilter, setActiveBatchFilter] = useState('all'); // NEW: Active batch filter state

  const navigate = useNavigate();

  // ================== API FUNCTIONS ==================

  // FIXED: Fetch ALL policies using the same logic as PolicyTable
  const fetchAllPolicies = async () => {
    try {
      setLoading(true);
      console.log('Fetching all policies for renewal tracking...');
      
      const response = await api.get('/policies');
      
      if (response.data && response.data.success) {
        const allPolicies = response.data.data || [];
        console.log(`Found ${allPolicies.length} total policies`);
        
        // Process all policies for renewal tracking with CORRECT expiry date logic
        const processedPolicies = allPolicies.map(policy => {
          const expiryDate = getExpiryDate(policy); // Uses the same logic as PolicyTable
          const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
          const batch = categorizeRenewalBatch(daysUntilExpiry);
          const batchInfo = getBatchInfo(batch);
          
          // NEW: Calculate next year renewal information
          const daysUntilNextYearRenewal = calculateDaysUntilNextYearRenewal(policy);
          const nextYearBatch = categorizeNextYearRenewalBatch(daysUntilNextYearRenewal);
          
          return {
            ...policy,
            expiryDate,
            daysUntilExpiry,
            batch,
            batchInfo,
            daysUntilNextYearRenewal,
            nextYearBatch,
            customer_details: {
              ...policy.customer_details,
              companyName: policy.customer_details?.companyName || '',
              contactPersonName: policy.customer_details?.contactPersonName || ''
            }
          };
        });
        
        setPolicies(processedPolicies);
        console.log(`Processed ${processedPolicies.length} policies for renewal tracking`);
        console.log('Expiry date breakdown:', {
          withExpiry: processedPolicies.filter(p => p.expiryDate !== null).length,
          withoutExpiry: processedPolicies.filter(p => p.expiryDate === null).length,
          total: processedPolicies.length
        });
        
        // Log next year renewal stats
        const nextYearPolicies = processedPolicies.filter(p => p.renewal_scheduled);
        console.log('Next year renewal policies:', {
          total: nextYearPolicies.length,
          dueNow: nextYearPolicies.filter(p => p.daysUntilNextYearRenewal !== null && p.daysUntilNextYearRenewal <= 0).length,
          within7Days: nextYearPolicies.filter(p => p.daysUntilNextYearRenewal !== null && p.daysUntilNextYearRenewal <= 7).length,
          within14Days: nextYearPolicies.filter(p => p.daysUntilNextYearRenewal !== null && p.daysUntilNextYearRenewal <= 14).length,
          within30Days: nextYearPolicies.filter(p => p.daysUntilNextYearRenewal !== null && p.daysUntilNextYearRenewal <= 30).length
        });
      } else {
        console.warn('No policies found or invalid response structure');
        setPolicies([]);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      alert('Failed to fetch policies. Please try again.');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePolicy = async (policyId) => {
    try {
      setDeleteLoading(true);
      const response = await api.delete(`/policies/${policyId}`);
      
      if (response.data && response.data.success) {
        setPolicies(prev => prev.filter(policy => policy._id !== policyId));
        return true;
      } else {
        throw new Error('Failed to delete policy');
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    } finally {
      setDeleteLoading(false);
    }
  };

  const moveToExternalPolicies = async (policy) => {
    try {
      const response = await api.put(`/policies/${policy._id}`, {
        policy_source: 'external',
        status: 'external',
        updated_at: new Date().toISOString()
      });
      
      if (response.data && response.data.success) {
        setPolicies(prev => prev.filter(p => p._id !== policy._id));
        alert('Policy moved to External Policies');
        return true;
      } else {
        throw new Error('Failed to move policy to external');
      }
    } catch (error) {
      console.error('Error moving policy to external:', error);
      throw error;
    }
  };

  const handleStatusUpdate = () => {
    fetchAllPolicies();
  };

  // ================== BATCH CLICK HANDLER ==================

  const handleBatchClick = (batchKey) => {
    console.log('Batch clicked:', batchKey);
    
    // Set active filter
    setActiveBatchFilter(batchKey);
    
    // Reset other filters when a batch is clicked
    setRenewalDays(0);
    setNextYearFilter('all');
    
    // Handle different batch types
    switch (batchKey) {
      case 'total':
        // Show all policies
        setBatchFilter('all');
        setSearchFilters(prev => ({
          ...prev,
          batch: 'all',
          nextYearRenewal: 'all'
        }));
        break;
        
      case 'next_year_7_days':
      case 'next_year_14_days':
      case 'next_year_30_days':
        // Handle next year renewal batches
        setBatchFilter('all');
        setNextYearFilter(batchKey);
        setSearchFilters(prev => ({
          ...prev,
          batch: 'all',
          nextYearRenewal: batchKey === 'next_year_7_days' ? 'next_year_7_days' :
                          batchKey === 'next_year_14_days' ? 'next_year_14_days' :
                          'next_year_30_days'
        }));
        break;
        
      default:
        // Handle regular renewal batches
        setBatchFilter(batchKey);
        setSearchFilters(prev => ({
          ...prev,
          batch: batchKey,
          nextYearRenewal: 'all'
        }));
        break;
    }
    
    // Reset to first page
    setCurrentPage(1);
  };

  // ================== DATA PROCESSING ==================

  const renewalPolicies = useMemo(() => {
    return policies.map(policy => {
      const customer = getCustomerDetails(policy);
      const vehicle = getVehicleInfo(policy);
      const policyInfo = policy.policy_info || {};
      const insuranceQuote = policy.insurance_quote || {};
      
      return {
        ...policy,
        customerDisplay: customer,
        vehicleDisplay: vehicle,
        premium: policyInfo.totalPremium || insuranceQuote.premium || 0,
        insuranceCompany: policyInfo.insuranceCompany || insuranceQuote.insurer || 'N/A',
        policyNumber: policyInfo.policyNumber || 'N/A',
        policyType: getPolicyType(policy),
        summary: generatePolicySummary(policy)
      };
    });
  }, [policies]);

  // FIXED: Enhanced filtering to include all policies with proper expiry date handling
  const filteredPolicies = useMemo(() => {
    let filtered = renewalPolicies;

    // Only filter by renewal days if a specific timeframe is selected (not 0)
    if (renewalDays > 0) {
      filtered = filtered.filter(policy => {
        if (policy.daysUntilExpiry === null) return false; // Exclude no-expiry when filtering by days
        return policy.daysUntilExpiry <= renewalDays && policy.daysUntilExpiry >= -30; // Include expired up to 30 days
      });
    }

    // Apply batch filter
    if (batchFilter !== 'all') {
      filtered = filtered.filter(policy => policy.batch === batchFilter);
    }

    // NEW: Apply next year renewal filter
    if (nextYearFilter !== 'all') {
      filtered = filtered.filter(policy => {
        if (!policy.renewal_scheduled) return false;
        
        switch (nextYearFilter) {
          case 'next_year_30_days':
            return policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 30;
          case 'next_year_14_days':
            return policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 14;
          case 'next_year_7_days':
            return policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 7;
          case 'next_year_due':
            return policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 0;
          default:
            return true;
        }
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(policy => {
        const customer = policy.customerDisplay;
        const vehicle = policy.vehicleDisplay;
        
        return (
          customer.name.toLowerCase().includes(query) ||
          customer.mobile.includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          vehicle.regNo.toLowerCase().includes(query) ||
          vehicle.make.toLowerCase().includes(query) ||
          policy.insuranceCompany.toLowerCase().includes(query) ||
          policy.policyNumber.toLowerCase().includes(query) ||
          (customer.companyName && customer.companyName.toLowerCase().includes(query))
        );
      });
    }

    // Apply advanced filters
    const hasAdvancedFilters = Object.values(searchFilters).some(value => value !== '' && value !== 'all');
    if (hasAdvancedFilters) {
      filtered = filtered.filter(policy => {
        const customer = policy.customerDisplay;
        const vehicle = policy.vehicleDisplay;
        
        const matchesCustomerName = !searchFilters.customerName || 
          customer.name.toLowerCase().includes(searchFilters.customerName.toLowerCase());
        
        const matchesMobile = !searchFilters.mobile || 
          customer.mobile.includes(searchFilters.mobile);
        
        const matchesRegNo = !searchFilters.regNo || 
          vehicle.regNo.toLowerCase().includes(searchFilters.regNo.toLowerCase());
        
        const matchesVehicleMake = !searchFilters.vehicleMake || 
          vehicle.make.toLowerCase().includes(searchFilters.vehicleMake.toLowerCase());
        
        const matchesPolicyNumber = !searchFilters.policyNumber || 
          policy.policyNumber.toLowerCase().includes(searchFilters.policyNumber.toLowerCase());
        
        const matchesInsuranceCompany = !searchFilters.insuranceCompany || 
          policy.insuranceCompany.toLowerCase().includes(searchFilters.insuranceCompany.toLowerCase());
        
        const matchesCity = !searchFilters.city || 
          customer.city.toLowerCase().includes(searchFilters.city.toLowerCase());
        
        const matchesBatch = !searchFilters.batch || searchFilters.batch === 'all' || 
          policy.batch === searchFilters.batch;

        const matchesNextYearRenewal = !searchFilters.nextYearRenewal || searchFilters.nextYearRenewal === 'all' ||
          (searchFilters.nextYearRenewal === 'has_reminder' && policy.renewal_scheduled) ||
          (searchFilters.nextYearRenewal === 'next_year_30_days' && policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 30) ||
          (searchFilters.nextYearRenewal === 'next_year_14_days' && policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 14) ||
          (searchFilters.nextYearRenewal === 'next_year_7_days' && policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 7) ||
          (searchFilters.nextYearRenewal === 'next_year_due' && policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 0);

        return matchesCustomerName && matchesMobile && matchesRegNo && 
               matchesVehicleMake && matchesPolicyNumber && 
               matchesInsuranceCompany && matchesCity && matchesBatch && matchesNextYearRenewal;
      });
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'daysUntilExpiry') {
        // Handle null values for daysUntilExpiry
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
      }
      
      if (sortConfig.key === 'daysUntilNextYearRenewal') {
        // Handle null values for next year renewal
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [renewalPolicies, renewalDays, batchFilter, nextYearFilter, searchQuery, searchFilters, sortConfig]);

  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  // FIXED: Batch statistics calculation - always show stats for ALL policies
  const batchStats = useMemo(() => {
    const stats = {
      '7_days': 0,
      '14_days': 0,
      '30_days': 0,
      '60_days': 0,
      'beyond_60_days': 0,
      'expired': 0,
      'no_expiry': 0,
      // NEW: Next year renewal stats
      'next_year_7_days': 0,
      'next_year_14_days': 0,
      'next_year_30_days': 0,
      total: renewalPolicies.length // Always show total from all policies
    };

    renewalPolicies.forEach(policy => {
      if (stats.hasOwnProperty(policy.batch)) {
        stats[policy.batch]++;
      }
      
      // Count next year renewal policies
      if (policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null) {
        if (policy.daysUntilNextYearRenewal <= 7) {
          stats['next_year_7_days']++;
        } else if (policy.daysUntilNextYearRenewal <= 14) {
          stats['next_year_14_days']++;
        } else if (policy.daysUntilNextYearRenewal <= 30) {
          stats['next_year_30_days']++;
        }
      }
    });

    console.log('Batch Statistics:', stats);
    return stats;
  }, [renewalPolicies]);

  // ================== EVENT HANDLERS ==================

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(paginatedPolicies.map(policy => policy._id || policy.id));
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (policyId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(policyId)) {
      newSelected.delete(policyId);
    } else {
      newSelected.add(policyId);
    }
    setSelectedRows(newSelected);
    
    const allIds = new Set(paginatedPolicies.map(policy => policy._id || policy.id));
    setSelectAll(newSelected.size === allIds.size && allIds.size > 0);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = async (action) => {
    if (selectedRows.size === 0) {
      alert('Please select policies to perform bulk action');
      return;
    }

    try {
      setLoading(true);
      
      if (action === 'export') {
        exportToCSV(renewalPolicies, Array.from(selectedRows));
      } else if (action === 'renew') {
        // Implement bulk renew logic
        alert(`Bulk renew action for ${selectedRows.size} policies`);
      }
      
      setShowBulkActions(false);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const handleRowExpand = (policyId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(policyId)) {
      newExpanded.delete(policyId);
    } else {
      newExpanded.add(policyId);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewClick = (policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const handleEditClick = (policy) => {
    const policyId = policy._id || policy.id;
    navigate(`/new-policy/${policyId}`);
  };

  const handleDeleteClick = (policy) => {
    setPolicyToDelete(policy);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;

    const policyId = policyToDelete._id || policyToDelete.id;

    try {
      await deletePolicy(policyId);
      setDeleteConfirmOpen(false);
      setPolicyToDelete(null);
      alert('Policy deleted successfully!');
    } catch (error) {
      alert('Failed to delete policy. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setPolicyToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApplyAdvancedFilters = (filters) => {
    setSearchFilters(filters);
  };

  const handleResetAdvancedFilters = () => {
    setSearchFilters({
      customerName: '',
      mobile: '',
      regNo: '',
      vehicleMake: '',
      policyNumber: '',
      insuranceCompany: '',
      city: '',
      batch: 'all',
      nextYearRenewal: 'all'
    });
  };

  const handleRenewalDaysChange = (days) => {
    setRenewalDays(days);
    setCurrentPage(1);
  };

  // NEW: Handle next year filter change
  const handleNextYearFilterChange = (filter) => {
    setNextYearFilter(filter);
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportToCSV(filteredPolicies, Array.from(selectedRows));
  };

  // ================== EFFECTS ==================

  useEffect(() => {
    // Fetch all policies on component mount
    fetchAllPolicies();
  }, []);

  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [batchFilter, searchQuery, searchFilters, renewalDays, nextYearFilter]);

  // Reset active batch filter when other filters change
  useEffect(() => {
    if (renewalDays > 0 || searchQuery || Object.values(searchFilters).some(v => v !== '' && v !== 'all')) {
      setActiveBatchFilter('all');
    }
  }, [renewalDays, searchQuery, searchFilters]);

  // Reset active batch filter when next year filter is used
  useEffect(() => {
    if (nextYearFilter !== 'all') {
      setActiveBatchFilter(nextYearFilter);
    }
  }, [nextYearFilter]);

  // ================== RENDER COMPONENTS ==================

  const ViewToggle = () => (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setViewMode('table')}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          viewMode === 'table' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FaList className="text-xs" />
        Table View
      </button>
      <button
        onClick={() => setViewMode('summary')}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          viewMode === 'summary' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FaTh className="text-xs" />
        Summary View
      </button>
    </div>
  );

  const SummaryView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {paginatedPolicies.map((policy) => (
        <CompactPolicySummary 
          key={policy._id || policy.id} 
          policy={policy}
          onView={handleViewClick}
          onEdit={handleEditClick}
        />
      ))}
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-1 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-8">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                />
              </th>
              <th className="px-1 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-8">
                {/* Expand column */}
              </th>
              <th 
                className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-48 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('customerDisplay.name')}
              >
                <div className="flex items-center gap-1">
                  Customer & Vehicle
                  {sortConfig.key === 'customerDisplay.name' && (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  )}
                </div>
              </th>
              <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                Policy Info
              </th>
              <th 
                className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-32 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('daysUntilExpiry')}
              >
                <div className="flex items-center gap-1">
                  Renewal Status
                  {sortConfig.key === 'daysUntilExpiry' && (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  )}
                </div>
              </th>
              <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                Payment
              </th>
              <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedPolicies.map((policy) => {
              const statusDisplay = getStatusDisplay(policy.status);
              const StatusIcon = statusDisplay.icon;
              const BatchIcon = policy.batchInfo.icon;
              const customer = policy.customerDisplay;
              const vehicle = policy.vehicleDisplay;
              const premium = getPremiumInfo(policy);
              const policyType = getPolicyType(policy);
              const insuranceCompany = policy.insuranceCompany;
              const policyNumber = policy.policyNumber;
              const policyId = getPolicyId(policy);
              const idvAmount = getIdvAmount(policy);
              const ncbDiscount = getNcbDiscount(policy);
              const vehicleType = getVehicleType(policy);
              const isSelected = selectedRows.has(policyId);
              const isExpanded = expandedRows.has(policyId);
              const detailedExpiryInfo = getDetailedExpiryInfo(policy);
              
              // Next year renewal info
              const nextYearBatchInfo = getBatchInfo(policy.nextYearBatch);
              const NextYearBatchIcon = nextYearBatchInfo.icon;

              return (
                <React.Fragment key={policyId}>
                  <tr
                    className={`border-b border-gray-100 transition-colors ${
                      isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                    } ${
                      policy.batch === '7_days' ? 'bg-red-50 hover:bg-red-100' :
                      policy.batch === '14_days' ? 'bg-orange-50 hover:bg-orange-100' :
                      policy.batch === '30_days' ? 'bg-yellow-50 hover:bg-yellow-100' :
                      policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 30 ? 'bg-teal-50 hover:bg-teal-100' : ''
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td className="px-1 py-2 border-r border-gray-100">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(policyId)}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                      />
                    </td>

                    {/* Expand Column */}
                    <td className="px-1 py-2 border-r border-gray-100">
                      <button
                        onClick={() => handleRowExpand(policyId)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                      </button>
                    </td>

                    {/* Customer & Vehicle Column */}
                    <td className="px-2 py-2 border-r border-gray-100">
                      <div className="space-y-1.5">
                        {/* Header with Policy ID and Vehicle Type */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-mono text-gray-500">
                            ID: {policyId}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              vehicleType === 'new' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {vehicleType === 'new' ? 'NEW' : 'USED'}
                            </span>
                            {customer.isCorporate && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
                                Corp
                              </span>
                            )}
                            {policy.renewal_scheduled && (
                              <span className="text-xs bg-teal-100 text-teal-800 px-1 py-0.5 rounded flex items-center gap-0.5">
                                <FaCalendarPlus className="text-xs" />
                                Next Year
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                              customer.isCorporate ? 'bg-orange-100' : 'bg-purple-100'
                            }`}>
                              {customer.isCorporate ? (
                                <FaBuilding className="text-orange-600 text-xs" />
                              ) : (
                                <FaUser className="text-purple-600 text-xs" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-sm truncate">
                                {customer.name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
                                <span className="truncate">{customer.mobile}</span>
                              </div>
                              {/* FIXED: Show company name for corporate clients */}
                              {customer.isCorporate && customer.companyName && customer.companyName !== 'N/A' && (
                                <div className="text-xs text-orange-600 flex items-center gap-1 truncate">
                                  <FaIndustry className="text-orange-500 text-xs flex-shrink-0" />
                                  <span className="truncate">{customer.companyName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="pt-1 border-t border-gray-100">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                              <FaCar className="text-blue-600 text-xs" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 text-sm truncate">{vehicle.main}</div>
                              {vehicle.regNo && (
                                <div className="text-xs text-gray-500 truncate">📋 {vehicle.regNo}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Policy Information Column */}
                    <td className="px-2 py-2 border-r border-gray-100">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-sm truncate">{insuranceCompany}</span>
                          <span className={`text-xs px-1 py-0.5 rounded flex-shrink-0 ${
                            policyType === 'Comprehensive' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {policyType}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="text-gray-600 flex justify-between">
                            <span className="truncate">Policy No:</span>
                            <span className="font-mono text-xs truncate ml-1">{policyNumber}</span>
                          </div>
                          <div className="text-gray-600 flex justify-between">
                            <span>Premium:</span>
                            <span className="font-semibold text-green-600 text-xs">{premium}</span>
                          </div>
                          <div className="text-gray-600 flex justify-between">
                            <span>IDV:</span>
                            <span className="font-semibold text-blue-600 text-xs">{idvAmount}</span>
                          </div>
                          <div className="text-gray-600 flex justify-between">
                            <span>NCB:</span>
                            <span className="font-semibold text-yellow-600 text-xs">{ncbDiscount}</span>
                          </div>
                          
                          {/* Next Year Renewal Info */}
                          {policy.renewal_scheduled && policy.next_renewal_date && (
                            <div className="pt-1 border-t border-gray-100 mt-1">
                              <div className="flex items-center gap-1 text-teal-600">
                                <FaCalendarPlus className="text-xs" />
                                <span className="text-xs font-medium">Next Year:</span>
                                <span className="text-xs">{formatDate(policy.next_renewal_date)}</span>
                              </div>
                              {policy.daysUntilNextYearRenewal !== null && (
                                <div className={`text-xs font-medium ${
                                  policy.daysUntilNextYearRenewal <= 0 ? 'text-amber-600' :
                                  policy.daysUntilNextYearRenewal <= 7 ? 'text-pink-600' :
                                  policy.daysUntilNextYearRenewal <= 14 ? 'text-indigo-600' :
                                  'text-teal-600'
                                }`}>
                                  {policy.daysUntilNextYearRenewal <= 0 ? 'Due now' : `In ${policy.daysUntilNextYearRenewal} days`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Renewal Status Column */}
                    <td className="px-2 py-2 border-r border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <BatchIcon className="text-xs" />
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${policy.batchInfo.class}`}>
                            {policy.batchInfo.text}
                          </span>
                        </div>
                        
                        {/* Next Year Renewal Badge */}
                        {policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 30 && (
                          <div className="flex items-center gap-1">
                            <NextYearBatchIcon className="text-xs" />
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${nextYearBatchInfo.class}`}>
                              {nextYearBatchInfo.text}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between items-center">
                            <span>Expiry:</span>
                            <span className="font-semibold text-blue-600 text-xs">{formatDate(policy.expiryDate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Days Left:</span>
                            <span className={`font-semibold ${
                              policy.daysUntilExpiry === null ? 'text-purple-600' :
                              policy.daysUntilExpiry < 0 ? 'text-red-600' :
                              policy.daysUntilExpiry <= 7 ? 'text-red-600' :
                              policy.daysUntilExpiry <= 14 ? 'text-orange-600' :
                              policy.daysUntilExpiry <= 30 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {policy.daysUntilExpiry === null ? 'No Expiry' : 
                               policy.daysUntilExpiry < 0 ? 'Expired' : 
                               `${policy.daysUntilExpiry} days`}
                            </span>
                          </div>
                        </div>

                        {/* Policy Status */}
                        <div className="pt-1 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="text-xs" />
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${statusDisplay.class}`}>
                              {statusDisplay.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Payment Status Column */}
                    <td className="px-2 py-2 border-r border-gray-100">
                      <CompactPaymentBreakdown 
                        policy={policy} 
                        paymentLedger={policy.payment_ledger || []} 
                      />
                    </td>

                    {/* Actions Column */}
                    <td className="px-2 py-2">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleViewClick(policy)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-1.5 py-1 rounded transition-colors border border-purple-200 justify-center"
                        >
                          <FaEye className="text-xs" />
                          View
                        </button>
                        <button 
                          onClick={() => handleEditClick(policy)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-1.5 py-1 rounded transition-colors border border-green-200 justify-center"
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </button>
                        
                        <ActionButton 
                          policy={policy}
                          onStatusUpdate={handleStatusUpdate}
                          onMoveToExternal={moveToExternalPolicies}
                        />
                        
                        <button 
                          onClick={() => handleDeleteClick(policy)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-1.5 py-1 rounded transition-colors border border-red-200 justify-center"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row with Additional Details */}
                  {isExpanded && (
                    <tr className={`border-b border-gray-100 ${
                      policy.batch === '7_days' ? 'bg-red-50' :
                      policy.batch === '14_days' ? 'bg-orange-50' :
                      policy.batch === '30_days' ? 'bg-yellow-50' :
                      policy.renewal_scheduled && policy.daysUntilNextYearRenewal !== null && policy.daysUntilNextYearRenewal <= 30 ? 'bg-teal-50' : 'bg-gray-50'
                    }`}>
                      <td colSpan="7" className="px-3 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          {/* Customer Details */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 border-b pb-1">Customer Details</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Type:</span>
                                <span className="font-medium capitalize">{customer.buyerType}</span>
                              </div>
                              {customer.isCorporate && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Company:</span>
                                    <span className="font-medium">{customer.companyName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Contact Person:</span>
                                    <span className="font-medium">{customer.contactPersonName}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Mobile:</span>
                                <span className="font-medium">{customer.mobile}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{customer.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">City:</span>
                                <span className="font-medium">{customer.city}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pincode:</span>
                                <span className="font-medium">{customer.pincode}</span>
                              </div>
                              {customer.address && customer.address !== 'N/A' && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Address:</span>
                                  <span className="font-medium text-right max-w-[200px]">{customer.address}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Vehicle Details */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 border-b pb-1">Vehicle Details</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Registration No:</span>
                                <span className="font-medium">{vehicle.regNo}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Make & Model:</span>
                                <span className="font-medium">{vehicle.main}</span>
                              </div>
                              {vehicle.variant && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Variant:</span>
                                  <span className="font-medium">{vehicle.variant}</span>
                                </div>
                              )}
                              {vehicle.manufacturingYear && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Manufacturing Year:</span>
                                  <span className="font-medium">{vehicle.manufacturingYear}</span>
                                </div>
                              )}
                              {vehicle.fuelType && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Fuel Type:</span>
                                  <span className="font-medium capitalize">{vehicle.fuelType}</span>
                                </div>
                              )}
                              {vehicle.chassisNo && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Chassis No:</span>
                                  <span className="font-medium font-mono text-xs">{vehicle.chassisNo}</span>
                                </div>
                              )}
                              {vehicle.engineNo && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Engine No:</span>
                                  <span className="font-medium font-mono text-xs">{vehicle.engineNo}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Renewal Details */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 border-b pb-1">Renewal Details</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Insurance Company:</span>
                                <span className="font-medium">{insuranceCompany}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Policy Number:</span>
                                <span className="font-medium">{policyNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Policy Type:</span>
                                <span className="font-medium">{policyType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Premium:</span>
                                <span className="font-medium text-green-600">{premium}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">IDV Amount:</span>
                                <span className="font-medium text-blue-600">{idvAmount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">NCB Discount:</span>
                                <span className="font-medium text-yellow-600">{ncbDiscount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Expiry Date:</span>
                                <span className="font-medium">{formatDate(policy.expiryDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Days Until Expiry:</span>
                                <span className={`font-semibold ${
                                  policy.daysUntilExpiry === null ? 'text-purple-600' :
                                  policy.daysUntilExpiry < 0 ? 'text-red-600' :
                                  policy.daysUntilExpiry <= 7 ? 'text-red-600' :
                                  policy.daysUntilExpiry <= 14 ? 'text-orange-600' :
                                  policy.daysUntilExpiry <= 30 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {policy.daysUntilExpiry === null ? 'No Expiry' : 
                                   policy.daysUntilExpiry < 0 ? 'Expired' : 
                                   `${policy.daysUntilExpiry} days`}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Renewal Batch:</span>
                                <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${policy.batchInfo.class}`}>
                                  {policy.batchInfo.text}
                                </span>
                              </div>
                              
                              {/* Next Year Renewal Information */}
                              {policy.renewal_scheduled && (
                                <div className="pt-2 border-t border-gray-200 mt-2">
                                  <h5 className="font-semibold text-teal-700 mb-1">Next Year Renewal</h5>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Scheduled Date:</span>
                                      <span className="font-medium">{formatDate(policy.next_renewal_date)}</span>
                                    </div>
                                    {policy.daysUntilNextYearRenewal !== null && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Days Until Reminder:</span>
                                        <span className={`font-semibold ${
                                          policy.daysUntilNextYearRenewal <= 0 ? 'text-amber-600' :
                                          policy.daysUntilNextYearRenewal <= 7 ? 'text-pink-600' :
                                          policy.daysUntilNextYearRenewal <= 14 ? 'text-indigo-600' :
                                          'text-teal-600'
                                        }`}>
                                          {policy.daysUntilNextYearRenewal <= 0 ? 'Due now' : `${policy.daysUntilNextYearRenewal} days`}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Reminder Status:</span>
                                      <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${nextYearBatchInfo.class}`}>
                                        {nextYearBatchInfo.text}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Detailed Expiry Information */}
                              {detailedExpiryInfo.odExpiryDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-xs">OD Expiry:</span>
                                  <span className="font-medium text-xs">{formatDate(detailedExpiryInfo.odExpiryDate)}</span>
                                </div>
                              )}
                              {detailedExpiryInfo.tpExpiryDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-xs">TP Expiry:</span>
                                  <span className="font-medium text-xs">{formatDate(detailedExpiryInfo.tpExpiryDate)}</span>
                                </div>
                              )}
                              {detailedExpiryInfo.dueDate && detailedExpiryInfo.dueDate !== policy.expiryDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-xs">Due Date:</span>
                                  <span className="font-medium text-xs">{formatDate(detailedExpiryInfo.dueDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-gray-600">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredPolicies.length)}
              </span>{' '}
              of <span className="font-medium">{filteredPolicies.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-purple-500 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ================== MAIN RENDER ==================

  if (loading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading renewal policies...</p>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaHistory className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-sm">No renewal policies found</p>
        <p className="text-gray-500 text-xs">Policies nearing expiry will appear here</p>
        <button
          onClick={() => fetchAllPolicies()}
          className="mt-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Renewal Overview Header */}
      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renewal Management</h1>
            <p className="text-gray-600 mt-1">
              {renewalDays === 0 
                ? `Tracking all ${filteredPolicies.length} policies with expiry information` 
                : `Proactively manage ${filteredPolicies.length} policies expiring in the next ${renewalDays} days`
              }
            </p>
          </div>
          <ViewToggle />
        </div>

        {/* Batch Statistics */}
        <BatchStatistics 
          stats={batchStats} 
          onBatchClick={handleBatchClick}
          activeFilter={activeBatchFilter}
        />
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-blue-700 font-medium">
                {selectedRows.size} policies selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('export')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <FaFileExport className="text-xs" />
                  Export Selected
                </button>
                <button
                  onClick={() => handleBulkAction('renew')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                >
                  <FaSync className="text-xs" />
                  Bulk Renew
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Renewal Days Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <select
                value={renewalDays}
                onChange={(e) => handleRenewalDaysChange(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={0}>All policies</option>
                <option value={7}>Next 7 days</option>
                <option value={14}>Next 14 days</option>
                <option value={30}>Next 30 days</option>
                <option value={60}>Next 60 days</option>
                <option value={90}>Next 90 days</option>
                <option value={180}>Next 180 days</option>
              </select>
            </div>

            {/* Batch Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="7_days">7 Days (Urgent)</option>
                <option value="14_days">14 Days (High)</option>
                <option value="30_days">30 Days (Medium)</option>
                <option value="60_days">60 Days (Low)</option>
                <option value="beyond_60_days">Beyond 60 Days</option>
                <option value="expired">Expired</option>
                <option value="no_expiry">No Expiry Date</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers, vehicles, policies..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Advanced Search Button */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Advanced</label>
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <FaFilter className="text-xs" />
                Advanced
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {/* NEW: Next Year Renewal Filter Button */}
            <NextYearRenewalFilter 
              onFilterChange={handleNextYearFilterChange}
              activeFilter={nextYearFilter}
            />
            
            <button
              onClick={handleExport}
              disabled={filteredPolicies.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaFileExport className="text-xs" />
              Export
            </button>
            <button
              onClick={() => fetchAllPolicies()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              <FaSync className="text-xs" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded border border-gray-200 p-6">
        {viewMode === 'summary' ? (
          <SummaryView />
        ) : (
          <TableView />
        )}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredPolicies.length === 0 && policies.length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <FaHistory className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-sm mb-1">No renewal policies match your filters</p>
          <button
            onClick={() => {
              setBatchFilter('all');
              setSearchQuery('');
              setNextYearFilter('all');
              setActiveBatchFilter('all');
              handleResetAdvancedFilters();
            }}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-medium"
          >
            Show All Renewals
          </button>
        </div>
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        searchFilters={searchFilters}
        onFilterChange={setSearchFilters}
        onApplyFilters={handleApplyAdvancedFilters}
        onResetFilters={handleResetAdvancedFilters}
      />

      {/* Policy Modal */}
      <PolicyModal
        policy={selectedPolicy}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-md w-full p-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Policy</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              Are you sure you want to delete this policy? This action cannot be undone.
            </p>

            {policyToDelete && (
              <div className="bg-gray-50 rounded p-3 mb-4">
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="font-medium">Policy ID: {getPolicyId(policyToDelete)}</div>
                  {policyToDelete.customer_details && (
                    <div>
                      {policyToDelete.buyer_type === 'corporate' 
                        ? `Company: ${policyToDelete.customer_details.companyName || policyToDelete.customer_details.contactPersonName}`
                        : `Customer: ${policyToDelete.customer_details.name}`
                      }
                    </div>
                  )}
                  {policyToDelete.vehicle_details && (
                    <div>
                      Vehicle: {policyToDelete.vehicle_details.make} {policyToDelete.vehicle_details.model}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Policy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RenewalTable;