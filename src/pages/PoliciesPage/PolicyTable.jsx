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
  FaFilter
} from 'react-icons/fa';

// ================== PAYMENT BREAKDOWN COMPONENTS ==================

// Calculate payment components function
const calculatePaymentComponents = (policy, paymentLedger = []) => {
  const totalPremium = policy.policy_info?.totalPremium || policy.insurance_quote?.premium || 0;
  
  // Extract NCB discount from policy
  const ncbDiscountPercent = policy.policy_info?.ncbDiscount || policy.insurance_quote?.ncb || 0;
  const ncbDiscountAmount = totalPremium * (ncbDiscountPercent / 100);
  
  // Calculate subvention from payment ledger (only customer payments with subvention)
  const subventionAmount = paymentLedger
    .filter(payment => 
      payment.paymentMadeBy === 'Customer' && (
        payment.mode?.toLowerCase().includes('subvention') ||
        payment.description?.toLowerCase().includes('subvention') ||
        payment.category === 'subvention'
      )
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate customer paid amount (only customer payments, excluding subvention and in-house)
  const customerPaidAmount = paymentLedger
    .filter(payment => 
      payment.paymentMadeBy === 'Customer' && 
      !payment.mode?.toLowerCase().includes('subvention') &&
      !payment.description?.toLowerCase().includes('subvention') &&
      payment.category !== 'subvention'
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate effective amount payable after discounts
  const effectivePayable = Math.max(totalPremium - ncbDiscountAmount - subventionAmount, 0);
  
  // Calculate remaining amount to be paid by customer
  const remainingCustomerAmount = Math.max(effectivePayable - customerPaidAmount, 0);
  
  // Calculate payment progress (capped at 100%)
  const paymentProgress = effectivePayable > 0 
    ? Math.min((customerPaidAmount / effectivePayable) * 100, 100)
    : 100;

  // Check payment made by type
  const hasCustomerPayments = customerPaidAmount > 0;
  const hasInHousePayments = paymentLedger.some(payment => payment.paymentMadeBy === 'In House');
  const paymentMadeBy = hasInHousePayments ? 'In House' : 
                       hasCustomerPayments ? 'Customer' : 'Not Paid';

  return {
    totalPremium,
    ncbDiscountPercent,
    ncbDiscountAmount,
    subventionAmount,
    customerPaidAmount,
    remainingCustomerAmount,
    effectivePayable,
    paymentProgress,
    paymentMadeBy,
    hasInHousePayments,
    totalCustomerPayments: customerPaidAmount + subventionAmount
  };
};

// Function to get payment status - MOVED BEFORE FILTER
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

// Compact version for table view
const CompactPaymentBreakdown = ({ policy, paymentLedger = [] }) => {
  const components = calculatePaymentComponents(policy, paymentLedger);
  
  const paymentStatus = getPaymentStatus(policy);
  const PaymentIcon = paymentStatus === 'fully_paid' ? FaCheckCircle : 
                     paymentStatus === 'partially_paid' ? FaMoneyBillWave : FaClock;

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaymentIcon className={`text-sm ${
            paymentStatus === 'fully paid' ? 'text-green-600' :
            paymentStatus === 'partially paid' ? 'text-yellow-600' : 'text-red-600'
          }`} />
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            paymentStatus === 'fully paid' ? 'bg-green-100 text-green-800 border border-green-200' :
            paymentStatus === 'partially paid' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {paymentStatus === 'fully paid' ? 'Fully Paid' :
             paymentStatus === 'partially paid' ? 'Partially Paid' : 'Payment Pending'}
          </span>
        </div>
        
        {/* Payment Type Indicator */}
        <div className={`text-xs px-2 py-1 rounded ${
          components.paymentMadeBy === 'In House' 
            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
            : components.paymentMadeBy === 'Customer'
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {components.paymentMadeBy === 'In House' ? (
            <div className="flex items-center gap-1">
              <FaStore className="text-xs" />
              In House
            </div>
          ) : components.paymentMadeBy === 'Customer' ? (
            <div className="flex items-center gap-1">
              <FaUser className="text-xs" />
              Customer
            </div>
          ) : (
            'Not Paid'
          )}
        </div>
      </div>
      
      {/* Payment Breakdown */}
      <div className="space-y-2 text-xs">
        {/* Total Premium */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Premium:</span>
          <span className="font-semibold text-gray-700">
            ₹{components.totalPremium.toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* NCB Discount - YELLOW */}
        {components.ncbDiscountAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">NCB Discount:</span>
            <span className="font-semibold text-yellow-600">
              -₹{components.ncbDiscountAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        
        {/* Subvention - PURPLE */}
        {components.subventionAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subvention:</span>
            <span className="font-semibold text-purple-600">
              -₹{components.subventionAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        
        {/* Effective Payable - BLUE */}
        <div className="flex items-center justify-between border-t pt-1">
          <span className="text-gray-700 font-medium">Effective Payable:</span>
          <span className="font-bold text-blue-600">
            ₹{components.effectivePayable.toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* Customer Paid - GREEN */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Customer Paid:</span>
          <span className="font-semibold text-green-600">
            ₹{components.customerPaidAmount.toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* Remaining - RED (if any) */}
        {components.remainingCustomerAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-semibold text-red-600">
              ₹{components.remainingCustomerAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              paymentStatus === 'fully paid' ? 'bg-green-500' : 
              paymentStatus === 'partially paid' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${components.paymentProgress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          {components.paymentProgress.toFixed(1)}% of Customer Portion Paid
        </div>
      </div>

      {/* In House Notice */}
      {components.hasInHousePayments && (
        <div className="bg-purple-50 border border-purple-200 rounded p-2">
          <div className="flex items-center gap-2 text-xs text-purple-700">
            <FaStore className="text-xs" />
            <span>Includes In House payment arrangement</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ================== CSV EXPORT UTILITY ==================

const exportToCSV = (policies, selectedRows = []) => {
  // If specific rows are selected, export only those. Otherwise export all filtered policies
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
    'Vehicle Type',
    'Vehicle Make',
    'Vehicle Model',
    'Registration No',
    'Insurance Company',
    'Policy Number',
    'Policy Type',
    'Total Premium',
    'IDV Amount',
    'NCB Discount',
    'Status',
    'Payment Status',
    'Created Date',
    'Expiry Date'
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

    return [
      policy._id || policy.id || 'N/A',
      getCustomerName(),
      customer.mobile || 'N/A',
      customer.email || 'N/A',
      customer.city || 'N/A',
      policy.vehicleType === 'new' ? 'New Car' : 'Used Car',
      vehicle.make || 'N/A',
      vehicle.model || 'N/A',
      vehicle.regNo || 'N/A',
      policyInfo.insuranceCompany || insuranceQuote.insurer || 'N/A',
      policyInfo.policyNumber || 'N/A',
      insuranceQuote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party',
      `₹${(policyInfo.totalPremium || insuranceQuote.premium || 0).toLocaleString('en-IN')}`,
      `₹${(policyInfo.idvAmount || insuranceQuote.idv || 0).toLocaleString('en-IN')}`,
      `${policyInfo.ncbDiscount || insuranceQuote.ncb || 0}%`,
      policy.status || 'N/A',
      getPaymentStatus(policy),
      new Date(policy.created_at || policy.ts).toLocaleDateString('en-IN'),
      policyInfo.dueDate ? new Date(policyInfo.dueDate).toLocaleDateString('en-IN') : 'N/A'
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

// ================== MAIN POLICY TABLE COMPONENT ==================

const PolicyTable = ({ policies, loading, onView, onDelete }) => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Sort policies by creation date (newest first)
  const sortedPolicies = useMemo(() => {
    return [...policies].sort((a, b) => {
      const dateA = new Date(a.created_at || a.ts || 0);
      const dateB = new Date(b.created_at || b.ts || 0);
      return dateB - dateA;
    });
  }, [policies]);

  // Filter and search policies
  const filteredPolicies = useMemo(() => {
    let filtered = sortedPolicies;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }

    // Apply payment filter - FIXED: Using getPaymentStatus function that's now defined above
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(policy => {
        const paymentStatus = getPaymentStatus(policy);
        return paymentStatus === paymentFilter;
      });
    }

    // Apply vehicle type filter
    if (vehicleTypeFilter !== 'all') {
      filtered = filtered.filter(policy => {
        const vehicleType = policy.vehicleType || 'used';
        return vehicleType === vehicleTypeFilter;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(policy => {
        const customer = policy.customer_details || {};
        const customerName = policy.buyer_type === 'corporate' 
          ? (customer.companyName || customer.contactPersonName || '').toLowerCase()
          : (customer.name || '').toLowerCase();
        
        const insuranceCompany = (
          policy.policy_info?.insuranceCompany || 
          policy.insurance_quote?.insurer || 
          ''
        ).toLowerCase();

        const vehicleMake = (policy.vehicle_details?.make || '').toLowerCase();
        const vehicleModel = (policy.vehicle_details?.model || '').toLowerCase();
        const policyNumber = (policy.policy_info?.policyNumber || '').toLowerCase();
        const mobile = (customer.mobile || '').toLowerCase();

        return (
          customerName.includes(query) ||
          insuranceCompany.includes(query) ||
          vehicleMake.includes(query) ||
          vehicleModel.includes(query) ||
          policyNumber.includes(query) ||
          mobile.includes(query) ||
          insuranceCompany.includes(query.replace(/\s+/g, '')) || // For "hdfc" instead of "HDFC Ergo"
          insuranceCompany.includes(query.split(' ')[0]) // For "icici" instead of "ICICI Lombard"
        );
      });
    }

    return filtered;
  }, [sortedPolicies, statusFilter, paymentFilter, vehicleTypeFilter, searchQuery]);

  // Paginate policies
  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(paginatedPolicies.map(policy => policy._id || policy.id));
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle individual row selection
  const handleRowSelect = (policyId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(policyId)) {
      newSelected.delete(policyId);
    } else {
      newSelected.add(policyId);
    }
    setSelectedRows(newSelected);
    
    // Update select all state
    const allIds = new Set(paginatedPolicies.map(policy => policy._id || policy.id));
    setSelectAll(newSelected.size === allIds.size && allIds.size > 0);
  };

  // Reset selection when page changes
  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [currentPage]);

  // Function to get vehicle type
  const getVehicleType = (policy) => {
    return policy.vehicleType || 'used';
  };

  // Function to handle view click
  const handleViewClick = (policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  // Function to handle edit click
  const handleEditClick = (policy) => {
    const policyId = policy._id || policy.id;
    navigate(`/new-policy/${policyId}`);
  };

  // Function to handle delete click
  const handleDeleteClick = (policy) => {
    setPolicyToDelete(policy);
    setDeleteConfirmOpen(true);
  };

  // Function to confirm delete
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

  // Function to cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setPolicyToDelete(null);
    setDeleteLoading(false);
  };

  // Function to format status display
  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { 
        text: 'Active', 
        class: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        icon: FaCheckCircle
      },
      completed: { 
        text: 'Completed', 
        class: 'bg-blue-50 text-blue-700 border border-blue-200',
        icon: FaCheckCircle
      },
      draft: { 
        text: 'Draft', 
        class: 'bg-amber-50 text-amber-700 border border-amber-200',
        icon: FaClock
      },
      pending: { 
        text: 'Pending', 
        class: 'bg-purple-50 text-purple-700 border border-purple-200',
        icon: FaClock
      },
      expired: { 
        text: 'Expired', 
        class: 'bg-rose-50 text-rose-700 border border-rose-200',
        icon: FaExclamationTriangle
      },
      'payment completed': {
        text: 'Payment Completed',
        class: 'bg-green-50 text-green-700 border border-green-200',
        icon: FaCheckCircle
      }
    };

    return statusConfig[status] || { 
      text: status, 
      class: 'bg-gray-50 text-gray-700 border border-gray-200',
      icon: FaTag
    };
  };

  // Function to format date
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

  // Function to get vehicle info
  const getVehicleInfo = (policy) => {
    if (policy.vehicle_details) {
      const make = policy.vehicle_details.make || '';
      const model = policy.vehicle_details.model || '';
      const variant = policy.vehicle_details.variant || '';
      const regNo = policy.vehicle_details.regNo || '';
      const engineNo = policy.vehicle_details.engineNo || '';
      const chassisNo = policy.vehicle_details.chassisNo || '';
      const makeYear = policy.vehicle_details.makeYear || '';
      
      return {
        main: `${make} ${model}`.trim() || 'No Vehicle Info',
        variant: variant,
        regNo: regNo,
        engineNo: engineNo,
        chassisNo: chassisNo,
        makeYear: makeYear
      };
    }
    return {
      main: 'No Vehicle',
      variant: '',
      regNo: '',
      engineNo: '',
      chassisNo: '',
      makeYear: ''
    };
  };

  // Function to get premium info
  const getPremiumInfo = (policy) => {
    if (policy.policy_info?.totalPremium) {
      return `₹${parseInt(policy.policy_info.totalPremium).toLocaleString('en-IN')}`;
    }
    if (policy.insurance_quote?.premium) {
      return `₹${parseInt(policy.insurance_quote.premium).toLocaleString('en-IN')}`;
    }
    return 'N/A';
  };

  // Function to get policy type
  const getPolicyType = (policy) => {
    if (policy.insurance_quote?.coverageType) {
      return policy.insurance_quote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party';
    }
    return policy.insurance_category || 'Insurance';
  };

  // Function to get expiry date
  const getExpiryDate = (policy) => {
    if (policy.policy_info?.dueDate) {
      return policy.policy_info.dueDate;
    }
    return 'N/A';
  };

  // Function to get insurance company
  const getInsuranceCompany = (policy) => {
    if (policy.policy_info?.insuranceCompany) {
      return policy.policy_info.insuranceCompany;
    }
    if (policy.insurance_quote?.insurer) {
      return policy.insurance_quote.insurer;
    }
    return 'N/A';
  };

  // Function to get customer details
  const getCustomerDetails = (policy) => {
    const customer = policy.customer_details || {};
    const isCorporate = policy.buyer_type === 'corporate';
    
    const displayName = isCorporate 
      ? (customer.companyName || customer.contactPersonName || 'N/A')
      : (customer.name || 'N/A');
    
    const contactPerson = isCorporate ? customer.contactPersonName : null;
    const employeeName = customer.employeeName || null;

    return {
      name: displayName,
      contactPerson: contactPerson,
      employeeName: employeeName,
      mobile: customer.mobile || 'N/A',
      email: customer.email || 'N/A',
      city: customer.city || 'N/A',
      buyerType: policy.buyer_type || 'individual',
      isCorporate: isCorporate,
      companyName: customer.companyName || null,
    };
  };

  // Function to get policy number
  const getPolicyNumber = (policy) => {
    if (policy.policy_info?.policyNumber) {
      return policy.policy_info.policyNumber;
    }
    if (policy.policy_info?.covernoteNumber) {
      return policy.policy_info.covernoteNumber;
    }
    return 'N/A';
  };

  // Function to get policy ID for display
  const getPolicyId = (policy) => {
    return policy._id || policy.id || 'N/A';
  };

  // Function to get IDV amount
  const getIdvAmount = (policy) => {
    if (policy.policy_info?.idvAmount) {
      return `₹${parseInt(policy.policy_info.idvAmount).toLocaleString('en-IN')}`;
    }
    if (policy.insurance_quote?.idv) {
      return `₹${parseInt(policy.insurance_quote.idv).toLocaleString('en-IN')}`;
    }
    return 'N/A';
  };

  // Function to get NCB discount
  const getNcbDiscount = (policy) => {
    if (policy.policy_info?.ncbDiscount) {
      return `${policy.policy_info.ncbDiscount}%`;
    }
    if (policy.insurance_quote?.ncb) {
      return `${policy.insurance_quote.ncb}%`;
    }
    return '0%';
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle export
  const handleExport = () => {
    exportToCSV(filteredPolicies, Array.from(selectedRows));
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [statusFilter, paymentFilter, vehicleTypeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-3 text-gray-600 text-sm">Loading policies...</p>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaFileInvoiceDollar className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium mb-1">No policies found</p>
        <p className="text-gray-500 text-xs">Create your first policy to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap flex-1">
            {/* Search Bar */}
            <div className="flex flex-col flex-1 min-w-[300px]">
              <label className="text-xs font-medium text-gray-700 mb-1">Search Policies</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, mobile, company, vehicle, policy number..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="payment completed">Payment Completed</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Payment</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]"
              >
                <option value="all">All Payments</option>
                <option value="fully paid">Fully Paid</option>
                <option value="partially paid">Partially Paid</option>
                <option value="pending">Payment Pending</option>
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]"
              >
                <option value="all">All Vehicles</option>
                <option value="new">New Cars</option>
                <option value="used">Used Cars</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Export Data</label>
            <button
              onClick={handleExport}
              disabled={filteredPolicies.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px] justify-center"
            >
              <FaDownload className="text-sm" />
              {selectedRows.size > 0 ? `Export (${selectedRows.size})` : 'Export All'}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredPolicies.length}</span> policies found
            {filteredPolicies.length !== sortedPolicies.length && (
              <span className="text-gray-400 ml-1">(filtered from {sortedPolicies.length})</span>
            )}
            {searchQuery && (
              <span className="text-purple-600 ml-2">for "{searchQuery}"</span>
            )}
          </div>
          {selectedRows.size > 0 && (
            <div className="text-sm text-blue-600 font-medium">
              {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected for export
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Customer & Vehicle
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Policy Information
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Payment Breakdown
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Status & Dates
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPolicies.map((policy, index) => {
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

                return (
                  <tr
                    key={policyId}
                    className={`border-b border-gray-100 transition-colors ${
                      isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td className="px-4 py-4 border-r border-gray-100">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(policyId)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </td>

                    {/* Customer & Vehicle Column */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-4">
                        {/* Header with Policy ID and Vehicle Type */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600">
                            ID: {policyId}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Vehicle Type Badge */}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              vehicleType === 'new' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {vehicleType === 'new' ? (
                                <div className="flex items-center gap-1">
                                  <FaPlusCircle className="text-xs" />
                                  NEW
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <FaHistory className="text-xs" />
                                  USED
                                </div>
                              )}
                            </span>
                            
                            {/* Corporate Badge */}
                            {customer.isCorporate && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded border border-orange-200">
                                Corporate
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              customer.isCorporate ? 'bg-orange-100' : 'bg-purple-100'
                            }`}>
                              {customer.isCorporate ? (
                                <FaBuilding className="text-orange-600 text-sm" />
                              ) : (
                                <FaUser className="text-purple-600 text-sm" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {customer.name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                {customer.isCorporate ? (
                                  <>
                                    <FaIndustry className="text-gray-400" />
                                    Corporate Client
                                  </>
                                ) : (
                                  <>
                                    <FaUser className="text-gray-400" />
                                    Individual Client
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 pl-11">
                            {/* Contact Person for Corporate */}
                            {customer.isCorporate && customer.contactPerson && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaUserTie className="text-gray-400 text-xs" />
                                Contact: {customer.contactPerson}
                              </div>
                            )}

                            {/* Employee Name */}
                            {customer.employeeName && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaIdCard className="text-gray-400 text-xs" />
                                Employee: {customer.employeeName}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FaPhone className="text-gray-400 text-xs" />
                              {customer.mobile}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FaEnvelope className="text-gray-400 text-xs" />
                              <span className="truncate max-w-[150px]">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FaMapMarkerAlt className="text-gray-400 text-xs" />
                              {customer.city}
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaCar className="text-blue-600 text-sm" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{vehicleInfo.main}</div>
                              {vehicleInfo.variant && (
                                <div className="text-xs text-gray-500">{vehicleInfo.variant}</div>
                              )}
                              {vehicleInfo.makeYear && (
                                <div className="text-xs text-gray-400">Year: {vehicleInfo.makeYear}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2 pl-11 mt-2">
                            {vehicleInfo.regNo && (
                              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                                📋 Reg: {vehicleInfo.regNo}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Policy Information Column */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-sm">{insuranceCompany}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            policyType === 'Comprehensive' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {policyType}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="text-xs text-gray-600 flex justify-between items-center">
                            <span>Policy No:</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{policyNumber}</span>
                          </div>
                          <div className="text-xs text-gray-600 flex justify-between items-center">
                            <span>Premium:</span>
                            <span className="font-semibold text-green-600">{premium}</span>
                          </div>
                          <div className="text-xs text-gray-600 flex justify-between items-center">
                            <span>IDV:</span>
                            <span className="font-semibold text-blue-600">{idvAmount}</span>
                          </div>
                          <div className="text-xs text-gray-600 flex justify-between items-center">
                            <span>NCB:</span>
                            <span className="font-semibold text-yellow-600">{ncbDiscount}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Payment Status Column */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <CompactPaymentBreakdown 
                        policy={policy} 
                        paymentLedger={policy.payment_ledger || []} 
                      />
                    </td>

                    {/* Status & Dates Column */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="text-sm" />
                          <span className={`text-xs font-medium px-2 py-1 rounded ${statusDisplay.class}`}>
                            {statusDisplay.text}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400" />
                              Created:
                            </span>
                            <span>{formatDate(policy.created_at || policy.ts)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1">
                              <FaExclamationTriangle className="text-gray-400" />
                              Expiry:
                            </span>
                            <span className={new Date(expiryDate) < new Date() ? 'text-red-600 font-semibold' : ''}>
                              {formatDate(expiryDate)}
                            </span>
                          </div>
                          
                          {/* Document Status */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="flex items-center gap-1">
                              <FaFileAlt className="text-gray-400" />
                              Documents:
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              policy.documents && policy.documents.length > 0 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {policy.documents && policy.documents.length > 0 ? `${policy.documents.length} docs` : 'No docs'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleViewClick(policy)}
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-3 py-2 rounded transition-colors border border-purple-200"
                        >
                          <FaEye />
                          View Details
                        </button>
                        <button 
                          onClick={() => handleEditClick(policy)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-3 py-2 rounded transition-colors border border-green-200"
                        >
                          <FaEdit />
                          Edit Case
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(policy)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-3 py-2 rounded transition-colors border border-red-200"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredPolicies.length)}
                </span>{' '}
                of <span className="font-medium">{filteredPolicies.length}</span> policies
                <span className="text-gray-400 ml-2">• Newest first</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
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
                        className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
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
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FaFileInvoiceDollar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-sm mb-1">No policies match your filters</p>
          <p className="text-gray-500 text-xs mb-4">Try adjusting your filter criteria</p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setPaymentFilter('all');
              setVehicleTypeFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium"
          >
            Show All Policies
          </button>
        </div>
      )}

      {/* Policy Modal */}
      <PolicyModal
        policy={selectedPolicy}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Policy</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this policy? This action cannot be undone.
            </p>

            {policyToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
                  <div>
                    Vehicle Type: {getVehicleType(policyToDelete) === 'new' ? 'New Car' : 'Used Car'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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