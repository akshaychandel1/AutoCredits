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
  FaSync
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

// ================== RENEWAL UTILITY FUNCTIONS ==================

// Calculate days until expiry
const calculateDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return Infinity;
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Categorize policies into renewal batches
const categorizeRenewalBatch = (daysUntilExpiry) => {
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return '7_days';
  if (daysUntilExpiry <= 14) return '14_days';
  if (daysUntilExpiry <= 21) return '21_days';
  if (daysUntilExpiry <= 30) return '30_days';
  return 'beyond_30_days';
};

// Get batch display information
const getBatchInfo = (batch) => {
  const batchConfig = {
    '7_days': {
      text: '7 Days',
      class: 'bg-red-100 text-red-800 border border-red-200',
      icon: FaExclamationCircle,
      priority: 1
    },
    '14_days': {
      text: '14 Days',
      class: 'bg-orange-100 text-orange-800 border border-orange-200',
      icon: FaCalendarCheck,
      priority: 2
    },
    '21_days': {
      text: '21 Days',
      class: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: FaBell,
      priority: 3
    },
    '30_days': {
      text: '30 Days',
      class: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: FaClock,
      priority: 4
    },
    'beyond_30_days': {
      text: 'Beyond 30 Days',
      class: 'bg-green-100 text-green-800 border border-green-200',
      icon: FaCalendarAlt,
      priority: 5
    },
    'expired': {
      text: 'Expired',
      class: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: FaTimes,
      priority: 0
    }
  };
  
  return batchConfig[batch] || batchConfig['beyond_30_days'];
};

// ================== COMPACT PAYMENT BREAKDOWN ==================

