import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaUser, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaDownload, 
  FaFilter, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp,
  FaUserTie,
  FaHandshake,
  FaStoreAlt,
  FaIdCard,
  FaFileAlt,
  FaShieldAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';

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
      city: '',
      companyName: '',
      contactPerson: '',
      policyType: '',
      leadStatus: '',
      creditType: '',
      sourceOrigin: ''
    };
    setLocalFilters(resetFilters);
    onResetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
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

            {/* Company Information */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={localFilters.companyName}
                onChange={(e) => handleFilterChange('companyName', e.target.value)}
                placeholder="Search by company name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                value={localFilters.contactPerson}
                onChange={(e) => handleFilterChange('contactPerson', e.target.value)}
                placeholder="Search by contact person"
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

            {/* Business Information */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Policy Type</label>
              <select
                value={localFilters.policyType}
                onChange={(e) => handleFilterChange('policyType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Policy Types</option>
                <option value="4 Wheeler">4 Wheeler</option>
                <option value="2 Wheeler">2 Wheeler</option>
                <option value="Home Insurance">Home Insurance</option>
                <option value="Health Insurance">Health Insurance</option>
                <option value="Life Insurance">Life Insurance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Lead Status</label>
              <select
                value={localFilters.leadStatus}
                onChange={(e) => handleFilterChange('leadStatus', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Credit Type</label>
              <select
                value={localFilters.creditType}
                onChange={(e) => handleFilterChange('creditType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Credit Types</option>
                <option value="auto">Autocredits India LLP</option>
                <option value="broker">Broker</option>
                <option value="showroom">Showroom</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Source Origin</label>
              <input
                type="text"
                value={localFilters.sourceOrigin}
                onChange={(e) => handleFilterChange('sourceOrigin', e.target.value)}
                placeholder="Search by source origin"
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

// ================== UTILITY FUNCTIONS ==================

// Safe value function to handle undefined/null values
const getSafeValue = (value, fallback = '') => {
  if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') return fallback;
  return String(value).trim();
};

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

// Get customer display name with proper fallbacks
const getCustomerDisplayName = (customer) => {
  if (!customer) return 'Unknown Customer';
  
  // Check if first_name is undefined or "undefined"
  const firstName = getSafeValue(customer.first_name);
  const isFirstNameInvalid = firstName === 'undefined' || !firstName;
  
  // Get other potential names
  const lastName = getSafeValue(customer.last_name);
  const companyName = getSafeValue(customer.company_name);
  const contactPersonName = getSafeValue(customer.contact_person_name);
  const employeeName = getSafeValue(customer.employeeName);
  const name = getSafeValue(customer.name);
  
  // Priority order for display name:
  // 1. Company Name (if first_name is invalid and company name exists)
  if (isFirstNameInvalid && companyName) {
    return companyName;
  }
  
  // 2. Contact Person Name
  if (contactPersonName) {
    return contactPersonName;
  }
  
  // 3. Employee Name
  if (employeeName) {
    return employeeName;
  }
  
  // 4. Name field
  if (name) {
    return name;
  }
  
  // 5. First + Last name (if first_name is valid)
  if (!isFirstNameInvalid) {
    const individualName = `${firstName} ${lastName}`.trim();
    if (individualName) return individualName;
  }
  
  // 6. Final fallbacks based on buyer type
  if (customer.buyer_type === 'corporate') {
    return 'Corporate Customer';
  }
  
  return 'Individual Customer';
};

// Get credit type display info
const getCreditTypeInfo = (creditType, brokerName = '') => {
  const types = {
    auto: { 
      label: 'Autocredits', 
      class: 'bg-blue-100 text-blue-800',
      icon: FaHandshake
    },
    broker: { 
      label: brokerName ? `Broker (${brokerName})` : 'Broker', 
      class: 'bg-purple-100 text-purple-800',
      icon: FaUserTie
    },
    showroom: { 
      label: 'Showroom', 
      class: 'bg-orange-100 text-orange-800',
      icon: FaStoreAlt
    },
    customer: { 
      label: 'Customer', 
      class: 'bg-green-100 text-green-800',
      icon: FaUser
    }
  };
  
  const safeCreditType = getSafeValue(creditType, 'auto');
  return types[safeCreditType] || { 
    label: safeCreditType, 
    class: 'bg-gray-100 text-gray-800',
    icon: FaUser
  };
};

// Get status display info
const getStatusDisplay = (status) => {
  const safeStatus = getSafeValue(status, 'New');
  const statusConfig = {
    'Active': { class: 'bg-emerald-100 text-emerald-800 border border-emerald-200', icon: FaCheckCircle },
    'New': { class: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: FaClock },
    'Converted': { class: 'bg-purple-100 text-purple-800 border border-purple-200', icon: FaCheckCircle },
    'Hot': { class: 'bg-red-100 text-red-800 border border-red-200', icon: FaExclamationTriangle },
    'Warm': { class: 'bg-orange-100 text-orange-800 border border-orange-200', icon: FaClock },
    'Cold': { class: 'bg-blue-100 text-blue-800 border border-blue-200', icon: FaClock },
    'Open': { class: 'bg-indigo-100 text-indigo-800 border border-indigo-200', icon: FaClock }
  };
  
  return statusConfig[safeStatus] || { 
    class: 'bg-gray-100 text-gray-800 border border-gray-200', 
    icon: FaClock 
  };
};

// ================== MAIN CUSTOMER TABLE COMPONENT ==================

const CustomerTable = ({ customers, loading, onView, onEdit, onDelete, onRefresh, onAddNew }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchFilters, setSearchFilters] = useState({
    customerName: '',
    mobile: '',
    email: '',
    city: '',
    companyName: '',
    contactPerson: '',
    policyType: '',
    leadStatus: '',
    creditType: '',
    sourceOrigin: ''
  });

  // Sort customers by creation date (newest first)
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const dateA = new Date(a.created_at || a.ts || 0);
      const dateB = new Date(b.created_at || b.ts || 0);
      return dateB - dateA;
    });
  }, [customers]);

  // Enhanced search function with advanced filters
  const filteredCustomers = useMemo(() => {
    let filtered = sortedCustomers;

    // Apply advanced search filters
    const hasAdvancedFilters = Object.values(searchFilters).some(value => value !== '');
    
    if (hasAdvancedFilters) {
      filtered = filtered.filter(customer => {
        const customerName = getCustomerDisplayName(customer).toLowerCase();
        const mobile = getSafeValue(customer.mobile).toLowerCase();
        const email = getSafeValue(customer.email).toLowerCase();
        const city = getSafeValue(customer.city).toLowerCase();
        const companyName = getSafeValue(customer.company_name).toLowerCase();
        const contactPerson = getSafeValue(customer.contact_person_name).toLowerCase();
        const policyType = getSafeValue(customer.policy_type).toLowerCase();
        const leadStatus = getSafeValue(customer.lead_status).toLowerCase();
        const creditType = getSafeValue(customer.creditType).toLowerCase();
        const sourceOrigin = getSafeValue(customer.sourceOrigin).toLowerCase();

        const matchesCustomerName = !searchFilters.customerName || 
          customerName.includes(searchFilters.customerName.toLowerCase());

        const matchesMobile = !searchFilters.mobile || 
          mobile.includes(searchFilters.mobile);

        const matchesEmail = !searchFilters.email || 
          email.includes(searchFilters.email.toLowerCase());

        const matchesCity = !searchFilters.city || 
          city.includes(searchFilters.city.toLowerCase());

        const matchesCompanyName = !searchFilters.companyName || 
          companyName.includes(searchFilters.companyName.toLowerCase());

        const matchesContactPerson = !searchFilters.contactPerson || 
          contactPerson.includes(searchFilters.contactPerson.toLowerCase());

        const matchesPolicyType = !searchFilters.policyType || 
          policyType.includes(searchFilters.policyType.toLowerCase());

        const matchesLeadStatus = !searchFilters.leadStatus || 
          leadStatus.includes(searchFilters.leadStatus.toLowerCase());

        const matchesCreditType = !searchFilters.creditType || 
          creditType.includes(searchFilters.creditType.toLowerCase());

        const matchesSourceOrigin = !searchFilters.sourceOrigin || 
          sourceOrigin.includes(searchFilters.sourceOrigin.toLowerCase());

        return matchesCustomerName && matchesMobile && matchesEmail && matchesCity &&
               matchesCompanyName && matchesContactPerson && matchesPolicyType &&
               matchesLeadStatus && matchesCreditType && matchesSourceOrigin;
      });
    }

    // Apply basic search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(customer => {
        const customerName = getCustomerDisplayName(customer).toLowerCase();
        const mobile = getSafeValue(customer.mobile).toLowerCase();
        const email = getSafeValue(customer.email).toLowerCase();
        const city = getSafeValue(customer.city).toLowerCase();
        const companyName = getSafeValue(customer.company_name).toLowerCase();
        const contactPerson = getSafeValue(customer.contact_person_name).toLowerCase();
        const customerId = getSafeValue(customer._id).toLowerCase();
        
        return (
          customerName.includes(query) ||
          mobile.includes(query) ||
          email.includes(query) ||
          city.includes(query) ||
          companyName.includes(query) ||
          contactPerson.includes(query) ||
          customerId.includes(query)
        );
      });
    }

    return filtered;
  }, [sortedCustomers, searchQuery, searchFilters]);

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(paginatedCustomers.map(customer => customer._id));
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (customerId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedRows(newSelected);
    
    const allIds = new Set(paginatedCustomers.map(customer => customer._id));
    setSelectAll(newSelected.size === allIds.size && allIds.size > 0);
  };

  // Expand row handler
  const handleRowExpand = (customerId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedRows(newExpanded);
  };

  // Reset selection when page changes
  useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [currentPage]);

  // Get customer details for display
  const getCustomerDetails = (customer) => {
    const isCorporate = customer.buyer_type === 'corporate';
    const displayName = getCustomerDisplayName(customer);
    const creditTypeInfo = getCreditTypeInfo(customer.creditType, customer.brokerName);
    const statusDisplay = getStatusDisplay(customer.lead_status);
    const StatusIcon = statusDisplay.icon;

    return {
      id: getSafeValue(customer._id),
      displayName,
      isCorporate,
      creditTypeInfo,
      statusDisplay,
      StatusIcon,
      firstName: getSafeValue(customer.first_name),
      lastName: getSafeValue(customer.last_name),
      companyName: getSafeValue(customer.company_name),
      contactPersonName: getSafeValue(customer.contact_person_name),
      employeeName: getSafeValue(customer.employeeName),
      email: getSafeValue(customer.email),
      phone: getSafeValue(customer.phone),
      mobile: getSafeValue(customer.mobile),
      gender: getSafeValue(customer.gender),
      address: getSafeValue(customer.address),
      city: getSafeValue(customer.city),
      pincode: getSafeValue(customer.pincode),
      leadSource: getSafeValue(customer.lead_source),
      policyType: getSafeValue(customer.policy_type),
      leadStatus: getSafeValue(customer.lead_status),
      sourceOrigin: getSafeValue(customer.sourceOrigin),
      brokerName: getSafeValue(customer.brokerName),
      alternatePhone: getSafeValue(customer.alternate_phone),
      createdDate: formatDate(customer.created_at || customer.ts),
      updatedDate: formatDate(customer.updated_at),
      age: customer.age ? `${customer.age} yrs` : '',
      panNumber: getSafeValue(customer.panNumber),
      aadhaarNumber: getSafeValue(customer.aadhaarNumber),
      gstNumber: getSafeValue(customer.gstNumber)
    };
  };

  const handleViewClick = (customer) => {
    onView(customer);
  };

  const handleEditClick = (customer) => {
    onEdit(customer);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    const customerId = customerToDelete._id;
    setDeleteLoading(true);

    try {
      await onDelete(customerId);
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setCustomerToDelete(null);
    setDeleteLoading(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Export to CSV
  const handleExport = () => {
    const customersToExport = selectedRows.size > 0 
      ? filteredCustomers.filter(customer => selectedRows.has(customer._id))
      : filteredCustomers;

    if (customersToExport.length === 0) {
      alert('No customers to export');
      return;
    }

    const headers = [
      'Customer ID',
      'Display Name',
      'First Name',
      'Last Name',
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Mobile',
      'City',
      'Pincode',
      'Address',
      'Buyer Type',
      'Lead Source',
      'Policy Type',
      'Lead Status',
      'Credit Type',
      'Source Origin',
      'Broker Name',
      'Created Date'
    ];

    const csvData = customersToExport.map(customer => {
      const details = getCustomerDetails(customer);
      
      return [
        details.id,
        details.displayName,
        details.firstName,
        details.lastName,
        details.companyName,
        details.contactPersonName,
        details.email,
        details.phone,
        details.mobile,
        details.city,
        details.pincode,
        details.address,
        details.isCorporate ? 'Corporate' : 'Individual',
        details.leadSource,
        details.policyType,
        details.leadStatus,
        details.creditTypeInfo.label,
        details.sourceOrigin,
        details.brokerName,
        details.createdDate
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
    link.setAttribute('download', `insurance-customers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyAdvancedFilters = (filters) => {
    setSearchFilters(filters);
  };

  const handleResetAdvancedFilters = () => {
    setSearchFilters({
      customerName: '',
      mobile: '',
      email: '',
      city: '',
      companyName: '',
      contactPerson: '',
      policyType: '',
      leadStatus: '',
      creditType: '',
      sourceOrigin: ''
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
      <div className="bg-white rounded border border-gray-200 p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading customers...</p>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-4 text-center">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaUser className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-sm">No customers found</p>
        <p className="text-gray-500 text-xs">Create your first customer to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Compact Filters Section */}
      <div className="bg-white rounded border border-gray-200 p-2 mb-2">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap flex-1">
            {/* Search Bar */}
            <div className="flex flex-col flex-1 min-w-[180px]">
              <div className="relative">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Search Button */}
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[80px] justify-center"
            >
              <FaFilter className="text-xs" />
              Filters
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[80px] justify-center"
            >
              <FaTimes className="text-xs transform rotate-45" />
              Refresh
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={filteredCustomers.length === 0}
            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px] justify-center"
          >
            <FaDownload className="text-xs" />
            Export
          </button>

          {/* Add Customer Button */}
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors min-w-[80px] justify-center"
          >
            <FaUser className="text-xs" />
            Add New
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-1 pt-1 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{filteredCustomers.length}</span> customers
            {filteredCustomers.length !== sortedCustomers.length && (
              <span className="text-gray-400 ml-1">(of {sortedCustomers.length})</span>
            )}
          </div>
          
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
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-1 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-6">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                  />
                </th>
                <th className="px-1 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-6">
                  {/* Expand column */}
                </th>
                <th className="px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                  Customer Details
                </th>
                <th className="px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-32">
                  Contact Info
                </th>
                <th className="px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-28">
                  Business Info
                </th>
                <th className="px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-24">
                  Status
                </th>
                <th className="px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.map((customer) => {
                const details = getCustomerDetails(customer);
                const isSelected = selectedRows.has(details.id);
                const isExpanded = expandedRows.has(details.id);
                const CreditTypeIcon = details.creditTypeInfo.icon;

                return (
                  <React.Fragment key={details.id}>
                    <tr
                      className={`border-b border-gray-100 transition-colors ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="px-1 py-1 border-r border-gray-100">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(details.id)}
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                        />
                      </td>

                      {/* Expand Column */}
                      <td className="px-1 py-1 border-r border-gray-100">
                        <button
                          onClick={() => handleRowExpand(details.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                        </button>
                      </td>

                      {/* Customer Details Column */}
                      <td className="px-2 py-1 border-r border-gray-100">
                        <div className="space-y-1">
                          {/* Customer Info */}
                          <div className="flex items-center gap-1">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              details.isCorporate ? 'bg-orange-100' : 'bg-purple-100'
                            }`}>
                              {details.isCorporate ? (
                                <FaBuilding className="text-orange-600 text-xs" />
                              ) : (
                                <FaUser className="text-purple-600 text-xs" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-xs truncate">
                                {details.displayName}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                ID: {details.id.slice(-8)}
                              </div>
                            </div>
                          </div>

                          {/* Company/Contact Info */}
                          {details.isCorporate ? (
                            <>
                              {details.companyName && (
                                <div className="text-xs text-gray-600 truncate">
                                  🏢 {details.companyName}
                                </div>
                              )}
                              {details.contactPersonName && (
                                <div className="text-xs text-gray-600 truncate">
                                  👤 {details.contactPersonName}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {(details.firstName || details.lastName) && (
                                <div className="text-xs text-gray-600 truncate">
                                  {details.firstName} {details.lastName}
                                </div>
                              )}
                            </>
                          )}

                          {/* Credit Type */}
                          <div className="flex items-center gap-1">
                            <CreditTypeIcon className="text-gray-400 text-xs flex-shrink-0" />
                            <span className={`text-xs px-1 py-0.5 rounded ${details.creditTypeInfo.class}`}>
                              {details.creditTypeInfo.label}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Information Column */}
                      <td className="px-2 py-1 border-r border-gray-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 text-xs truncate">
                                {details.mobile || details.phone}
                              </div>
                              {details.alternatePhone && (
                                <div className="text-xs text-gray-500 truncate">
                                  Alt: {details.alternatePhone}
                                </div>
                              )}
                            </div>
                          </div>

                          {details.email && (
                            <div className="flex items-center gap-1">
                              <FaEnvelope className="text-gray-400 text-xs flex-shrink-0" />
                              <div className="text-xs text-gray-600 truncate">
                                {details.email}
                              </div>
                            </div>
                          )}

                          {details.city && (
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
                              <div className="text-xs text-gray-600 truncate">
                                {details.city} {details.pincode && `- ${details.pincode}`}
                              </div>
                            </div>
                          )}

                          {details.sourceOrigin && (
                            <div className="text-xs text-gray-500 truncate">
                              📍 {details.sourceOrigin}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Business Information Column */}
                      <td className="px-2 py-1 border-r border-gray-100">
                        <div className="space-y-1">
                          {details.policyType && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Policy:</span>
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                details.policyType === '4 Wheeler' ? 'bg-blue-100 text-blue-800' :
                                details.policyType === '2 Wheeler' ? 'bg-green-100 text-green-800' :
                                details.policyType === 'Home Insurance' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {details.policyType}
                              </span>
                            </div>
                          )}

                          {details.leadSource && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Lead Source:</span>
                              <span className="text-xs font-medium truncate ml-1">
                                {details.leadSource}
                              </span>
                            </div>
                          )}

                          {details.brokerName && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Broker:</span>
                              <span className="text-xs font-medium truncate ml-1">
                                {details.brokerName}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Created:</span>
                            <span className="text-xs">{details.createdDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-2 py-1 border-r border-gray-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <details.StatusIcon className="text-xs" />
                            <span className={`text-xs font-medium px-1 py-0.5 rounded ${details.statusDisplay.class}`}>
                              {details.leadStatus || 'New'}
                            </span>
                          </div>
                          
                          {details.age && (
                            <div className="text-xs text-gray-600">
                              Age: {details.age}
                            </div>
                          )}

                          {details.gender && (
                            <div className="text-xs text-gray-600">
                              Gender: {details.gender}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-2 py-1">
                        <div className="flex flex-col gap-0.5">
                          <button 
                            onClick={() => handleViewClick(customer)}
                            className="flex items-center gap-0.5 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-1 py-0.5 rounded transition-colors border border-purple-200 justify-center"
                          >
                            <FaEye className="text-xs" />
                            View
                          </button>
                          <button 
                            onClick={() => handleEditClick(customer)}
                            className="flex items-center gap-0.5 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-1 py-0.5 rounded transition-colors border border-green-200 justify-center"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(customer)}
                            className="flex items-center gap-0.5 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-1 py-0.5 rounded transition-colors border border-red-200 justify-center"
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
                        <td colSpan="7" className="px-3 py-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            {/* Personal Details */}
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-700 border-b pb-0.5">Personal Details</h4>
                              <div className="space-y-0.5">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Customer ID:</span>
                                  <span className="font-medium">{details.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Type:</span>
                                  <span className="font-medium capitalize">
                                    {details.isCorporate ? 'Corporate' : 'Individual'}
                                  </span>
                                </div>
                                {!details.isCorporate && (
                                  <>
                                    {details.firstName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">First Name:</span>
                                        <span className="font-medium">{details.firstName}</span>
                                      </div>
                                    )}
                                    {details.lastName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Last Name:</span>
                                        <span className="font-medium">{details.lastName}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                {details.gender && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Gender:</span>
                                    <span className="font-medium">{details.gender}</span>
                                  </div>
                                )}
                                {details.age && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Age:</span>
                                    <span className="font-medium">{details.age}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-700 border-b pb-0.5">Contact Details</h4>
                              <div className="space-y-0.5">
                                {details.email && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{details.email}</span>
                                  </div>
                                )}
                                {details.phone && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium">{details.phone}</span>
                                  </div>
                                )}
                                {details.mobile && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Mobile:</span>
                                    <span className="font-medium">{details.mobile}</span>
                                  </div>
                                )}
                                {details.alternatePhone && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Alternate Phone:</span>
                                    <span className="font-medium">{details.alternatePhone}</span>
                                  </div>
                                )}
                                {details.city && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">City:</span>
                                    <span className="font-medium">{details.city}</span>
                                  </div>
                                )}
                                {details.pincode && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Pincode:</span>
                                    <span className="font-medium">{details.pincode}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Business Details */}
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-700 border-b pb-0.5">Business Details</h4>
                              <div className="space-y-0.5">
                                {details.isCorporate && (
                                  <>
                                    {details.companyName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Company Name:</span>
                                        <span className="font-medium">{details.companyName}</span>
                                      </div>
                                    )}
                                    {details.contactPersonName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Contact Person:</span>
                                        <span className="font-medium">{details.contactPersonName}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                {details.policyType && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Policy Type:</span>
                                    <span className="font-medium">{details.policyType}</span>
                                  </div>
                                )}
                                {details.leadSource && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Lead Source:</span>
                                    <span className="font-medium">{details.leadSource}</span>
                                  </div>
                                )}
                                {details.leadStatus && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Lead Status:</span>
                                    <span className="font-medium">{details.leadStatus}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Credit Type:</span>
                                  <span className="font-medium">{details.creditTypeInfo.label}</span>
                                </div>
                                {details.brokerName && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Broker Name:</span>
                                    <span className="font-medium">{details.brokerName}</span>
                                  </div>
                                )}
                                {details.sourceOrigin && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Source Origin:</span>
                                    <span className="font-medium">{details.sourceOrigin}</span>
                                  </div>
                                )}
                                {details.createdDate && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Created Date:</span>
                                    <span className="font-medium">{details.createdDate}</span>
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

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="px-2 py-1 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1">
              <div className="text-xs text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 2) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNumber = totalPages - 2 + i;
                    } else {
                      pageNumber = currentPage - 1 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
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
                  className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredCustomers.length === 0 && customers.length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-3 text-center">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <FaUser className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-xs mb-1">No customers match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleResetAdvancedFilters();
            }}
            className="px-2 py-0.5 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-medium"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-md w-full p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaExclamationTriangle className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Delete Customer</h3>
            </div>
            
            <p className="text-gray-600 mb-3 text-xs">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>

            {customerToDelete && (
              <div className="bg-gray-50 rounded p-2 mb-3">
                <div className="text-xs text-gray-700 space-y-0.5">
                  <div className="font-medium">Customer ID: {getSafeValue(customerToDelete._id)?.slice(-8)}</div>
                  <div>Name: {getCustomerDisplayName(customerToDelete)}</div>
                  <div>Email: {getSafeValue(customerToDelete.email)}</div>
                  <div>Phone: {getSafeValue(customerToDelete.phone)}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-2 py-1 text-xs font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white mr-1"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Customer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerTable;