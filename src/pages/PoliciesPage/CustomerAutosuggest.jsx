import { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';

const CustomerAutosuggest = () => {
  const [form, setForm] = useState({
    customerName: '',
    // ... other form fields
  });
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/cutomers"
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setCustomers(data.data);
      } else {
        console.warn('Unexpected API response format:', data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setErrors(prev => ({ ...prev, api: 'Failed to load customers' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e, shouldFilter = false) => {
    const { name, value } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors.customerName) {
      setErrors(prev => ({ ...prev, customerName: '' }));
    }

    // Filter customers based on input
    if (shouldFilter && value.trim()) {
      const filtered = customers.filter(customer => 
        `${customer.first_name} ${customer.last_name}`
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        customer.phone.includes(value)
      );
      setFilteredCustomers(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCustomers([]);
      setShowSuggestions(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setForm(prev => ({
      ...prev,
      customerName: `${customer.first_name} ${customer.last_name}`,
      // You can also set other fields if needed
      // customerPhone: customer.phone,
      // customerEmail: customer.email,
    }));
    setFilteredCustomers([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <label className="block mb-1 text-sm font-medium text-gray-600">
        Customer Name *
      </label>
      <div className="flex items-center relative">
        <FaUser className="text-gray-400 mr-2" />
        <input
          type="text"
          name="customerName"
          value={form.customerName || ""}
          onChange={(e) => handleTextChange(e, true)}
          onFocus={() => {
            if (form.customerName) {
              const filtered = customers.filter(customer => 
                `${customer.first_name} ${customer.last_name}`
                  .toLowerCase()
                  .includes(form.customerName.toLowerCase()) ||
                customer.phone.includes(form.customerName)
              );
              setFilteredCustomers(filtered);
            }
            setShowSuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Enter customer name"
          className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
            errors.customerName ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      
      {/* API Error */}
      {errors.api && (
        <p className="text-red-500 text-xs mt-1">{errors.api}</p>
      )}
      
      {/* Loading State */}
      {isLoading && showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">Loading customers...</div>
        </div>
      )}
      
      {/* Autosuggest Dropdown */}
      {showSuggestions && filteredCustomers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="px-3 py-2 cursor-pointer hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
              onClick={() => handleCustomerSelect(customer)}
            >
              <div className="font-medium text-sm">
                {customer.first_name} {customer.last_name}
              </div>
              <div className="text-xs text-gray-500">{customer.phone}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Results */}
      {showSuggestions && form.customerName && !isLoading && filteredCustomers.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">No customers found</div>
        </div>
      )}
      
      {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
    </div>
  );
};

export default CustomerAutosuggest;