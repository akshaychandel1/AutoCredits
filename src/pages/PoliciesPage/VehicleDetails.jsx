import { useState, useEffect } from 'react';
import { FaCar } from 'react-icons/fa';

const VehicleDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Vehicle make options for auto-suggest
  const vehicleMakes = [
    "Tata Motors", "Mahindra & Mahindra", "Maruti Suzuki", "Force Motors", "Hindustan Motors",
    "Hyundai", "Kia", "Toyota", "Honda", "Renault", "Nissan", "Volkswagen", "Skoda", "MG Motor",
    "BMW", "Mercedes-Benz", "Audi", "Volvo", "Jeep", "Land Rover", "Jaguar", "Porsche", "Isuzu",
    "Lexus", "Mini", "Citroen", "Peugeot", "Fiat", "Mitsubishi", "Chevrolet", "BYD",
    "Hero MotoCorp", "Bajaj Auto", "TVS Motor", "Royal Enfield", "Mahindra Two Wheelers",
    "Honda Motorcycle & Scooter India", "Yamaha Motor India", "Suzuki Motorcycle India", "KTM",
    "Husqvarna", "BMW Motorrad", "Triumph Motorcycles", "Harley-Davidson", "Benelli", "CFMoto",
    "Ducati", "Aprilia", "Vespa", "Keeway", "Ashok Leyland", "Eicher Motors", "Tata Motors Commercial",
    "Mahindra Electric", "Piaggio Vehicles", "Olectra Greentech", "Omega Seiki Mobility", "Euler Motors",
    "Switch Mobility", "JBM Auto", "VE Commercial Vehicles", "Ola Electric", "Ather Energy",
    "Simple Energy", "Revolt Motors", "Ultraviolette Automotive", "Tork Motors", "PURE EV",
    "Matter Motors", "Ampere Vehicles", "Okaya EV", "Greaves Electric Mobility", "Hero Electric",
    "TVS iQube", "Bajaj Chetak Electric"
  ];

  // Vehicle models organized by make
  const vehicleModels = {
    "Tata Motors": ["Nexon", "Punch", "Harrier", "Safari", "Tiago", "Altroz", "Tigor", "Nexon EV", "Tigor EV", "Nexon iCNG"],
    "Mahindra & Mahindra": ["Thar", "Scorpio", "XUV700", "Bolero", "XUV300", "Scorpio N", "Bolero Neo", "XUV400 EV"],
    "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "WagonR", "Dzire", "Alto", "Ertiga", "XL6", "Ciaz", "Jimny", "Invicto", "Fronx"],
    "Hyundai": ["Creta", "Venue", "i20", "Verna", "Exter", "Tucson", "Aura", "Alcazar", "Ioniq 5", "Kona Electric"],
    "Kia": ["Seltos", "Sonet", "Carens", "EV6", "Carnival"],
    "Toyota": ["Innova Crysta", "Fortuner", "Camry", "Glanza", "Hyryder", "Innova Hycross", "Vellfire", "Urban Cruiser Hyryder"],
    "Honda": ["City", "Amaze", "Elevate", "WR-V", "Jazz"],
    "Renault": ["Kwid", "Triber", "Kiger"],
    "Nissan": ["Magnite", "Kicks"],
    "Volkswagen": ["Virtus", "Taigun", "Polo", "Tiguan", "T-Roc"],
    "Skoda": ["Slavia", "Kushaq", "Kodiaq", "Superb"],
    "MG Motor": ["Hector", "Astor", "ZS EV", "Gloster", "Comet EV"],
    "Jeep": ["Compass", "Meridian", "Wrangler", "Grand Cherokee"],
    "BMW": ["X1", "X3", "3 Series", "5 Series", "7 Series", "X5", "X7", "i4", "iX"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC", "GLE", "S-Class", "A-Class", "EQB", "EQS"],
    "Audi": ["A4", "A6", "Q3", "Q5", "Q7", "Q8", "e-tron", "RS5"],
    "Volvo": ["XC40", "XC60", "XC90", "S90", "C40 Recharge"],
    "Hero MotoCorp": ["Splendor", "HF Deluxe", "Xpulse 200", "Passion Pro", "Glamour", "Xtreme 160R"],
    "Bajaj Auto": ["Pulsar", "Dominar", "Platina", "Avenger", "CT100", "Pulsar NS", "Pulsar RS"],
    "TVS Motor": ["Apache RTR", "Raider", "Jupiter", "NTorq", "XL100", "Apache RR 310"],
    "Royal Enfield": ["Classic 350", "Hunter 350", "Himalayan 450", "Meteor 350", "Bullet 350", "Interceptor 650", "Shotgun 650"],
    "Ola Electric": ["S1 Pro", "S1 Air", "S1 X"],
    "Ather Energy": ["450X", "450S", "450 Apex"],
    "Tata Motors Commercial": ["Ace", "Intra", "Ultra", "Signa", "Winger", "Mint"],
    "Ashok Leyland": ["Dost", "Boss", "Partner", "Captain", "1616", "3520"],
    "Force Motors": ["Gurkha", "Urbania", "Traveller", "One"],
    "Hindustan Motors": ["Ambassador"],
    "Yamaha Motor India": ["MT-15", "R15", "FZ", "Fascino", "RayZR", "Aerox"],
    "Suzuki Motorcycle India": ["Access 125", "Burgman Street", "Gixxer", "Avenis"],
    "KTM": ["Duke", "RC", "Adventure", "390 Duke", "250 Duke"],
    "Harley-Davidson": ["Sportster", "Softail", "Touring", "Street"],
    "Ducati": ["Panigale", "Monster", "Scrambler", "Multistrada", "Diavel"],
    "Aprilia": ["RS 457", "Tuono", "SR 160"],
    "Vespa": ["VXL", "SXL", "Zx", "Primavera"],
    "Eicher Motors": ["Pro 2000", "Pro 3000", "Pro 6000"],
    "Mahindra Electric": ["eVerito", "eSupro", "Treo", "eAlfa Mini"],
    "Piaggio Vehicles": ["Ape", "Ape Xtra", "Ape E-City"],
    "Simple Energy": ["One"],
    "Revolt Motors": ["RV400", "RV300"],
    "Ultraviolette Automotive": ["F77"],
    "Tork Motors": ["Kratos", "Kratos R"],
    "PURE EV": ["EcoDryft", "EPluto 7G"],
    "Matter Motors": ["Aera"],
    "Ampere Vehicles": ["Zeal", "Reo", "Nitro"],
    "Okaya EV": ["Freedum", "Faast", "ClassIQ"],
    "Greaves Electric Mobility": ["Ampere Magnus", "Ampere Primus", "Ampere REO"],
    "Hero Electric": ["Optima", "Photon", "NYX", "Flash"],
    "TVS iQube": ["iQube S", "iQube ST"],
    "Bajaj Chetak Electric": ["Chetak", "Chetak Urbane"]
  };

  // State for vehicle make suggestions
  const [vehicleMakeSuggestions, setVehicleMakeSuggestions] = useState([]);
  const [showVehicleMakeSuggestions, setShowVehicleMakeSuggestions] = useState(false);
  
  // State for vehicle model suggestions
  const [vehicleModelSuggestions, setVehicleModelSuggestions] = useState([]);
  const [showVehicleModelSuggestions, setShowVehicleModelSuggestions] = useState(false);

  // State for registration number suggestions
  const [regNoSuggestions, setRegNoSuggestions] = useState([]);
  const [showRegNoSuggestions, setShowRegNoSuggestions] = useState(false);
  const [isFetchingRegNos, setIsFetchingRegNos] = useState(false);
  const [apiError, setApiError] = useState('');
  const [allVehicles, setAllVehicles] = useState([]);

  // Fetch ALL vehicles from the API on component mount
  useEffect(() => {
    const fetchAllVehicles = async () => {
      setIsFetchingRegNos(true);
      setApiError('');
      
      try {
        console.log('Fetching ALL vehicles from API...');
        
        const response = await fetch(`https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/vehicles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('ALL vehicles data received:', data);
          
          if (data && Array.isArray(data)) {
            setAllVehicles(data);
            console.log(`Loaded ${data.length} vehicles into memory`);
          } else {
            throw new Error('Invalid data format received from API');
          }
        } else {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching all vehicles:', error);
        setApiError('Failed to fetch vehicle data. Please try again.');
        setAllVehicles([]);
      } finally {
        setIsFetchingRegNos(false);
      }
    };

    fetchAllVehicles();
  }, []);

  // Search vehicles by registration number - filter from loaded vehicles
  const searchVehiclesByRegNo = async (searchTerm = '') => {
    if (!searchTerm || searchTerm.length < 2) {
      setRegNoSuggestions([]);
      setShowRegNoSuggestions(false);
      setApiError('');
      return;
    }

    setIsFetchingRegNos(true);
    setApiError('');
    
    try {
      console.log('Searching for vehicles with regNo containing:', searchTerm);
      
      if (allVehicles && Array.isArray(allVehicles) && allVehicles.length > 0) {
        console.log('Searching in', allVehicles.length, 'vehicles');
        
        // Filter vehicles by registration number (case insensitive partial match)
        const filteredVehicles = allVehicles.filter(vehicle => {
          if (!vehicle.regNo) return false;
          
          const vehicleRegNo = vehicle.regNo.toString().toLowerCase();
          const searchTermLower = searchTerm.toLowerCase();
          
          return vehicleRegNo.includes(searchTermLower);
        });
        
        console.log('Filtered vehicles found:', filteredVehicles.length);
        console.log('Filtered vehicles:', filteredVehicles);
        
        if (filteredVehicles.length > 0) {
          setRegNoSuggestions(filteredVehicles);
          setShowRegNoSuggestions(true);
          setApiError('');
        } else {
          setRegNoSuggestions([]);
          setShowRegNoSuggestions(true);
          setApiError(`No vehicles found containing "${searchTerm}"`);
        }
      } else {
        setRegNoSuggestions([]);
        setShowRegNoSuggestions(false);
        setApiError('No vehicle data available. Please try again later.');
      }
    } catch (error) {
      console.error('Error searching vehicles:', error);
      setApiError('Failed to search vehicles. Please try again.');
      setRegNoSuggestions([]);
      setShowRegNoSuggestions(false);
    } finally {
      setIsFetchingRegNos(false);
    }
  };

  // Auto-populate form when a registration number is selected
  const handleRegNoSelect = (vehicle) => {
    console.log('Selected vehicle:', vehicle);
    
    // Update all fields from the selected vehicle data
    const fieldsToUpdate = [
      { name: 'regNo', value: vehicle.regNo || '' },
      { name: 'make', value: vehicle.make || '' },
      { name: 'model', value: vehicle.model || '' },
      { name: 'variant', value: vehicle.variant || '' },
      { name: 'engineNo', value: vehicle.engineNo || '' },
      { name: 'chassisNo', value: vehicle.chassisNo || '' },
      { name: 'makeMonth', value: vehicle.makeMonth || '' },
      { name: 'makeYear', value: vehicle.makeYear || '' },
      { name: 'cubicCapacity', value: vehicle.cubicCapacity || '' },
      { name: 'vehicleTypeCategory', value: vehicle.vehicleTypeCategory || "4 wheeler" }
    ];

    fieldsToUpdate.forEach(field => {
      handleChange({
        target: {
          name: field.name,
          value: field.value
        }
      });
    });

    setShowRegNoSuggestions(false);
    setApiError('');
  };

  // Get available models based on selected make
  const getAvailableModels = () => {
    if (!form.make || !vehicleModels[form.make]) {
      return [];
    }
    return vehicleModels[form.make];
  };

  // Filter models based on input
  const filterModels = (inputValue) => {
    const availableModels = getAvailableModels();
    if (!inputValue) return availableModels;
    
    return availableModels.filter(model =>
      model.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // Handle registration number input changes
  const handleRegNoChange = (e) => {
    const value = e.target.value.toUpperCase();
    
    handleChange({
      target: {
        name: e.target.name,
        value: value
      }
    });

    // Clear suggestions if input is too short
    if (value.length < 2) {
      setRegNoSuggestions([]);
      setShowRegNoSuggestions(false);
      setApiError('');
    } else {
      // Trigger search when user types 2+ characters
      searchVehiclesByRegNo(value);
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
        {/* Registration Number with Auto-suggest */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Registration Number *
          </label>
          <div className="relative">
            <input
              type="text"
              name="regNo"
              value={form.regNo || ""}
              onChange={handleRegNoChange}
              onFocus={() => {
                if (form.regNo && form.regNo.length >= 2 && regNoSuggestions.length > 0) {
                  setShowRegNoSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowRegNoSuggestions(false), 200);
              }}
              placeholder="Enter Vehicle Number (e.g., PB10AB1234)"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.regNo ? "border-red-500" : "border-gray-300"
              }`}
              style={{ textTransform: 'uppercase' }}
            />
            
            {/* Loading indicator */}
            {isFetchingRegNos && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              </div>
            )}
            
            {/* Registration Number Suggestions Dropdown */}
            {showRegNoSuggestions && regNoSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {regNoSuggestions.map((vehicle, index) => (
                  <div
                    key={index}
                    className="px-3 py-3 cursor-pointer hover:bg-purple-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    onClick={() => handleRegNoSelect(vehicle)}
                  >
                    <div className="font-medium text-gray-900">{vehicle.regNo}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {vehicle.make} {vehicle.model} {vehicle.variant && `- ${vehicle.variant}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {vehicle.makeYear} • {vehicle.cubicCapacity}cc • {vehicle.vehicleTypeCategory}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* API Error Message */}
            {apiError && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-red-300 rounded-md shadow-lg">
                <div className="px-3 py-2 text-sm text-red-600">
                  {apiError}
                </div>
              </div>
            )}

            {/* No results message */}
            {showRegNoSuggestions && regNoSuggestions.length === 0 && !isFetchingRegNos && !apiError && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="px-3 py-2 text-sm text-gray-500">
                  No vehicles found. Please check the registration number.
                </div>
              </div>
            )}
          </div>
          {errors.regNo && <p className="text-red-500 text-xs mt-1">{errors.regNo}</p>}
          <p className="text-gray-500 text-xs mt-1">
            Start typing registration number (2+ characters) to search vehicle database
          </p>
        </div>

        {/* Vehicle Make with Auto-suggest */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Make *
          </label>
          <div className="relative">
            <input
              type="text"
              name="make"
              value={form.make || ""}
              onChange={(e) => {
                handleChange(e);
                // Show suggestions when user starts typing
                if (e.target.value.length > 0) {
                  const filtered = vehicleMakes.filter(make =>
                    make.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setVehicleMakeSuggestions(filtered);
                  setShowVehicleMakeSuggestions(true);
                } else {
                  setShowVehicleMakeSuggestions(false);
                }
              }}
              onFocus={() => {
                if (form.make) {
                  const filtered = vehicleMakes.filter(make =>
                    make.toLowerCase().includes(form.make.toLowerCase())
                  );
                  setVehicleMakeSuggestions(filtered);
                } else {
                  setVehicleMakeSuggestions(vehicleMakes);
                }
                setShowVehicleMakeSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowVehicleMakeSuggestions(false), 200);
              }}
              placeholder="Type vehicle make"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.make ? "border-red-500" : "border-gray-300"
              }`}
            />
            
            {/* Vehicle Make Suggestions Dropdown */}
            {showVehicleMakeSuggestions && vehicleMakeSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {vehicleMakeSuggestions.map((make, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => {
                      handleChange({
                        target: {
                          name: 'make',
                          value: make
                        }
                      });
                      setShowVehicleMakeSuggestions(false);
                    }}
                  >
                    {make}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
        </div>

        {/* Vehicle Model with Auto-suggest */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Model *
          </label>
          <div className="relative">
            <input
              type="text"
              name="model"
              value={form.model || ""}
              onChange={(e) => {
                handleChange(e);
                // Show suggestions when user starts typing and make is selected
                if (e.target.value.length > 0 && form.make) {
                  const filtered = filterModels(e.target.value);
                  setVehicleModelSuggestions(filtered);
                  setShowVehicleModelSuggestions(true);
                } else {
                  setShowVehicleModelSuggestions(false);
                }
              }}
              onFocus={() => {
                if (form.make) {
                  const availableModels = getAvailableModels();
                  if (form.model) {
                    const filtered = filterModels(form.model);
                    setVehicleModelSuggestions(filtered);
                  } else {
                    setVehicleModelSuggestions(availableModels);
                  }
                  setShowVehicleModelSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowVehicleModelSuggestions(false), 200);
              }}
              placeholder={form.make ? "Type vehicle model" : "Select make first"}
              disabled={!form.make}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.model ? "border-red-500" : "border-gray-300"
              } ${!form.make ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            
            {/* Vehicle Model Suggestions Dropdown */}
            {showVehicleModelSuggestions && vehicleModelSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {vehicleModelSuggestions.map((model, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => {
                      handleChange({
                        target: {
                          name: 'model',
                          value: model
                        }
                      });
                      setShowVehicleModelSuggestions(false);
                    }}
                  >
                    {model}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
          {!form.make && (
            <p className="text-gray-500 text-xs mt-1">Please select vehicle make first</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Variant *
          </label>
          <input
            type="text"
            name="variant"
            value={form.variant || ""}
            onChange={handleChange}
            placeholder="Select variant"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.variant ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.variant && <p className="text-red-500 text-xs mt-1">{errors.variant}</p>}
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
            will be verified during policy issuance. Start typing your registration number (2+ characters) to search and auto-populate vehicle details from our database.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;