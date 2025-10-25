// Customer Details Modal Component
const CustomerDetailsModal = ({ customer, onClose, onEdit }) => {
  const isCorporate = customer.buyer_type === 'corporate';

  // Format date function
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

  // Format phone number for better readability
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if the number is Indian (starts with +91 or 91 or just 10 digits)
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    
    return phone;
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'New': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Converted': 'bg-purple-100 text-purple-800 border-purple-200',
      'Hot': 'bg-red-100 text-red-800 border-red-200',
      'Warm': 'bg-orange-100 text-orange-800 border-orange-200',
      'Cold': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get policy type badge color
  const getPolicyBadge = (policyType) => {
    const policyConfig = {
      '4 Wheeler': 'bg-blue-100 text-blue-800 border-blue-200',
      '2 Wheeler': 'bg-green-100 text-green-800 border-green-200',
      'Home Insurance': 'bg-purple-100 text-purple-800 border-purple-200',
      'Health Insurance': 'bg-pink-100 text-pink-800 border-pink-200',
      'Life Insurance': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return policyConfig[policyType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isCorporate ? 'bg-orange-100' : 'bg-purple-100'
            }`}>
              {isCorporate ? (
                <Building className="text-orange-600 w-6 h-6" />
              ) : (
                <User className="text-purple-600 w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isCorporate ? customer.company_name : `${customer.first_name} ${customer.last_name}`}
              </h2>
              <p className="text-gray-600 text-sm">
                {isCorporate ? 'Corporate Customer' : 'Individual Customer'} • ID: {customer._id?.slice(-8)}
              </p>
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Personal/Business Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-gray-600" />
              {isCorporate ? 'Business Information' : 'Personal Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isCorporate ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-gray-900 font-medium text-lg">{customer.company_name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="text-gray-900 font-medium">{customer.contact_person_name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <p className="text-gray-900">{customer.designation || 'N/A'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="text-gray-900 font-medium text-lg">{customer.first_name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="text-gray-900 font-medium">{customer.last_name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{customer.gender || 'N/A'}</p>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Customer Type</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  isCorporate 
                    ? 'bg-orange-100 text-orange-800 border-orange-200' 
                    : 'bg-purple-100 text-purple-800 border-purple-200'
                }`}>
                  {isCorporate ? 'Corporate' : 'Individual'}
                </span>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="text-gray-900">{customer.dob ? formatDate(customer.dob) : 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                <p className="text-gray-900 font-mono">{customer.pan_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a 
                    href={`mailto:${customer.email}`} 
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {customer.email || 'N/A'}
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a 
                    href={`tel:${customer.phone}`} 
                    className="text-gray-900 font-medium hover:text-blue-600"
                  >
                    {formatPhoneNumber(customer.phone)}
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
                <p className="text-gray-900">{formatPhoneNumber(customer.alternate_phone) || 'N/A'}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-900">{customer.address || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <p className="text-gray-900">{customer.city || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">State</label>
                <p className="text-gray-900">{customer.state || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <p className="text-gray-900">{customer.pincode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Policy & Business Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Policy & Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Policy Type</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPolicyBadge(customer.policy_type)}`}>
                  {customer.policy_type || 'N/A'}
                </span>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Lead Source</label>
                <p className="text-gray-900">{customer.lead_source || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Lead Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(customer.lead_status)}`}>
                  {customer.lead_status || 'N/A'}
                </span>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Annual Income</label>
                <p className="text-gray-900">
                  {customer.annual_income ? `₹${parseInt(customer.annual_income).toLocaleString('en-IN')}` : 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Occupation</label>
                <p className="text-gray-900">{customer.occupation || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Education</label>
                <p className="text-gray-900">{customer.education || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                <p className="text-gray-900 font-mono text-sm bg-white px-3 py-2 rounded border">{customer._id || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="text-gray-900">{formatDate(customer.created_at || customer.ts)}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900">{formatDate(customer.updated_at) || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Created By</label>
                <p className="text-gray-900">{customer.created_by || 'System'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                <p className="text-gray-900">{customer.assigned_to || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-gray-900">{customer.notes || 'No notes available'}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(customer.preferences || customer.referral_source || customer.marketing_consent) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gray-600" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customer.preferences && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Preferences</label>
                    <p className="text-gray-900">{customer.preferences}</p>
                  </div>
                )}
                {customer.referral_source && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Referral Source</label>
                    <p className="text-gray-900">{customer.referral_source}</p>
                  </div>
                )}
                {customer.marketing_consent && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Marketing Consent</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      customer.marketing_consent === 'Yes' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {customer.marketing_consent}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Last viewed: {formatDate(new Date().toISOString())}
          </div>
          <div className="flex gap-3">
            <button 
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              onClick={onClose}
            >
              Close
            </button>
            <button 
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4" />
              Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};