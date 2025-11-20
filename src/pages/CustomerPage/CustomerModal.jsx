import React, { useState, useEffect } from 'react';

const CustomerModal = ({ customer, onSave, onClose, generateCompanyCode, generateContactCode }) => {
  const isEditMode = Boolean(customer);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    city: '',
    buyer_type: 'individual',
    company_name: '',
    contact_person_name: '',
    company_code: '',
    contact_code: '',
    creditType: 'auto',
    sourceOrigin: '',
    brokerName: '',
    lead_source: '',
    policy_type: '4 Wheeler',
    lead_status: 'New'
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
        city: customer.city || '',
        buyer_type: customer.buyer_type || 'individual',
        company_name: customer.company_name || '',
        contact_person_name: customer.contact_person_name || '',
        company_code: customer.company_code || '',
        contact_code: customer.contact_code || '',
        creditType: customer.creditType || 'auto',
        sourceOrigin: customer.sourceOrigin || '',
        brokerName: customer.brokerName || '',
        lead_source: customer.lead_source || '',
        policy_type: customer.policy_type || '4 Wheeler',
        lead_status: customer.lead_status || 'New'
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
        city: '',
        buyer_type: 'individual',
        company_name: '',
        contact_person_name: '',
        company_code: '',
        contact_code: '',
        creditType: 'auto',
        sourceOrigin: '',
        brokerName: '',
        lead_source: '',
        policy_type: '4 Wheeler',
        lead_status: 'New'
      });
    }
  }, [customer, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle buyer type change - reset corporate fields if switching to individual
    if (name === "buyer_type" && value === "individual") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        company_name: '',
        contact_person_name: '',
        company_code: '',
        contact_code: ''
      }));
      return;
    }
    
    // Handle company name change - auto-generate code
    if (name === "company_name" && formData.buyer_type === "corporate") {
      const newFormData = { ...formData, [name]: value };
      newFormData.company_code = generateCompanyCode(newFormData);
      setFormData(newFormData);
      return;
    }
    
    // Handle contact person change - auto-generate code
    if (name === "contact_person_name" && formData.buyer_type === "corporate") {
      const newFormData = { ...formData, [name]: value };
      newFormData.contact_code = generateContactCode(newFormData);
      setFormData(newFormData);
      return;
    }
    
    // Handle credit type change - reset broker name if not broker
    if (name === "creditType" && value !== "broker") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        brokerName: ''
      }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const customerData = {
        ...formData,
        ts: Date.now(),
        created_by: "user-id"
      };

      await onSave(customerData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // Error handling is done in parent component
    }
  };

  const leadSourceOptions = [
    'Website',
    'Social Media',
    'Partnership',
    'Online',
    'Aggregators',
    'Others'
  ];

  const leadStatusOptions = [
    'New',
    'Contacted',
    'Qualified',
    'Proposal Sent',
    'Negotiation',
    'Converted',
    'Lost'
  ];

  const policyTypeOptions = [
    '2 Wheeler',
    '4 Wheeler',
    'Home Insurance',
    'Health Insurance',
    'Life Insurance'
  ];

  const creditTypeOptions = [
    { value: 'auto', label: 'Autocredits India LLP' },
    { value: 'broker', label: 'Broker' },
    { value: 'showroom', label: 'Showroom' },
    { value: 'customer', label: 'Customer' }
  ];

  const sourceOriginOptions = [
    'Website',
    'Referral',
    'Walk-in',
    'Call Center',
    'Partner',
    'Social Media',
    'Existing Customer',
    'Other'
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
              {/* Left Column - Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label htmlFor="buyer_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type *
                  </label>
                  <select
                    id="buyer_type"
                    name="buyer_type"
                    value={formData.buyer_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>

                {formData.buyer_type === 'individual' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="Enter company name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="contact_person_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        id="contact_person_name"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleInputChange}
                        placeholder="Enter contact person name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="company_code" className="block text-sm font-medium text-gray-700 mb-1">
                          Company Code
                        </label>
                        <input
                          type="text"
                          id="company_code"
                          name="company_code"
                          value={formData.company_code}
                          onChange={handleInputChange}
                          placeholder="Auto-generated"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          readOnly
                        />
                      </div>

                      <div>
                        <label htmlFor="contact_code" className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Code
                        </label>
                        <input
                          type="text"
                          id="contact_code"
                          name="contact_code"
                          value={formData.contact_code}
                          onChange={handleInputChange}
                          placeholder="Auto-generated"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </>
                )}

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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Right Column - Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Information</h3>

                <div>
                  <label htmlFor="creditType" className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Type *
                  </label>
                  <select
                    id="creditType"
                    name="creditType"
                    value={formData.creditType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {creditTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.creditType === 'broker' && (
                  <div>
                    <label htmlFor="brokerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Broker Name *
                    </label>
                    <input
                      type="text"
                      id="brokerName"
                      name="brokerName"
                      value={formData.brokerName}
                      onChange={handleInputChange}
                      placeholder="Enter broker name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="sourceOrigin" className="block text-sm font-medium text-gray-700 mb-1">
                    Source Origin
                  </label>
                  <select
                    id="sourceOrigin"
                    name="sourceOrigin"
                    value={formData.sourceOrigin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select source origin</option>
                    {sourceOriginOptions.map(source => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
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
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="lead_source" className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    id="lead_source"
                    name="lead_source"
                    value={formData.lead_source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Policy Type
                  </label>
                  <select
                    id="policy_type"
                    name="policy_type"
                    value={formData.policy_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select policy type</option>
                    {policyTypeOptions.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
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

export default CustomerModal;