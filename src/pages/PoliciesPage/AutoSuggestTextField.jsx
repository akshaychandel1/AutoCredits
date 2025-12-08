import React, { useState, useEffect, useCallback } from 'react';

const AutoSuggestTextField = ({
  fieldName,
  keyName,
  placeholder = 'Type...',
  value,
  onChange,
  disabled = false,
  // New props for dynamic field names
  make = '',
  model = '',
  label = '',
  error = ''
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiError, setApiError] = useState('');

  const API_BASE_URL = 'https://app-jcnxmqnpnq-el.a.run.app/v1/parameters';

  // Build the dynamic field name based on make and model
  const getDynamicFieldName = useCallback(() => {
    if (fieldName === 'model' && make) {
      // Convert make to URL-friendly format
      const formattedMake = make
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
      return `model-${formattedMake}`;
    } else if (fieldName === 'variant' && make && model) {
      // Convert make and model to URL-friendly format
      const formattedMake = make
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const formattedModel = model
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      return `variant-${formattedMake}-${formattedModel}`;
    }
    if(fieldName=="autoCreditBankName" || fieldName=="inHouseBankName"){
      return keyName || fieldName;
    }
    return fieldName;
  }, [fieldName, make, model]);

  // Fetch all suggestions when field is focused
  const fetchAllSuggestions = useCallback(async () => {
    if (disabled) return;
    
    // Special handling for model and variant fields
    if (fieldName === 'model' && !make) {
      setApiError('Please select make first');
      return;
    }
    
    if (fieldName === 'variant' && (!make || !model)) {
      setApiError('Please select make and model first');
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
      const dynamicFieldName = getDynamicFieldName();
      console.log(`Fetching from: ${API_BASE_URL}/${dynamicFieldName}`);
      
      const response = await fetch(`${API_BASE_URL}/${dynamicFieldName}`);
      
      if (!response.ok) {
        // If 404, it's okay - just means no suggestions yet
        if (response.status === 404) {
          console.log(`No suggestions found for ${dynamicFieldName}`);
          setSuggestions([]);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`API Response for ${dynamicFieldName}:`, data);
      
      // Extract values from API response
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (data.value && Array.isArray(data.value)) {
        items = data.value;
      } else if (typeof data === 'object') {
        items = Object.values(data).filter(item => 
          item && typeof item === 'object'
        );
      }
      
      // Get unique values
      const values = items
        .filter(item => item)
        .map(item => item.value || item)
        .filter((value, index, self) => 
          value && self.indexOf(value) === index
        );
      
      console.log(`Found ${values.length} suggestions for ${dynamicFieldName}:`, values);
      setSuggestions(values);
    } catch (err) {
      console.error(`Error fetching ${fieldName}:`, err);
      if (err.message !== 'HTTP 404') {
        setApiError('Failed to load suggestions');
      }
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [fieldName, make, model, disabled, getDynamicFieldName]);

  // Search suggestions as user types
  const searchSuggestions = useCallback(
    async (searchTerm) => {
      if (disabled || !searchTerm.trim()) {
        return;
      }

      // Special handling for model and variant fields
      if (fieldName === 'model' && !make) {
        setApiError('Please select make first');
        return;
      }
      
      if (fieldName === 'variant' && (!make || !model)) {
        setApiError('Please select make and model first');
        return;
      }
      
      setLoading(true);
      setApiError('');
      
      try {
        const dynamicFieldName = getDynamicFieldName();
        const response = await fetch(`${API_BASE_URL}/${dynamicFieldName}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setSuggestions([]);
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data.data) items = data.data;
        else if (data.value) items = data.value;
        else if (typeof data === 'object') {
          items = Object.values(data).filter(item => 
            item && typeof item === 'object'
          );
        }
        
        // Filter based on search term
        const filtered = items
          .filter(item => item && (item.value || item).toString().toLowerCase().includes(searchTerm.toLowerCase()))
          .map(item => item.value || item)
          .filter((value, index, self) => 
            value && self.indexOf(value) === index
          );
        
        setSuggestions(filtered);
      } catch (err) {
        console.error(`Search error for ${fieldName}:`, err);
        if (err.message !== 'HTTP 404') {
          setApiError('Failed to load suggestions');
        }
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [fieldName, make, model, disabled, getDynamicFieldName]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.trim()) {
      // Debounce the search
      const timer = setTimeout(() => {
        searchSuggestions(val);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchAllSuggestions();
    }
  };

  // Handle field focus
  const handleFocus = () => {
    if (!disabled && !showSuggestions) {
      fetchAllSuggestions();
      setShowSuggestions(true);
    }
  };

  // Handle adding new value
  const handleAdd = async () => {
    if (!value.trim() || disabled) return;
    
    // Special handling for model and variant fields
    if (fieldName === 'model' && !make) {
      setApiError('Please select make first');
      return;
    }
    
    if (fieldName === 'variant' && (!make || !model)) {
      setApiError('Please select make and model first');
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
      const dynamicFieldName = getDynamicFieldName();
      console.log(`POSTing to: ${API_BASE_URL}/${dynamicFieldName}`, { value: value.trim() });
      
      const response = await fetch(`${API_BASE_URL}/${dynamicFieldName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: value.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`POST response for ${dynamicFieldName}:`, result);
      
      // Refresh suggestions after adding
      await fetchAllSuggestions();
      
      // Show success message
      setTimeout(() => {
        alert(`"${value}" added successfully to database!`);
      }, 100);
      
    } catch (err) {
      console.error(`Error adding ${fieldName}:`, err);
      setApiError('Failed to add new value. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if value is new
  const isNewValue = value.trim() && !suggestions.some(s => s.toLowerCase() === value.toLowerCase());

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.autosuggest-container-${fieldName}`)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fieldName]);

  // Reset suggestions when make or model changes
  useEffect(() => {
    if ((fieldName === 'model' && make) || (fieldName === 'variant' && make && model)) {
      if (value) {
        fetchAllSuggestions();
      }
    }
  }, [make, model, fieldName, fetchAllSuggestions, value]);

  // Debug info
  useEffect(() => {
    if (fieldName === 'model') {
      console.log(`Model field: make="${make}", value="${value}", disabled=${disabled}`);
    } else if (fieldName === 'variant') {
      console.log(`Variant field: make="${make}", model="${model}", value="${value}", disabled=${disabled}`);
    }
  }, [fieldName, make, model, value, disabled]);

  return (
    <div className={`autosuggest-container-${fieldName}`} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      
      {/* Loading/Add indicator */}
      {!disabled && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          ) : isNewValue && value.trim() ? (
            <button
              onClick={handleAdd}
              className="text-purple-600 hover:text-purple-800"
              title="Add to database"
              type="button"
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          ) : null}
        </div>
      )}
      
      {/* API Error message */}
      {apiError && (
        <div className="text-red-500 text-xs mt-1">{apiError}</div>
      )}
      
      {/* Form error message */}
      {error && !apiError && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
      
      {/* Suggestions dropdown */}
      {showSuggestions && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading && suggestions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(item);
                  setShowSuggestions(false);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
              >
                {item}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No suggestions found
              {value.trim() && isNewValue && (
                <div className="mt-1">
                  <button
                    onClick={handleAdd}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    Add "{value}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoSuggestTextField;