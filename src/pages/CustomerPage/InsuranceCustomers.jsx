import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Download, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  User, 
  Building, 
  Filter,
  X,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Briefcase,
  UserCheck,
  TrendingUp,
  FileText,
  CreditCard,
  Shield,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/customers";
const POLICIES_API_URL = "https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies";

const InsuranceCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [buyerTypeFilter, setBuyerTypeFilter] = useState("");
  const [creditTypeFilter, setCreditTypeFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    email: '',
    phone: '',
    city: '',
    companyName: '',
    contactPerson: '',
    creditType: '',
    sourceOrigin: ''
  });

  // Fetch customers and policies from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch customers
      const customerResponse = await axios.get(API_BASE_URL);
      let customersData = [];
      
      if (customerResponse.data && Array.isArray(customerResponse.data)) {
        customersData = customerResponse.data;
      } else if (customerResponse.data && customerResponse.data.success && Array.isArray(customerResponse.data.data)) {
        customersData = customerResponse.data.data;
      }
      
      // Process customers to ensure all required fields
      const processedCustomers = customersData.map(customer => ({
        ...customer,
        buyer_type: customer.buyer_type || 'individual',
        creditType: customer.creditType || 'auto',
        sourceOrigin: customer.sourceOrigin || 'direct',
        brokerName: customer.brokerName || '',
        company_code: customer.company_code || generateCompanyCode(customer),
        contact_code: customer.contact_code || generateContactCode(customer)
      }));
      
      setCustomers(processedCustomers);

      // Fetch policies to get company/contact person data
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

  // Generate company code for corporate customers
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

  // Generate contact code for corporate customers
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

  // Enhanced search function
  const filteredCustomers = customers.filter((customer) => {
    const firstName = customer.first_name || '';
    const lastName = customer.last_name || '';
    const email = customer.email || '';
    const phone = customer.phone || '';
    const policyType = customer.policy_type || '';
    const customerId = customer._id || '';
    const companyName = customer.company_name || '';
    const contactPerson = customer.contact_person_name || '';
    const city = customer.city || '';
    const creditType = customer.creditType || '';
    const sourceOrigin = customer.sourceOrigin || '';
    const companyCode = customer.company_code || '';
    const contactCode = customer.contact_code || '';

    // Basic search across all fields including ID
    const matchesSearch = search ? 
      firstName.toLowerCase().includes(search.toLowerCase()) ||
      lastName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      phone.toLowerCase().includes(search.toLowerCase()) ||
      customerId.toLowerCase().includes(search.toLowerCase()) ||
      companyName.toLowerCase().includes(search.toLowerCase()) ||
      contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase()) ||
      creditType.toLowerCase().includes(search.toLowerCase()) ||
      sourceOrigin.toLowerCase().includes(search.toLowerCase()) ||
      companyCode.toLowerCase().includes(search.toLowerCase()) ||
      contactCode.toLowerCase().includes(search.toLowerCase())
      : true;

    // Status filter
    const matchesStatus = statusFilter ? customer.lead_status === statusFilter : true;
    
    // Policy type filter
    const matchesType = typeFilter ? policyType.toLowerCase().includes(typeFilter.toLowerCase()) : true;
    
    // Buyer type filter
    const matchesBuyerType = buyerTypeFilter ? customer.buyer_type === buyerTypeFilter : true;
    
    // Credit type filter
    const matchesCreditType = creditTypeFilter ? customer.creditType === creditTypeFilter : true;

    // Advanced filters
    const matchesAdvanced = 
      (!advancedFilters.email || email.toLowerCase().includes(advancedFilters.email.toLowerCase())) &&
      (!advancedFilters.phone || phone.includes(advancedFilters.phone)) &&
      (!advancedFilters.city || city.toLowerCase().includes(advancedFilters.city.toLowerCase())) &&
      (!advancedFilters.companyName || companyName.toLowerCase().includes(advancedFilters.companyName.toLowerCase())) &&
      (!advancedFilters.contactPerson || contactPerson.toLowerCase().includes(advancedFilters.contactPerson.toLowerCase())) &&
      (!advancedFilters.creditType || creditType.toLowerCase().includes(advancedFilters.creditType.toLowerCase())) &&
      (!advancedFilters.sourceOrigin || sourceOrigin.toLowerCase().includes(advancedFilters.sourceOrigin.toLowerCase()));

    return matchesSearch && matchesStatus && matchesType && matchesBuyerType && matchesCreditType && matchesAdvanced;
  });

  // Handle View Customer
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Handle Edit Customer
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsNewCustomerModalOpen(true);
  };

  // Handle Delete Customer
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

  // Refresh data
  const handleRefresh = () => {
    fetchData();
  };

  // Get unique values for filters
  const uniqueStatuses = [...new Set(customers.map(c => c.lead_status).filter(Boolean))];
  const uniqueTypes = [...new Set(customers.map(c => c.policy_type).filter(Boolean))];
  const uniqueBuyerTypes = [...new Set(customers.map(c => c.buyer_type).filter(Boolean))];
  const uniqueCreditTypes = [...new Set(customers.map(c => c.creditType).filter(Boolean))];

  // Get stats for dashboard
  const getStats = () => {
    const total = customers.length;
    const active = customers.filter(c => c.lead_status && c.lead_status.includes('Active')).length;
    const newLeads = customers.filter(c => c.lead_status && c.lead_status.includes('New')).length;
    const converted = customers.filter(c => c.lead_status && c.lead_status.includes('Converted')).length;
    const corporate = customers.filter(c => c.buyer_type === 'corporate').length;
    const individual = customers.filter(c => c.buyer_type === 'individual' || !c.buyer_type).length;
    const autoCredit = customers.filter(c => c.creditType === 'auto').length;
    const broker = customers.filter(c => c.creditType === 'broker').length;
    const showroom = customers.filter(c => c.creditType === 'showroom').length;
    const customerDirect = customers.filter(c => c.creditType === 'customer').length;
    
    return { 
      total, 
      active, 
      newLeads, 
      converted, 
      corporate, 
      individual,
      autoCredit,
      broker,
      showroom,
      customerDirect
    };
  };

  const stats = getStats();

  // Handle stat card click to filter
  const handleStatClick = (filterType, filterValue) => {
    if (filterType === 'status') {
      setStatusFilter(filterValue);
    } else if (filterType === 'buyerType') {
      setBuyerTypeFilter(filterValue);
    } else if (filterType === 'creditType') {
      setCreditTypeFilter(filterValue);
    }
    setSearch("");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("");
    setSearch("");
    setTypeFilter("");
    setBuyerTypeFilter("");
    setCreditTypeFilter("");
    setAdvancedFilters({
      email: '',
      phone: '',
      city: '',
      companyName: '',
      contactPerson: '',
      creditType: '',
      sourceOrigin: ''
    });
  };

  // Check if any filter is active
  const isFilterActive = statusFilter || search || typeFilter || buyerTypeFilter || creditTypeFilter || 
    Object.values(advancedFilters).some(value => value !== '');

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
      return 'Invalid Date';
    }
  };

  // Get credit type display info
  const getCreditTypeInfo = (creditType, brokerName = '') => {
    const types = {
      auto: { label: 'Autocredits India LLP', color: 'blue', icon: <Shield className="w-3 h-3" /> },
      broker: { label: `Broker${brokerName ? ` - ${brokerName}` : ''}`, color: 'purple', icon: <UserCheck className="w-3 h-3" /> },
      showroom: { label: 'Showroom', color: 'orange', icon: <Building className="w-3 h-3" /> },
      customer: { label: 'Customer', color: 'green', icon: <User className="w-3 h-3" /> }
    };
    
    return types[creditType] || { label: creditType, color: 'gray', icon: <CreditCard className="w-3 h-3" /> };
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Customer ID',
      'Buyer Type',
      'First Name',
      'Last Name',
      'Company Name',
      'Contact Person',
      'Company Code',
      'Contact Code',
      'Email',
      'Phone',
      'Gender',
      'Address',
      'City',
      'Lead Source',
      'Policy Type',
      'Lead Status',
      'Credit Type',
      'Source Origin',
      'Broker Name',
      'Created Date'
    ];

    const csvData = filteredCustomers.map(customer => [
      customer._id || 'N/A',
      customer.buyer_type || 'individual',
      customer.first_name || 'N/A',
      customer.last_name || 'N/A',
      customer.company_name || 'N/A',
      customer.contact_person_name || 'N/A',
      customer.company_code || 'N/A',
      customer.contact_code || 'N/A',
      customer.email || 'N/A',
      customer.phone || 'N/A',
      customer.gender || 'N/A',
      customer.address || 'N/A',
      customer.city || 'N/A',
      customer.lead_source || 'N/A',
      customer.policy_type || 'N/A',
      customer.lead_status || 'N/A',
      customer.creditType || 'auto',
      customer.sourceOrigin || 'direct',
      customer.brokerName || 'N/A',
      formatDate(customer.created_at || customer.ts)
    ].map(field => `"${field}"`).join(','));

    const csvContent = [
      headers.join(','),
      ...csvData
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `insurance-customers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle customer save
  const handleCustomerSave = async (customerData) => {
    try {
      let updatedCustomer;
      
      // Generate codes for corporate customers
      if (customerData.buyer_type === 'corporate') {
        customerData.company_code = generateCompanyCode(customerData);
        customerData.contact_code = generateContactCode(customerData);
      } else {
        customerData.company_code = '';
        customerData.contact_code = '';
      }
      
      if (editingCustomer) {
        // Update existing customer
        const response = await axios.put(`${API_BASE_URL}/${editingCustomer._id}`, customerData);
        updatedCustomer = response.data.data || response.data;
        setCustomers(customers.map(c => c._id === editingCustomer._id ? updatedCustomer : c));
        
        if (selectedCustomer && selectedCustomer._id === editingCustomer._id) {
          setSelectedCustomer(updatedCustomer);
        }
      } else {
        // Create new customer
        const response = await axios.post(API_BASE_URL, customerData);
        updatedCustomer = response.data.data || response.data;
        setCustomers([...customers, updatedCustomer]);
      }
      
      setIsNewCustomerModalOpen(false);
      setEditingCustomer(null);
      await fetchData();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(`Failed to ${editingCustomer ? 'update' : 'add'} customer. Please try again.`);
      await fetchData();
    }
  };

  // Close customer modal and reset editing state
  const handleCloseCustomerModal = () => {
    setIsNewCustomerModalOpen(false);
    setEditingCustomer(null);
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

  // Advanced Search Component
  const AdvancedSearchModal = () => {
    if (!showAdvancedSearch) return null;

    const handleFilterChange = (key, value) => {
      setAdvancedFilters(prev => ({
        ...prev,
        [key]: value
      }));
    };

    const handleApply = () => {
      setShowAdvancedSearch(false);
    };

    const handleReset = () => {
      setAdvancedFilters({
        email: '',
        phone: '',
        city: '',
        companyName: '',
        contactPerson: '',
        creditType: '',
        sourceOrigin: ''
      });
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm   bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Search</h3>
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={advancedFilters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  placeholder="Filter by email"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={advancedFilters.phone}
                  onChange={(e) => handleFilterChange('phone', e.target.value)}
                  placeholder="Filter by phone"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={advancedFilters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Filter by city"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={advancedFilters.companyName}
                  onChange={(e) => handleFilterChange('companyName', e.target.value)}
                  placeholder="Filter by company name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={advancedFilters.contactPerson}
                  onChange={(e) => handleFilterChange('contactPerson', e.target.value)}
                  placeholder="Filter by contact person"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Credit Type</label>
                <select
                  value={advancedFilters.creditType}
                  onChange={(e) => handleFilterChange('creditType', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Credit Types</option>
                  <option value="auto">Autocredits India LLP</option>
                  <option value="broker">Broker</option>
                  <option value="showroom">Showroom</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Source Origin</label>
                <input
                  type="text"
                  value={advancedFilters.sourceOrigin}
                  onChange={(e) => handleFilterChange('sourceOrigin', e.target.value)}
                  placeholder="Filter by source origin"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded hover:bg-purple-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
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
            {loading ? "Loading..." : `Showing ${filteredCustomers.length} of ${customers.length} customers`}
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
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> New Customer
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {!loading && customers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Customer Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Total Customers */}
              <button
                onClick={() => handleStatClick('status', '')}
                className={`bg-gradient-to-br from-blue-50 to-blue-100 border-2 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg text-left ${
                  !statusFilter && !buyerTypeFilter && !creditTypeFilter
                    ? 'border-blue-300 ring-2 ring-blue-100' 
                    : 'border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{stats.total}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Total Customers</h3>
                <p className="text-xs text-blue-600">
                  All customers
                </p>
              </button>

              {/* Individual Customers */}
              <button
                onClick={() => handleStatClick('buyerType', 'individual')}
                className={`bg-gradient-to-br from-green-50 to-green-100 border-2 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg text-left ${
                  buyerTypeFilter === 'individual'
                    ? 'border-green-300 ring-2 ring-green-100' 
                    : 'border-green-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <User className="text-white w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Individual</h3>
                <p className="text-xs text-green-600">
                  {stats.individual} customers
                </p>
              </button>

              {/* Corporate Customers */}
              <button
                onClick={() => handleStatClick('buyerType', 'corporate')}
                className={`bg-gradient-to-br from-orange-50 to-orange-100 border-2 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg text-left ${
                  buyerTypeFilter === 'corporate'
                    ? 'border-orange-300 ring-2 ring-orange-100' 
                    : 'border-orange-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Building className="text-white w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Corporate</h3>
                <p className="text-xs text-orange-600">
                  {stats.corporate} customers
                </p>
              </button>

              {/* Autocredits Customers */}
              <button
                onClick={() => handleStatClick('creditType', 'auto')}
                className={`bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg text-left ${
                  creditTypeFilter === 'auto'
                    ? 'border-indigo-300 ring-2 ring-indigo-100' 
                    : 'border-indigo-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Shield className="text-white w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Autocredits</h3>
                <p className="text-xs text-indigo-600">
                  {stats.autoCredit} customers
                </p>
              </button>

              {/* Broker Customers */}
              <button
                onClick={() => handleStatClick('creditType', 'broker')}
                className={`bg-gradient-to-br from-purple-50 to-purple-100 border-2 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg text-left ${
                  creditTypeFilter === 'broker'
                    ? 'border-purple-300 ring-2 ring-purple-100' 
                    : 'border-purple-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <UserCheck className="text-white w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Broker</h3>
                <p className="text-xs text-purple-600">
                  {stats.broker} customers
                </p>
              </button>

              {/* Converted */}
              <button
                onClick={() => handleStatClick('status', 'Converted')}
                className={`bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg text-left ${
                  statusFilter === 'Converted'
                    ? 'border-emerald-300 ring-2 ring-emerald-100' 
                    : 'border-emerald-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{stats.converted}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Converted</h3>
                <p className="text-xs text-emerald-600">
                  Converted leads
                </p>
              </button>
            </div>
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
              onClick={fetchData}
              className="text-red-700 hover:text-red-900 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ID, company, contact, codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm"
            />
          </div>

          {/* Advanced Search Button */}
          <button
            onClick={() => setShowAdvancedSearch(true)}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <Filter className="w-4 h-4" />
            Advanced
          </button>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm min-w-[140px]"
          >
            <option value="">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

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

          {/* Buyer Type Filter */}
          <select
            value={buyerTypeFilter}
            onChange={(e) => setBuyerTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm min-w-[140px]"
          >
            <option value="">All Buyer Types</option>
            {uniqueBuyerTypes.map(type => (
              <option key={type} value={type}>
                {type === 'corporate' ? 'Corporate' : 'Individual'}
              </option>
            ))}
          </select>

          {/* Credit Type Filter */}
          <select
            value={creditTypeFilter}
            onChange={(e) => setCreditTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none shadow-sm min-w-[140px]"
          >
            <option value="">All Credit Types</option>
            {uniqueCreditTypes.map(type => (
              <option key={type} value={type}>
                {type === 'auto' ? 'Autocredits' : 
                 type === 'broker' ? 'Broker' : 
                 type === 'showroom' ? 'Showroom' : 
                 type === 'customer' ? 'Customer' : type}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={filteredCustomers.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Active Filters Display */}
        {isFilterActive && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Search: "{search}"
                <button 
                  onClick={() => setSearch("")}
                  className="ml-1 hover:bg-blue-200 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Status: {statusFilter}
                <button 
                  onClick={() => setStatusFilter("")}
                  className="ml-1 hover:bg-green-200 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                Type: {typeFilter}
                <button 
                  onClick={() => setTypeFilter("")}
                  className="ml-1 hover:bg-purple-200 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </span>
            )}
            {buyerTypeFilter && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                Buyer: {buyerTypeFilter === 'corporate' ? 'Corporate' : 'Individual'}
                <button 
                  onClick={() => setBuyerTypeFilter("")}
                  className="ml-1 hover:bg-orange-200 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </span>
            )}
            {creditTypeFilter && (
              <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                Credit: {creditTypeFilter === 'auto' ? 'Autocredits' : 
                        creditTypeFilter === 'broker' ? 'Broker' : 
                        creditTypeFilter === 'showroom' ? 'Showroom' : 'Customer'}
                <button 
                  onClick={() => setCreditTypeFilter("")}
                  className="ml-1 hover:bg-indigo-200 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </span>
            )}
            {Object.entries(advancedFilters).map(([key, value]) => 
              value && (
                <span key={key} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                  {key}: {value}
                  <button 
                    onClick={() => setAdvancedFilters(prev => ({ ...prev, [key]: '' }))}
                    className="ml-1 hover:bg-gray-200 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </span>
              )
            )}
            <button
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-800 underline text-xs font-medium ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No customers found</p>
            <p className="text-gray-500 text-xs">
              {customers.length === 0 ? 'Create your first customer to get started' : 'Try adjusting your filter criteria'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    Customer Details
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    Contact Information
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    Business Info
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    Policy & Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => {
                  const isCorporate = customer.buyer_type === 'corporate';
                  const creditTypeInfo = getCreditTypeInfo(customer.creditType, customer.brokerName);
                  
                  return (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      {/* Customer Details Column - ENHANCED with Company Name and Contact Person */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCorporate ? 'bg-orange-100' : 'bg-purple-100'
                            }`}>
                              {isCorporate ? (
                                <Building className={`text-orange-600 w-4 h-4`} />
                              ) : (
                                <User className={`text-purple-600 w-4 h-4`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm truncate">
                                {isCorporate ? customer.company_name : `${customer.first_name} ${customer.last_name}`}
                              </div>
                              
                              {/* Company Name and Contact Person - ALWAYS VISIBLE for Corporate */}
                              {isCorporate && customer.contact_person_name && (
                                <div className="text-xs text-gray-600 mt-1 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-gray-500" />
                                    <span className="truncate">{customer.company_name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-gray-500" />
                                    <span className="truncate">{customer.contact_person_name}</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Individual customer details */}
                              {!isCorporate && (
                                <div className="text-xs text-gray-500">
                                  {customer.gender || 'N/A'} • {customer.age || 'N/A'} yrs
                                </div>
                              )}
                              
                              {/* Corporate codes */}
                              {isCorporate && (
                                <div className="flex gap-1 mt-1">
                                  {customer.company_code && (
                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                                      <Briefcase className="w-2.5 h-2.5" />
                                      {customer.company_code}
                                    </span>
                                  )}
                                  {customer.contact_code && (
                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                                      <User className="w-2.5 h-2.5" />
                                      {customer.contact_code}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">ID: {customer._id?.slice(-6)}</div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Information Column */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-700 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span className="truncate">{customer.email || 'N/A'}</span>
                          </div>
                          <div className="text-gray-700 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span>{customer.phone || 'N/A'}</span>
                          </div>
                          <div className="text-gray-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="text-xs">{customer.city || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Business Info Column */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              isCorporate 
                                ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                              {isCorporate ? 'Corporate' : 'Individual'}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                              creditTypeInfo.color === 'blue' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              creditTypeInfo.color === 'purple' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              creditTypeInfo.color === 'orange' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                              'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {creditTypeInfo.icon}
                              {creditTypeInfo.label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Target className="w-2.5 h-2.5" />
                              Source: {customer.lead_source || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              Created: {formatDate(customer.created_at || customer.ts)}
                            </div>
                            {customer.sourceOrigin && (
                              <div>Origin: {customer.sourceOrigin}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Policy & Status Column */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              customer.policy_type === '4 Wheeler' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : customer.policy_type === '2 Wheeler'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {customer.policy_type || 'No Policy'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              customer.lead_status?.includes('Active') 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : customer.lead_status?.includes('New')
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : customer.lead_status?.includes('Converted')
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {customer.lead_status || 'No Status'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => handleView(customer)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-2 py-1.5 rounded transition-colors border border-purple-200 justify-center"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button 
                            onClick={() => handleEdit(customer)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-2 py-1.5 rounded transition-colors border border-green-200 justify-center"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(customer._id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-2 py-1.5 rounded transition-colors border border-red-200 justify-center"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {isModalOpen && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setIsModalOpen(false)}
          onEdit={() => {
            setIsModalOpen(false);
            handleEdit(selectedCustomer);
          }}
          getCreditTypeInfo={getCreditTypeInfo}
        />
      )}

      {/* New/Edit Customer Modal */}
      {isNewCustomerModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleCustomerSave}
          onClose={handleCloseCustomerModal}
          generateCompanyCode={generateCompanyCode}
          generateContactCode={generateContactCode}
        />
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearchModal />
    </div>
  );
};

// Customer Details Modal Component
const CustomerDetailsModal = ({ customer, onClose, onEdit, getCreditTypeInfo }) => {
  const isCorporate = customer.buyer_type === 'corporate';
  const creditTypeInfo = getCreditTypeInfo(customer.creditType, customer.brokerName);

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
    <div className="fixed inset-0 backdrop-blur-md   bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                  {customer.company_code && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Company Code</label>
                      <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded border">{customer.company_code}</p>
                    </div>
                  )}
                  {customer.contact_code && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Contact Code</label>
                      <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded border">{customer.contact_code}</p>
                    </div>
                  )}
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
                <label className="block text-sm font-medium text-gray-700">Credit Type</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  creditTypeInfo.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  creditTypeInfo.color === 'purple' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  creditTypeInfo.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                  'bg-green-100 text-green-800 border-green-200'
                }`}>
                  {creditTypeInfo.icon}
                  {creditTypeInfo.label}
                </span>
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
                <label className="block text-sm font-medium text-gray-700">Source Origin</label>
                <p className="text-gray-900">{customer.sourceOrigin || 'N/A'}</p>
              </div>
              {customer.brokerName && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Broker Name</label>
                  <p className="text-gray-900 font-medium">{customer.brokerName}</p>
                </div>
              )}
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

// Customer Modal Component
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

export default InsuranceCustomers;