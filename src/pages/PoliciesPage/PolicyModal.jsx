// src/pages/PoliciesPage/PolicyModal.jsx
import React from 'react';

const PolicyModal = ({ policy, isOpen, onClose }) => {
  if (!isOpen || !policy) return null;

  // Function to format status display
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return { text: 'Active', class: 'bg-green-100 text-green-700 border border-green-200' };
      case 'draft':
        return { text: 'Draft', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' };
      case 'pending':
        return { text: 'Pending', class: 'bg-blue-100 text-blue-700 border border-blue-200' };
      case 'expired':
        return { text: 'Expired', class: 'bg-red-100 text-red-700 border border-red-200' };
      default:
        return { text: status, class: 'bg-gray-100 text-gray-700 border border-gray-200' };
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  // Function to get premium info
  const getPremiumInfo = (policy) => {
    if (policy.policy_info?.totalPremium) {
      return `₹${policy.policy_info.totalPremium}`;
    }
    if (policy.insurance_quote?.premium) {
      return `₹${policy.insurance_quote.premium}`;
    }
    return 'N/A';
  };

  // Enhanced function to get insurance quotes from all possible fields
  const getInsuranceQuotes = () => {
    console.log("🔍 Checking insurance quotes in policy:", policy);
    
    // Check all possible fields where quotes might be stored
    const possibleQuoteFields = [
      'quotes', // Most likely field name
      'insurance_quotes',
      'insuranceQuotes', 
      'insurance_quote',
      'quoteDetails',
      'quote_data'
    ];

    for (const field of possibleQuoteFields) {
      if (policy[field]) {
        console.log(`✅ Found quotes in '${field}':`, policy[field]);
        
        // Handle array format
        if (Array.isArray(policy[field])) {
          return policy[field];
        }
        // Handle object format (single quote)
        else if (typeof policy[field] === 'object') {
          return [policy[field]]; // Convert to array for consistent handling
        }
        // Handle string that might be JSON
        else if (typeof policy[field] === 'string') {
          try {
            const parsed = JSON.parse(policy[field]);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If it's not JSON, skip
            continue;
          }
        }
      }
    }

    // Check nested fields
    if (policy.policy_info?.quotes && Array.isArray(policy.policy_info.quotes)) {
      console.log("✅ Found quotes in 'policy_info.quotes':", policy.policy_info.quotes);
      return policy.policy_info.quotes;
    }

    if (policy.vehicle_details?.quotes && Array.isArray(policy.vehicle_details.quotes)) {
      console.log("✅ Found quotes in 'vehicle_details.quotes':", policy.vehicle_details.quotes);
      return policy.vehicle_details.quotes;
    }

    console.log("❌ No insurance quotes found in any field");
    console.log("📋 Available policy fields:", Object.keys(policy));
    if (policy.policy_info) console.log("📋 Policy info fields:", Object.keys(policy.policy_info));
    if (policy.vehicle_details) console.log("📋 Vehicle details fields:", Object.keys(policy.vehicle_details));
    
    return [];
  };

  // Function to extract insurer name from quote
  const getInsurerName = (quote) => {
    // Check all possible fields for insurer name
    const possibleInsurerFields = [
      'insuranceCompany',
      'insurer',
      'quoteInsurer', 
      'company',
      'insurance_company',
      'provider',
      'insurerName'
    ];

    for (const field of possibleInsurerFields) {
      if (quote[field]) {
        return quote[field];
      }
    }

    // If no specific insurer field, check for company info
    if (quote.companyInfo?.name) {
      return quote.companyInfo.name;
    }

    return 'Unknown Insurer';
  };

  // Function to extract IDV from quote
  const getIDV = (quote) => {
    const possibleIDVFields = ['idv', 'IDV', 'insuredValue', 'sum_insured'];
    for (const field of possibleIDVFields) {
      if (quote[field]) {
        return parseInt(quote[field]) || 0;
      }
    }
    return 0;
  };

  // Function to extract premium from quote
  const getPremium = (quote) => {
    const possiblePremiumFields = [
      'premium', 
      'totalPremium',
      'finalPremium',
      'amount',
      'premiumAmount'
    ];
    
    for (const field of possiblePremiumFields) {
      if (quote[field]) {
        return parseInt(quote[field]) || 0;
      }
    }
    return 0;
  };

  // Function to extract coverage type from quote
  const getCoverageType = (quote) => {
    const possibleCoverageFields = ['coverageType', 'coverage_type', 'type', 'policyType'];
    for (const field of possibleCoverageFields) {
      if (quote[field]) {
        return quote[field];
      }
    }
    return 'Comprehensive';
  };

  // Function to extract policy duration from quote
  const getDuration = (quote) => {
    const possibleDurationFields = ['duration', 'policyDuration', 'term', 'policy_term'];
    for (const field of possibleDurationFields) {
      if (quote[field]) {
        return quote[field];
      }
    }
    return '1';
  };

  // Function to extract NCB from quote
  const getNCB = (quote) => {
    const possibleNCBFields = ['ncb', 'ncbDiscount', 'ncb_percentage'];
    for (const field of possibleNCBFields) {
      if (quote[field]) {
        return quote[field];
      }
    }
    return '0';
  };

  const insuranceQuotes = getInsuranceQuotes();
  const hasMultipleQuotes = insuranceQuotes.length > 1;

  console.log("📊 Final processed insurance quotes:", insuranceQuotes);
  console.log("📊 Has multiple quotes:", hasMultipleQuotes);

  // Get dates conditionally
  const createdDate = formatDate(policy.createdAt);
  const startDate = formatDate(policy.policy_info?.startDate);
  const expiryDate = formatDate(policy.policy_info?.dueDate);

  const statusDisplay = getStatusDisplay(policy.status);

  return (
    <div className="fixed inset-0 bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-auto max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-3 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Policy Details</h2>
                <p className="text-gray-600 mt-1">Complete policy information and documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusDisplay.class}`}>
                {statusDisplay.text}
              </span>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <span className="text-2xl font-light">×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-w-[800px]">
            
            {/* Left Sidebar - Premium Amount & Quick Overview */}
            <div className="xl:col-span-3 space-y-6">
              {/* Premium Highlight Card */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="text-sm font-medium opacity-90">Premium Amount</div>
                <div className="text-3xl font-bold mt-2">{getPremiumInfo(policy)}</div>
                <div className="text-xs opacity-80 mt-1">Total Policy Value</div>
              </div>

              {/* Status & Dates Card */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Quick Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                    <div className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold inline-block ${statusDisplay.class}`}>
                      {statusDisplay.text}
                    </div>
                  </div>
                  
                  {(createdDate || startDate || expiryDate) && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      {createdDate && (
                        <div>
                          <div className="text-xs text-gray-500">Created</div>
                          <div className="text-sm font-medium text-gray-900">{createdDate}</div>
                        </div>
                      )}
                      {startDate && (
                        <div>
                          <div className="text-xs text-gray-500">Start Date</div>
                          <div className="text-sm font-medium text-green-600">{startDate}</div>
                        </div>
                      )}
                      {expiryDate && (
                        <div>
                          <div className="text-xs text-gray-500">Expiry Date</div>
                          <div className="text-sm font-medium text-orange-600">{expiryDate}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Customer Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Full Name</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{policy.customer_details?.name || 'N/A'}</div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Mobile</div>
                      <div className="text-base text-gray-900 mt-1">{policy.customer_details?.mobile || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
                      <div className="text-sm text-gray-900 mt-1 break-all">{policy.customer_details?.email || 'N/A'}</div>
                    </div>
                  </div>
                  {policy.customer_details?.residenceAddress && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Address</div>
                      <div className="text-sm text-gray-700 mt-1 leading-relaxed">
                        {policy.customer_details.residenceAddress}
                        {policy.customer_details?.pincode && ` - ${policy.customer_details.pincode}`}
                        {policy.customer_details?.city && `, ${policy.customer_details.city}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - Only Policy Details */}
            <div className="xl:col-span-5">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm h-full">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Policy Details
                </h3>
                <div className="space-y-4">
                  {/* Basic Policy Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Policy ID</div>
                      <div className="font-mono text-sm text-gray-900 mt-1">{policy._id || policy.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Policy Type</div>
                      <div className="text-sm font-medium text-gray-900 mt-1 capitalize">
                        {policy.insurance_quote?.coverageType || policy.insurance_category || 'Insurance'}
                      </div>
                    </div>
                  </div>

                  {/* Policy Information Details */}
                  <div className="space-y-3">
                    {policy.policy_info && Object.entries(policy.policy_info).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-600 font-medium capitalize flex-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-medium text-gray-900 text-right flex-1 ml-4 break-words">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                    {(!policy.policy_info || Object.keys(policy.policy_info).length === 0) && (
                      <p className="text-gray-400 text-sm text-center py-4">No policy details available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Vehicle Info & Quote Details */}
            <div className="xl:col-span-4 space-y-6">
              {/* Vehicle Information */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Vehicle Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Make & Model</div>
                    <div className="text-base font-semibold text-gray-900 mt-1">
                      {policy.vehicle_details ? 
                        `${policy.vehicle_details.make || ''} ${policy.vehicle_details.model || ''}`.trim() 
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div className="space-y-3">
                    {policy.vehicle_details?.variant && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Variant</div>
                        <div className="text-sm text-gray-900 mt-1">{policy.vehicle_details.variant}</div>
                      </div>
                    )}
                    {policy.vehicle_details?.makeYear && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Year</div>
                        <div className="text-sm text-gray-900 mt-1">{policy.vehicle_details.makeYear}</div>
                      </div>
                    )}
                  </div>
                  {policy.vehicle_details?.engineNo && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Engine No.</div>
                      <div className="font-mono text-sm text-gray-900 mt-1">{policy.vehicle_details.engineNo}</div>
                    </div>
                  )}
                  {policy.vehicle_details?.chassisNo && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Chassis No.</div>
                      <div className="font-mono text-sm text-gray-900 mt-1">{policy.vehicle_details.chassisNo}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Quotes - UPDATED SECTION */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    Insurance Quotes
                    {hasMultipleQuotes && (
                      <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full">
                        {insuranceQuotes.length} quotes
                      </span>
                    )}
                  </h3>
                </div>

                {insuranceQuotes.length > 0 ? (
                  <div className="space-y-4">
                    {hasMultipleQuotes ? (
                      // Table view for multiple quotes
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Insurer</th>
                              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">IDV</th>
                              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Premium</th>
                              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Type</th>
                              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase">NCB</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {insuranceQuotes.map((quote, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-2 px-2">
                                  <div className="font-medium text-gray-900 text-xs">
                                    {getInsurerName(quote)}
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  <div className="text-gray-700 text-xs">
                                    ₹{getIDV(quote).toLocaleString('en-IN')}
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  <div className="text-gray-700 text-xs">
                                    ₹{getPremium(quote).toLocaleString('en-IN')}
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  <div className="text-gray-700 text-xs capitalize">
                                    {getCoverageType(quote)}
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  <div className="text-gray-700 text-xs">
                                    {getNCB(quote)}%
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      // Detailed view for single quote
                      <div className="space-y-3">
                        {insuranceQuotes.map((quote, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Insurer:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {getInsurerName(quote)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">IDV Amount:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{getIDV(quote).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Premium:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{getPremium(quote).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Coverage Type:</span>
                              <span className="text-sm font-semibold text-gray-900 capitalize">
                                {getCoverageType(quote)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Policy Duration:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {getDuration(quote)} year(s)
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">NCB Discount:</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {getNCB(quote)}%
                              </span>
                            </div>
                            {/* Additional quote details */}
                            {quote.zone && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Zone:</span>
                                <span className="text-sm font-semibold text-gray-900">{quote.zone}</span>
                              </div>
                            )}
                            {quote.odDiscount && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">OD Discount:</span>
                                <span className="text-sm font-semibold text-gray-900">{quote.odDiscount}%</span>
                              </div>
                            )}
                            {quote.electricalAccessories && quote.electricalAccessories !== "0" && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Electrical Accessories:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{(parseInt(quote.electricalAccessories) || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">No insurance quotes available</p>
                    <p className="text-gray-400 text-xs mt-1">Quotes will appear here when added</p>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              {policy.notes && (
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Additional Notes
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {policy.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Policy Type: {policy.insurance_quote?.coverageType || policy.insurance_category || 'Insurance'}
              {hasMultipleQuotes && ` • ${insuranceQuotes.length} quotes available`}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
            >
              Close Policy Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;