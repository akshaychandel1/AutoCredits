// src/pages/PoliciesPage/PolicyModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaMoneyBillWave,
  FaCreditCard,
  FaIdCard,
  FaBuilding,
  FaTag,
  FaFileAlt,
  FaShieldAlt,
  FaPercentage,
  FaHistory,
  FaArrowRight
} from 'react-icons/fa';
import logo from "../../assets/logo.png";

const PolicyModal = ({ policy, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !policy) return null;

  // Function to handle edit click
  const handleEditClick = () => {
    const policyId = policy._id || policy.id;
    navigate(`/new-policy/${policyId}`);
    onClose(); // Close modal after navigation
  };

  // Function to format status display
  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { 
        text: 'Active', 
        class: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        icon: FaCheckCircle,
        color: 'emerald'
      },
      completed: { 
        text: 'Completed', 
        class: 'bg-blue-50 text-blue-700 border border-blue-200',
        icon: FaCheckCircle,
        color: 'blue'
      },
      draft: { 
        text: 'Draft', 
        class: 'bg-amber-50 text-amber-700 border border-amber-200',
        icon: FaClock,
        color: 'amber'
      },
      pending: { 
        text: 'Pending', 
        class: 'bg-purple-50 text-purple-700 border border-purple-200',
        icon: FaClock,
        color: 'purple'
      },
      expired: { 
        text: 'Expired', 
        class: 'bg-rose-50 text-rose-700 border border-rose-200',
        icon: FaExclamationTriangle,
        color: 'rose'
      },
      'payment completed': {
        text: 'Payment Completed',
        class: 'bg-green-50 text-green-700 border border-green-200',
        icon: FaCheckCircle,
        color: 'green'
      }
    };

    return statusConfig[status] || { 
      text: status, 
      class: 'bg-gray-50 text-gray-700 border border-gray-200',
      icon: FaTag,
      color: 'gray'
    };
  };

  // Function to format payment status display
  const getPaymentStatusDisplay = (policy) => {
    const totalPaid = policy.payment_info?.totalPaidAmount || 0;
    const totalPremium = policy.policy_info?.totalPremium || policy.insurance_quote?.premium || 0;
    
    let paymentStatus = 'pending';
    if (totalPaid >= totalPremium && totalPremium > 0) {
      paymentStatus = 'fully paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partially paid';
    }

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

    return paymentConfig[paymentStatus] || paymentConfig.pending;
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  // Function to get premium info
  const getPremiumInfo = (policy) => {
    if (policy.policy_info?.totalPremium) {
      return parseInt(policy.policy_info.totalPremium);
    }
    if (policy.insurance_quote?.premium) {
      return parseInt(policy.insurance_quote.premium);
    }
    return 0;
  };

  // Function to get paid amount
  const getPaidAmount = (policy) => {
    const totalPaid = policy.payment_info?.totalPaidAmount || 0;
    const totalPremium = getPremiumInfo(policy);
    
    return {
      paid: totalPaid,
      total: totalPremium,
      percentage: totalPremium > 0 ? (totalPaid / totalPremium) * 100 : 0
    };
  };

  // Enhanced function to get insurance quotes
  const getInsuranceQuotes = () => {
    const possibleQuoteFields = [
      'insurance_quotes',
      'insuranceQuotes', 
      'quotes',
      'insurance_quote'
    ];

    for (const field of possibleQuoteFields) {
      if (policy[field]) {
        if (Array.isArray(policy[field])) {
          return policy[field];
        } else if (typeof policy[field] === 'object') {
          return [policy[field]];
        }
      }
    }

    // Check nested fields
    if (policy.policy_info?.quotes && Array.isArray(policy.policy_info.quotes)) {
      return policy.policy_info.quotes;
    }

    return [];
  };

  // Function to extract insurer name from quote
  const getInsurerName = (quote) => {
    const possibleInsurerFields = [
      'insuranceCompany',
      'insurer',
      'company',
      'provider'
    ];

    for (const field of possibleInsurerFields) {
      if (quote[field]) {
        return quote[field];
      }
    }
    return 'Unknown Insurer';
  };

  // Function to extract quote details
  const getQuoteDetails = (quote) => {
    return {
      insurer: getInsurerName(quote),
      idv: parseInt(quote.idv) || 0,
      premium: parseInt(quote.premium) || 0,
      totalPremium: parseInt(quote.totalPremium) || parseInt(quote.premium) || 0,
      coverageType: quote.coverageType || 'comprehensive',
      policyDuration: quote.policyDuration || 1,
      ncbDiscount: quote.ncbDiscount || 0,
      odAmount: parseInt(quote.odAmount) || 0,
      thirdPartyAmount: parseInt(quote.thirdPartyAmount) || 0
    };
  };

  // Get accepted quote
  const getAcceptedQuote = () => {
    const quotes = getInsuranceQuotes();
    return quotes.find(quote => quote.accepted === true) || quotes[0];
  };

  // Get customer details
  const getCustomerDetails = () => {
    const customer = policy.customer_details || {};
    return {
      name: customer.name || 'N/A',
      mobile: customer.mobile || 'N/A',
      email: customer.email || 'N/A',
      city: customer.city || 'N/A',
      pincode: customer.pincode || 'N/A',
      address: customer.residenceAddress || 'N/A',
      buyerType: policy.buyer_type || 'individual',
      age: customer.age || 'N/A',
      gender: customer.gender || 'N/A',
      panNumber: customer.panNumber || 'N/A',
      aadhaarNumber: customer.aadhaarNumber || 'N/A'
    };
  };

  // Get vehicle details
  const getVehicleDetails = () => {
    const vehicle = policy.vehicle_details || {};
    return {
      make: vehicle.make || 'N/A',
      model: vehicle.model || 'N/A',
      variant: vehicle.variant || 'N/A',
      regNo: vehicle.regNo || 'N/A',
      engineNo: vehicle.engineNo || 'N/A',
      chassisNo: vehicle.chassisNo || 'N/A',
      makeYear: vehicle.makeYear || 'N/A',
      makeMonth: vehicle.makeMonth || 'N/A'
    };
  };

  // Get previous policy details
  const getPreviousPolicy = () => {
    const prev = policy.previous_policy || {};
    return {
      insuranceCompany: prev.insuranceCompany || 'N/A',
      policyNumber: prev.policyNumber || 'N/A',
      policyType: prev.policyType || 'N/A',
      issueDate: prev.issueDate || 'N/A',
      dueDate: prev.dueDate || 'N/A',
      claimTakenLastYear: prev.claimTakenLastYear || 'no',
      ncbDiscount: prev.ncbDiscount || 0
    };
  };

  // Get payout details
  const getPayoutDetails = () => {
    const payout = policy.payout || {};
    return {
      netPremium: payout.netPremium || 0,
      odAmount: payout.odAmount || 0,
      ncbAmount: payout.ncbAmount || 0,
      subVention: payout.subVention || 0,
      netAmount: payout.netAmount || 0
    };
  };

  // Data extraction
  const customer = getCustomerDetails();
  const vehicle = getVehicleDetails();
  const previousPolicy = getPreviousPolicy();
  const payout = getPayoutDetails();
  const insuranceQuotes = getInsuranceQuotes();
  const acceptedQuote = getAcceptedQuote();
  const quoteDetails = acceptedQuote ? getQuoteDetails(acceptedQuote) : null;
  const premiumInfo = getPremiumInfo(policy);
  const paidInfo = getPaidAmount(policy);
  const statusDisplay = getStatusDisplay(policy.status);
  const paymentDisplay = getPaymentStatusDisplay(policy);
  const PaymentIcon = paymentDisplay.icon;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-28 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center"><img src={logo} alt="" srcset="" />
                  <FaFileInvoiceDollar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Policy Details</h1>
                  <p className="text-gray-300 text-sm">Complete insurance case information</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Policy ID:</span>
                  <span className="font-mono  bg-opacity-10 px-2 py-1 rounded text-sm">
                    {policy._id || policy.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Customer:</span>
                  <span className="font-semibold">{customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Vehicle:</span>
                  <span className="font-semibold">{vehicle.make} {vehicle.model}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                <FaEdit className="w-4 h-4" />
                Edit Case
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white hover:text-gray-950 hover:bg-opacity-10 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column - Customer & Vehicle */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4 border-b border-blue-200">
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-white" />
                    </div>
                    Customer Information
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Name</label>
                      <div className="font-semibold text-gray-900 mt-1">{customer.name}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Type</label>
                      <div className="flex items-center gap-2 mt-1">
                        <FaBuilding className={`w-4 h-4 ${customer.buyerType === 'corporate' ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-900 capitalize">{customer.buyerType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaPhone className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Mobile</div>
                        <div className="font-medium text-gray-900">{customer.mobile}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="font-medium text-gray-900 text-sm break-all">{customer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="font-medium text-gray-900">{customer.city} - {customer.pincode}</div>
                      </div>
                    </div>
                  </div>

                  {(customer.age !== 'N/A' || customer.gender !== 'N/A') && (
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      {customer.age !== 'N/A' && (
                        <div>
                          <label className="text-xs text-gray-500 uppercase font-semibold">Age</label>
                          <div className="font-medium text-gray-900">{customer.age} years</div>
                        </div>
                      )}
                      {customer.gender !== 'N/A' && (
                        <div>
                          <label className="text-xs text-gray-500 uppercase font-semibold">Gender</label>
                          <div className="font-medium text-gray-900 capitalize">{customer.gender}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {(customer.panNumber !== 'N/A' || customer.aadhaarNumber !== 'N/A') && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {customer.panNumber !== 'N/A' && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-semibold">PAN Number</span>
                          <span className="font-mono text-sm text-gray-900">{customer.panNumber}</span>
                        </div>
                      )}
                      {customer.aadhaarNumber !== 'N/A' && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-semibold">Aadhaar Number</span>
                          <span className="font-mono text-sm text-gray-900">{customer.aadhaarNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-4 border-b border-green-200">
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <FaCar className="w-5 h-5 text-white" />
                    </div>
                    Vehicle Information
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Make</label>
                      <div className="font-semibold text-gray-900 mt-1">{vehicle.make}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Model</label>
                      <div className="font-semibold text-gray-900 mt-1">{vehicle.model}</div>
                    </div>
                  </div>
                  
                  {vehicle.variant !== 'N/A' && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Variant</label>
                      <div className="font-medium text-gray-900 mt-1">{vehicle.variant}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Registration</label>
                      <div className="font-mono text-sm text-gray-900 mt-1 bg-gray-100 px-2 py-1 rounded">
                        {vehicle.regNo}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Year</label>
                      <div className="font-medium text-gray-900 mt-1">{vehicle.makeYear}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-semibold">Engine No</span>
                      <span className="font-mono text-sm text-gray-900">{vehicle.engineNo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-semibold">Chassis No</span>
                      <span className="font-mono text-sm text-gray-900">{vehicle.chassisNo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Policy & Payment */}
            <div className="space-y-6">
              {/* Policy Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-4 border-b border-purple-200">
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FaFileAlt className="w-5 h-5 text-white" />
                    </div>
                    Policy Information
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.class}`}>
                          <statusDisplay.icon className="w-3 h-3" />
                          {statusDisplay.text}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Type</label>
                      <div className="font-semibold text-gray-900 mt-1 capitalize">
                        {policy.insurance_quote?.coverageType || policy.insurance_category || 'Insurance'}
                      </div>
                    </div>
                  </div>

                  {quoteDetails && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Insurer</span>
                        <span className="font-semibold text-gray-900">{quoteDetails.insurer}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">IDV Amount</span>
                        <span className="font-semibold text-gray-900">₹{quoteDetails.idv.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Policy Duration</span>
                        <span className="font-semibold text-gray-900">{quoteDetails.policyDuration} Year(s)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">NCB Discount</span>
                        <span className="font-semibold text-green-600">{quoteDetails.ncbDiscount}%</span>
                      </div>
                    </div>
                  )}

                  {/* Policy Dates */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {policy.policy_info?.issueDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          Issue Date
                        </span>
                        <span className="font-medium text-gray-900">{formatDate(policy.policy_info.issueDate)}</span>
                      </div>
                    )}
                    {policy.policy_info?.dueDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          Expiry Date
                        </span>
                        <span className={`font-medium ${new Date(policy.policy_info.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(policy.policy_info.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-4 border-b border-amber-200">
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <FaCreditCard className="w-5 h-5 text-white" />
                    </div>
                    Payment Information
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="w-4 h-4" />
                      <span className="text-sm font-semibold text-gray-700">Payment Status</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentDisplay.class}`}>
                      {paymentDisplay.text}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Premium</span>
                      <span className="font-semibold text-gray-900">₹{premiumInfo.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paid Amount</span>
                      <span className="font-semibold text-green-600">₹{paidInfo.paid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Balance</span>
                      <span className="font-semibold text-red-600">₹{(premiumInfo - paidInfo.paid).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Payment Progress</span>
                      <span>{paidInfo.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          paidInfo.percentage === 100 ? 'bg-green-500' : 
                          paidInfo.percentage > 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${paidInfo.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  {policy.payment_info && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Payment Mode</span>
                        <span className="text-sm font-medium text-gray-900">{policy.payment_info.paymentMode || 'N/A'}</span>
                      </div>
                      {policy.payment_info.transactionId && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Transaction ID</span>
                          <span className="font-mono text-sm text-gray-900">{policy.payment_info.transactionId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Previous Policy */}
              {previousPolicy.insuranceCompany !== 'N/A' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                        <FaHistory className="w-5 h-5 text-white" />
                      </div>
                      Previous Policy
                    </h2>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Insurance Company</span>
                      <span className="font-semibold text-gray-900">{previousPolicy.insuranceCompany}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Policy Number</span>
                      <span className="font-mono text-sm text-gray-900">{previousPolicy.policyNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">NCB Discount</span>
                      <span className="font-semibold text-green-600">{previousPolicy.ncbDiscount}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Claim History</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        previousPolicy.claimTakenLastYear === 'yes' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {previousPolicy.claimTakenLastYear === 'yes' ? 'Claim Taken' : 'No Claim'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Quotes & Payout */}
            <div className="space-y-6">
              {/* Insurance Quotes */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-5 py-4 border-b border-cyan-200">
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                      <FaShieldAlt className="w-5 h-5 text-white" />
                    </div>
                    Insurance Quotes
                    <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                      {insuranceQuotes.length} Available
                    </span>
                  </h2>
                </div>
                <div className="p-5">
                  {insuranceQuotes.length > 0 ? (
                    <div className="space-y-3">
                      {insuranceQuotes.slice(0, 3).map((quote, index) => {
                        const details = getQuoteDetails(quote);
                        const isAccepted = quote.accepted === true;
                        
                        return (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border ${
                              isAccepted 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-gray-900">{details.insurer}</div>
                              {isAccepted && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  <FaCheckCircle className="w-3 h-3" />
                                  Accepted
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-gray-600">Premium:</div>
                              <div className="font-semibold text-gray-900">₹{details.totalPremium.toLocaleString('en-IN')}</div>
                              
                              <div className="text-gray-600">IDV:</div>
                              <div className="font-semibold text-gray-900">₹{details.idv.toLocaleString('en-IN')}</div>
                              
                              <div className="text-gray-600">NCB:</div>
                              <div className="font-semibold text-green-600">{details.ncbDiscount}%</div>
                              
                              <div className="text-gray-600">Type:</div>
                              <div className="font-semibold text-gray-900 capitalize">{details.coverageType}</div>
                            </div>
                          </div>
                        );
                      })}
                      {insuranceQuotes.length > 3 && (
                        <div className="text-center text-sm text-gray-500 pt-2">
                          +{insuranceQuotes.length - 3} more quotes available
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <FaShieldAlt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No insurance quotes available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payout Details */}
              {(payout.netPremium > 0 || payout.odAmount > 0) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-5 py-4 border-b border-emerald-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <FaMoneyBillWave className="w-5 h-5 text-white" />
                      </div>
                      Payout Details
                    </h2>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Net Premium</span>
                      <span className="font-semibold text-gray-900">₹{payout.netPremium.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">OD Amount</span>
                      <span className="font-semibold text-gray-900">₹{payout.odAmount.toLocaleString('en-IN')}</span>
                    </div>
                    {payout.ncbAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">NCB Amount</span>
                        <span className="font-semibold text-green-600">₹{payout.ncbAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {payout.subVention > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subvention</span>
                        <span className="font-semibold text-blue-600">₹{payout.subVention.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {payout.netAmount !== 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">Net Amount</span>
                        <span className="font-semibold text-gray-900">₹{payout.netAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                      <FaTag className="w-5 h-5 text-white" />
                    </div>
                    System Information
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created Date</span>
                    <span className="font-medium text-gray-900">{formatDate(policy.created_at || policy.ts)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">{formatDate(policy.updated_at) || 'N/A'}</span>
                  </div>
                  {policy.created_by && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Created By</span>
                      <span className="font-medium text-gray-900">{policy.created_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Case created on {formatDate(policy.created_at || policy.ts)}
              {policy.updated_at && ` • Last updated: ${formatDate(policy.updated_at)}`}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                <FaEdit className="w-4 h-4" />
                Edit Case
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <FaTimes className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;