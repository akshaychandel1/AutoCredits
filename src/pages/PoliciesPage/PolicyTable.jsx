// src/pages/PoliciesPage/PolicyTable.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyModal from './PolicyModal';

const PolicyTable = ({ policies, loading, onView, onDelete }) => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Filter policies by status
  const filteredPolicies = useMemo(() => {
    if (statusFilter === 'all') return policies;
    return policies.filter(policy => policy.status === statusFilter);
  }, [policies, statusFilter]);

  // Paginate policies
  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);

  // Function to handle view click
  const handleViewClick = (policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
    if (onView) {
      onView(policy);
    }
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
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        // Call the onDelete prop to update the parent component
        if (onDelete) {
          onDelete(policyId);
        }
        // Close the confirmation modal
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
        class: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      },
      completed: { 
        text: 'Active', 
        class: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      },
      draft: { 
        text: 'Draft', 
        class: 'bg-amber-50 text-amber-700 border border-amber-200'
      },
      pending: { 
        text: 'Pending', 
        class: 'bg-blue-50 text-blue-700 border border-blue-200'
      },
      expired: { 
        text: 'Expired', 
        class: 'bg-rose-50 text-rose-700 border border-rose-200'
      }
    };

    return statusConfig[status] || { 
      text: status, 
      class: 'bg-gray-50 text-gray-700 border border-gray-200'
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
      
      const mainInfo = `${make} ${model}`.trim();
      return {
        main: mainInfo || 'No Vehicle Info',
        variant: variant
      };
    }
    return {
      main: 'No Vehicle',
      variant: ''
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
      return policy.insurance_quote.coverageType;
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

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-3 text-gray-600 text-sm">Loading policies...</p>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
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
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Policy ID
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPolicies.map((policy) => {
                const statusDisplay = getStatusDisplay(policy.status);
                const customerName = policy.customer_details?.name || 'N/A';
                const vehicleInfo = getVehicleInfo(policy);
                const premium = getPremiumInfo(policy);
                const policyType = getPolicyType(policy);
                const expiryDate = getExpiryDate(policy);

                return (
                  <tr
                    key={policy._id || policy.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-600 text-xs font-mono">
                        {policy._id ? policy._id.substring(0, 8) + '...' : policy.id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="font-medium text-gray-900 text-sm">{customerName}</div>
                        <div className="text-xs text-gray-500">
                          {policy.customer_details?.mobile || 'No phone'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="font-medium text-gray-900 text-sm">{vehicleInfo.main}</div>
                        {vehicleInfo.variant && (
                          <div className="text-xs text-gray-500">
                            {vehicleInfo.variant}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 capitalize">
                        {policyType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 text-sm">
                        {premium}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusDisplay.class}`}
                      >
                        {statusDisplay.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">
                        {formatDate(expiryDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewClick(policy)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleEditClick(policy)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(policy)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline"
                        >
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
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredPolicies.length)}
                </span>{' '}
                of <span className="font-medium">{filteredPolicies.length}</span> policies
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
                            ? 'bg-blue-500 text-white'
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
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium text-sm mb-1">No policies match your filters</p>
          <p className="text-gray-500 text-xs mb-4">Try adjusting your filter criteria</p>
          <button
            onClick={() => setStatusFilter('all')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
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
        <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-1 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Policy</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this policy? This action cannot be undone.
            </p>

            {policyToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Policy ID: {policyToDelete._id ? policyToDelete._id.substring(0, 8) + '...' : policyToDelete.id}</div>
                  {policyToDelete.customer_details?.name && (
                    <div>Customer: {policyToDelete.customer_details.name}</div>
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