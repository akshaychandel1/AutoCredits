import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, RefreshCw, Download, Search, Edit, Trash2, Eye, 
  User, Building, Filter, X, Mail, Phone, MapPin, IdCard, 
  Briefcase, UserCheck, FileText, Shield, Calendar, Users, Target,
  ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';

// Advanced Search Component
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
      email: '',
      phone: '',
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Search</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
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
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                value={localFilters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="Search by email"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                value={localFilters.phone}
                onChange={(e) => handleFilterChange('phone', e.target.value)}
                placeholder="Search by phone"
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

// Main Customer Table Component
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
    email: '',
    phone: '',
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

  // Get customer display name with fallback logic
  const getCustomerDisplayName = (customer) => {
    if (customer.buyer_type === 'corporate') {
      return customer.company_name || customer.contact_person_name || 'Corporate Customer';
    }
    if (customer.first_name || customer.last_name) {
      return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    }
    return customer.contact_person_name || 'Individual Customer';
  };

  // Enhanced search function with advanced filters
  const filteredCustomers = useMemo(() => {
    let filtered = sortedCustomers;

    // Apply advanced search filters
    const hasAdvancedFilters = Object.values(searchFilters).some(value => value !== '');
    
    if (hasAdvancedFilters) {
      filtered = filtered.filter(customer => {
        const customerName = getCustomerDisplayName(customer).toLowerCase();
        const email = (customer.email || '').toLowerCase();
        const phone = (customer.phone || '');
        const city = (customer.city || '').toLowerCase();
        const companyName = (customer.company_name || '').toLowerCase();
        const contactPerson = (customer.contact_person_name || '').toLowerCase();
        const policyType = (customer.policy_type || '').toLowerCase();
        const leadStatus = (customer.lead_status || '').toLowerCase();
        const creditType = (customer.creditType || '').toLowerCase();
        const sourceOrigin = (customer.sourceOrigin || '').toLowerCase();

        const matchesCustomerName = !searchFilters.customerName || 
          customerName.includes(searchFilters.customerName.toLowerCase());

        const matchesEmail = !searchFilters.email || 
          email.includes(searchFilters.email.toLowerCase());

        const matchesPhone = !searchFilters.phone || 
          phone.includes(searchFilters.phone);

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

        return matchesCustomerName && matchesEmail && matchesPhone && matchesCity &&
               matchesCompanyName && matchesContactPerson && matchesPolicyType &&
               matchesLeadStatus && matchesCreditType && matchesSourceOrigin;
      });
    }

    // Apply basic search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(customer => {
        const customerName = getCustomerDisplayName(customer).toLowerCase();
        const email = (customer.email || '').toLowerCase();
        const phone = (customer.phone || '');
        const city = (customer.city || '').toLowerCase();
        const companyName = (customer.company_name || '').toLowerCase();
        const contactPerson = (customer.contact_person_name || '').toLowerCase();
        const customerId = (customer._id || '').toLowerCase();
        
        return (
          customerName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
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

  // Helper functions
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

  // Get credit type display info
  const getCreditTypeInfo = (creditType, brokerName = '') => {
    const types = {
      auto: { label: 'Autocredits India LLP', color: 'blue', icon: <Shield className="w-3 h-3" /> },
      broker: { label: `Broker${brokerName ? ` - ${brokerName}` : ''}`, color: 'purple', icon: <UserCheck className="w-3 h-3" /> },
      showroom: { label: 'Showroom', color: 'orange', icon: <Building className="w-3 h-3" /> },
      customer: { label: 'Customer', color: 'green', icon: <User className="w-3 h-3" /> }
    };
    
    return types[creditType] || { label: creditType, color: 'gray', icon: <FileText className="w-3 h-3" /> };
  };

  // Get status display info
  const getStatusDisplay = (status) => {
    const statusConfig = {
      'Active': { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      'New': { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Converted': { class: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      'Hot': { class: 'bg-red-100 text-red-800', icon: AlertTriangle },
      'Warm': { class: 'bg-orange-100 text-orange-800', icon: Clock },
      'Cold': { class: 'bg-blue-100 text-blue-800', icon: Clock },
      'Open': { class: 'bg-blue-100 text-blue-800', icon: Clock }
    };
    
    return statusConfig[status] || { class: 'bg-gray-100 text-gray-800', icon: Clock };
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
  const exportToCSV = () => {
    const customersToExport = selectedRows.size > 0 
      ? filteredCustomers.filter(customer => selectedRows.has(customer._id))
      : filteredCustomers;

    if (customersToExport.length === 0) {
      alert('No customers to export');
      return;
    }

    const headers = [
      'Customer ID',
      'Buyer Type',
      'Display Name',
      'First Name',
      'Last Name',
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Gender',
      'Address',
      'City',
      'Pincode',
      'Lead Source',
      'Policy Type',
      'Lead Status',
      'Credit Type',
      'Source Origin',
      'Broker Name',
      'Created Date'
    ];

    const csvData = customersToExport.map(customer => {
      const isCorporate = customer.buyer_type === 'corporate';
      const displayName = getCustomerDisplayName(customer);
      
      return [
        customer._id || 'N/A',
        customer.buyer_type || 'individual',
        displayName,
        customer.first_name || 'N/A',
        customer.last_name || 'N/A',
        customer.company_name || 'N/A',
        customer.contact_person_name || 'N/A',
        customer.email || 'N/A',
        customer.phone || 'N/A',
        customer.gender || 'N/A',
        customer.address || 'N/A',
        customer.city || 'N/A',
        customer.pincode || 'N/A',
        customer.lead_source || 'N/A',
        customer.policy_type || 'N/A',
        customer.lead_status || 'N/A',
        customer.creditType || 'auto',
        customer.sourceOrigin || 'direct',
        customer.brokerName || 'N/A',
        formatDate(customer.created_at || customer.ts)
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
      email: '',
      phone: '',
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
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading customers...</p>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-sm">No customers found</p>
        <p className="text-gray-500 text-xs">Create your first customer to get started</p>
        <button
          onClick={onAddNew}
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add Customer
        </button>
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
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone, company..."
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
                <Filter className="text-xs" />
                Advanced
              </button>
            </div>

            {/* Refresh Button */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Refresh</label>
              <button
                onClick={onRefresh}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[100px] justify-center"
              >
                <RefreshCw className="text-xs" />
                Refresh
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Export</label>
            <button
              onClick={exportToCSV}
              disabled={filteredCustomers.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] justify-center"
            >
              <Download className="text-xs" />
              {selectedRows.size > 0 ? `Export (${selectedRows.size})` : 'Export All'}
            </button>
          </div>

          {/* Add Customer Button */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">New Customer</label>
            <button
              onClick={onAddNew}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors min-w-[100px] justify-center"
            >
              <Plus className="text-xs" />
              Add New
            </button>
          </div>
        </div>

        {/* Results Count and Active Filters */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{filteredCustomers.length}</span> customers
            {filteredCustomers.length !== sortedCustomers.length && (
              <span className="text-gray-400 ml-1">(of {sortedCustomers.length})</span>
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
                  Customer Details
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                  Contact Information
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                  Business Info
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
              {paginatedCustomers.map((customer) => {
                const isCorporate = customer.buyer_type === 'corporate';
                const displayName = getCustomerDisplayName(customer);
                const creditTypeInfo = getCreditTypeInfo(customer.creditType, customer.brokerName);
                const statusDisplay = getStatusDisplay(customer.lead_status);
                const StatusIcon = statusDisplay.icon;
                const isSelected = selectedRows.has(customer._id);
                const isExpanded = expandedRows.has(customer._id);

                return (
                  <React.Fragment key={customer._id}>
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
                          onChange={() => handleRowSelect(customer._id)}
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                        />
                      </td>

                      {/* Expand Column */}
                      <td className="px-1 py-2 border-r border-gray-100">
                        <button
                          onClick={() => handleRowExpand(customer._id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="text-xs" /> : <ChevronDown className="text-xs" />}
                        </button>
                      </td>

                      {/* Customer Details Column */}
                      <td className="px-2 py-2 border-r border-gray-100">
                        <div className="space-y-1.5">
                          {/* Header with Customer ID */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-mono text-gray-500">
                              ID: {customer._id?.slice(-6)}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                isCorporate 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {isCorporate ? 'CORP' : 'IND'}
                              </span>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="space-y-1">
                            <div className="flex items-start gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                                isCorporate ? 'bg-orange-100' : 'bg-purple-100'
                              }`}>
                                {isCorporate ? (
                                  <Building className="text-orange-600 text-xs" />
                                ) : (
                                  <User className="text-purple-600 text-xs" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 text-sm truncate">
                                  {displayName}
                                </div>
                                
                                {/* Company Name and Contact Person for Corporate */}
                                {isCorporate && (
                                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                    {customer.company_name && (
                                      <div className="flex items-center gap-1 truncate">
                                        <Building className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{customer.company_name}</span>
                                      </div>
                                    )}
                                    {customer.contact_person_name && (
                                      <div className="flex items-center gap-1 truncate">
                                        <User className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{customer.contact_person_name}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Individual customer details */}
                                {!isCorporate && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <span>{customer.gender || 'N/A'}</span>
                                    {customer.age && <span>• {customer.age} yrs</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Credit Type */}
                          <div className="pt-1 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              {creditTypeInfo.icon}
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                creditTypeInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                creditTypeInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                creditTypeInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {creditTypeInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Information Column */}
                      <td className="px-2 py-2 border-r border-gray-100">
                        <div className="space-y-1.5 text-xs">
                          <div className="text-gray-700 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{customer.email || 'N/A'}</span>
                          </div>
                          <div className="text-gray-700 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span>{customer.phone || 'N/A'}</span>
                          </div>
                          <div className="text-gray-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{customer.city || 'N/A'}</span>
                          </div>
                          {customer.sourceOrigin && customer.sourceOrigin !== 'N/A' && (
                            <div className="text-gray-700 flex items-center gap-1 pt-1 border-t border-gray-100">
                              <Target className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              <span className="truncate">Source: {customer.sourceOrigin}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Business Info Column */}
                      <td className="px-2 py-2 border-r border-gray-100">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              customer.policy_type === '4 Wheeler' ? 'bg-blue-100 text-blue-800' :
                              customer.policy_type === '2 Wheeler' ? 'bg-green-100 text-green-800' :
                              customer.policy_type === 'Home Insurance' ? 'bg-purple-100 text-purple-800' :
                              customer.policy_type === 'Health Insurance' ? 'bg-pink-100 text-pink-800' :
                              customer.policy_type === 'Life Insurance' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {customer.policy_type || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5" />
                              <span>Lead: {customer.lead_source || 'N/A'}</span>
                            </div>
                            {customer.brokerName && customer.brokerName !== 'N/A' && (
                              <div className="flex items-center gap-1">
                                <UserCheck className="w-2.5 h-2.5" />
                                <span className="truncate">Broker: {customer.brokerName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Dates Column */}
                      <td className="px-2 py-2 border-r border-gray-100">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="text-xs" />
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${statusDisplay.class}`}>
                              {customer.lead_status || 'New'}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between items-center">
                              <span>Created:</span>
                              <span className="text-xs">{formatDate(customer.created_at || customer.ts)}</span>
                            </div>
                            {customer.updated_at && (
                              <div className="flex justify-between items-center">
                                <span>Updated:</span>
                                <span className="text-xs">{formatDate(customer.updated_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-2 py-2">
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => handleViewClick(customer)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-1.5 py-1 rounded transition-colors border border-purple-200 justify-center"
                          >
                            <Eye className="text-xs" />
                            View
                          </button>
                          <button 
                            onClick={() => handleEditClick(customer)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-1.5 py-1 rounded transition-colors border border-green-200 justify-center"
                          >
                            <Edit className="text-xs" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(customer)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-1.5 py-1 rounded transition-colors border border-red-200 justify-center"
                          >
                            <Trash2 className="text-xs" />
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
                                  <span className="text-gray-600">Customer ID:</span>
                                  <span className="font-medium font-mono">{customer._id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Type:</span>
                                  <span className="font-medium capitalize">{customer.buyer_type}</span>
                                </div>
                                {isCorporate ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Company Name:</span>
                                      <span className="font-medium">{customer.company_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Contact Person:</span>
                                      <span className="font-medium">{customer.contact_person_name || 'N/A'}</span>
                                    </div>
                                    {customer.company_code && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Company Code:</span>
                                        <span className="font-medium">{customer.company_code}</span>
                                      </div>
                                    )}
                                    {customer.contact_code && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Contact Code:</span>
                                        <span className="font-medium">{customer.contact_code}</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">First Name:</span>
                                      <span className="font-medium">{customer.first_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Last Name:</span>
                                      <span className="font-medium">{customer.last_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Gender:</span>
                                      <span className="font-medium">{customer.gender || 'N/A'}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 border-b pb-1">Contact Information</h4>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Email:</span>
                                  <span className="font-medium">{customer.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Phone:</span>
                                  <span className="font-medium">{customer.phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Alternate Phone:</span>
                                  <span className="font-medium">{customer.alternate_phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Address:</span>
                                  <span className="font-medium text-right max-w-[200px]">{customer.address || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">City:</span>
                                  <span className="font-medium">{customer.city || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pincode:</span>
                                  <span className="font-medium">{customer.pincode || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Business Information */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-700 border-b pb-1">Business Information</h4>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Credit Type:</span>
                                  <span className="font-medium">{creditTypeInfo.label}</span>
                                </div>
                                {customer.brokerName && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Broker Name:</span>
                                    <span className="font-medium">{customer.brokerName}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Source Origin:</span>
                                  <span className="font-medium">{customer.sourceOrigin || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Policy Type:</span>
                                  <span className="font-medium">{customer.policy_type || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Lead Source:</span>
                                  <span className="font-medium">{customer.lead_source || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Lead Status:</span>
                                  <span className="font-medium">{customer.lead_status || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Created By:</span>
                                  <span className="font-medium">{customer.created_by || 'System'}</span>
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
                  {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredCustomers.length}</span>
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
      {filteredCustomers.length === 0 && customers.length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-sm mb-1">No customers match your filters</p>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-md w-full p-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>

            {customerToDelete && (
              <div className="bg-gray-50 rounded p-3 mb-4">
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="font-medium">Customer ID: {customerToDelete._id?.slice(-6)}</div>
                  <div>Name: {getCustomerDisplayName(customerToDelete)}</div>
                  <div>Email: {customerToDelete.email || 'N/A'}</div>
                  <div>Phone: {customerToDelete.phone || 'N/A'}</div>
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