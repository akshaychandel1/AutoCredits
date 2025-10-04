// src/pages/PoliciesPage/PoliciesPage.jsx
import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiFilter, FiDownload, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import PolicyTable from "./PolicyTable";
import PolicyModal from "./PolicyModal";

const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1";

const PoliciesPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching policies from API...");
      
      const response = await axios.get(`${API_BASE_URL}/policies`);
      console.log("API Response:", response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setPolicies(response.data.data);
      } else {
        setError("Invalid response format from server");
        setPolicies([]);
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
      setError(`Failed to load policies: ${err.message}`);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Filter policies based on search and filters
  const filteredPolicies = policies.filter((policy) => {
    const customerName = policy.customer_details?.name || '';
    const vehicleMake = policy.vehicle_details?.make || '';
    const vehicleModel = policy.vehicle_details?.model || '';
    const policyId = policy._id || '';
    const policyType = policy.insurance_quote?.coverageType || policy.insurance_category || '';

    // Handle active filter (includes both 'active' and 'completed' statuses)
    if (statusFilter === 'active') {
      const isActivePolicy = policy.status === 'active' || policy.status === 'completed';
      if (!isActivePolicy) return false;
    } else if (statusFilter && policy.status !== statusFilter) {
      return false;
    }

    return (
      (typeFilter ? policyType.toLowerCase().includes(typeFilter.toLowerCase()) : true) &&
      (search
        ? customerName.toLowerCase().includes(search.toLowerCase()) ||
          policyId.toLowerCase().includes(search.toLowerCase()) ||
          vehicleMake.toLowerCase().includes(search.toLowerCase()) ||
          vehicleModel.toLowerCase().includes(search.toLowerCase())
        : true)
    );
  });

  // Handle View Policy - Now opens modal instead of alert
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  // Handle Delete Policy
  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await axios.delete(`${API_BASE_URL}/policies/${policyId}`);
        setPolicies(policies.filter((p) => p._id !== policyId));
        
        // If the deleted policy was currently being viewed, close the modal
        if (selectedPolicy && (selectedPolicy._id === policyId || selectedPolicy.id === policyId)) {
          handleCloseModal();
        }
      } catch (err) {
        console.error("Error deleting policy:", err);
        alert("Failed to delete policy. Please try again.");
      }
    }
  };

  // Refresh policies
  const handleRefresh = () => {
    fetchPolicies();
  };

  // Export policies to CSV
  const handleExport = () => {
    if (filteredPolicies.length === 0) {
      alert("No data to export!");
      return;
    }

    try {
      // Prepare data for CSV
      const exportData = filteredPolicies.map(policy => ({
        'Policy ID': policy._id || 'N/A',
        'Customer Name': policy.customer_details?.name || 'N/A',
        'Customer Mobile': policy.customer_details?.mobile || 'N/A',
        'Customer Email': policy.customer_details?.email || 'N/A',
        'Vehicle Make': policy.vehicle_details?.make || 'N/A',
        'Vehicle Model': policy.vehicle_details?.model || 'N/A',
        'Vehicle Variant': policy.vehicle_details?.variant || 'N/A',
        'Make Year': policy.vehicle_details?.makeYear || 'N/A',
        'Policy Type': policy.insurance_quote?.coverageType || policy.insurance_category || 'N/A',
        'Premium': policy.policy_info?.totalPremium || policy.insurance_quote?.premium || 'N/A',
        'Status': policy.status || 'N/A',
        'Expiry Date': policy.policy_info?.dueDate ? new Date(policy.policy_info.dueDate).toLocaleDateString('en-IN') : 'N/A',
        'Created Date': policy.ts ? new Date(policy.ts).toLocaleDateString('en-IN') : 'N/A'
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','), // header row
        ...exportData.map(row => 
          headers.map(header => {
            // Escape quotes and wrap in quotes if contains comma
            const value = String(row[header] || '');
            return `"${value.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `policies_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert(`Successfully exported ${filteredPolicies.length} policies to CSV!`);
      
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  // Get unique statuses for filter (excluding 'completed' since it's handled with 'active')
  const uniqueStatuses = [...new Set(policies.map(p => p.status).filter(Boolean))].filter(
    status => status !== 'completed' // Hide 'completed' from dropdown since it's included in 'active'
  );

  // Get unique types for filter
  const uniqueTypes = [...new Set(policies.map(p => 
    p.insurance_quote?.coverageType || p.insurance_category
  ).filter(Boolean))];

  // Get stats for dashboard
  const getStats = () => {
    const total = policies.length;
    const active = policies.filter(p => p.status === 'active' || p.status === 'completed').length;
    const draft = policies.filter(p => p.status === 'draft').length;
    const pending = policies.filter(p => p.status === 'pending').length;
    const expired = policies.filter(p => p.status === 'expired').length;
    
    return { total, active, draft, pending, expired };
  };

  const stats = getStats();

  // Handle stat card click to filter
  const handleStatClick = (filterType) => {
    setStatusFilter(filterType);
    // Also clear any existing search to make the filter more obvious
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

  // Get active filter display text
  const getActiveFilterText = () => {
    if (statusFilter === 'active') return 'Active/Completed';
    return statusFilter;
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Insurance Policies
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? "Loading..." : `Showing ${filteredPolicies.length} of ${policies.length} policies`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={loading || filteredPolicies.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload />
            Export CSV
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link to="/new-policy">
            <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg shadow-md transition">
              <FiPlus className="text-lg" /> New Policy
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Overview - Now Clickable */}
      {!loading && policies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {/* Total Policies Card */}
          <button
            onClick={() => handleStatClick('')}
            className={`bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${
              !statusFilter 
                ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>Total Policies</span>
              {!statusFilter && (
                <span className="text-blue-600 text-xs">● Active Filter</span>
              )}
            </div>
          </button>

          {/* Active Policies Card */}
          <button
            onClick={() => handleStatClick('active')}
            className={`bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${
              statusFilter === 'active' 
                ? 'border-green-300 ring-2 ring-green-100 bg-green-50' 
                : 'border-green-200 hover:border-green-300'
            }`}
          >
            <div className={`text-2xl font-bold ${
              statusFilter === 'active' ? 'text-green-800' : 'text-green-700'
            }`}>
              {stats.active}
            </div>
            <div className="text-sm flex items-center justify-between">
              <span className={statusFilter === 'active' ? 'text-green-700' : 'text-green-600'}>
                Active
              </span>
              {statusFilter === 'active' && (
                <span className="text-green-600 text-xs">● Active Filter</span>
              )}
            </div>
          </button>

          {/* Draft Policies Card */}
          <button
            onClick={() => handleStatClick('draft')}
            className={`bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${
              statusFilter === 'draft' 
                ? 'border-yellow-300 ring-2 ring-yellow-100 bg-yellow-50' 
                : 'border-yellow-200 hover:border-yellow-300'
            }`}
          >
            <div className={`text-2xl font-bold ${
              statusFilter === 'draft' ? 'text-yellow-800' : 'text-yellow-700'
            }`}>
              {stats.draft}
            </div>
            <div className="text-sm flex items-center justify-between">
              <span className={statusFilter === 'draft' ? 'text-yellow-700' : 'text-yellow-600'}>
                Draft
              </span>
              {statusFilter === 'draft' && (
                <span className="text-yellow-600 text-xs">● Active Filter</span>
              )}
            </div>
          </button>

          {/* Pending Policies Card */}
          <button
            onClick={() => handleStatClick('pending')}
            className={`bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${
              statusFilter === 'pending' 
                ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50' 
                : 'border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className={`text-2xl font-bold ${
              statusFilter === 'pending' ? 'text-blue-800' : 'text-blue-700'
            }`}>
              {stats.pending}
            </div>
            <div className="text-sm flex items-center justify-between">
              <span className={statusFilter === 'pending' ? 'text-blue-700' : 'text-blue-600'}>
                Pending
              </span>
              {statusFilter === 'pending' && (
                <span className="text-blue-600 text-xs">● Active Filter</span>
              )}
            </div>
          </button>

          {/* Expired Policies Card */}
          {stats.expired > 0 && (
            <button
              onClick={() => handleStatClick('expired')}
              className={`bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${
                statusFilter === 'expired' 
                  ? 'border-red-300 ring-2 ring-red-100 bg-red-50' 
                  : 'border-red-200 hover:border-red-300'
              }`}
            >
              <div className={`text-2xl font-bold ${
                statusFilter === 'expired' ? 'text-red-800' : 'text-red-700'
              }`}>
                {stats.expired}
              </div>
              <div className="text-sm flex items-center justify-between">
                <span className={statusFilter === 'expired' ? 'text-red-700' : 'text-red-600'}>
                  Expired
                </span>
                {statusFilter === 'expired' && (
                  <span className="text-red-600 text-xs">● Active Filter</span>
                )}
              </div>
            </button>
          )}
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
              onClick={fetchPolicies}
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
            <FiSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, policy ID, or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm min-w-[140px]"
            >
              <option value="">All Status</option>
              <option value="active">Active/Completed</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
                Status: {getActiveFilterText()}
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

      {/* Policy Table */}
      <PolicyTable 
        policies={filteredPolicies}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Policy Modal */}
      <PolicyModal
        policy={selectedPolicy}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PoliciesPage;