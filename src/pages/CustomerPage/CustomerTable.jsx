import React, { useState, useMemo, useEffect } from 'react';
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
  FaClock,
  FaCreditCard,
  FaReceipt,
  FaPercentage,
  FaHistory,
  FaFileInvoice,
  FaFingerprint,
  FaHome,
  FaIndustry,
  FaMobileAlt,
  FaFileSignature,
  FaAddressCard,
  FaBriefcase,
  FaTag
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
      alternatePhone: '',
      pincode: '',
      panNumber: '',
      aadhaarNumber: '',
      gstNumber: '',
      creditType: '',
      sourceOrigin: '',
      brokerName: '',
      employeeName: ''
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
              <label className="text-sm font-medium text-gray-700">Alternate Phone</label>
              <input
                type="text"
                value={localFilters.alternatePhone}
                onChange={(e) => handleFilterChange('alternatePhone', e.target.value)}
                placeholder="Search by alternate phone"
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Employee Name</label>
              <input
                type="text"
                value={localFilters.employeeName}
                onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                placeholder="Search by employee name"
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

            {/* Document Numbers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">PAN Number</label>
              <input
                type="text"
                value={localFilters.panNumber}
                onChange={(e) => handleFilterChange('panNumber', e.target.value)}
                placeholder="Search by PAN"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
              <input
                type="text"
                value={localFilters.aadhaarNumber}
                onChange={(e) => handleFilterChange('aadhaarNumber', e.target.value)}
                placeholder="Search by Aadhaar"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">GST Number</label>
              <input
                type="text"
                value={localFilters.gstNumber}
                onChange={(e) => handleFilterChange('gstNumber', e.target.value)}
                placeholder="Search by GST"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Business Information */}
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
              <label className="text-sm font-medium text-gray-700">Broker Name</label>
              <input
                type="text"
                value={localFilters.brokerName}
                onChange={(e) => handleFilterChange('brokerName', e.target.value)}
                placeholder="Search by broker name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
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

// Get customer display name with proper fallbacks - UPDATED to handle all cases from dummy data
const getCustomerDisplayName = (customer) => {
  if (!customer) return 'Unknown Customer';
  
  // Check if customer object has customer_details nested structure
  const customerData = customer.customer_details || customer;
  
  // Extract all possible name fields
  const firstName = getSafeValue(customerData.first_name);
  const lastName = getSafeValue(customerData.last_name);
  const name = getSafeValue(customerData.name);
  const customerName = getSafeValue(customerData.customerName);
  const companyName = getSafeValue(customerData.companyName);
  const contactPersonName = getSafeValue(customerData.contact_person_name);
  const employeeName = getSafeValue(customerData.employeeName);
  
  // Check if name fields are invalid
  const isFirstNameInvalid = firstName === 'undefined' || !firstName;
  const isNameInvalid = name === 'undefined' || !name;
  const isCustomerNameInvalid = customerName === 'undefined' || !customerName;
  
  // Priority logic:
  // 1. If first_name is "undefined" or empty, try other fields
  if (!isFirstNameInvalid && firstName) {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
  }
  
  // 2. Check name field
  if (!isNameInvalid && name) {
    return name;
  }
  
  // 3. Check customerName field
  if (!isCustomerNameInvalid && customerName) {
    return customerName;
  }
  
  // 4. Check if company exists (corporate customer)
  if (companyName) {
    // Return company name first, then contact person separately
    return `${companyName}`;
  }
  
  // 5. Check contact person
  if (contactPersonName) {
    return contactPersonName;
  }
  
  // 6. Check employee name
  if (employeeName) {
    return employeeName;
  }
  
  // 7. Check buyer type
  if (customerData.buyer_type === 'corporate') {
    return 'Corporate Customer';
  }
  
  // 8. Fallback
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
  const safeStatus = getSafeValue(status, 'Active');
  const statusConfig = {
    'Active': { class: 'bg-emerald-100 text-emerald-800', icon: FaCheckCircle },
    'New': { class: 'bg-yellow-100 text-yellow-800', icon: FaClock },
    'Open': { class: 'bg-blue-100 text-blue-800', icon: FaClock },
    'Inactive': { class: 'bg-gray-100 text-gray-800', icon: FaTimes },
    'Verified': { class: 'bg-blue-100 text-blue-800', icon: FaCheckCircle },
    'Pending': { class: 'bg-orange-100 text-orange-800', icon: FaClock },
    'Converted': { class: 'bg-green-100 text-green-800', icon: FaCheckCircle }
  };
  
  return statusConfig[safeStatus] || { 
    class: 'bg-gray-100 text-gray-800', 
    icon: FaClock 
  };
};

