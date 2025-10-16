// src/pages/PoliciesPage/PoliciesPage.jsx
import { useState, useEffect } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
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
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link to="/new-policy">
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow-md transition">
              <FiPlus className="text-lg" /> New Policy
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Overview - Beautiful Cards */}
      {!loading && policies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Policy Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Policies Card */}
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
                <h3 className="text-lg font-bold text-gray-800 mb-1">Total Policies</h3>
                <p className="text-sm text-blue-600 font-medium">
                  {!statusFilter ? 'Viewing all policies' : 'Click to view all'}
                </p>
              </button>

              {/* Active Policies Card */}
              <button
                onClick={() => handleStatClick('active')}
                className={`bg-gradient-to-br from-green-50 to-green-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                  statusFilter === 'active' 
                    ? 'border-green-300 ring-4 ring-green-100' 
                    : 'border-green-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{stats.active}</span>
                  </div>
                  {statusFilter === 'active' && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Active Policies</h3>
                <p className="text-sm text-green-600 font-medium">
                  {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}% of total` : 'No policies'}
                </p>
              </button>

              {/* Draft Policies Card */}
              <button
                onClick={() => handleStatClick('draft')}
                className={`bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                  statusFilter === 'draft' 
                    ? 'border-yellow-300 ring-4 ring-yellow-100' 
                    : 'border-yellow-200 hover:border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{stats.draft}</span>
                  </div>
                  {statusFilter === 'draft' && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Draft Policies</h3>
                <p className="text-sm text-yellow-600 font-medium">
                  {stats.total > 0 ? `${((stats.draft / stats.total) * 100).toFixed(1)}% of total` : 'No policies'}
                </p>
              </button>

              {/* Pending Policies Card */}
              <button
                onClick={() => handleStatClick('pending')}
                className={`bg-gradient-to-br from-purple-50 to-purple-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                  statusFilter === 'pending' 
                    ? 'border-purple-300 ring-4 ring-purple-100' 
                    : 'border-purple-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{stats.pending}</span>
                  </div>
                  {statusFilter === 'pending' && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Pending Policies</h3>
                <p className="text-sm text-purple-600 font-medium">
                  {stats.total > 0 ? `${((stats.pending / stats.total) * 100).toFixed(1)}% of total` : 'No policies'}
                </p>
              </button>
            </div>

            {/* Expired Policies Card - Full width if exists */}
            {stats.expired > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => handleStatClick('expired')}
                  className={`bg-gradient-to-br from-red-50 to-red-100 border-2 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 text-left w-full ${
                    statusFilter === 'expired' 
                      ? 'border-red-300 ring-4 ring-red-100' 
                      : 'border-red-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{stats.expired}</span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Expired Policies</h3>
                        <p className="text-sm text-red-600 font-medium">
                          {stats.total > 0 ? `${((stats.expired / stats.total) * 100).toFixed(1)}% of total` : 'No policies'}
                        </p>
                      </div>
                    </div>
                    {statusFilter === 'expired' && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ACTIVE FILTER
                      </span>
                    )}
                  </div>
                </button>
              </div>
            )}
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
            <input
              type="text"
              placeholder="Search by customer name, policy ID, or vehicle..."
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