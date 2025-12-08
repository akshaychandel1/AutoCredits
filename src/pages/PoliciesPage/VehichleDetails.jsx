import React, { useState } from 'react';
import { FaCar } from 'react-icons/fa';
import AutoSuggestTextField from './AutoSuggestTextField'; // Adjust the import path as needed

const VehicleDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Vehicle make options for auto-suggest
  // const vehicleMakes = [
  //   "Tata Motors", "Mahindra & Mahindra", "Maruti Suzuki", "Force Motors", "Hindustan Motors",
  //   "Hyundai", "Kia", "Toyota", "Honda", "Renault", "Nissan", "Volkswagen", "Skoda", "MG Motor",
  //   "BMW", "Mercedes-Benz", "Audi", "Volvo", "Jeep", "Land Rover", "Jaguar", "Porsche", "Isuzu",
  //   "Lexus", "Mini", "Citroen", "Peugeot", "Fiat", "Mitsubishi", "Chevrolet", "BYD",
  //   "Hero MotoCorp", "Bajaj Auto", "TVS Motor", "Royal Enfield", "Mahindra Two Wheelers",
  //   "Honda Motorcycle & Scooter India", "Yamaha Motor India", "Suzuki Motorcycle India", "KTM",
  //   "Husqvarna", "BMW Motorrad", "Triumph Motorcycles", "Harley-Davidson", "Benelli", "CFMoto",
  //   "Ducati", "Aprilia", "Vespa", "Keeway", "Ashok Leyland", "Eicher Motors", "Tata Motors Commercial",
  //   "Mahindra Electric", "Piaggio Vehicles", "Olectra Greentech", "Omega Seiki Mobility", "Euler Motors",
  //   "Switch Mobility", "JBM Auto", "VE Commercial Vehicles", "Ola Electric", "Ather Energy",
  //   "Simple Energy", "Revolt Motors", "Ultraviolette Automotive", "Tork Motors", "PURE EV",
  //   "Matter Motors", "Ampere Vehicles", "Okaya EV", "Greaves Electric Mobility", "Hero Electric",
  //   "TVS iQube", "Bajaj Chetak Electric"
  // ];

  // Vehicle models organized by make

  // State for registration number suggestions
  const [regNoSuggestions, setRegNoSuggestions] = useState([]);
  const [showRegNoSuggestions, setShowRegNoSuggestions] = useState(false);
  const [isLoadingRegNo, setIsLoadingRegNo] = useState(false);

  // Get available models based on selected make
  const getAvailableModels = () => {
    if (!form.make || !vehicleModels[form.make]) {
      return [];
    }
    return vehicleModels[form.make];
  };

  // Extract vehicles array from API response
  const extractVehiclesFromResponse = (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object') {
      // Check common response formats
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.vehicles)) return data.vehicles;
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data.docs)) return data.docs;
      
      // If it's a single vehicle object
      if (data.regNo || data.make || data.model) {
        return [data];
      }
      
      // Look for any array property
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
      
      // Convert object values to array if they look like vehicles
      const values = Object.values(data);
      if (values.length > 0 && values.some(item => item && typeof item === 'object' && (item.regNo || item.make))) {
        return values;
      }
    }
    
    return [];
  };

  // Fetch vehicle suggestions based on registration number
  const fetchVehicleSuggestions = async (regNo) => {
    if (!regNo || regNo.length < 2) {
      setRegNoSuggestions([]);
      setShowRegNoSuggestions(false);
      return;
    }

    setIsLoadingRegNo(true);
    try {
      const response = await fetch('https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/vehicles');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract vehicles from response
      const vehicles = extractVehiclesFromResponse(data);
      
      // Filter vehicles by registration number
      const filteredVehicles = vehicles.filter(vehicle => 
        vehicle && 
        typeof vehicle === 'object' && 
        vehicle.regNo && 
        typeof vehicle.regNo === 'string' &&
        vehicle.regNo.toLowerCase().includes(regNo.toLowerCase())
      );
      
      setRegNoSuggestions(filteredVehicles);
      setShowRegNoSuggestions(filteredVehicles.length > 0);
      
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      setRegNoSuggestions([]);
      setShowRegNoSuggestions(false);
    } finally {
      setIsLoadingRegNo(false);
    }
  };

  // Handle registration number selection from suggestions
  const handleRegNoSelect = (vehicle) => {
    // Create a mock event object to simulate form changes
    const updateFormField = (name, value) => {
      handleChange({
        target: {
          name: name,
          value: value !== null && value !== undefined ? value.toString() : ''
        }
      });
    };

    // Update all form fields with the selected vehicle data
    updateFormField('regNo', vehicle.regNo || '');
    updateFormField('make', vehicle.make || '');
    updateFormField('model', vehicle.model || '');
    updateFormField('variant', vehicle.variant || '');
    updateFormField('engineNo', vehicle.engineNo || '');
    updateFormField('chassisNo', vehicle.chassisNo || '');
    updateFormField('makeMonth', vehicle.makeMonth || '');
    updateFormField('makeYear', vehicle.makeYear || '');
    updateFormField('cubicCapacity', vehicle.cubicCapacity || '');
    updateFormField('vehicleTypeCategory', vehicle.vehicleTypeCategory || '4 wheeler');
    
    // Close the suggestions dropdown
    setShowRegNoSuggestions(false);
  };

  // Handle vehicle make change
  const handleMakeChange = (value) => {
    handleChange({
      target: {
        name: 'make',
        value: value
      }
    });
    
    // Clear model and variant when make changes
    if (value !== form.make) {
      handleChange({
        target: {
          name: 'model',
          value: ''
        }
      });
      handleChange({
        target: {
          name: 'variant',
          value: ''
        }
      });
    }
  };

  // Handle vehicle model change
  const handleModelChange = (value) => {
    handleChange({
      target: {
        name: 'model',
        value: value
      }
    });
    
    // Clear variant when model changes
    if (value !== form.model) {
      handleChange({
        target: {
          name: 'variant',
          value: ''
        }
      });
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaCar />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
             Step 2: Vehicle Details
            </h3>
            <p className="text-xs text-gray-500">
              Provide accurate vehicle information
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Registration Number with Auto-suggest from API */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Registration Number *
          </label>
          <div className="relative">
            <input
              type="text"
              name="regNo"
              value={form.regNo || ""}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                handleChange({
                  target: {
                    name: e.target.name,
                    value: value
                  }
                });
                // Fetch suggestions when user types
                fetchVehicleSuggestions(value);
              }}
              onFocus={() => {
                if (form.regNo && form.regNo.length >= 2) {
                  fetchVehicleSuggestions(form.regNo);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowRegNoSuggestions(false), 200);
              }}
              placeholder="Enter Vehicle Number"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.regNo ? "border-red-500" : "border-gray-300"
              }`}
              style={{ textTransform: 'uppercase' }}
            />
            
            {/* Loading indicator */}
            {isLoadingRegNo && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              </div>
            )}
            
            {/* Registration Number Suggestions Dropdown */}
            {showRegNoSuggestions && regNoSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {regNoSuggestions.map((vehicle, index) => (
                  <div
                    key={vehicle._id || vehicle.regNo || index}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                    onClick={() => handleRegNoSelect(vehicle)}
                  >
                    <div className="font-medium">{vehicle.regNo}</div>
                    <div className="text-xs text-gray-500">
                      {vehicle.make} {vehicle.model} {vehicle.variant ? `- ${vehicle.variant}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results message */}
            {showRegNoSuggestions && regNoSuggestions.length === 0 && !isLoadingRegNo && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-3 py-2 text-sm text-gray-500">
                No vehicles found
              </div>
            )}
          </div>
          {errors.regNo && <p className="text-red-500 text-xs mt-1">{errors.regNo}</p>}
        </div>

        {/* Vehicle Make with API-based AutoSuggestTextField */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Make *
          </label>
          <AutoSuggestTextField
            fieldName="make"
            placeholder="Type vehicle make"
            value={form.make || ""}
            onChange={handleMakeChange}
            disabled={false}
            error={errors.make}
          />
          {!errors.make && form.make && (
            <p className="text-green-600 text-xs mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Make selected
            </p>
          )}
        </div>

        {/* Vehicle Model with API-based AutoSuggestTextField (depends on make) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Model *
          </label>
          <AutoSuggestTextField
            fieldName="model"
            placeholder={form.make ? "Type vehicle model" : "Select make first"}
            value={form.model || ""}
            onChange={handleModelChange}
            disabled={!form.make}
            make={form.make} // Pass make for dynamic endpoint
            error={errors.model}
          />
          {!form.make && !errors.model && (
            <p className="text-gray-500 text-xs mt-1">Please select vehicle make first</p>
          )}
          {form.make && form.model && !errors.model && (
            <p className="text-green-600 text-xs mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Model selected for {form.make}
            </p>
          )}
        </div>

        {/* Vehicle Variant with API-based AutoSuggestTextField (depends on make and model) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Variant *
          </label>
          <AutoSuggestTextField
            fieldName="variant"
            placeholder={form.make && form.model ? "Type vehicle variant" : "Select make and model first"}
            value={form.variant || ""}
            onChange={(value) => {
              handleChange({
                target: {
                  name: 'variant',
                  value: value
                }
              });
            }}
            disabled={!form.make || !form.model}
            make={form.make} // Pass make for dynamic endpoint
            model={form.model} // Pass model for dynamic endpoint
            error={errors.variant}
          />
          {(!form.make || !form.model) && !errors.variant && (
            <p className="text-gray-500 text-xs mt-1">
              {!form.make ? 'Select make first' : 'Select model first'}
            </p>
          )}
          {form.make && form.model && form.variant && !errors.variant && (
            <p className="text-green-600 text-xs mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Variant selected for {form.make} {form.model}
            </p>
          )}
        </div>

        {/* Cubic Capacity (cc) field */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Cubic Capacity (cc)
          </label>
          <input
            type="text"
            name="cubicCapacity"
            value={form.cubicCapacity || ""}
            onChange={handleChange}
            placeholder="Enter cubic capacity"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.cubicCapacity ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.cubicCapacity && <p className="text-red-500 text-xs mt-1">{errors.cubicCapacity}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Engine Number *
          </label>
          <input
            type="text"
            name="engineNo"
            value={form.engineNo || ""}
            onChange={handleChange}
            placeholder="Enter engine number"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none uppercase ${
              errors.engineNo ? "border-red-500" : "border-gray-300"
            }`}
            style={{ textTransform: 'uppercase' }}
          />
          {errors.engineNo && <p className="text-red-500 text-xs mt-1">{errors.engineNo}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Chassis Number *
          </label>
          <input
            type="text"
            name="chassisNo"
            value={form.chassisNo || ""}
            onChange={handleChange}
            placeholder="Enter chassis number"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none uppercase ${
              errors.chassisNo ? "border-red-500" : "border-gray-300"
            }`}
            style={{ textTransform: 'uppercase' }}
          />
          {errors.chassisNo && <p className="text-red-500 text-xs mt-1">{errors.chassisNo}</p>}
        </div>

        {/* Types of Vehicle dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Types of Vehicle
          </label>
          <select
            name="vehicleTypeCategory"
            value={form.vehicleTypeCategory || "4 wheeler"}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.vehicleTypeCategory ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="4 wheeler">Four Wheeler</option>
            <option value="two wheeler">Two Wheeler</option>
            <option value="commercial">Commercial Vehicle</option>
          </select>
          {errors.vehicleTypeCategory && <p className="text-red-500 text-xs mt-1">{errors.vehicleTypeCategory}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Manufacture Date *
          </label>
          <div className="flex gap-3">
            <div className="w-1/2">
              <select
                name="makeMonth"
                value={form.makeMonth || ""}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.makeMonth ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Month</option>
                {[
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.makeMonth && <p className="text-red-500 text-xs mt-1">{errors.makeMonth}</p>}
            </div>
            <div className="w-1/2">
              <input
                type="number"
                name="makeYear"
                value={form.makeYear || ""}
                onChange={handleChange}
                placeholder="Year"
                min='1500'
                max='3000'
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.makeYear ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.makeYear && <p className="text-red-500 text-xs mt-1">{errors.makeYear}</p>}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="mt-4 p-3 rounded-md bg-gray-50 border border-gray-100 text-sm text-gray-600">
            <strong>Note:</strong> All vehicle details must be accurate as they
            will be verified during policy issuance. You can start typing the registration number to auto-fill details from existing records.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;