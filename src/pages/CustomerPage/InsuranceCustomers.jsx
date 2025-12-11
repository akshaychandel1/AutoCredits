import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';
import CustomerTable from './CustomerTable';
import CustomerDetailsModal from './CustomerDetailsModal';
import CustomerModal from './CustomerEditModal';

const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/customers";
const POLICIES_API_URL = "https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies";

const InsuranceCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const customerResponse = await axios.get(API_BASE_URL);
      let customersData = [];
      
      if (customerResponse.data && Array.isArray(customerResponse.data)) {
        customersData = customerResponse.data;
      } else if (customerResponse.data && customerResponse.data.success && Array.isArray(customerResponse.data.data)) {
        customersData = customerResponse.data.data;
      }
      
      const processedCustomers = customersData.map(customer => ({
        ...customer,
        buyer_type: customer.buyer_type || 'individual',
        creditType: customer.creditType || 'auto',
        sourceOrigin: customer.sourceOrigin || 'direct',
        brokerName: customer.brokerName || '',
        company_code: customer.company_code || generateCompanyCode(customer),
        contact_code: customer.contact_code || generateContactCode(customer),
        company_name: customer.company_name || customer.companyName || '',
        contact_person_name: customer.contact_person_name || customer.contactPersonName || ''
      }));
      
      setCustomers(processedCustomers);

      // Fetch policies
      try {
        const policiesResponse = await axios.get(POLICIES_API_URL);
        if (policiesResponse.data && Array.isArray(policiesResponse.data)) {
          setPolicies(policiesResponse.data);
        }
      } catch (policyError) {
        console.warn("Could not fetch policies:", policyError);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to load data: ${err.message}`);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const generateCompanyCode = (customer) => {
    if (customer.buyer_type !== 'corporate' || !customer.company_name) return '';
    const companyName = customer.company_name.toUpperCase();
    const words = companyName.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 6);
    }
    return words.map(word => word[0]).join('').substring(0, 4) + 
           Math.floor(1000 + Math.random() * 9000).toString().substring(0, 3);
  };

  const generateContactCode = (customer) => {
    if (customer.buyer_type !== 'corporate' || !customer.contact_person_name) return '';
    const contactName = customer.contact_person_name.toUpperCase();
    const names = contactName.split(' ').filter(name => name.length > 0);
    if (names.length === 1) {
      return names[0].substring(0, 4);
    }
    return (names[0][0] + (names[names.length - 1] || names[0]).substring(0, 3)).toUpperCase() +
           Math.floor(100 + Math.random() * 900).toString().substring(0, 2);
  };

  // Import from policies
  const importFromPolicies = async () => {
    try {
      setLoading(true);
      const importedCustomers = [];
      
      for (const policy of policies) {
        const customerDetails = policy.customer_details;
        if (customerDetails) {
          const existingCustomer = customers.find(c => 
            c.email === customerDetails.email || 
            c.phone === customerDetails.mobile
          );

          if (!existingCustomer) {
            const newCustomer = {
              first_name: customerDetails.name || '',
              last_name: '',
              email: customerDetails.email || '',
              phone: customerDetails.mobile || '',
              address: customerDetails.address || '',
              city: customerDetails.city || '',
              buyer_type: policy.buyer_type || 'individual',
              company_name: customerDetails.companyName || '',
              contact_person_name: customerDetails.contactPersonName || '',
              creditType: customerDetails.creditType || 'auto',
              sourceOrigin: customerDetails.sourceOrigin || 'policy_import',
              brokerName: customerDetails.brokerName || '',
              policy_type: '4 Wheeler',
              lead_source: 'Policy Import',
              lead_status: 'Converted',
              ts: Date.now()
            };

            // Generate codes for corporate customers
            if (newCustomer.buyer_type === 'corporate') {
              newCustomer.company_code = generateCompanyCode(newCustomer);
              newCustomer.contact_code = generateContactCode(newCustomer);
            }

            const response = await axios.post(API_BASE_URL, newCustomer);
            importedCustomers.push(response.data.data || response.data);
          }
        }
      }

      if (importedCustomers.length > 0) {
        setCustomers([...customers, ...importedCustomers]);
        alert(`Successfully imported ${importedCustomers.length} customers from policies`);
      } else {
        alert('No new customers found to import from policies');
      }
    } catch (error) {
      console.error('Error importing from policies:', error);
      alert('Failed to import customers from policies');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsNewCustomerModalOpen(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${customerId}`);
        setCustomers(customers.filter((c) => c._id !== customerId));
        if (selectedCustomer && selectedCustomer._id === customerId) {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }
      } catch (err) {
        console.error("Error deleting customer:", err);
        alert("Failed to delete customer. Please try again.");
      }
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setIsNewCustomerModalOpen(true);
  };

  const handleCustomerSave = async (customerData) => {
    try {
      let updatedCustomer;
      
      if (customerData.buyer_type === 'corporate') {
        customerData.company_code = generateCompanyCode(customerData);
        customerData.contact_code = generateContactCode(customerData);
      } else {
        customerData.company_code = '';
        customerData.contact_code = '';
      }
      
      if (editingCustomer) {
        const response = await axios.put(`${API_BASE_URL}/${editingCustomer._id}`, customerData);
        updatedCustomer = response.data.data || response.data;
        setCustomers(customers.map(c => c._id === editingCustomer._id ? updatedCustomer : c));
        if (selectedCustomer && selectedCustomer._id === editingCustomer._id) {
          setSelectedCustomer(updatedCustomer);
        }
      } else {
        const response = await axios.post(API_BASE_URL, customerData);
        updatedCustomer = response.data.data || response.data;
        setCustomers([...customers, updatedCustomer]);
      }
      
      setIsNewCustomerModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(`Failed to ${editingCustomer ? 'update' : 'add'} customer. Please try again.`);
    }
  };

  const handleCloseCustomerModal = () => {
    setIsNewCustomerModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? "Loading..." : `Showing ${customers.length} customers`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={importFromPolicies}
            disabled={loading || policies.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Import from Policies
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> New Customer
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="text-red-700 hover:text-red-900 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Customer Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        onAddNew={handleAddNew}
      />

      {/* Modals */}
      {isModalOpen && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setIsModalOpen(false)}
          onEdit={() => {
            setIsModalOpen(false);
            handleEdit(selectedCustomer);
          }}
        />
      )}

      {isNewCustomerModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleCustomerSave}
          onClose={handleCloseCustomerModal}
          generateCompanyCode={generateCompanyCode}
          generateContactCode={generateContactCode}
        />
      )}
    </div>
  );
};

export default InsuranceCustomers;