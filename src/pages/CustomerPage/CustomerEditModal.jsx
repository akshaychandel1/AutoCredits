import React, { useState, useEffect } from 'react';
import { X, User, Building, Phone, Mail, MapPin, FileText, Briefcase, CreditCard, Shield, Users, CheckCircle, Home, AlertCircle, Link } from 'lucide-react';

const CustomerEditModal = ({ customer, onSave, onClose }) => {
  const isEditMode = Boolean(customer);
  const customerData = customer?.customer_details || customer || {};
  
  const [loading, setLoading] = useState(false);
  const [addressSync, setAddressSync] = useState(true); // State to track if addresses are synced
  
  const [formData, setFormData] = useState({
    // Basic Information
    first_name: '',
    last_name: '',
    name: '',
    customerName: '',
    email: '',
    phone: '',
    mobile: '',
    gender: '',
    age: '',
    
    // Corporate Information
    buyer_type: 'individual',
    companyName: '',
    company_name: '',
    contact_person_name: '',
    employeeName: '',
    
    // Address Information - THESE WILL STAY IN SYNC
    address: '',
    residenceAddress: '',
    city: '',
    pincode: '',
    alternate_phone: '',
    
    // Document Information
    panNumber: '',
    pan: '',
    aadhaarNumber: '',
    aadhar: '',
    gstNumber: '',
    gst: '',
    
    // Business Information
    creditType: 'auto',
    brokerName: '',
    sourceOrigin: '',
    lead_source: '',
    policy_type: '4 Wheeler',
    insurance_category: '',
    lead_status: 'Active',
    
    // Additional Information
    notes: '',
    referenceName: '',
    referencePhone: '',
    nomineeName: '',
    relation: '',
    nomineeAge: '',
    
    // System (read-only in form)
    created_by: '',
    ts: Date.now()
  });

  // Function to detect if customer should be corporate
  const shouldBeCorporate = (data) => {
    const firstName = data?.first_name || data?.firstName;
    const companyName = data?.companyName || data?.company_name;
    const contactPersonName = data?.contact_person_name;
    
    const isFirstNameInvalid = !firstName || firstName === 'undefined' || firstName.trim() === '';
    const hasCompanyName = companyName && companyName !== 'undefined';
    const hasContactPerson = contactPersonName && contactPersonName !== 'undefined';
    const isAlreadyCorporate = data?.buyer_type === 'corporate';
    
    return isAlreadyCorporate || (isFirstNameInvalid && (hasCompanyName || hasContactPerson));
  };

  // Determine initial buyer type
  const determineInitialBuyerType = (data) => {
    return shouldBeCorporate(data) ? 'corporate' : 'individual';
  };

  useEffect(() => {
    if (isEditMode && customerData) {
      const buyerType = determineInitialBuyerType(customerData);
      const existingAddress = customerData.address || customerData.residenceAddress || '';
      
      setFormData({
        first_name: customerData.first_name || '',
        last_name: customerData.last_name || '',
        name: customerData.name || '',
        customerName: customerData.customerName || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        mobile: customerData.mobile || '',
        gender: customerData.gender || '',
        age: customerData.age || '',
        
        buyer_type: buyerType,
        companyName: customerData.companyName || customerData.company_name || '',
        company_name: customerData.company_name || customerData.companyName || '',
        contact_person_name: customerData.contact_person_name || '',
        employeeName: customerData.employeeName || '',
        
        address: existingAddress,
        residenceAddress: existingAddress,
        city: customerData.city || '',
        pincode: customerData.pincode || '',
        alternate_phone: customerData.alternate_phone || '',
        
        panNumber: customerData.panNumber || customerData.pan || '',
        pan: customerData.pan || customerData.panNumber || '',
        aadhaarNumber: customerData.aadhaarNumber || customerData.aadhar || '',
        aadhar: customerData.aadhar || customerData.aadhaarNumber || '',
        gstNumber: customerData.gstNumber || customerData.gst || '',
        gst: customerData.gst || customerData.gstNumber || '',
        
        creditType: customerData.creditType || 'auto',
        brokerName: customerData.brokerName || '',
        sourceOrigin: customerData.sourceOrigin || '',
        lead_source: customerData.lead_source || '',
        policy_type: customerData.policy_type || customerData.insurance_category || '4 Wheeler',
        lead_status: customerData.lead_status || 'Active',
        
        notes: customerData.notes || '',
        referenceName: customerData.referenceName || '',
        referencePhone: customerData.referencePhone || '',
        nomineeName: customerData.nomineeName || '',
        relation: customerData.relation || '',
        nomineeAge: customerData.nomineeAge || '',
        
        created_by: customerData.created_by || '',
        ts: customerData.ts || Date.now()
      });
      
      // Check if addresses are already synced
      const isSynced = customerData.address === customerData.residenceAddress || 
                      (!customerData.address && !customerData.residenceAddress) ||
                      (!customerData.address && customerData.residenceAddress) ||
                      (customerData.address && !customerData.residenceAddress);
      setAddressSync(isSynced);
    }
  }, [customerData, isEditMode]);

  // Clean handler for address changes - updates both fields
  const handleAddressChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // If we're changing either address or residenceAddress, update both
      if (field === 'address' || field === 'residenceAddress') {
        newData.address = value;
        newData.residenceAddress = value;
        setAddressSync(true); // Mark as synced
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle address fields specially
    if (name === 'address' || name === 'residenceAddress') {
      handleAddressChange(name, value);
      return;
    }
    
    if (name === "buyer_type") {
      if (value === "individual") {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          companyName: '',
          company_name: '',
          gst: '',
          gstNumber: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          first_name: '',
          last_name: '',
          gender: ''
        }));
      }
      return;
    }
    
    // Handle uppercase for PAN and GST
    if (name === 'pan' || name === 'panNumber' || name === 'gst' || name === 'gstNumber') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }
    
    // Handle numeric only fields
    if (name === 'phone' || name === 'mobile' || name === 'alternate_phone' || 
        name === 'pincode' || name === 'aadhar' || name === 'aadhaarNumber' ||
        name === 'referencePhone' || name === 'age' || name === 'nomineeAge') {
      const numericValue = value.replace(/\D/g, '');
      let maxLength;
      
      switch(name) {
        case 'pincode': maxLength = 6; break;
        case 'aadhar':
        case 'aadhaarNumber': maxLength = 12; break;
        case 'phone':
        case 'mobile':
        case 'alternate_phone':
        case 'referencePhone': maxLength = 10; break;
        case 'age':
        case 'nomineeAge': maxLength = 3; break;
        default: maxLength = undefined;
      }
      
      const limitedValue = maxLength ? numericValue.slice(0, maxLength) : numericValue;
      setFormData(prev => ({ ...prev, [name]: limitedValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // AUTO-DETECT: If first name becomes "undefined" or empty and we have company/contact info, switch to corporate
    if (name === 'first_name' || name === 'companyName' || name === 'contact_person_name') {
      const firstName = name === 'first_name' ? value : formData.first_name;
      const companyName = name === 'companyName' ? value : formData.companyName;
      const contactPerson = name === 'contact_person_name' ? value : formData.contact_person_name;
      
      const isFirstNameInvalid = !firstName || firstName === 'undefined' || firstName.trim() === '';
      const hasCompanyInfo = (companyName && companyName.trim() !== '') || 
                            (contactPerson && contactPerson.trim() !== '');
      
      if (isFirstNameInvalid && hasCompanyInfo && formData.buyer_type === 'individual') {
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            buyer_type: 'corporate',
            first_name: '',
            last_name: '',
            gender: ''
          }));
        }, 0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data for submission
      let submissionData = {
        ...formData,
        ts: Date.now(),
        updated_at: new Date().toISOString(),
        created_by: isEditMode ? formData.created_by : "current-user-id"
      };
      
      // Auto-detect corporate based on current form data
      const isFirstNameInvalid = !submissionData.first_name || 
                                submissionData.first_name === 'undefined' || 
                                submissionData.first_name.trim() === '';
      const hasCompanyInfo = (submissionData.companyName && submissionData.companyName.trim() !== '') || 
                           (submissionData.contact_person_name && submissionData.contact_person_name.trim() !== '');
      
      if (isFirstNameInvalid && hasCompanyInfo) {
        submissionData.buyer_type = 'corporate';
      }
      
      // Clean up duplicate fields
      if (submissionData.panNumber && !submissionData.pan) {
        submissionData.pan = submissionData.panNumber;
      }
      if (submissionData.aadhaarNumber && !submissionData.aadhar) {
        submissionData.aadhar = submissionData.aadhaarNumber;
      }
      if (submissionData.gstNumber && !submissionData.gst) {
        submissionData.gst = submissionData.gstNumber;
      }
      if (submissionData.companyName && !submissionData.company_name) {
        submissionData.company_name = submissionData.companyName;
      }

      await onSave(submissionData);
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  const isCorporate = formData.buyer_type === 'corporate';
  const isFirstNameInvalid = !formData.first_name || 
                            formData.first_name === 'undefined' || 
                            formData.first_name.trim() === '';
  const hasCompanyInfo = (formData.companyName && formData.companyName.trim() !== '') || 
                       (formData.contact_person_name && formData.contact_person_name.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isCorporate ? 'bg-orange-100' : 'bg-purple-100'}`}>
                  {isCorporate ? (
                    <Building className="w-6 h-6 text-orange-600" />
                  ) : (
                    <User className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      Mode: <span className="font-medium">{isCorporate ? 'Corporate' : 'Individual'}</span>
                    </span>
                    {isFirstNameInvalid && hasCompanyInfo && !isCorporate && (
                      <div className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span>Auto-detected as Corporate</span>
                      </div>
                    )}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Customer Type */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Type *
                  </label>
                  {isEditMode && (
                    <div className="text-xs text-gray-500">
                      {isFirstNameInvalid && hasCompanyInfo ? (
                        <span className="text-yellow-600">Auto-detected as Corporate</span>
                      ) : (
                        'Manually select type'
                      )}
                    </div>
                  )}
                </div>
                <select
                  name="buyer_type"
                  value={formData.buyer_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {isCorporate ? (
                    <Building className="w-5 h-5 text-gray-500" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                  {isCorporate ? 'Company Information' : 'Personal Information'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isCorporate ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Enter company name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required={isCorporate}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name}
                          onChange={handleInputChange}
                          placeholder="Enter contact person name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required={isCorporate}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              formData.first_name === 'undefined' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            required={!isCorporate}
                          />
                          {formData.first_name === 'undefined' && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                        </div>
                        {formData.first_name === 'undefined' && (
                          <p className="text-xs text-red-600 mt-1">
                            "undefined" detected. Please enter a valid first name or switch to Corporate.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required={!isCorporate}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required={!isCorporate}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="text"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder="Enter age"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter display name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Name
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleInputChange}
                      placeholder="Enter employee name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Address Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-gray-500" />
                  Contact & Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formatPhoneNumber(formData.phone || formData.mobile)}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternate_phone"
                      value={formatPhoneNumber(formData.alternate_phone)}
                      onChange={handleInputChange}
                      placeholder="Enter alternate phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit pincode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* SINGLE ADDRESS FIELD THAT UPDATES BOTH */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Address / Residence Address *
                    </label>
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <Link className="w-3 h-3" />
                      <span>Fields are synced</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      This will update both "Address" and "Residence Address" fields
                    </span>
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  
                  {/* Visual indicator showing both fields are the same */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium truncate max-w-[300px]">{formData.address || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Residence Address:</span>
                      <span className="font-medium truncate max-w-[300px]">{formData.residenceAddress || 'Not set'}</span>
                    </div>
                    {formData.address === formData.residenceAddress ? (
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Both address fields are synchronized
                      </div>
                    ) : (
                      <div className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Address fields are different - will be synchronized on save
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Document Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isCorporate ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST Number
                        </label>
                        <input
                          type="text"
                          name="gst"
                          value={formData.gst}
                          onChange={handleInputChange}
                          placeholder="Enter GST number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company PAN
                        </label>
                        <input
                          type="text"
                          name="pan"
                          value={formData.pan}
                          onChange={handleInputChange}
                          placeholder="Enter company PAN"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person Aadhaar
                        </label>
                        <input
                          type="text"
                          name="aadhar"
                          value={formData.aadhar}
                          onChange={handleInputChange}
                          placeholder="Enter contact person's Aadhaar"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          name="pan"
                          value={formData.pan}
                          onChange={handleInputChange}
                          placeholder="Enter PAN number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aadhaar Number
                        </label>
                        <input
                          type="text"
                          name="aadhar"
                          value={formData.aadhar}
                          onChange={handleInputChange}
                          placeholder="Enter Aadhaar number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Type
                    </label>
                    <select
                      name="creditType"
                      value={formData.creditType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="auto">Autocredits India LLP</option>
                      <option value="broker">Broker</option>
                      <option value="showroom">Showroom</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Type
                    </label>
                    <select
                      name="policy_type"
                      value={formData.policy_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="4 Wheeler">4 Wheeler</option>
                      <option value="2 Wheeler">2 Wheeler</option>
                      <option value="Health">Health Insurance</option>
                      <option value="Life">Life Insurance</option>
                      <option value="Home">Home Insurance</option>
                      <option value="Vehicle">Vehicle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Broker Name
                    </label>
                    <input
                      type="text"
                      name="brokerName"
                      value={formData.brokerName}
                      onChange={handleInputChange}
                      placeholder="Enter broker name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source Origin
                    </label>
                    <input
                      type="text"
                      name="sourceOrigin"
                      value={formData.sourceOrigin}
                      onChange={handleInputChange}
                      placeholder="Enter source origin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Source
                    </label>
                    <input
                      type="text"
                      name="lead_source"
                      value={formData.lead_source}
                      onChange={handleInputChange}
                      placeholder="Enter lead source"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Status
                    </label>
                    <select
                      name="lead_status"
                      value={formData.lead_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="New">New</option>
                      <option value="Open">Open</option>
                      <option value="Pending">Pending</option>
                      <option value="Converted">Converted</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Verified">Verified</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  Additional Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Enter any notes..."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Name
                      </label>
                      <input
                        type="text"
                        name="referenceName"
                        value={formData.referenceName}
                        onChange={handleInputChange}
                        placeholder="Enter reference name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Phone
                      </label>
                      <input
                        type="tel"
                        name="referencePhone"
                        value={formatPhoneNumber(formData.referencePhone)}
                        onChange={handleInputChange}
                        placeholder="Enter reference phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nominee Name
                      </label>
                      <input
                        type="text"
                        name="nomineeName"
                        value={formData.nomineeName}
                        onChange={handleInputChange}
                        placeholder="Enter nominee name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nominee Relation
                      </label>
                      <input
                        type="text"
                        name="relation"
                        value={formData.relation}
                        onChange={handleInputChange}
                        placeholder="Enter relation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nominee Age
                      </label>
                      <input
                        type="text"
                        name="nomineeAge"
                        value={formData.nomineeAge}
                        onChange={handleInputChange}
                        placeholder="Enter nominee age"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {isEditMode ? 'Update Customer' : 'Create Customer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerEditModal;