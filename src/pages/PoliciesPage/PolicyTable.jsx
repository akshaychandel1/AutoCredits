// src/pages/PoliciesPage/PolicyTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyModal from './PolicyModal';
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
  FaIdCard,
  FaMoneyBillWave,
  FaCreditCard,
  FaReceipt,
  FaIndustry,
  FaUserTie,
  FaHome,
  FaStore,
  FaShieldAlt,
  FaCarCrash,
  FaFileAlt,
  FaPercentage,
  FaHistory,
  FaPlusCircle,
  FaSearch,
  FaDownload,
  FaFilter,
  FaCog,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

// ================== PAYMENT BREAKDOWN CALCULATION ==================

// Calculate payment components function - IMPROVED: Better payment calculation
const calculatePaymentComponents = (policy, paymentLedger = []) => {
  const totalPremium = policy.policy_info?.totalPremium || policy.insurance_quote?.premium || 0;
  
  // Calculate subvention refunds from payment ledger
  const subventionRefundAmount = paymentLedger
    .filter(payment => payment.type === "subvention_refund")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate ALL customer payments (including subvention refunds for total paid calculation)
  const totalCustomerPaidAmount = paymentLedger
    .filter(payment => 
      payment.paymentMadeBy === "Customer"
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate customer paid amount (excluding subvention refunds for due calculation)
  const customerPaidAmount = paymentLedger
    .filter(payment => 
      payment.paymentMadeBy === "Customer" && 
      payment.type !== "subvention_refund" &&
      !payment.mode?.toLowerCase().includes('subvention') &&
      !payment.description?.toLowerCase().includes('subvention refund')
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate effective amount payable after subvention refunds only
  const effectivePayable = Math.max(totalPremium - subventionRefundAmount, 0);
  
  // Calculate remaining amount to be paid by customer
  const remainingCustomerAmount = Math.max(effectivePayable - customerPaidAmount, 0);
  
  // Calculate auto credit amount (should be total premium)
  const autoCreditEntry = paymentLedger.find(payment => payment.type === "auto_credit");
  const autoCreditAmount = autoCreditEntry ? autoCreditEntry.amount : 0;

  // FIX: Calculate payment progress considering auto credit
  const effectivePaidAmount = autoCreditAmount > 0 ? autoCreditAmount : totalCustomerPaidAmount;
  const paymentProgress = effectivePayable > 0 
    ? Math.min((effectivePaidAmount / effectivePayable) * 100, 100)
    : 100;

  // Check payment made by type
  const hasCustomerPayments = totalCustomerPaidAmount > 0;
  const hasInHousePayments = paymentLedger.some(payment => payment.paymentMadeBy === "In House");
  const hasAutoCredit = autoCreditAmount > 0;
  
  // FIX: Improved payment made by logic
  const paymentMadeBy = hasAutoCredit ? 'Customer' : 
                       hasInHousePayments ? 'In House' : 
                       hasCustomerPayments ? 'Customer' : 'Not Paid';

  return {
    totalPremium,
    subventionRefundAmount,
    customerPaidAmount,
    totalCustomerPaidAmount,
    remainingCustomerAmount,
    effectivePayable,
    paymentProgress,
    paymentMadeBy,
    hasInHousePayments,
    autoCreditAmount,
    hasAutoCredit,
    effectivePaidAmount,
    netPremiumAfterDiscounts: effectivePayable
  };
};

// Function to get payment status - IMPROVED: Consistent calculation
const getPaymentStatus = (policy) => {
  if (policy.payment_info?.paymentStatus) {
    return policy.payment_info.paymentStatus.toLowerCase();
  }
  
  const components = calculatePaymentComponents(policy, policy.payment_ledger || []);
  
  // FIX: Improved status calculation with tolerance for rounding errors
  const tolerance = 0.01; // 1 paisa tolerance
  
  if (components.effectivePaidAmount >= (components.effectivePayable - tolerance) && components.effectivePayable > 0) {
    return 'fully paid';
  } else if (components.effectivePaidAmount > 0) {
    return 'partially paid';
  } else {
    return 'pending';
  }
};

// ================== CSV EXPORT UTILITY ==================

// Helper function to get expiry date for CSV export
const getExpiryDateForCSV = (policy) => {
  const policyInfo = policy.policy_info || {};
  const policyType = (policy.insurance_quote?.coverageType || policy.insurance_category || '').toLowerCase();
  
  // For Third Party policies, use tpExpiryDate
  if (policyType.includes('third party') || policyType.includes('tp')) {
    return policyInfo.tpExpiryDate || policyInfo.dueDate || 'N/A';
  }
  
  // For Standalone OD, Comprehensive, and all other policies, use odExpiryDate
  return policyInfo.odExpiryDate || policyInfo.dueDate || 'N/A';
};

// Format date for CSV export
const formatDateForCSV = (dateString) => {
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
    'Pincode',
    'Address',
    'Vehicle Type',
    'Vehicle Make',
    'Vehicle Model',
    'Variant',
    'Registration No',
    'Manufacturing Year',
    'Fuel Type',
    'Insurance Company',
    'Policy Number',
    'Policy Type',
    'Total Premium',
    'IDV Amount',
    'NCB Discount',
    'Status',
    'Payment Status',
    'Created Date',
    'Expiry Date',
    'Buyer Type',
    'Contact Person',
    'Company Name'
  ];

  const csvData = policiesToExport.map(policy => {
    const customer = policy.customer_details || {};
    const vehicle = policy.vehicle_details || {};
    const policyInfo = policy.policy_info || {};
    const insuranceQuote = policy.insurance_quote || {};
    
    const getCustomerName = () => {
      if (policy.buyer_type === 'corporate') {
        return customer.companyName || customer.contactPersonName || 'N/A';
      }
      return customer.name || 'N/A';
    };

    const getPolicyType = () => {
      if (insuranceQuote.coverageType) {
        return insuranceQuote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party';
      }
      return policy.insurance_category || 'Insurance';
    };

    return [
      policy._id || policy.id || 'N/A',
      getCustomerName(),
      customer.mobile || 'N/A',
      customer.email || 'N/A',
      customer.city || 'N/A',
      customer.pincode || 'N/A',
      customer.address || 'N/A',
      policy.vehicleType === 'new' ? 'New Car' : 'Used Car',
      vehicle.make || 'N/A',
      vehicle.model || 'N/A',
      vehicle.variant || 'N/A',
      vehicle.regNo || 'N/A',
      vehicle.manufacturingYear || 'N/A',
      vehicle.fuelType || 'N/A',
      policyInfo.insuranceCompany || insuranceQuote.insurer || 'N/A',
      policyInfo.policyNumber || 'N/A',
      getPolicyType(),
      `₹${(policyInfo.totalPremium || insuranceQuote.premium || 0).toLocaleString('en-IN')}`,
      `₹${(policyInfo.idvAmount || insuranceQuote.idv || 0).toLocaleString('en-IN')}`,
      `${policyInfo.ncbDiscount || insuranceQuote.ncb || 0}%`,
      policy.status || 'N/A',
      getPaymentStatus(policy),
      formatDateForCSV(policy.created_at || policy.ts),
      formatDateForCSV(getExpiryDateForCSV(policy)),
      policy.buyer_type || 'individual',
      customer.contactPersonName || 'N/A',
      customer.companyName || 'N/A'
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
  link.setAttribute('download', `insurance-policies-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ================== COMPACT PAYMENT BREAKDOWN ==================

const CompactPaymentBreakdown = ({ policy, paymentLedger = [] }) => {
  const components = calculatePaymentComponents(policy, paymentLedger);
  const paymentStatus = getPaymentStatus(policy);

  // FIX: Use the consistent calculation from the main function
  const displayPaidAmount = components.effectivePaidAmount;
  const displayDueAmount = Math.max(components.effectivePayable - components.effectivePaidAmount, 0);
  
  // FIX: Use consistent progress calculation
  const displayProgress = components.paymentProgress;

  // FIX: Use the actual payment status from the main function
  const displayPaymentStatus = paymentStatus;
  const displayPaymentMadeBy = components.paymentMadeBy;

  return (
    <div className="space-y-1.5 p-1.5 bg-gray-50 rounded border border-gray-200 text-xs">
      {/* Status Header - FIXED: Use actual payment status */}
      <div className="flex items-center justify-between">
        <span className={`font-medium px-1 py-0.5 rounded text-xs ${
          displayPaymentStatus === 'fully paid' ? 'bg-green-100 text-green-800' :
          displayPaymentStatus === 'partially paid' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {displayPaymentStatus === 'fully paid' ? 'Paid' :
           displayPaymentStatus === 'partially paid' ? 'Partial' : 'Pending'}
        </span>
        
        <div className={`px-1 py-0.5 rounded text-xs ${
          displayPaymentMadeBy === 'In House' ? 'bg-purple-100 text-purple-800' :
          displayPaymentMadeBy === 'Customer' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {displayPaymentMadeBy === 'In House' ? 'In House' :
           displayPaymentMadeBy === 'Customer' ? 'Customer' : 'Not Paid'}
        </div>
      </div>
      
      {/* Payment Breakdown - FIXED: Use consistent amounts */}
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
            ₹{displayPaidAmount.toLocaleString('en-IN')}
          </span>
        </div>
        
        {displayDueAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Due:</span>
            <span className="text-red-600 font-medium">
              ₹{displayDueAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
      
      {/* Progress Bar - FIXED: Use consistent progress */}
      <div className="pt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Payment Progress</span>
          <span>{displayProgress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              displayProgress === 100 ? 'bg-green-500' : 
              displayProgress > 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(displayProgress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Auto Credit Info - Show only if auto credit exists */}
      {components.hasAutoCredit && (
        <div className="pt-1 border-t border-gray-200">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Auto Credit:</span>
            <span className="font-medium text-green-600">
              ₹{components.autoCreditAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ... (rest of the code remains exactly the same - AdvancedSearch component and PolicyTable component)

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
      email: '',
      regNo: '',
      vehicleMake: '',
      vehicleModel: '',
      policyNumber: '',
      insuranceCompany: '',
      city: '',
      pincode: '',
      minPremium: '',
      maxPremium: '',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(resetFilters);
    onResetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm background-drop-md bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Search</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Customer Information */}
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
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                value={localFilters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="Search by email"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Vehicle Information */}
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
              <label className="text-sm font-medium text-gray-700">Vehicle Model</label>
              <input
                type="text"
                value={localFilters.vehicleModel}
                onChange={(e) => handleFilterChange('vehicleModel', e.target.value)}
                placeholder="Search by vehicle model"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Policy Information */}
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

            {/* Location */}
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
              <label className="text-sm font-medium text-gray-700">Pincode</label>
              <input
                type="text"
                value={localFilters.pincode}
                onChange={(e) => handleFilterChange('pincode', e.target.value)}
                placeholder="Search by pincode"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Premium Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Min Premium</label>
              <input
                type="number"
                value={localFilters.minPremium}
                onChange={(e) => handleFilterChange('minPremium', e.target.value)}
                placeholder="Minimum premium"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Premium</label>
              <input
                type="number"
                value={localFilters.maxPremium}
                onChange={(e) => handleFilterChange('maxPremium', e.target.value)}
                placeholder="Maximum premium"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
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

// ================== MAIN POLICY TABLE COMPONENT ==================

const PolicyTable = ({ policies, loading, onView, onDelete }) => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
    email: '',
    regNo: '',
    vehicleMake: '',
    vehicleModel: '',
    policyNumber: '',
    insuranceCompany: '',
    city: '',
    pincode: '',
    minPremium: '',
    maxPremium: '',
    startDate: '',
    endDate: ''
  });

  const navigate = useNavigate();

  // Sort policies by creation date (newest first)
  const sortedPolicies = useMemo(() => {
    return [...policies].sort((a, b) => {
      const dateA = new Date(a.created_at || a.ts || 0);
      const dateB = new Date(b.created_at || b.ts || 0);
      return dateB - dateA;
    });
  }, [policies]);

  // Enhanced search function with advanced filters
  const filteredPolicies = useMemo(() => {
    let filtered = sortedPolicies;

    // Apply advanced search filters
    const hasAdvancedFilters = Object.values(searchFilters).some(value => value !== '');
    
    if (hasAdvancedFilters) {
      filtered = filtered.filter(policy => {
        const customer = policy.customer_details || {};
        const vehicle = policy.vehicle_details || {};
        const policyInfo = policy.policy_info || {};
        const insuranceQuote = policy.insurance_quote || {};

        const customerName = policy.buyer_type === 'corporate' 
          ? (customer.companyName || customer.contactPersonName || '').toLowerCase()
          : (customer.name || '').toLowerCase();

        const matchesCustomerName = !searchFilters.customerName || 
          customerName.includes(searchFilters.customerName.toLowerCase());

        const matchesMobile = !searchFilters.mobile || 
          (customer.mobile || '').includes(searchFilters.mobile);

        const matchesEmail = !searchFilters.email || 
          (customer.email || '').toLowerCase().includes(searchFilters.email.toLowerCase());

        const matchesRegNo = !searchFilters.regNo || 
          (vehicle.regNo || '').toLowerCase().includes(searchFilters.regNo.toLowerCase());

        const matchesVehicleMake = !searchFilters.vehicleMake || 
          (vehicle.make || '').toLowerCase().includes(searchFilters.vehicleMake.toLowerCase());

        const matchesVehicleModel = !searchFilters.vehicleModel || 
          (vehicle.model || '').toLowerCase().includes(searchFilters.vehicleModel.toLowerCase());

        const matchesPolicyNumber = !searchFilters.policyNumber || 
          (policyInfo.policyNumber || '').toLowerCase().includes(searchFilters.policyNumber.toLowerCase());

        const matchesInsuranceCompany = !searchFilters.insuranceCompany || 
          (policyInfo.insuranceCompany || insuranceQuote.insurer || '').toLowerCase().includes(searchFilters.insuranceCompany.toLowerCase());

        const matchesCity = !searchFilters.city || 
          (customer.city || '').toLowerCase().includes(searchFilters.city.toLowerCase());

        const matchesPincode = !searchFilters.pincode || 
          (customer.pincode || '').includes(searchFilters.pincode);

        const totalPremium = policyInfo.totalPremium || insuranceQuote.premium || 0;
        const matchesMinPremium = !searchFilters.minPremium || totalPremium >= parseFloat(searchFilters.minPremium);
        const matchesMaxPremium = !searchFilters.maxPremium || totalPremium <= parseFloat(searchFilters.maxPremium);

        const createdDate = new Date(policy.created_at || policy.ts);
        const matchesStartDate = !searchFilters.startDate || createdDate >= new Date(searchFilters.startDate);
        const matchesEndDate = !searchFilters.endDate || createdDate <= new Date(searchFilters.endDate + 'T23:59:59');

        return matchesCustomerName && matchesMobile && matchesEmail && matchesRegNo && 
               matchesVehicleMake && matchesVehicleModel && matchesPolicyNumber && 
               matchesInsuranceCompany && matchesCity && matchesPincode &&
               matchesMinPremium && matchesMaxPremium && matchesStartDate && matchesEndDate;
      });
    }

    // Apply basic search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(policy => {
        const customer = policy.customer_details || {};
        
        // Customer information
        const customerName = policy.buyer_type === 'corporate' 
          ? (customer.companyName || customer.contactPersonName || '').toLowerCase()
          : (customer.name || '').toLowerCase();
        
        // Contact information
        const mobile = (customer.mobile || '').toLowerCase();
        const email = (customer.email || '').toLowerCase();
        
        // Vehicle information
        const vehicleMake = (policy.vehicle_details?.make || '').toLowerCase();
        const vehicleModel = (policy.vehicle_details?.model || '').toLowerCase();
        const regNo = (policy.vehicle_details?.regNo || '').toLowerCase();
        
        // Policy information
        const insuranceCompany = (
          policy.policy_info?.insuranceCompany || 
          policy.insurance_quote?.insurer || 
          ''
        ).toLowerCase();
        const policyNumber = (policy.policy_info?.policyNumber || '').toLowerCase();
        
        // Search across all fields
        return (
          customerName.includes(query) ||
          mobile.includes(query) ||
          email.includes(query) ||
          vehicleMake.includes(query) ||
          vehicleModel.includes(query) ||
          regNo.includes(query) ||
          // Enhanced registration number search - last 4 digits
          (regNo && regNo.slice(-4).includes(query)) ||
          insuranceCompany.includes(query) ||
          policyNumber.includes(query) ||
          // Fuzzy search for insurance companies
          insuranceCompany.includes(query.replace(/\s+/g, '')) ||
          insuranceCompany.includes(query.split(' ')[0])
        );
      });
    }

    return filtered;
  }, [sortedPolicies, searchQuery, searchFilters]);

  // Paginate policies
  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  // Selection handlers
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

  // Expand row handler
  const handleRowExpand = (policyId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(policyId)) {
      newExpanded.delete(policyId);
    } else {
      newExpanded.add(policyId);
    }
    setExpandedRows(newExpanded);
  };

  // Reset selection when page changes
  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [currentPage]);

  // Helper functions
  const getVehicleType = (policy) => policy.vehicleType || 'used';

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
    setDeleteLoading(true);

    try {
      const response = await fetch(`https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (onDelete) {
          onDelete(policyId);
        }
        setDeleteConfirmOpen(false);
        setPolicyToDelete(null);
      } else {
        throw new Error('Failed to delete policy');
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      alert('Failed to delete policy. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setPolicyToDelete(null);
    setDeleteLoading(false);
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { 
        text: 'Active', 
        class: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        icon: FaCheckCircle,
        description: 'Policy is currently protecting the customer'
      },
      completed: { 
        text: 'Completed', 
        class: 'bg-blue-100 text-blue-800 border border-blue-200',
        icon: FaCheckCircle,
        description: 'Policy purchased but coverage starts later'
      },
      draft: { 
        text: 'Draft', 
        class: 'bg-amber-100 text-amber-800 border border-amber-200',
        icon: FaClock,
        description: 'Policy is saved but not finalized'
      },
      pending: { 
        text: 'Pending', 
        class: 'bg-purple-100 text-purple-800 border border-purple-200',
        icon: FaClock,
        description: 'Awaiting processing or approval'
      },
      expired: { 
        text: 'Expired', 
        class: 'bg-rose-100 text-rose-800 border border-rose-200',
        icon: FaExclamationTriangle,
        description: 'Policy coverage has ended'
      },
      'payment completed': {
        text: 'Paid',
        class: 'bg-green-100 text-green-800 border border-green-200',
        icon: FaCheckCircle,
        description: 'Payment completed for policy'
      }
    };

    return statusConfig[status] || { 
      text: status, 
      class: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: FaTag,
      description: 'Policy status'
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
        engineNo: engineNo
      };
    }
    return {
      main: 'No Vehicle',
      variant: '',
      regNo: '',
      manufacturingYear: '',
      fuelType: '',
      chassisNo: '',
      engineNo: ''
    };
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

  const getPolicyType = (policy) => {
    if (policy.insurance_quote?.coverageType) {
      return policy.insurance_quote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party';
    }
    return policy.insurance_category || 'Insurance';
  };

  // UPDATED: Get expiry date based on policy type - clean single expiry date for status column
  const getExpiryDate = (policy) => {
    const policyInfo = policy.policy_info || {};
    const policyType = getPolicyType(policy).toLowerCase();
    
    // For Third Party policies, use tpExpiryDate
    if (policyType.includes('third party') || policyType.includes('tp')) {
      return policyInfo.tpExpiryDate || policyInfo.dueDate || 'N/A';
    }
    
    // For Standalone OD, Comprehensive, and all other policies, use odExpiryDate
    return policyInfo.odExpiryDate || policyInfo.dueDate || 'N/A';
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExport = () => {
    exportToCSV(filteredPolicies, Array.from(selectedRows));
  };

  const handleApplyAdvancedFilters = (filters) => {
    setSearchFilters(filters);
  };

  const handleResetAdvancedFilters = () => {
    setSearchFilters({
      customerName: '',
      mobile: '',
      email: '',
      regNo: '',
      vehicleMake: '',
      vehicleModel: '',
      policyNumber: '',
      insuranceCompany: '',
      city: '',
      pincode: '',
      minPremium: '',
      maxPremium: '',
      startDate: '',
      endDate: ''
    });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [searchQuery, searchFilters]);

  if (loading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading policies...</p>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaFileInvoiceDollar className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-sm">No policies found</p>
        <p className="text-gray-500 text-xs">Create your first policy to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded border border-gray-200 p-3 mb-3">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap flex-1">
            {/* Search Bar */}
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-700 mb-1">Quick Search</label>
              <div className="relative">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, mobile, vehicle, policy no..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Search Button */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Advanced</label>
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[100px] justify-center"
              >
                <FaFilter className="text-xs" />
                Advanced
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Export</label>
            <button
              onClick={handleExport}
              disabled={filteredPolicies.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] justify-center"
            >
              <FaDownload className="text-xs" />
              {selectedRows.size > 0 ? `Export (${selectedRows.size})` : 'Export All'}
            </button>
          </div>
        </div>

        {/* Results Count and Active Filters */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{filteredPolicies.length}</span> policies
            {filteredPolicies.length !== sortedPolicies.length && (
              <span className="text-gray-400 ml-1">(of {sortedPolicies.length})</span>
            )}
            {searchQuery && (
              <span className="text-purple-600 ml-1">for "{searchQuery}"</span>
            )}
          </div>
          
          {/* Active Advanced Filters */}
          {Object.values(searchFilters).some(value => value !== '') && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {Object.entries(searchFilters).map(([key, value]) => 
                value && (
                  <span key={key} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    {key}: {value}
                  </span>
                )
              )}
              <button
                onClick={handleResetAdvancedFilters}
                className="text-xs text-red-600 hover:text-red-800 ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {selectedRows.size > 0 && (
            <div className="text-xs text-blue-600 font-medium">
              {selectedRows.size} selected
            </div>
          )}
        </div>
      </div>

      {/* Compact Table */}
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
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-48">
                  Customer & Vehicle
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                  Policy Info
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                  Payment
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-32">
                  Status & Dates
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPolicies.map((policy) => {
                const statusDisplay = getStatusDisplay(policy.status);
                const StatusIcon = statusDisplay.icon;
                const customer = getCustomerDetails(policy);
                const vehicleInfo = getVehicleInfo(policy);
                const premium = getPremiumInfo(policy);
                const policyType = getPolicyType(policy);
                const expiryDate = getExpiryDate(policy);
                const insuranceCompany = getInsuranceCompany(policy);
                const policyNumber = getPolicyNumber(policy);
                const policyId = getPolicyId(policy);
                const paymentStatus = getPaymentStatus(policy);
                const idvAmount = getIdvAmount(policy);
                const ncbDiscount = getNcbDiscount(policy);
                const vehicleType = getVehicleType(policy);
                const isSelected = selectedRows.has(policyId);
                const isExpanded = expandedRows.has(policyId);

                return (
                  <React.Fragment key={policyId}>
                    <tr
                      className={`border-b border-gray-100 transition-colors ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
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
                                <div className="font-medium text-gray-900 text-sm truncate">{vehicleInfo.main}</div>
                                {vehicleInfo.regNo && (
                                  <div className="text-xs text-gray-500 truncate">📋 {vehicleInfo.regNo}</div>
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

                      {/* Status & Dates Column */}
                      <td className="px-2 py-2 border-r border-gray-100">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="text-xs" />
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${statusDisplay.class}`}>
                              {statusDisplay.text}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between items-center">
                              <span>Created:</span>
                              <span className="text-xs">{formatDate(policy.created_at || policy.ts)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Expiry:</span>
                              <span className={`text-xs ${new Date(expiryDate) < new Date() ? 'text-red-600 font-semibold' : ''}`}>
                                {formatDate(expiryDate)}
                              </span>
                            </div>
                            
                            {/* Document Status */}
                            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                              <span>Documents:</span>
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                policy.documents && policy.documents.length > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {policy.documents && policy.documents.length > 0 ? `${policy.documents.length}` : '0'}
                              </span>
                            </div>
                          </div>
                        </div>
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
                      <tr className="bg-gray-50 border-b border-gray-100">
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
                                  <span className="font-medium">{vehicleInfo.regNo}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Make & Model:</span>
                                  <span className="font-medium">{vehicleInfo.main}</span>
                                </div>
                                {vehicleInfo.variant && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Variant:</span>
                                    <span className="font-medium">{vehicleInfo.variant}</span>
                                  </div>
                                )}
                                {vehicleInfo.manufacturingYear && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Manufacturing Year:</span>
                                    <span className="font-medium">{vehicleInfo.manufacturingYear}</span>
                                  </div>
                                )}
                                {vehicleInfo.fuelType && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fuel Type:</span>
                                    <span className="font-medium capitalize">{vehicleInfo.fuelType}</span>
                                  </div>
                                )}
                                {vehicleInfo.chassisNo && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Chassis No:</span>
                                    <span className="font-medium font-mono text-xs">{vehicleInfo.chassisNo}</span>
                                  </div>
                                )}
                                {vehicleInfo.engineNo && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Engine No:</span>
                                    <span className="font-medium font-mono text-xs">{vehicleInfo.engineNo}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Policy Details */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 border-b pb-1">Policy Details</h4>
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
                                  <span className="text-gray-600">Created Date:</span>
                                  <span className="font-medium">{formatDate(policy.created_at || policy.ts)}</span>
                                </div>
                                
                                {/* UPDATED: Show proper expiry dates based on policy type */}
                                {policy.policy_info && (
                                  <>
                                    {/* Show single expiry date for status display */}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Policy Expiry:</span>
                                      <span className="font-medium">{formatDate(expiryDate)}</span>
                                    </div>
                                    
                                    {/* Show detailed expiry information in expanded view */}
                                    {policyType.toLowerCase().includes('comprehensive') && (
                                      <>
                                        {policy.policy_info.odExpiryDate && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600 text-xs">OD Expiry:</span>
                                            <span className="font-medium text-xs">{formatDate(policy.policy_info.odExpiryDate)}</span>
                                          </div>
                                        )}
                                        {policy.policy_info.tpExpiryDate && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600 text-xs">TP Expiry:</span>
                                            <span className="font-medium text-xs">{formatDate(policy.policy_info.tpExpiryDate)}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </>
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

        {/* Compact Pagination */}
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
                
                {/* Page Numbers */}
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

      {/* Empty State for Filtered Results */}
      {filteredPolicies.length === 0 && policies.length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <FaFileInvoiceDollar className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-sm mb-1">No policies match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleResetAdvancedFilters();
            }}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-medium"
          >
            Clear Filters
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

export default PolicyTable;