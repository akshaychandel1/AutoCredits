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
    // Removed: creditType, sourceOrigin, brokerName, lead_source, policy_type, lead_status
    alternate_phone: '',
    pincode: '',
    pan: '',
    aadhar: '',
    gst: ''
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
        // Removed fields
        alternate_phone: customer.alternate_phone || '',
        pincode: customer.pincode || '',
        pan: customer.pan || '',
        aadhar: customer.aadhar || '',
        gst: customer.gst || ''
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
        // Removed fields
        alternate_phone: '',
        pincode: '',
        pan: '',
        aadhar: '',
        gst: ''
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
    
    // Handle uppercase for PAN and GST
    if (name === 'pan' || name === 'gst') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }
    
    // Handle numeric only for phone, alternate phone, pincode, and aadhar
    if (name === 'phone' || name === 'alternate_phone' || name === 'pincode' || name === 'aadhar') {
      const numericValue = value.replace(/\D/g, '');
      
      // Set max lengths
      let maxLength;
      if (name === 'pincode') maxLength = 6;
      else if (name === 'aadhar') maxLength = 12;
      else if (name === 'phone' || name === 'alternate_phone') maxLength = 10;
      
      const limitedValue = numericValue.slice(0, maxLength);
      setFormData(prev => ({ ...prev, [name]: limitedValue }));
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

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

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

                    {/* PAN Number for Individual */}
                    <div>
                      <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        id="pan"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        placeholder="Enter PAN number"
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
                    </div>

                    {/* Aadhar Number for Individual */}
                    <div>
                      <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        id="aadhar"
                        name="aadhar"
                        value={formData.aadhar}
                        onChange={handleInputChange}
                        placeholder="Enter 12-digit Aadhar number"
                        maxLength={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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

                    {/* GST Number for Corporate */}
                    <div>
                      <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        id="gst"
                        name="gst"
                        value={formData.gst}
                        onChange={handleInputChange}
                        placeholder="Enter GST number"
                        maxLength={15}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
                    </div>

                    {/* PAN Number for Corporate */}
                    <div>
                      <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number (Company)
                      </label>
                      <input
                        type="text"
                        id="pan"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        placeholder="Enter company PAN"
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      />
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
              </div>

              {/* Right Column - Contact & Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact & Address Information</h3>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formatPhoneNumber(formData.phone)}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="alternate_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="alternate_phone"
                      name="alternate_phone"
                      value={formatPhoneNumber(formData.alternate_phone)}
                      onChange={handleInputChange}
                      placeholder="Enter alternate phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Common fields that appear for both individual and corporate */}
                {formData.buyer_type === 'corporate' && (
                  <div>
                    <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number (Contact Person)
                    </label>
                    <input
                      type="text"
                      id="aadhar"
                      name="aadhar"
                      value={formData.aadhar}
                      onChange={handleInputChange}
                      placeholder="Enter contact person's Aadhar"
                      maxLength={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
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