// Format document numbers for display
const formatDocumentNumber = (number, type) => {
  if (!number) return '';
  
  const clean = number.replace(/\s+/g, '').toUpperCase();
  
  switch(type) {
    case 'pan':
      if (clean.length === 10 && /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(clean)) {
        return clean;
      }
      break;
    case 'aadhaar':
      if (clean.length === 12 && /^\d+$/.test(clean)) {
        return `${clean.slice(0,4)} ${clean.slice(4,8)} ${clean.slice(8)}`;
      }
      break;
    case 'gst':
      if (clean.length === 15 && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/.test(clean)) {
        return clean;
      }
      break;
  }
  
  return clean;
};

// ================== COMPACT DOCUMENT DISPLAY COMPONENT ==================

const CompactDocumentDisplay = ({ panNumber, aadhaarNumber, gstNumber }) => {
  const formatPan = (pan) => formatDocumentNumber(pan, 'pan');
  const formatAadhaar = (aadhaar) => formatDocumentNumber(aadhaar, 'aadhaar');
  const formatGst = (gst) => formatDocumentNumber(gst, 'gst');

  const hasDocuments = panNumber || aadhaarNumber || gstNumber;
  
  if (!hasDocuments) {
    return (
      <div className="text-xs text-gray-400 italic">No documents</div>
    );
  }

  return (
    <div className="space-y-1">
      {panNumber && (
        <div className="flex items-center gap-1">
          <FaIdCard className="text-blue-500 text-xs flex-shrink-0" />
          <span className="text-xs text-blue-700 font-mono truncate" title={panNumber}>
            {formatPan(panNumber)}
          </span>
        </div>
      )}
      {aadhaarNumber && (
        <div className="flex items-center gap-1">
          <FaFingerprint className="text-green-500 text-xs flex-shrink-0" />
          <span className="text-xs text-green-700 font-mono truncate" title={aadhaarNumber}>
            {formatAadhaar(aadhaarNumber)}
          </span>
        </div>
      )}
      {gstNumber && (
        <div className="flex items-center gap-1">
          <FaFileInvoice className="text-purple-500 text-xs flex-shrink-0" />
          <span className="text-xs text-purple-700 font-mono truncate" title={gstNumber}>
            {formatGst(gstNumber)}
          </span>
        </div>
      )}
    </div>
  );
};

// ================== CSV EXPORT UTILITY ==================

