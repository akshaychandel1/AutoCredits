import React, { useState } from 'react';
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
  CreditCard,
  Calendar,
  UserCircle,
  X,
  Shield,
  CheckCircle,
  Clock,
  Tag,
  Home,
  Smartphone,
  FileSignature,
  Percent,
  History,
  Fingerprint,
  Briefcase as BriefcaseIcon,
  Shield as ShieldIcon,
  PhoneCall
} from 'lucide-react';

const CustomerDetailsModal = ({ customer, onClose, onEdit }) => {
  // Safely get customer data
  const customerData = customer?.customer_details || customer || {};
  
  // Safe value function
  const getSafeValue = (value, fallback = '') => {
    if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') return fallback;
    return String(value).trim();
  };
  
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
      return 'N/A';
    }
  };
  
  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return phone;
  };
  
  // Get display name using the same logic as CustomerTable
  const getCustomerDisplayName = (customerData) => {
    if (!customerData) return 'Unknown Customer';
    
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
  
  // Determine customer type
  const isCorporate = customerData.buyer_type === 'corporate' || getSafeValue(customerData.companyName).length > 0;
  
  // Get status badge color
  const getStatusBadge = (status) => {
    const safeStatus = getSafeValue(status, 'Active');
    const statusConfig = {
      'Active': { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      'New': { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Open': { class: 'bg-blue-100 text-blue-800', icon: Clock },
      'Inactive': { class: 'bg-gray-100 text-gray-800', icon: X },
      'Verified': { class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'Pending': { class: 'bg-orange-100 text-orange-800', icon: Clock },
      'Converted': { class: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    return statusConfig[safeStatus] || { class: 'bg-gray-100 text-gray-800', icon: Clock };
  };
  
  // Get credit type info
  const getCreditTypeInfo = (creditType, brokerName = '') => {
    const types = {
      auto: { 
        label: 'Autocredits', 
        class: 'bg-blue-100 text-blue-800'
      },
      broker: { 
        label: brokerName ? `Broker (${brokerName})` : 'Broker', 
        class: 'bg-purple-100 text-purple-800'
      },
      showroom: { 
        label: 'Showroom', 
        class: 'bg-orange-100 text-orange-800'
      },
      customer: { 
        label: 'Customer', 
        class: 'bg-green-100 text-green-800'
      }
    };
    
    const safeCreditType = getSafeValue(creditType, 'auto');
    return types[safeCreditType] || { 
      label: safeCreditType, 
      class: 'bg-gray-100 text-gray-800'
    };
  };
  
  // Format document numbers
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
  
  // Get all customer details
  const details = {
    // Basic Information
    id: getSafeValue(customer?._id || customer?.id),
    displayName: getCustomerDisplayName(customerData),
    isCorporate,
    
    // Personal Information
    firstName: getSafeValue(customerData.first_name),
    lastName: getSafeValue(customerData.last_name),
    name: getSafeValue(customerData.name),
    gender: getSafeValue(customerData.gender),
    age: customerData.age ? `${customerData.age} yrs` : '',
    
    // Company Information
    companyName: getSafeValue(customerData.companyName),
    contactPersonName: getSafeValue(customerData.contact_person_name),
    employeeName: getSafeValue(customerData.employeeName),
    
    // Contact Information
    email: getSafeValue(customerData.email),
    phone: getSafeValue(customerData.phone),
    mobile: getSafeValue(customerData.mobile),
    alternatePhone: getSafeValue(customerData.alternate_phone),
    
    // Location Information
    address: getSafeValue(customerData.address, getSafeValue(customerData.residenceAddress)),
    city: getSafeValue(customerData.city),
    pincode: getSafeValue(customerData.pincode),
    
    // Document Information
    panNumber: formatDocumentNumber(getSafeValue(customerData.panNumber), 'pan'),
    aadhaarNumber: formatDocumentNumber(getSafeValue(customerData.aadhaarNumber), 'aadhaar'),
    gstNumber: formatDocumentNumber(getSafeValue(customerData.gstNumber), 'gst'),
    originalPan: getSafeValue(customerData.panNumber),
    originalAadhaar: getSafeValue(customerData.aadhaarNumber),
    originalGst: getSafeValue(customerData.gstNumber),
    
    // Business Information
    creditType: getSafeValue(customerData.creditType, customer?.creditType),
    brokerName: getSafeValue(customerData.brokerName, customer?.brokerName),
    sourceOrigin: getSafeValue(customerData.sourceOrigin),
    leadStatus: getSafeValue(customerData.lead_status, getSafeValue(customerData.status, 'Active')),
    policyType: getSafeValue(customerData.policy_type, getSafeValue(customerData.insurance_category)),
    
    // System Information
    createdDate: formatDate(customerData.created_at || customer?.ts || customer?.created_at || customer?.ts),
    updatedDate: formatDate(customerData.updated_at || customer?.updated_at),
    createdBy: getSafeValue(customerData.created_by, customer?.created_by)
  };
  
  // Get status info
  const statusInfo = getStatusBadge(details.leadStatus);
  const StatusIcon = statusInfo.icon;
  
  // Get credit type info
  const creditTypeInfo = getCreditTypeInfo(details.creditType, details.brokerName);
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${details.isCorporate ? 'bg-orange-100' : 'bg-purple-100'}`}>
                  {details.isCorporate ? (
                    <Building className="w-8 h-8 text-orange-600" />
                  ) : (
                    <User className="w-8 h-8 text-purple-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {details.displayName}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500 font-mono">
                      ID: {details.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.class}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {details.leadStatus}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${details.isCorporate ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                      {details.isCorporate ? 'Corporate' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - All information in one tab */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Personal/Company Information Card */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    {details.isCorporate ? (
                      <Building className="w-5 h-5 text-gray-500" />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                    {details.isCorporate ? 'Company Information' : 'Personal Information'}
                  </h3>
                  
                  <div className="space-y-4">
                    {details.isCorporate ? (
                      <>
                        {details.companyName && (
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Company Name:</span>
                            <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">
                              {details.companyName}
                            </span>
                          </div>
                        )}
                        {details.contactPersonName && (
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Contact Person:</span>
                            <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">
                              {details.contactPersonName}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {details.firstName && (
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">First Name:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {details.firstName}
                            </span>
                          </div>
                        )}
                        {details.lastName && (
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Last Name:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {details.lastName}
                            </span>
                          </div>
                        )}
                        {details.name && details.name !== details.displayName && (
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Name Field:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {details.name}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {details.employeeName && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Employee Name:</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">
                          {details.employeeName}
                        </span>
                      </div>
                    )}
                    
                    {(details.age || details.gender) && (
                      <>
                        {details.age && (
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Age:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {details.age}
                            </span>
                          </div>
                        )}
                        {details.gender && (
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Gender:</span>
                            <span className="text-sm font-semibold text-gray-900 capitalize">
                              {details.gender}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-500" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    {details.mobile && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Mobile:</span>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`tel:${details.mobile}`}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {formatPhoneNumber(details.mobile)}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {details.phone && details.phone !== details.mobile && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`tel:${details.phone}`}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {formatPhoneNumber(details.phone)}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {details.alternatePhone && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Alternate Phone:</span>
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPhoneNumber(details.alternatePhone)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {details.email && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`mailto:${details.email}`}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate max-w-[200px]"
                          >
                            {details.email}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {(details.city || details.pincode) && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Location:</span>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900 text-right">
                            {details.city || ''} {details.pincode && `- ${details.pincode}`}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {details.address && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <Home className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-600 block mb-1">Address:</span>
                            <p className="text-sm text-gray-700">{details.address}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Business Information Card */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                    Business Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Credit Type:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${creditTypeInfo.class}`}>
                        {creditTypeInfo.label}
                      </span>
                    </div>
                    
                    {details.brokerName && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Broker Name:</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">
                          {details.brokerName}
                        </span>
                      </div>
                    )}
                    
                    {details.sourceOrigin && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Source Origin:</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">
                          {details.sourceOrigin}
                        </span>
                      </div>
                    )}
                    
                    {/* {details.policyType && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Policy Type:</span>
                        <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px]">
                          {details.policyType}
                        </span>
                      </div>
                    )} */}
                    
                    {/* <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.class}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {details.leadStatus}
                      </span>
                    </div> */}
                  </div>
                </div>

                {/* Document Information Card */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-gray-500" />
                    Document Information
                  </h3>
                  
                  <div className="space-y-4">
                    {details.panNumber ? (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-600">PAN Number:</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-700 font-mono">
                          {details.panNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">PAN Number:</span>
                        </div>
                        <span className="text-sm text-gray-400 italic">Not provided</span>
                      </div>
                    )}
                    
                    {details.aadhaarNumber ? (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-600">Aadhaar Number:</span>
                        </div>
                        <span className="text-sm font-semibold text-green-700 font-mono">
                          {details.aadhaarNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Aadhaar Number:</span>
                        </div>
                        <span className="text-sm text-gray-400 italic">Not provided</span>
                      </div>
                    )}
                    
                    {details.gstNumber ? (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileSignature className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-600">GST Number:</span>
                        </div>
                        <span className="text-sm font-semibold text-purple-700 font-mono">
                          {details.gstNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileSignature className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">GST Number:</span>
                        </div>
                        <span className="text-sm text-gray-400 italic">Not provided</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Information Card */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    System Information
                  </h3>
                  
                  <div className="space-y-4">
                    {details.createdDate && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Created Date:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {details.createdDate}
                        </span>
                      </div>
                    )}
                    
                    {details.updatedDate && details.updatedDate !== details.createdDate && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Updated Date:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {details.updatedDate}
                        </span>
                      </div>
                    )}
                    
                    {details.createdBy && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Created By:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {details.createdBy}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Customer ID:</span>
                      <span className="text-sm font-semibold text-gray-900 font-mono text-right max-w-[200px] break-all">
                        {details.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-xl">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Last viewed: {formatDate(new Date().toISOString())}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;