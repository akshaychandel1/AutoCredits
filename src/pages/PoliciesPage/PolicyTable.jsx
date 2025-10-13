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
  FaPercentage
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

// Compact version for table view
const CompactPaymentBreakdown = ({ policy, paymentLedger = [] }) => {
  const components = calculatePaymentComponents(policy, paymentLedger);
  
  const getPaymentStatus = () => {
    if (components.customerPaidAmount >= components.effectivePayable && components.effectivePayable > 0) {
      return 'fully_paid';
    } else if (components.customerPaidAmount > 0) {
      return 'partially_paid';
    } else {
      return 'pending';
    }
  };

  const paymentStatus = getPaymentStatus();
  const PaymentIcon = paymentStatus === 'fully_paid' ? FaCheckCircle : 
                     paymentStatus === 'partially_paid' ? FaMoneyBillWave : FaClock;

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaymentIcon className={`text-sm ${
            paymentStatus === 'fully_paid' ? 'text-green-600' :
            paymentStatus === 'partially_paid' ? 'text-yellow-600' : 'text-red-600'
          }`} />
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            paymentStatus === 'fully_paid' ? 'bg-green-100 text-green-800 border border-green-200' :
            paymentStatus === 'partially_paid' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {paymentStatus === 'fully_paid' ? 'Fully Paid' :
             paymentStatus === 'partially_paid' ? 'Partially Paid' : 'Payment Pending'}
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
              paymentStatus === 'fully_paid' ? 'bg-green-500' : 
              paymentStatus === 'partially_paid' ? 'bg-yellow-500' : 'bg-red-500'
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

// ================== MAIN POLICY TABLE COMPONENT ==================

const PolicyTable = ({ policies, loading, onView, onDelete }) => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
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

  // Filter policies by status and payment
  const filteredPolicies = useMemo(() => {
    let filtered = sortedPolicies;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(policy => {
        const paymentStatus = getPaymentStatus(policy);
        return paymentStatus === paymentFilter;
      });
    }

    return filtered;
  }, [sortedPolicies, statusFilter, paymentFilter]);

  // Paginate policies
  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  // Function to get payment status
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

  // Function to format payment status display
  const getPaymentStatusDisplay = (paymentStatus) => {
    const paymentConfig = {
      'fully paid': {
        text: 'Fully Paid',
        class: 'bg-green-100 text-green-800 border border-green-200',
        icon: FaCheckCircle
      },
      'partially paid': {
        text: 'Partially Paid',
        class: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: FaMoneyBillWave
      },
      'pending': {
        text: 'Payment Pending',
        class: 'bg-red-100 text-red-800 border border-red-200',
        icon: FaClock
      }
    };

    return paymentConfig[paymentStatus] || {
      text: 'Unknown',
      class: 'bg-gray-100 text-gray-800 border border-gray-200',
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

  // ENHANCED: Function to get customer details with corporate support
  const getCustomerDetails = (policy) => {
    const customer = policy.customer_details || {};
    const isCorporate = policy.buyer_type === 'corporate';
    
    // For corporate: Use companyName and contactPersonName
    // For individual: Use name field
    const displayName = isCorporate 
      ? (customer.companyName || customer.contactPersonName || 'N/A')
      : (customer.name || 'N/A');
    
    const contactPerson = isCorporate ? customer.contactPersonName : null;
    const employeeName = customer.employeeName || null;
    const panNumber = isCorporate ? customer.companyPanNumber : customer.panNumber;
    const gstNumber = customer.gstNumber || null;

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
      panNumber: panNumber || null,
      gstNumber: gstNumber || null,
      residenceAddress: customer.residenceAddress || 'N/A'
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

  // Function to get previous policy info
  const getPreviousPolicyInfo = (policy) => {
    const previousPolicy = policy.previous_policy || {};
    return {
      company: previousPolicy.insuranceCompany || 'N/A',
      policyNumber: previousPolicy.policyNumber || 'N/A',
      claimTaken: previousPolicy.claimTakenLastYear || 'no',
      ncbDiscount: previousPolicy.ncbDiscount || '0%'
    };
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentFilter]);

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
     

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Customer Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Vehicle Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Policy Information
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Payment Status
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
                const previousPolicy = getPreviousPolicyInfo(policy);

                return (
                  <tr
                    key={policy._id || policy.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Customer Details Column - ENHANCED */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-3">
                        {/* Policy ID */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600">
                            ID: {policyId}
                          </div>
                          {customer.isCorporate && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded border border-orange-200">
                              Corporate
                            </span>
                          )}
                        </div>

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

                          {/* Additional Customer Info */}
                          {customer.panNumber && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FaFileAlt className="text-gray-400 text-xs" />
                              PAN: {customer.panNumber}
                            </div>
                          )}
                          {customer.isCorporate && customer.gstNumber && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FaFileAlt className="text-gray-400 text-xs" />
                              GST: {customer.gstNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vehicle Details Column - ENHANCED */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-3">
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
                        
                        <div className="space-y-2 pl-11">
                          {vehicleInfo.regNo && (
                            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                              📋 Reg: {vehicleInfo.regNo}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            {vehicleInfo.engineNo && (
                              <div className="flex items-center gap-2">
                                <FaCarCrash className="text-gray-400 text-xs" />
                                Engine: {vehicleInfo.engineNo}
                              </div>
                            )}
                            {vehicleInfo.chassisNo && (
                              <div className="flex items-center gap-2">
                                <FaShieldAlt className="text-gray-400 text-xs" />
                                Chassis: {vehicleInfo.chassisNo}
                              </div>
                            )}
                          </div>

                          {/* Previous Policy Info */}
                          {previousPolicy.company !== 'N/A' && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-500 font-medium mb-1">Previous Policy:</div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Company: {previousPolicy.company}</div>
                                <div>Policy No: {previousPolicy.policyNumber}</div>
                                <div className="flex items-center gap-2">
                                  <FaPercentage className="text-gray-400 text-xs" />
                                  NCB: {previousPolicy.ncbDiscount}
                                </div>
                                <div className={`text-xs ${previousPolicy.claimTaken === 'yes' ? 'text-red-600' : 'text-green-600'}`}>
                                  Claim: {previousPolicy.claimTaken === 'yes' ? 'Yes' : 'No'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Policy Information Column - ENHANCED */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-3">
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
                        
                        <div className="space-y-2">
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
                          
                          {/* Additional Policy Info */}
                          {policy.policy_info?.insuranceDuration && (
                            <div className="text-xs text-gray-600 flex justify-between">
                              <span>Duration:</span>
                              <span>{policy.policy_info.insuranceDuration}</span>
                            </div>
                          )}
                          {policy.policy_info?.issueDate && (
                            <div className="text-xs text-gray-600 flex justify-between">
                              <span>Issued:</span>
                              <span>{formatDate(policy.policy_info.issueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Payment Status Column - ENHANCED */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <CompactPaymentBreakdown 
                        policy={policy} 
                        paymentLedger={policy.payment_ledger || []} 
                      />
                    </td>

                    {/* Status & Dates Column - ENHANCED */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="text-sm" />
                          <span className={`text-xs font-medium px-2 py-1 rounded ${statusDisplay.class}`}>
                            {statusDisplay.text}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-2">
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
                          
                          {/* Additional Dates */}
                          {policy.policy_info?.policyStartDate && (
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-400" />
                                Start:
                              </span>
                              <span>{formatDate(policy.policy_info.policyStartDate)}</span>
                            </div>
                          )}
                          
                          {/* Payment Dates */}
                          {policy.payment_info?.paymentDate && (
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1">
                                <FaMoneyBillWave className="text-gray-400" />
                                Last Payment:
                              </span>
                              <span>{formatDate(policy.payment_info.paymentDate)}</span>
                            </div>
                          )}
                          
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
                              {policy.documents && policy.documents.length > 0 ? `${policy.documents.length} ` : 'No docs'}
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