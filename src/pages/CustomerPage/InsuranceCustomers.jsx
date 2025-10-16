import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiDownload, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/customers";

const InsuranceCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Fetch customers from API using axios
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching customers from API...");
      
      const response = await axios.get(API_BASE_URL);
      console.log("API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
      } else {
        setError("Invalid response format from server");
        setCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(`Failed to load customers: ${err.message}`);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter((customer) => {
    const firstName = customer.first_name || '';
    const lastName = customer.last_name || '';
    const email = customer.email || '';
    const phone = customer.phone || '';
    const policyType = customer.policy_type || '';

    return (
      (statusFilter ? customer.lead_status === statusFilter : true) &&
      (typeFilter ? policyType.toLowerCase().includes(typeFilter.toLowerCase()) : true) &&
      (search
        ? firstName.toLowerCase().includes(search.toLowerCase()) ||
          lastName.toLowerCase().includes(search.toLowerCase()) ||
          email.toLowerCase().includes(search.toLowerCase()) ||
          phone.toLowerCase().includes(search.toLowerCase())
        : true)
    );
  });

  // Handle View Customer
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Handle Edit Customer
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsNewCustomerModalOpen(true);
  };

  // Handle Delete Customer
  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${customerId}`);
        setCustomers(customers.filter((c) => c._id !== customerId));
        
        if (selectedCustomer && selectedCustomer._id === customerId) {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }
      } catch (err) {
        console.error("Error deleting customer:", err);
        alert("Failed to delete customer. Please try again.");
      }
    }
  };

  // Refresh customers
  const handleRefresh = () => {
    fetchCustomers();
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(customers.map(c => c.lead_status).filter(Boolean))];

  // Get unique policy types for filter
  const uniqueTypes = [...new Set(customers.map(c => c.policy_type).filter(Boolean))];

  // Get stats for dashboard
  const getStats = () => {
    const total = customers.length;
    const active = customers.filter(c => c.lead_status && c.lead_status.includes('Active')).length;
    const newLeads = customers.filter(c => c.lead_status && c.lead_status.includes('New')).length;
    const converted = customers.filter(c => c.lead_status && c.lead_status.includes('Converted')).length;
    
    return { total, active, newLeads, converted };
  };

  const stats = getStats();

  // Handle stat card click to filter
  const handleStatClick = (filterType) => {
    setStatusFilter(filterType);
    setSearch("");
    setTypeFilter("");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("");
    setSearch("");
    setTypeFilter("");
  };

  // Check if any filter is active
  const isFilterActive = statusFilter || search || typeFilter;

  // Format date
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

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Customer ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Gender',
      'Address',
      'Lead Source',
      'Policy Type',
      'Lead Status',
      'Created Date'
    ];

    const csvData = filteredCustomers.map(customer => [
      customer._id || 'N/A',
      customer.first_name || 'N/A',
      customer.last_name || 'N/A',
      customer.email || 'N/A',
      customer.phone || 'N/A',
      customer.gender || 'N/A',
      customer.address || 'N/A',
      customer.lead_source || 'N/A',
      customer.policy_type || 'N/A',
      customer.lead_status || 'N/A',
      formatDate(customer.created_at || customer.ts)
    ].join(','));

    const csvContent = [
      headers.join(','),
      ...csvData
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

  // Handle customer save (both create and update)
  const handleCustomerSave = async (customerData) => {
    try {
      let updatedCustomer;
      if (editingCustomer) {
        // Update existing customer
        const response = await axios.put(`${API_BASE_URL}/${editingCustomer._id}`, customerData);
        updatedCustomer = response.data.data || response.data; // Handle both response formats
        setCustomers(customers.map(c => c._id === editingCustomer._id ? updatedCustomer : c));
        
        // Update selectedCustomer if it's the one being edited
        if (selectedCustomer && selectedCustomer._id === editingCustomer._id) {
          setSelectedCustomer(updatedCustomer);
        }
      } else {
        // Create new customer
        const response = await axios.post(API_BASE_URL, customerData);
        updatedCustomer = response.data.data || response.data; // Handle both response formats
        setCustomers([...customers, updatedCustomer]);
      }
      
      setIsNewCustomerModalOpen(false);
      setEditingCustomer(null);
      
      // Fetch customers again as a fallback to ensure data consistency
      await fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(`Failed to ${editingCustomer ? 'update' : 'add'} customer. Please try again.`);
      // Fetch customers to ensure UI is in sync with server
      await fetchCustomers();
    }
  };

  // Close customer modal and reset editing state
  const handleCloseCustomerModal = () => {
    setIsNewCustomerModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Insurance Customers
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? "Loading..." : `Showing ${filteredCustomers.length} of ${customers.length} customers`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            <FiPlus className="text-lg" /> New Customer
          </button>
        </div>
      </div>

      {/* Stats Overview - Beautiful Cards */}
      {!loading && customers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Customer Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Customers Card */}
              <button
                onClick={() => handleStatClick('')}
                className={`bg-gradient-to-br from-blue-50 to-blue-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                  !statusFilter 
                    ? 'border-blue-300 ring-4 ring-blue-100' 
                    : 'border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{stats.total}</span>
                  </div>
                  {!statusFilter && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Total Customers</h3>
                <p className="text-sm text-blue-600 font-medium">
                  {!statusFilter ? 'Viewing all customers' : 'Click to view all'}
                </p>
              </button>

              {/* Active Customers Card */}
              <button
                onClick={() => handleStatClick('Active')}
                className={`bg-gradient-to-br from-green-50 to-green-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                  statusFilter === 'Active' 
                    ? 'border-green-300 ring-4 ring-green-100' 
                    : 'border-green-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{stats.active}</span>
                  </div>
                  {statusFilter === 'Active' && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Active Customers</h3>
                <p className="text-sm text-green-600 font-medium">
                  {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}% of total` : 'No customers'}
                </p>
              </button>

              {/* New Leads Card */}
              <button
                onClick={() => handleStatClick('New')}
                className={`bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                  statusFilter === 'New' 
                    ? 'border-yellow-300 ring-4 ring-yellow-100' 
                    : 'border-yellow-200 hover:border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{stats.newLeads}</span>
                  </div>
                  {statusFilter === 'New' && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">New Leads</h3>
                <p className="text-sm text-yellow-600 font-medium">
                  {stats.total > 0 ? `${((stats.newLeads / stats.total) * 100).toFixed(1)}% of total` : 'No customers'}
                </p>
              </button>

              {/* Converted Customers Card */}
              <button
                onClick={() => handleStatClick('Converted')}
                className={`bg-gradient-to-br from-purple-50 to-purple-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                  statusFilter === 'Converted' 
                    ? 'border-purple-300 ring-4 ring-purple-100' 
                    : 'border-purple-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{stats.converted}</span>
                  </div>
                  {statusFilter === 'Converted' && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Converted</h3>
                <p className="text-sm text-purple-600 font-medium">
                  {stats.total > 0 ? `${((stats.converted / stats.total) * 100).toFixed(1)}% of total` : 'No customers'}
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchCustomers}
              className="text-red-700 hover:text-red-900 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm min-w-[140px]"
            >
              <option value="">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm min-w-[140px]"
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={filteredCustomers.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload className="text-sm" />
            Export CSV
          </button>

          {/* Clear All Filters */}
          {isFilterActive && (
            <button
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-800 underline text-sm whitespace-nowrap font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {isFilterActive && (
          <div className="mt-3 flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Search: "{search}"
                <button 
                  onClick={() => setSearch("")}
                  className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                Status: {statusFilter}
                <button 
                  onClick={() => setStatusFilter("")}
                  className="ml-1 hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                Type: {typeFilter}
                <button 
                  onClick={() => setTypeFilter("")}
                  className="ml-1 hover:bg-purple-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiSearch className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No customers found</p>
            <p className="text-gray-500 text-xs">
              {customers.length === 0 ? 'Create your first customer to get started' : 'Try adjusting your filter criteria'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    Customer Details
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    Contact Information
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    Policy & Lead Info
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer Details Column */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {customer.first_name?.[0]}{customer.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-xs text-gray-500">ID: {customer._id}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>Gender: {customer.gender || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Information Column */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">📧</span>
                          <span className="truncate max-w-[200px]">{customer.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">📱</span>
                          <span>{customer.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-gray-700">
                          <span className="font-medium mt-1">📍</span>
                          <span className="text-xs text-gray-600 line-clamp-2">
                            {customer.address || 'No address provided'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Policy & Lead Info Column */}
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            customer.policy_type === '4 Wheeler' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {customer.policy_type || 'No Policy'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            customer.lead_status?.includes('Active') 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : customer.lead_status?.includes('New')
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {customer.lead_status || 'No Status'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Lead Source: {customer.lead_source || 'N/A'}</div>
                          <div>Created: {formatDate(customer.created_at || customer.ts)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleView(customer)}
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-3 py-2 rounded transition-colors border border-purple-200"
                        >
                          <FiEye className="w-3 h-3" /> View Details
                        </button>
                        <button 
                          onClick={() => handleEdit(customer)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-3 py-2 rounded transition-colors border border-green-200"
                        >
                          <FiEdit className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(customer._id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-3 py-2 rounded transition-colors border border-red-200"
                        >
                          <FiTrash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <p className="text-gray-900">{selectedCustomer.first_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <p className="text-gray-900">{selectedCustomer.last_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <p className="text-gray-900">{selectedCustomer.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-gray-900">{selectedCustomer.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Policy Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Policy Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
                    <p className="text-gray-900">{selectedCustomer.policy_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                    <p className="text-gray-900">{selectedCustomer.lead_source || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
                    <p className="text-gray-900">{selectedCustomer.lead_status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-900">{formatDate(selectedCustomer.created_at || selectedCustomer.ts)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button 
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              <button 
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                onClick={() => {
                  setIsModalOpen(false);
                  handleEdit(selectedCustomer);
                }}
              >
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Customer Modal */}
      {isNewCustomerModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleCustomerSave}
          onClose={handleCloseCustomerModal}
        />
      )}
    </div>
  );
};

// Customer Modal Component (Integrated from NewCustomerPage)
const CustomerModal = ({ customer, onSave, onClose }) => {
  const isEditMode = Boolean(customer);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    lead_source: '',
    policy_type: '4 Wheeler',
    lead_status: ''
  });

  // Initialize form data when customer prop changes
  useEffect(() => {
    if (isEditMode && customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        gender: customer.gender || '',
        address: customer.address || '',
        lead_source: customer.lead_source || '',
        policy_type: customer.policy_type || '4 Wheeler',
        lead_status: customer.lead_status || ''
      });
    } else {
      // Reset form for new customer
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        address: '',
        lead_source: '',
        policy_type: '4 Wheeler',
        lead_status: ''
      });
    }
  }, [customer, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const customerData = {
        ...formData,
        ts: Date.now(),
        created_by: "user-id" // Replace with actual user ID
      };

      // Let the server generate the _id for new customers
      const response = await onSave(customerData);
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      // Error handling is done in parent component
    }
  };

  // Updated options based on your screenshots
  const leadSourceOptions = [
    'Website',
    'Social Media',
    'Partnership',
    'Online',
    'Aggregators',
    'Others'
  ];

  const leadStatusOptions = [
    'Hot',
    'Cold',
    'Warm',
    'In Progress'
  ];

  const policyTypeOptions = [
    '2 Wheeler',
    '4 Wheeler',
    'Home Insurance',
    'Health Insurance',
    'Life Insurance'
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="lead_source" className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Source *
                  </label>
                  <select
                    id="lead_source"
                    name="lead_source"
                    value={formData.lead_source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select lead source</option>
                    {leadSourceOptions.map(source => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="policy_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Type *
                  </label>
                  <select
                    id="policy_type"
                    name="policy_type"
                    value={formData.policy_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select policy type</option>
                    {policyTypeOptions.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lead_status" className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Status
                  </label>
                  <select
                    id="lead_status"
                    name="lead_status"
                    value={formData.lead_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    {leadStatusOptions.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InsuranceCustomers;