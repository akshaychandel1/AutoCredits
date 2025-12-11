// src/pages/PoliciesPage/PoliciesPage.jsx
import { useState, useEffect, useMemo } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { FaMotorcycle, FaCar, FaTruck } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import PolicyTable from "./PolicyTable";
import PolicyModal from "./PolicyModal";

const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1";

// Payment status calculation function - UPDATED: Consistent with PolicyTable including auto credit
const getPaymentStatus = (policy) => {
  if (policy.payment_info?.paymentStatus) {
    return policy.payment_info.paymentStatus.toLowerCase();
  }
  
  const paymentLedger = policy.payment_ledger || [];
  const totalPremium = policy.policy_info?.totalPremium || policy.insurance_quote?.premium || 0;
  
  // Calculate subvention refunds
  const subventionRefundAmount = paymentLedger
    .filter(payment => payment.type === "subvention_refund")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate effective payable amount
  const effectivePayable = Math.max(totalPremium - subventionRefundAmount, 0);
  
  // Calculate auto credit amount
  const autoCreditEntry = paymentLedger.find(payment => payment.type === "auto_credit");
  const autoCreditAmount = autoCreditEntry ? autoCreditEntry.amount : 0;
  
  // Calculate ALL customer payments (including subvention refunds for total paid calculation)
  const totalCustomerPaidAmount = paymentLedger
    .filter(payment => 
      payment.paymentMadeBy === "Customer"
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  // FIX: Include auto credit in payment status calculation (consistent with PolicyTable)
  const effectivePaidAmount = autoCreditAmount > 0 
    ? autoCreditAmount 
    : totalCustomerPaidAmount;
  
  // FIX: Improved status calculation with tolerance for rounding errors
  const tolerance = 0.01; // 1 paisa tolerance
  
  // Payment status logic - UPDATED: Consistent with PolicyTable
  if (effectivePaidAmount >= (effectivePayable - tolerance) && effectivePayable > 0) {
    return 'fully paid';
  } else if (effectivePaidAmount > 0) {
    return 'partially paid';
  } else {
    return 'pending';
  }
};

// NEW: Function to check if policy should be in payment-due tab
const isPaymentDue = (policy) => {
  const paymentStatus = getPaymentStatus(policy);
  // Payment due includes both pending and partially paid policies
  return paymentStatus === 'pending' || paymentStatus === 'partially paid';
};

// NEW: Function to detect vehicle type from policy data
const getVehicleType = (policy) => {
  // Check if vehicle_type is directly available
  if (policy.vehicle_type) {
    const vehicleType = policy.vehicle_type.toLowerCase();
    if (vehicleType.includes('two') || vehicleType.includes('2') || vehicleType.includes('bike') || vehicleType.includes('motorcycle')) {
      return 'two wheeler';
    } else if (vehicleType.includes('four') || vehicleType.includes('4') || vehicleType.includes('car') || vehicleType.includes('suv')) {
      return 'four wheeler';
    } else if (vehicleType.includes('commercial') || vehicleType.includes('truck') || vehicleType.includes('bus') || vehicleType.includes('lcv') || vehicleType.includes('hcv')) {
      return 'commercial';
    }
  }

  // Check vehicle_details for vehicleTypeCategory
  if (policy.vehicle_details?.vehicleTypeCategory) {
    const category = policy.vehicle_details.vehicleTypeCategory.toLowerCase();
    if (category.includes('two') || category.includes('2')) {
      return 'two wheeler';
    } else if (category.includes('four') || category.includes('4')) {
      return 'four wheeler';
    } else if (category.includes('commercial')) {
      return 'commercial';
    }
  }

  // Check vehicle_details for make to infer type
  if (policy.vehicle_details?.make) {
    const make = policy.vehicle_details.make.toLowerCase();
    
    // Two wheeler makes
    const twoWheelerMakes = [
      'hero', 'bajaj', 'tvs', 'honda', 'yamaha', 'suzuki', 'royal enfield', 
      'ktm', 'harley', 'ducati', 'triumph', 'bmw', 'vespa', 'aprilia', 
      'benelli', 'cfmoto', 'husqvarna', 'kawasaki', 'ola', 'ather', 
      'revolt', 'ultraviolette', 'tork', 'pure ev', 'matter', 'ampere', 
      'okaya', 'greaves', 'hero electric', 'tvs iqube', 'bajaj chetak'
    ];
    
    // Commercial vehicle makes
    const commercialMakes = [
      'ashok leyland', 'tata motors commercial', 'eicher', 'mahindra electric', 
      'piaggio', 'olectra', 'omega', 'euler', 'switch', 'jbm', 've commercial', 
      'force', 'hindustan motors'
    ];

    if (twoWheelerMakes.some(brand => make.includes(brand))) {
      return 'two wheeler';
    } else if (commercialMakes.some(brand => make.includes(brand))) {
      return 'commercial';
    }
  }

  // Default to four wheeler if no other info is available
  return 'four wheeler';
};

const PoliciesPage = () => {
  const [activeFilter, setActiveFilter] = useState("all"); // Can be "all", status type, or vehicle type
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(`${API_BASE_URL}/policies`);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setPolicies(response.data.data);
      } else {
        setError("Invalid response format from server");
        setPolicies([]);
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
      setError(`Failed to load policies: ${err.message}`);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Calculate vehicle category statistics
  const vehicleStats = useMemo(() => {
    const stats = {
      total: policies.length,
      twoWheeler: 0,
      fourWheeler: 0,
      commercial: 0
    };

    policies.forEach(policy => {
      const vehicleType = getVehicleType(policy);
      switch (vehicleType) {
        case 'two wheeler':
          stats.twoWheeler++;
          break;
        case 'four wheeler':
          stats.fourWheeler++;
          break;
        case 'commercial':
          stats.commercial++;
          break;
      }
    });

    return stats;
  }, [policies]);

  // Get status statistics
  const getStats = useMemo(() => {
    const total = policies.length;
    const completed = policies.filter(p => p.status === 'completed').length;
    const draft = policies.filter(p => p.status === 'draft').length;
    
    // Payment stats - UPDATED: Use consistent logic
    const paymentDue = policies.filter(p => isPaymentDue(p)).length;
    const fullyPaid = policies.filter(p => getPaymentStatus(p) === 'fully paid').length;
    
    return { 
      total, 
      completed, 
      draft,
      paymentDue,
      fullyPaid
    };
  }, [policies]);

  const stats = getStats;

  // Filter policies based on active filter
  const getFilteredPolicies = () => {
    if (activeFilter === "all") {
      return policies;
    }

    // Check if it's a status filter
    const statusFilters = ["completed", "draft", "payment-due", "fully-paid"];
    if (statusFilters.includes(activeFilter)) {
      switch (activeFilter) {
        case "completed":
          return policies.filter(policy => policy.status === 'completed');
        case "draft":
          return policies.filter(policy => policy.status === 'draft');
        case "payment-due":
          return policies.filter(policy => isPaymentDue(policy));
        case "fully-paid":
          return policies.filter(policy => getPaymentStatus(policy) === 'fully paid');
        default:
          return policies;
      }
    }

    // Otherwise it's a vehicle filter
    return policies.filter(policy => getVehicleType(policy) === activeFilter);
  };

  const filteredPolicies = getFilteredPolicies();

  // Handle View Policy
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  // Handle Delete Policy
  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await axios.delete(`${API_BASE_URL}/policies/${policyId}`);
        setPolicies(policies.filter((p) => p._id !== policyId));
        
        if (selectedPolicy && (selectedPolicy._id === policyId || selectedPolicy.id === policyId)) {
          handleCloseModal();
        }
      } catch (err) {
        console.error("Error deleting policy:", err);
        alert("Failed to delete policy. Please try again.");
      }
    }
  };

  // Refresh policies
  const handleRefresh = () => {
    fetchPolicies();
  };

  // Status Tab configuration
  const statusTabs = [
    { 
      id: "all", 
      name: "All Policies", 
      count: stats.total,
      color: "blue",
      activeClass: "bg-blue-500 text-white border-blue-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-blue-50 border-blue-200"
    },
    { 
      id: "completed", 
      name: "Completed", 
      count: stats.completed,
      color: "green",
      activeClass: "bg-green-500 text-white border-green-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-green-50 border-green-200"
    },
    { 
      id: "draft", 
      name: "Draft", 
      count: stats.draft,
      color: "yellow",
      activeClass: "bg-yellow-500 text-white border-yellow-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-yellow-50 border-yellow-200"
    },
    { 
      id: "payment-due", 
      name: "Payment Due", 
      count: stats.paymentDue,
      color: "red",
      activeClass: "bg-red-500 text-white border-red-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-red-50 border-red-200"
    },
    { 
      id: "fully-paid", 
      name: "Fully Paid", 
      count: stats.fullyPaid,
      color: "emerald",
      activeClass: "bg-emerald-500 text-white border-emerald-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-emerald-50 border-emerald-200"
    }
  ];

  // Vehicle Category Tab configuration
  const vehicleTabs = [
    {
      id: "two wheeler",
      name: "Two Wheeler",
      shortName: "2W",
      count: vehicleStats.twoWheeler,
      color: "orange",
      icon: FaMotorcycle,
      activeClass: "bg-orange-500 text-white border-orange-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-orange-50 border-orange-200"
    },
    {
      id: "four wheeler",
      name: "Four Wheeler",
      shortName: "4W",
      count: vehicleStats.fourWheeler,
      color: "blue",
      icon: FaCar,
      activeClass: "bg-blue-500 text-white border-blue-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-blue-50 border-blue-200"
    },
    {
      id: "commercial",
      name: "Commercial",
      shortName: "Comm",
      count: vehicleStats.commercial,
      color: "purple",
      icon: FaTruck,
      activeClass: "bg-purple-500 text-white border-purple-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-purple-50 border-purple-200"
    }
  ];

  // Get display name for active filter
  const getActiveFilterName = () => {
    if (activeFilter === "all") return "All Policies";
    
    // Check status tabs
    const statusTab = statusTabs.find(tab => tab.id === activeFilter);
    if (statusTab) return statusTab.name;
    
    // Check vehicle tabs
    const vehicleTab = vehicleTabs.find(tab => tab.id === activeFilter);
    if (vehicleTab) return vehicleTab.name;
    
    return "All Policies";
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Insurance Policies
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? "Loading..." : `Total ${policies.length} policies • Showing ${filteredPolicies.length} ${activeFilter === "all" ? "" : `in ${getActiveFilterName()}`}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link to="/new-policy">
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow-md transition">
              <FiPlus className="text-lg" /> New Policy
            </button>
          </Link>
        </div>
      </div>

      {/* Status and Vehicle Filter Tabs */}
      {!loading && policies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Filter Policies
              </h3>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="text-xs text-red-600 hover:text-red-800 hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
            
            {/* All Tabs in a single grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {/* Status Tabs (first 5) */}
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md relative ${
                    activeFilter === tab.id ? tab.activeClass : tab.inactiveClass
                  }`}
                >
                  <div className={`text-base font-bold mb-0.5 ${
                    activeFilter === tab.id ? 'text-white' : `text-${tab.color}-600`
                  }`}>
                    {tab.count}
                  </div>
                  <div className={`font-semibold text-xs text-center ${
                    activeFilter === tab.id ? 'text-white' : 'text-gray-800'
                  }`}>
                    {tab.name}
                  </div>
                  
                  {/* Active indicator */}
                  {activeFilter === tab.id && (
                    <div className="absolute -top-1 -right-1">
                      <div className={`w-2 h-2 bg-${tab.color}-500 rounded-full border-2 border-white`}></div>
                    </div>
                  )}
                </button>
              ))}
              
              {/* Vehicle Filter Tabs (last 3) */}
              {vehicleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(activeFilter === tab.id ? "all" : tab.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md relative ${
                    activeFilter === tab.id ? tab.activeClass : tab.inactiveClass
                  }`}
                >
                  {tab.icon && (
                    <tab.icon className={`text-sm mb-0.5 ${
                      activeFilter === tab.id ? 'text-white' : `text-${tab.color}-600`
                    }`} />
                  )}
                  <div className={`text-base font-bold ${
                    activeFilter === tab.id ? 'text-white' : `text-${tab.color}-600`
                  }`}>
                    {tab.count}
                  </div>
                  <div className={`font-semibold text-xs text-center ${
                    activeFilter === tab.id ? 'text-white' : 'text-gray-800'
                  }`}>
                    {tab.shortName}
                  </div>
                  
                  {/* Active indicator */}
                  {activeFilter === tab.id && (
                    <div className="absolute -top-1 -right-1">
                      <div className={`w-2 h-2 bg-${tab.color}-500 rounded-full border-2 border-white`}></div>
                    </div>
                  )}
                </button>
              ))}
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
              onClick={fetchPolicies}
              className="text-red-700 hover:text-red-900 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Policy Table */}
      <PolicyTable 
        policies={filteredPolicies}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Policy Modal */}
      <PolicyModal
        policy={selectedPolicy}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PoliciesPage;