const CompactPaymentBreakdown = ({ policy, paymentLedger = [] }) => {
  const calculatePaymentComponents = (policy, paymentLedger) => {
    const totalPremium = policy.policy_info?.totalPremium || policy.insurance_quote?.premium || 0;
    
    const customerPaidAmount = paymentLedger
      .filter(payment => 
        payment.paymentMadeBy === "Customer" && 
        payment.type !== "subvention_refund"
      )
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const paymentProgress = totalPremium > 0 
      ? Math.min((customerPaidAmount / totalPremium) * 100, 100)
      : 100;

    const hasInHousePayments = paymentLedger.some(payment => payment.paymentMadeBy === "In House");
    const paymentMadeBy = hasInHousePayments ? 'In House' : 
                         customerPaidAmount > 0 ? 'Customer' : 'Not Paid';

    return {
      totalPremium,
      customerPaidAmount,
      paymentProgress,
      paymentMadeBy,
      remainingAmount: Math.max(totalPremium - customerPaidAmount, 0)
    };
  };

  const components = calculatePaymentComponents(policy, paymentLedger);
  const paymentStatus = components.paymentProgress === 100 ? 'fully paid' : 
                       components.customerPaidAmount > 0 ? 'partially paid' : 'pending';

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
          {components.paymentMadeBy}
        </div>
      </div>
      
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span className="text-gray-600">Premium:</span>
          <span className="font-medium">₹{components.totalPremium.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Paid:</span>
          <span className="text-green-600 font-medium">
            ₹{components.customerPaidAmount.toLocaleString('en-IN')}
          </span>
        </div>
        
        {components.remainingAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Due:</span>
            <span className="text-red-600 font-medium">
              ₹{components.remainingAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
      
      <div className="pt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Payment Progress</span>
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
      batch: 'all'
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

            {/* Renewal Batch Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Renewal Batch</label>
              <select
                value={localFilters.batch}
                onChange={(e) => handleFilterChange('batch', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Batches</option>
                <option value="7_days">7 Days</option>
                <option value="14_days">14 Days</option>
                <option value="21_days">21 Days</option>
                <option value="30_days">30 Days</option>
                <option value="beyond_30_days">Beyond 30 Days</option>
                <option value="expired">Expired</option>
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
    batch: 'all'
  });
  const [renewalDays, setRenewalDays] = useState(370); // Default to 30 days

  const navigate = useNavigate();

  // ================== API FUNCTIONS ==================

  // Fetch renewal policies
  const fetchRenewalPolicies = async (days = 600) => {
    try {
      setLoading(true);
      const response = await api.get(`/policies/renewals?days=${days}`);
      
      if (response.data && response.data.success) {
        setPolicies(response.data.data || []);
      } else {
        setPolicies([]);
        console.warn('No renewal policies found or invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching renewal policies:', error);
      alert('Failed to fetch renewal policies. Please try again.');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete policy
  const deletePolicy = async (policyId) => {
    try {
      setDeleteLoading(true);
      const response = await api.delete(`/policies/${policyId}`);
      
      if (response.data && response.data.success) {
        // Remove policy from local state
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

  // Update policy (for edit functionality)
  const updatePolicy = async (policyId, updatedData) => {
    try {
      const response = await api.put(`/policies/${policyId}`, updatedData);
      
      if (response.data && response.data.success) {
        // Update policy in local state
        setPolicies(prev => prev.map(policy => 
          policy._id === policyId ? { ...policy, ...updatedData } : policy
        ));
        return response.data.data;
      } else {
        throw new Error('Failed to update policy');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  };

  // Renew policy (create new policy based on existing one)
  const renewPolicy = async (policy) => {
    try {
      // Create renewal data structure
      const renewalData = {
        ...policy,
        originalPolicyId: policy._id,
        // Reset policy-specific fields for renewal
        policy_info: {
          ...policy.policy_info,
          policyNumber: '', // New policy number will be generated
          issueDate: new Date().toISOString(),
          // Calculate new expiry date (1 year from now)
          dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        status: 'draft', // Set as draft for review
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      delete renewalData._id; // Remove ID for new document

      const response = await api.post('/policies', renewalData);
      
      if (response.data && response.data.success) {
        alert('Policy renewed successfully!');
        // Refresh the renewal policies list
        fetchRenewalPolicies(renewalDays);
        return response.data.data;
      } else {
        throw new Error('Failed to renew policy');
      }
    } catch (error) {
      console.error('Error renewing policy:', error);
      throw error;
    }
  };

  // ================== EFFECTS ==================

  // Fetch policies on component mount and when renewalDays changes
  useEffect(() => {
    fetchRenewalPolicies(renewalDays);
  }, [renewalDays]);

  // Process policies for renewal tracking
  const renewalPolicies = useMemo(() => {
    return policies.map(policy => {
      const expiryDate = policy.policy_info?.dueDate || 
                        policy.policy_info?.odExpiryDate || 
                        policy.policy_info?.tpExpiryDate;
      
      const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
      const batch = categorizeRenewalBatch(daysUntilExpiry);
      const batchInfo = getBatchInfo(batch);
      
      return {
        ...policy,
        expiryDate,
        daysUntilExpiry,
        batch,
        batchInfo
      };
    });
  }, [policies]);

  // Sort by priority (closest expiry first)
  const sortedPolicies = useMemo(() => {
    return [...renewalPolicies].sort((a, b) => {
      // Sort by batch priority first
      const priorityA = a.batchInfo.priority;
      const priorityB = b.batchInfo.priority;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Then by days until expiry
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });
  }, [renewalPolicies]);

  // Enhanced search function with batch filtering
  const filteredPolicies = useMemo(() => {
    let filtered = sortedPolicies;

    // Apply batch filter
    if (batchFilter !== 'all') {
      filtered = filtered.filter(policy => policy.batch === batchFilter);
    }

    // Apply advanced search filters
    const hasAdvancedFilters = Object.values(searchFilters).some(value => value !== '' && value !== 'all');
    
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

        const matchesRegNo = !searchFilters.regNo || 
          (vehicle.regNo || '').toLowerCase().includes(searchFilters.regNo.toLowerCase());

        const matchesVehicleMake = !searchFilters.vehicleMake || 
          (vehicle.make || '').toLowerCase().includes(searchFilters.vehicleMake.toLowerCase());

        const matchesPolicyNumber = !searchFilters.policyNumber || 
          (policyInfo.policyNumber || '').toLowerCase().includes(searchFilters.policyNumber.toLowerCase());

        const matchesInsuranceCompany = !searchFilters.insuranceCompany || 
          (policyInfo.insuranceCompany || insuranceQuote.insurer || '').toLowerCase().includes(searchFilters.insuranceCompany.toLowerCase());

        const matchesCity = !searchFilters.city || 
          (customer.city || '').toLowerCase().includes(searchFilters.city.toLowerCase());

        const matchesBatch = !searchFilters.batch || searchFilters.batch === 'all' || 
          policy.batch === searchFilters.batch;

        return matchesCustomerName && matchesMobile && matchesRegNo && 
               matchesVehicleMake && matchesPolicyNumber && 
               matchesInsuranceCompany && matchesCity && matchesBatch;
      });
    }

    // Apply basic search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(policy => {
        const customer = policy.customer_details || {};
        
        const customerName = policy.buyer_type === 'corporate' 
          ? (customer.companyName || customer.contactPersonName || '').toLowerCase()
          : (customer.name || '').toLowerCase();
        
        const mobile = (customer.mobile || '').toLowerCase();
        const vehicleMake = (policy.vehicle_details?.make || '').toLowerCase();
        const regNo = (policy.vehicle_details?.regNo || '').toLowerCase();
        const insuranceCompany = (
          policy.policy_info?.insuranceCompany || 
          policy.insurance_quote?.insurer || 
          ''
        ).toLowerCase();
        const policyNumber = (policy.policy_info?.policyNumber || '').toLowerCase();
        
        return (
          customerName.includes(query) ||
          mobile.includes(query) ||
          vehicleMake.includes(query) ||
          regNo.includes(query) ||
          (regNo && regNo.slice(-4).includes(query)) ||
          insuranceCompany.includes(query) ||
          policyNumber.includes(query)
        );
      });
    }

    return filtered;
  }, [sortedPolicies, batchFilter, searchQuery, searchFilters]);

  // Paginate policies
  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

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

  const handleRenewClick = async (policy) => {
    try {
      await renewPolicy(policy);
    } catch (error) {
      alert('Failed to renew policy. Please try again.');
    }
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
      batch: 'all'
    });
  };

  const handleRenewalDaysChange = (days) => {
    setRenewalDays(days);
    setCurrentPage(1);
  };

  // Reset selection when page changes
  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [batchFilter, searchQuery, searchFilters, renewalDays]);

  // ================== HELPER FUNCTIONS ==================

  const getVehicleType = (policy) => policy.vehicleType || 'used';

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

  const getVehicleInfo = (policy) => {
    if (policy.vehicle_details) {
      const make = policy.vehicle_details.make || '';
      const model = policy.vehicle_details.model || '';
      const variant = policy.vehicle_details.variant || '';
      const regNo = policy.vehicle_details.regNo || '';
      
      return {
        main: `${make} ${model}`.trim() || 'No Vehicle Info',
        variant: variant,
        regNo: regNo
      };
    }
    return {
      main: 'No Vehicle',
      variant: '',
      regNo: ''
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
      buyerType: policy.buyer_type || 'individual',
      isCorporate: isCorporate
    };
  };

  const getPolicyNumber = (policy) => {
    if (policy.policy_info?.policyNumber) {
      return policy.policy_info.policyNumber;
    }
    return 'N/A';
  };

  const getPolicyId = (policy) => policy._id || policy.id || 'N/A';

  // Batch statistics
  const batchStats = useMemo(() => {
    const stats = {
      '7_days': 0,
      '14_days': 0,
      '21_days': 0,
      '30_days': 0,
      'beyond_30_days': 0,
      'expired': 0,
      total: sortedPolicies.length
    };

    sortedPolicies.forEach(policy => {
      stats[policy.batch]++;
    });

    return stats;
  }, [sortedPolicies]);

  // ================== RENDER COMPONENT ==================

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
          onClick={() => fetchRenewalPolicies(renewalDays)}
          className="mt-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Renewal Days Filter */}
      <div className="bg-white rounded border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Renewal Overview</h3>
          <div className="flex flex-wrap gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              Show policies expiring in:
            </label>
            <select
              value={renewalDays}
              onChange={(e) => handleRenewalDaysChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
            <button
              onClick={() => fetchRenewalPolicies(renewalDays)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              <FaSync className="text-xs" />
              Refresh
            </button>
          </div>
        </div>

        {/* Batch Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{batchStats['7_days']}</div>
            <div className="text-xs text-red-700 font-medium">7 Days</div>
            <div className="text-xs text-red-500">Urgent</div>
          </div>
          <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{batchStats['14_days']}</div>
            <div className="text-xs text-orange-700 font-medium">14 Days</div>
            <div className="text-xs text-orange-500">High Priority</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{batchStats['21_days']}</div>
            <div className="text-xs text-yellow-700 font-medium">21 Days</div>
            <div className="text-xs text-yellow-500">Medium Priority</div>
          </div>
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{batchStats['30_days']}</div>
            <div className="text-xs text-blue-700 font-medium">30 Days</div>
            <div className="text-xs text-blue-500">Low Priority</div>
          </div>
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{batchStats['beyond_30_days']}</div>
            <div className="text-xs text-green-700 font-medium">Beyond 30</div>
            <div className="text-xs text-green-500">Future</div>
          </div>
          <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{batchStats['expired']}</div>
            <div className="text-xs text-gray-700 font-medium">Expired</div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
          <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{batchStats.total}</div>
            <div className="text-xs text-purple-700 font-medium">Total</div>
            <div className="text-xs text-purple-500">Policies</div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same as before */}
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
                  placeholder="Search renewals..."
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

            {/* Batch Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Renewal Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[120px]"
              >
                <option value="all">All Batches</option>
                <option value="7_days">7 Days</option>
                <option value="14_days">14 Days</option>
                <option value="21_days">21 Days</option>
                <option value="30_days">30 Days</option>
                <option value="beyond_30_days">Beyond 30 Days</option>
                <option value="expired">Expired</option>
              </select>
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
        </div>

        {/* Results Count and Active Filters */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{filteredPolicies.length}</span> renewal policies
            {filteredPolicies.length !== sortedPolicies.length && (
              <span className="text-gray-400 ml-1">(of {sortedPolicies.length})</span>
            )}
            {searchQuery && (
              <span className="text-purple-600 ml-1">for "{searchQuery}"</span>
            )}
          </div>
          
          {/* Active Advanced Filters */}
          {Object.values(searchFilters).some(value => value !== '' && value !== 'all') && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {Object.entries(searchFilters).map(([key, value]) => 
                value && value !== 'all' && (
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
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-32">
                  Renewal Status
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                  Payment
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
                const BatchIcon = policy.batchInfo.icon;
                const customer = getCustomerDetails(policy);
                const vehicleInfo = getVehicleInfo(policy);
                const premium = getPremiumInfo(policy);
                const insuranceCompany = getInsuranceCompany(policy);
                const policyNumber = getPolicyNumber(policy);
                const policyId = getPolicyId(policy);
                const vehicleType = getVehicleType(policy);
                const isSelected = selectedRows.has(policyId);
                const isExpanded = expandedRows.has(policyId);

                return (
                  <React.Fragment key={policyId}>
                    <tr
                      className={`border-b border-gray-100 transition-colors ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                      } ${
                        policy.batch === '7_days' ? 'bg-red-50 hover:bg-red-100' :
                        policy.batch === '14_days' ? 'bg-orange-50 hover:bg-orange-100' :
                        policy.batch === '21_days' ? 'bg-yellow-50 hover:bg-yellow-100' : ''
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
                              <span>Expiry:</span>
                              <span className="font-semibold text-blue-600 text-xs">{formatDate(policy.expiryDate)}</span>
                            </div>
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
                          
                          <div className="text-xs text-gray-600">
                            <div className="flex justify-between items-center">
                              <span>Days Left:</span>
                              <span className={`font-semibold ${
                                policy.daysUntilExpiry < 0 ? 'text-red-600' :
                                policy.daysUntilExpiry <= 7 ? 'text-red-600' :
                                policy.daysUntilExpiry <= 14 ? 'text-orange-600' :
                                policy.daysUntilExpiry <= 21 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {policy.daysUntilExpiry < 0 ? 'Expired' : `${policy.daysUntilExpiry} days`}
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
                          <button 
                            onClick={() => handleRenewClick(policy)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium hover:bg-blue-50 px-1.5 py-1 rounded transition-colors border border-blue-200 justify-center"
                          >
                            <FaSync className="text-xs" />
                            Renew
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
                      <tr className={`border-b border-gray-100 ${
                        policy.batch === '7_days' ? 'bg-red-50' :
                        policy.batch === '14_days' ? 'bg-orange-50' :
                        policy.batch === '21_days' ? 'bg-yellow-50' : 'bg-gray-50'
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
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Name:</span>
                                  <span className="font-medium">{customer.name}</span>
                                </div>
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
                                {policy.vehicle_details?.makeYear && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Manufacturing Year:</span>
                                    <span className="font-medium">{policy.vehicle_details.makeYear}</span>
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
                                  <span className="text-gray-600">Total Premium:</span>
                                  <span className="font-medium text-green-600">{premium}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Expiry Date:</span>
                                  <span className="font-medium">{formatDate(policy.expiryDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Days Until Expiry:</span>
                                  <span className={`font-semibold ${
                                    policy.daysUntilExpiry < 0 ? 'text-red-600' :
                                    policy.daysUntilExpiry <= 7 ? 'text-red-600' :
                                    policy.daysUntilExpiry <= 14 ? 'text-orange-600' :
                                    policy.daysUntilExpiry <= 21 ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    {policy.daysUntilExpiry < 0 ? 'Expired' : `${policy.daysUntilExpiry} days`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Renewal Batch:</span>
                                  <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${policy.batchInfo.class}`}>
                                    {policy.batchInfo.text}
                                  </span>
                                </div>
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
            <FaHistory className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-sm mb-1">No renewal policies match your filters</p>
          <button
            onClick={() => {
              setBatchFilter('all');
              setSearchQuery('');
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