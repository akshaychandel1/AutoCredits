import React from 'react';
import { 
  Building, 
  User, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  IdCard, 
  FileText, 
  Briefcase, 
  UserCheck,
  CreditCard 
} from 'lucide-react';

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
    const cleaned = phone.replace(/\D/g, '');
    
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
      'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Open': 'bg-blue-100 text-blue-800 border-blue-200'
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
      'Life Insurance': 'bg-red-100 text-red-800 border-red-200',
      'Vehicle': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    
    return policyConfig[policyType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get credit type display
  const getCreditTypeInfo = (creditType, brokerName = '') => {
    const types = {
      auto: { label: 'Autocredits India LLP', color: 'bg-blue-100 text-blue-800' },
      broker: { label: `Broker${brokerName ? ` - ${brokerName}` : ''}`, color: 'bg-purple-100 text-purple-800' },
      showroom: { label: 'Showroom', color: 'bg-orange-100 text-orange-800' },
      customer: { label: 'Customer', color: 'bg-green-100 text-green-800' }
    };
    
    return types[creditType] || { label: creditType, color: 'bg-gray-100 text-gray-800' };
  };

  const creditTypeInfo = getCreditTypeInfo(customer.creditType, customer.brokerName);

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
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
                {isCorporate ? customer.companyName || customer.company_name : `${customer.first_name} ${customer.last_name}`}
              </h2>
              <p className="text-gray-600 text-sm">
                {isCorporate ? 'Corporate Customer' : 'Individual Customer'} • ID: {customer._id?.slice(-8)}
                {customer.company_code && ` • Company Code: ${customer.company_code}`}
                {customer.contact_code && ` • Contact Code: ${customer.contact_code}`}
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

        <div className="p-6 space-y-6">
          {/* Customer Information Grid - Similar to PolicyTable */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <IdCard className="w-5 h-5 text-gray-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                {isCorporate ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Company Name</span>
                      <span className="text-sm font-semibold text-gray-900">{customer.companyName || customer.company_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Contact Person</span>
                      <span className="text-sm font-semibold text-gray-900">{customer.contactPersonName || customer.contact_person_name || 'N/A'}</span>
                    </div>
                    {customer.designation && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Designation</span>
                        <span className="text-sm text-gray-900">{customer.designation}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">First Name</span>
                      <span className="text-sm font-semibold text-gray-900">{customer.first_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Last Name</span>
                      <span className="text-sm font-semibold text-gray-900">{customer.last_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Gender</span>
                      <span className="text-sm text-gray-900 capitalize">{customer.gender || 'N/A'}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Customer Type</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${isCorporate ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                    {isCorporate ? 'Corporate' : 'Individual'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Credit Type</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${creditTypeInfo.color}`}>
                    {creditTypeInfo.label}
                  </span>
                </div>

                {customer.employeeName && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Employee Name</span>
                    <span className="text-sm text-gray-900">{customer.employeeName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Mobile</span>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`tel:${customer.mobile || customer.phone}`} 
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {formatPhoneNumber(customer.mobile || customer.phone)}
                    </a>
                  </div>
                </div>

                {customer.alternatePhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Alternate Phone</span>
                    <span className="text-sm text-gray-900">{formatPhoneNumber(customer.alternatePhone)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Email</span>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`mailto:${customer.email}`} 
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate max-w-[200px]"
                    >
                      {customer.email || 'N/A'}
                    </a>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Address</span>
                  <div className="flex items-start gap-2 max-w-[200px] text-right">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-900">{customer.address || customer.residenceAddress || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">City</span>
                  <span className="text-sm text-gray-900">{customer.city || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Pincode</span>
                  <span className="text-sm text-gray-900">{customer.pincode || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Business & Policy Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Business & Policy Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Policy Type</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPolicyBadge(customer.policy_type)}`}>
                    {customer.policy_type || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Lead Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(customer.lead_status)}`}>
                    {customer.lead_status || 'N/A'}
                  </span>
                </div>

                {customer.lead_source && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Lead Source</span>
                    <span className="text-sm text-gray-900">{customer.lead_source}</span>
                  </div>
                )}

                {customer.sourceOrigin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Source Origin</span>
                    <span className="text-sm text-gray-900">{customer.sourceOrigin}</span>
                  </div>
                )}

                {customer.panNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">PAN Number</span>
                    <span className="text-sm font-mono text-gray-900">{customer.panNumber}</span>
                  </div>
                )}

                {customer.aadhaarNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Aadhaar Number</span>
                    <span className="text-sm font-mono text-gray-900">{customer.aadhaarNumber}</span>
                  </div>
                )}

                {customer.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">GST Number</span>
                    <span className="text-sm font-mono text-gray-900">{customer.gstNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                System Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Customer ID</span>
                  <span className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border">{customer._id || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm text-gray-900">{formatDate(customer.created_at || customer.ts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">{formatDate(customer.updated_at) || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-gray-900">{customer.created_by || 'System'}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(customer.notes || customer.referenceName || customer.referencePhone) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                  Additional Information
                </h3>
                <div className="space-y-3">
                  {customer.notes && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Notes</span>
                      <span className="text-sm text-gray-900 text-right max-w-[200px]">{customer.notes}</span>
                    </div>
                  )}
                  {customer.referenceName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Reference Name</span>
                      <span className="text-sm text-gray-900">{customer.referenceName}</span>
                    </div>
                  )}
                  {customer.referencePhone && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Reference Phone</span>
                      <span className="text-sm text-gray-900">{formatPhoneNumber(customer.referencePhone)}</span>
                    </div>
                  )}
                  {customer.nomineeName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Nominee Name</span>
                      <span className="text-sm text-gray-900">{customer.nomineeName}</span>
                    </div>
                  )}
                  {customer.relation && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Nominee Relation</span>
                      <span className="text-sm text-gray-900">{customer.relation}</span>
                    </div>
                  )}
                  {customer.nomineeAge && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Nominee Age</span>
                      <span className="text-sm text-gray-900">{customer.nomineeAge}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Customer Type</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">
                    {isCorporate ? 'Corporate' : 'Individual'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCorporate ? 'bg-orange-100' : 'bg-purple-100'
                }`}>
                  {isCorporate ? (
                    <Building className="text-orange-600 w-5 h-5" />
                  ) : (
                    <User className="text-purple-600 w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Contact Status</p>
                  <p className="text-lg font-bold text-green-900 mt-1">
                    {customer.lead_status || 'Open'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="text-green-600 w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Policy Type</p>
                  <p className="text-lg font-bold text-purple-900 mt-1">
                    {customer.policy_type || 'Vehicle'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="text-purple-600 w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Credit Type</p>
                  <p className="text-lg font-bold text-orange-900 mt-1">
                    {creditTypeInfo.label.split(' ')[0]}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <CreditCard className="text-orange-600 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
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

export default CustomerDetailsModal;