const exportToCSV = (customers, selectedRows = []) => {
  const customersToExport = selectedRows.length > 0 
    ? customers.filter(customer => selectedRows.includes(customer._id || customer.id))
    : customers;

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
    'Employee Name',
    'Email',
    'Mobile',
    'Alternate Phone',
    'Phone',
    'City',
    'Pincode',
    'Address',
    'Buyer Type',
    'Age',
    'Gender',
    'PAN Number',
    'Aadhaar Number',
    'GST Number',
    'Credit Type',
    'Broker Name',
    'Source Origin',
    'Lead Status',
    'Policy Type',
    'Created Date',
    'Updated Date',
    'Created By'
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
      details.employeeName,
      details.email,
      details.mobile,
      details.alternatePhone,
      details.phone,
      details.city,
      details.pincode,
      details.address,
      details.buyerType,
      details.age,
      details.gender,
      details.panNumber,
      details.aadhaarNumber,
      details.gstNumber,
      details.creditTypeInfo.label,
      details.brokerName,
      details.sourceOrigin,
      details.leadStatus,
      details.policyType,
      details.createdDate,
      details.updatedDate,
      details.createdBy
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

// ================== GET CUSTOMER DETAILS FUNCTION (moved outside component) ==================

const getCustomerDetails = (customer) => {
  // Extract customer data from nested structure or direct object
  const customerData = customer.customer_details || customer;
  
  // Determine buyer type
  const buyerType = getSafeValue(customerData.buyer_type, 
                                customerData.companyName ? 'corporate' : 'individual');
  const isCorporate = buyerType === 'corporate';
  
  // Get display name
  const displayName = getCustomerDisplayName(customer);
  
  // Get credit type info
  const creditType = getSafeValue(customerData.creditType, customer.creditType);
  const brokerName = getSafeValue(customerData.brokerName, customer.brokerName);
  const creditTypeInfo = getCreditTypeInfo(creditType, brokerName);
  
  // Get status info
  const leadStatus = getSafeValue(customerData.lead_status, customerData.status, 'Active');
  const statusDisplay = getStatusDisplay(leadStatus);
  const StatusIcon = statusDisplay.icon;
  
  // Extract all fields from customer data
  const firstName = getSafeValue(customerData.first_name);
  const lastName = getSafeValue(customerData.last_name);
  const name = getSafeValue(customerData.name);
  const companyName = getSafeValue(customerData.companyName);
  const contactPersonName = getSafeValue(customerData.contact_person_name);
  const employeeName = getSafeValue(customerData.employeeName);
  const email = getSafeValue(customerData.email);
  const phone = getSafeValue(customerData.phone);
  const mobile = getSafeValue(customerData.mobile);
  const alternatePhone = getSafeValue(customerData.alternate_phone);
  const gender = getSafeValue(customerData.gender);
  const address = getSafeValue(customerData.address, customerData.residenceAddress);
  const city = getSafeValue(customerData.city);
  const pincode = getSafeValue(customerData.pincode);
  const age = customerData.age ? `${customerData.age} yrs` : '';
  const panNumber = getSafeValue(customerData.panNumber);
  const aadhaarNumber = getSafeValue(customerData.aadhaarNumber);
  const gstNumber = getSafeValue(customerData.gstNumber);
  const sourceOrigin = getSafeValue(customerData.sourceOrigin);
  const policyType = getSafeValue(customerData.policy_type, customerData.insurance_category);
  const createdDate = formatDate(customerData.created_at || customerData.ts || customer.created_at || customer.ts);
  const updatedDate = formatDate(customerData.updated_at || customer.updated_at);
  const createdBy = getSafeValue(customerData.created_by, customer.created_by);

  return {
    id: getSafeValue(customer._id, customer.id),
    displayName,
    buyerType,
    isCorporate,
    creditTypeInfo,
    statusDisplay,
    StatusIcon,
    firstName,
    lastName,
    name,
    companyName,
    contactPersonName,
    employeeName,
    email,
    phone,
    mobile,
    alternatePhone,
    gender,
    address,
    city,
    pincode,
    age,
    panNumber: formatDocumentNumber(panNumber, 'pan'),
    aadhaarNumber: formatDocumentNumber(aadhaarNumber, 'aadhaar'),
    gstNumber: formatDocumentNumber(gstNumber, 'gst'),
    sourceOrigin,
    brokerName,
    leadStatus,
    policyType,
    createdDate,
    updatedDate,
    createdBy,
    creditType,
    originalPan: panNumber,
    originalAadhaar: aadhaarNumber,
    originalGst: gstNumber
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
    alternatePhone: '',
    pincode: '',
    panNumber: '',
    aadhaarNumber: '',
    gstNumber: '',
    creditType: '',
    sourceOrigin: '',
    brokerName: '',
    employeeName: ''
  });

  // Sort customers by creation date (newest first)
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const dateA = new Date(a.created_at || a.ts || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.ts || b.createdAt || 0);
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
        const details = getCustomerDetails(customer);
        
        const customerName = details.displayName.toLowerCase();
        const mobile = getSafeValue(details.mobile).toLowerCase();
        const email = getSafeValue(details.email).toLowerCase();
        const city = getSafeValue(details.city).toLowerCase();
        const companyName = getSafeValue(details.companyName).toLowerCase();
        const contactPerson = getSafeValue(details.contactPersonName).toLowerCase();
        const employeeName = getSafeValue(details.employeeName).toLowerCase();
        const alternatePhone = getSafeValue(details.alternatePhone).toLowerCase();
        const pincode = getSafeValue(details.pincode).toLowerCase();
        const panNumber = getSafeValue(details.originalPan).toLowerCase();
        const aadhaarNumber = getSafeValue(details.originalAadhaar).toLowerCase();
        const gstNumber = getSafeValue(details.originalGst).toLowerCase();
        const creditType = getSafeValue(details.creditType).toLowerCase();
        const sourceOrigin = getSafeValue(details.sourceOrigin).toLowerCase();
        const brokerName = getSafeValue(details.brokerName).toLowerCase();

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

        const matchesEmployeeName = !searchFilters.employeeName || 
          employeeName.includes(searchFilters.employeeName.toLowerCase());

        const matchesAlternatePhone = !searchFilters.alternatePhone || 
          alternatePhone.includes(searchFilters.alternatePhone);

        const matchesPincode = !searchFilters.pincode || 
          pincode.includes(searchFilters.pincode);

        const matchesPanNumber = !searchFilters.panNumber || 
          panNumber.includes(searchFilters.panNumber.toLowerCase());

        const matchesAadhaarNumber = !searchFilters.aadhaarNumber || 
          aadhaarNumber.includes(searchFilters.aadhaarNumber.toLowerCase());

        const matchesGstNumber = !searchFilters.gstNumber || 
          gstNumber.includes(searchFilters.gstNumber.toLowerCase());

        const matchesCreditType = !searchFilters.creditType || 
          creditType.includes(searchFilters.creditType.toLowerCase());

        const matchesSourceOrigin = !searchFilters.sourceOrigin || 
          sourceOrigin.includes(searchFilters.sourceOrigin.toLowerCase());

        const matchesBrokerName = !searchFilters.brokerName || 
          brokerName.includes(searchFilters.brokerName.toLowerCase());

        return matchesCustomerName && matchesMobile && matchesEmail && matchesCity &&
               matchesCompanyName && matchesContactPerson && matchesEmployeeName &&
               matchesAlternatePhone && matchesPincode && matchesPanNumber && 
               matchesAadhaarNumber && matchesGstNumber && matchesCreditType && 
               matchesSourceOrigin && matchesBrokerName;
      });
    }

    // Apply basic search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(customer => {
        const details = getCustomerDetails(customer);
        
        const customerName = details.displayName.toLowerCase();
        const mobile = getSafeValue(details.mobile).toLowerCase();
        const email = getSafeValue(details.email).toLowerCase();
        const city = getSafeValue(details.city).toLowerCase();
        const companyName = getSafeValue(details.companyName).toLowerCase();
        const contactPerson = getSafeValue(details.contactPersonName).toLowerCase();
        const employeeName = getSafeValue(details.employeeName).toLowerCase();
        const customerId = getSafeValue(details.id).toLowerCase();
        const panNumber = getSafeValue(details.originalPan).toLowerCase();
        const aadhaarNumber = getSafeValue(details.originalAadhaar).toLowerCase();
        const gstNumber = getSafeValue(details.originalGst).toLowerCase();
        const sourceOrigin = getSafeValue(details.sourceOrigin).toLowerCase();
        const brokerName = getSafeValue(details.brokerName).toLowerCase();
        
        return (
          customerName.includes(query) ||
          mobile.includes(query) ||
          email.includes(query) ||
          city.includes(query) ||
          companyName.includes(query) ||
          contactPerson.includes(query) ||
          employeeName.includes(query) ||
          customerId.includes(query) ||
          panNumber.includes(query) ||
          aadhaarNumber.includes(query) ||
          gstNumber.includes(query) ||
          sourceOrigin.includes(query) ||
          brokerName.includes(query)
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
      const allIds = new Set(paginatedCustomers.map(customer => customer._id || customer.id));
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
    
    const allIds = new Set(paginatedCustomers.map(customer => customer._id || customer.id));
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

  // Event handlers
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    const customerId = customerToDelete._id || customerToDelete.id;
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

  const handleExport = () => {
    exportToCSV(filteredCustomers, Array.from(selectedRows));
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
      alternatePhone: '',
      pincode: '',
      panNumber: '',
      aadhaarNumber: '',
      gstNumber: '',
      creditType: '',
      sourceOrigin: '',
      brokerName: '',
      employeeName: ''
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
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading customers...</p>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-4 text-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaUser className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-sm">No customers found</p>
        <p className="text-gray-500 text-xs">Create your first customer to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Compact Filters Section */}
      <div className="bg-white rounded border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap flex-1">
            {/* Search Bar */}
            <div className="flex flex-col flex-1 min-w-[220px]">
              <div className="relative">
                <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers by name, mobile, PAN, Aadhaar, GST..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Search Button */}
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[90px] justify-center"
            >
              <FaFilter className="text-sm" />
              Filters
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[90px] justify-center"
            >
              <FaTimes className="text-sm transform rotate-45" />
              Refresh
            </button>
          </div>

          {/* Export and Add New Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={filteredCustomers.length === 0}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[90px] justify-center"
            >
              <FaDownload className="text-sm" />
              Export
            </button>

            <button
              onClick={onAddNew}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors min-w-[90px] justify-center"
            >
              <FaUser className="text-sm" />
              Add New
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredCustomers.length}</span> customers
            {filteredCustomers.length !== sortedCustomers.length && (
              <span className="text-gray-400 ml-1">(of {sortedCustomers.length})</span>
            )}
          </div>
          
          {selectedRows.size > 0 && (
            <div className="text-sm text-blue-600 font-medium">
              {selectedRows.size} selected
            </div>
          )}
        </div>
      </div>

      {/* Responsive Table - No horizontal scroll needed */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-2 py-2 font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-9">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                  />
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-9">
                  {/* Expand column */}
                </th>
                <th className="px-3 py-2 font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 min-w-[190px]">
                  Customer Details
                </th>
                <th className="px-3 py-2 font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 min-w-[170px]">
                  Contact Information
                </th>
                <th className="px-3 py-2 font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                  Document Numbers
                </th>
                <th className="px-3 py-2 font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                  Business Info
                </th>
                <th className="px-3 py-2 font-semibold text-gray-600 uppercase tracking-wider min-w-[110px]">
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
                      <td className="px-2 py-2 border-r border-gray-100 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(details.id)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                        />
                      </td>

                      {/* Expand Column */}
                      <td className="px-2 py-2 border-r border-gray-100 align-top">
                        <button
                          onClick={() => handleRowExpand(details.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                        </button>
                      </td>

                      {/* Customer Details Column */}
                      <td className="px-3 py-2 border-r border-gray-100 align-top">
                        <div className="space-y-1.5">
                          {/* Customer ID - Full ID shown */}
                          <div className="text-xs font-mono text-gray-500 truncate" title={details.id}>
                            ID: {details.id}
                          </div>
                          
                          {/* Company Name (if exists) - NEW: Show company name first */}
                          {details.companyName && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-100">
                                  <FaBuilding className="text-orange-600 text-xs" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-gray-900 text-sm truncate" title={details.companyName}>
                                    {details.companyName}
                                  </div>
                                </div>
                              </div>
                              {/* Contact Person Name (below company) - NEW: Show below, not in brackets */}
                              {details.contactPersonName && details.displayName !== details.contactPersonName && (
                                <div className="flex items-center gap-1.5 ml-1.5">
                                  <FaUser className="text-gray-400 text-xs flex-shrink-0" />
                                  <div className="text-xs text-gray-600 truncate" title={details.contactPersonName}>
                                    {details.contactPersonName}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Individual Customer (no company) */}
                          {!details.companyName && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100">
                                <FaUser className="text-purple-600 text-xs" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 text-sm truncate" title={details.displayName}>
                                  {details.displayName}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Employee Name */}
                          {details.employeeName && (
                            <div className="text-xs text-gray-500 truncate ml-1.5">
                              👨‍💼 {details.employeeName}
                            </div>
                          )}

                          {/* Age & Gender */}
                          {(details.age || details.gender) && (
                            <div className="text-xs text-gray-500 flex gap-2 ml-1.5">
                              {details.age && <span>Age: {details.age}</span>}
                              {details.gender && <span>Gender: {details.gender}</span>}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact Information Column */}
                      <td className="px-3 py-2 border-r border-gray-100 align-top">
                        <div className="space-y-1.5">
                          {/* Mobile Number */}
                          <div className="flex items-center gap-1.5">
                            <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
                            <div className="font-medium text-gray-900 text-sm truncate" title={details.mobile}>
                              {details.mobile || 'N/A'}
                            </div>
                          </div>

                          {/* Alternate Phone */}
                          {details.alternatePhone && (
                            <div className="flex items-center gap-1.5 ml-1.5">
                              <FaMobileAlt className="text-gray-400 text-xs flex-shrink-0" />
                              <div className="text-xs text-gray-600 truncate" title={details.alternatePhone}>
                                {details.alternatePhone}
                              </div>
                            </div>
                          )}

                          {/* Email */}
                          {details.email && (
                            <div className="flex items-center gap-1.5">
                              <FaEnvelope className="text-gray-400 text-xs flex-shrink-0" />
                              <div className="text-xs text-gray-600 truncate" title={details.email}>
                                {details.email}
                              </div>
                            </div>
                          )}

                          {/* Location */}
                          {(details.city || details.pincode) && (
                            <div className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
                              <div className="text-xs text-gray-600 truncate">
                                {details.city || ''} {details.pincode && `- ${details.pincode}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Document Numbers Column */}
                      <td className="px-3 py-2 border-r border-gray-100 align-top">
                        <CompactDocumentDisplay 
                          panNumber={details.panNumber}
                          aadhaarNumber={details.aadhaarNumber}
                          gstNumber={details.gstNumber}
                        />
                      </td>

                      {/* Business Information Column */}
                      <td className="px-3 py-2 border-r border-gray-100 align-top">
                        <div className="space-y-1.5">
                          {/* Status */}
                          <div className="flex items-center gap-1.5">
                            <details.StatusIcon className="text-xs" />
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${details.statusDisplay.class}`}>
                              {details.leadStatus}
                            </span>
                          </div>
                          
                          {/* Credit Type */}
                          <div className="flex items-center gap-1.5">
                            <CreditTypeIcon className="text-gray-400 text-xs flex-shrink-0" />
                            <span className={`text-xs px-1.5 py-0.5 rounded ${details.creditTypeInfo.class}`}>
                              {details.creditTypeInfo.label}
                            </span>
                          </div>

                          {/* Source Origin & Broker */}
                          <div className="space-y-0.5">
                            {details.sourceOrigin && (
                              <div className="text-xs text-gray-500 truncate" title={details.sourceOrigin}>
                                📍 {details.sourceOrigin}
                              </div>
                            )}
                            {details.brokerName && (
                              <div className="text-xs text-gray-500 truncate" title={details.brokerName}>
                                🤝 {details.brokerName}
                              </div>
                            )}
                          </div>

                          {/* Policy Type */}
                          {details.policyType && (
                            <div className="text-xs text-gray-500">
                              📄 {details.policyType}
                            </div>
                          )}

                          {/* Created Date */}
                          <div className="text-xs text-gray-400 mt-0.5">
                            Created: {details.createdDate}
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col gap-1.5">
                          <button 
                            onClick={() => onView(customer)}
                            className="flex items-center justify-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-2 py-1.5 rounded transition-colors border border-purple-200"
                          >
                            <FaEye className="text-xs" />
                            View
                          </button>
                          <button 
                            onClick={() => onEdit(customer)}
                            className="flex items-center justify-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-2 py-1.5 rounded transition-colors border border-green-200"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              setCustomerToDelete(customer);
                              setDeleteConfirmOpen(true);
                            }}
                            className="flex items-center justify-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-2 py-1.5 rounded transition-colors border border-red-200"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row with ALL Details */}
                    {isExpanded && (
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <td colSpan="7" className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Personal Details */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 text-sm border-b pb-1">Personal Details</h4>
                              <div className="space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Customer ID:</span>
                                  <span className="font-medium font-mono">{details.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Display Name:</span>
                                  <span className="font-medium">{details.displayName}</span>
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
                                {details.name && details.name !== details.displayName && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Name Field:</span>
                                    <span className="font-medium">{details.name}</span>
                                  </div>
                                )}
                                {details.employeeName && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Employee Name:</span>
                                    <span className="font-medium">{details.employeeName}</span>
                                  </div>
                                )}
                                {details.age && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Age:</span>
                                    <span className="font-medium">{details.age}</span>
                                  </div>
                                )}
                                {details.gender && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Gender:</span>
                                    <span className="font-medium capitalize">{details.gender}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Contact & Company Details */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 text-sm border-b pb-1">Contact & Company</h4>
                              <div className="space-y-1.5">
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
                                {details.address && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Address:</span>
                                    <span className="font-medium text-right max-w-[160px]">{details.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Business & Document Details */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 text-sm border-b pb-1">Business & Documents</h4>
                              <div className="space-y-1.5">
                                {details.panNumber && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">PAN Number:</span>
                                    <span className="font-medium font-mono text-blue-600">{details.panNumber}</span>
                                  </div>
                                )}
                                {details.aadhaarNumber && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Aadhaar Number:</span>
                                    <span className="font-medium font-mono text-green-600">{details.aadhaarNumber}</span>
                                  </div>
                                )}
                                {details.gstNumber && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">GST Number:</span>
                                    <span className="font-medium font-mono text-purple-600">{details.gstNumber}</span>
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
                                {details.policyType && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Policy Type:</span>
                                    <span className="font-medium">{details.policyType}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${details.statusDisplay.class}`}>
                                    {details.leadStatus}
                                  </span>
                                </div>
                                {details.createdDate && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Created Date:</span>
                                    <span className="font-medium">{details.createdDate}</span>
                                  </div>
                                )}
                                {details.updatedDate && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Updated Date:</span>
                                    <span className="font-medium">{details.updatedDate}</span>
                                  </div>
                                )}
                                {details.createdBy && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Created By:</span>
                                    <span className="font-medium">{details.createdBy}</span>
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
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1.5">
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
                        onClick={() => setCurrentPage(pageNumber)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FaUser className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-sm mb-2">No customers match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleResetAdvancedFilters();
            }}
            className="px-3 py-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm font-medium"
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
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaExclamationTriangle className="w-4.5 h-4.5 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Delete Customer</h3>
            </div>
            
            <p className="text-gray-600 mb-3 text-sm">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>

            {customerToDelete && (
              <div className="bg-gray-50 rounded p-2 mb-3">
                <div className="text-sm text-gray-700 space-y-1.5">
                  <div className="font-medium">Customer ID: {getSafeValue(customerToDelete._id || customerToDelete.id)}</div>
                  <div>Name: {getCustomerDisplayName(customerToDelete)}</div>
                  <div>Email: {getSafeValue(customerToDelete.customer_details?.email || customerToDelete.email)}</div>
                  <div>Phone: {getSafeValue(customerToDelete.customer_details?.phone || customerToDelete.phone)}</div>
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
                    <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-white mr-1.5"></div>
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