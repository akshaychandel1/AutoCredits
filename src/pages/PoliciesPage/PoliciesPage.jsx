// src/pages/PoliciesPage/PoliciesPage.jsx
import { useState, useEffect } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
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

// NEW: Function to get vehicle type
const getVehicleType = (policy) => {
  return policy.vehicleType === 'new' ? 'new' : 'used';
};

// NEW: Function to get buyer type
const getBuyerType = (policy) => {
  return policy.buyer_type === 'corporate' ? 'corporate' : 'individual';
};

const PoliciesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
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

  // Filter policies based on active tab
  const getFilteredPolicies = () => {
    switch (activeTab) {
      case "completed":
        return policies.filter(policy => policy.status === 'completed');
      case "draft":
        return policies.filter(policy => policy.status === 'draft');
      case "payment-due":
        // FIX: Use the new isPaymentDue function that includes both pending and partially paid
        return policies.filter(policy => isPaymentDue(policy));
      case "fully-paid":
        // FIX: Only show truly fully paid policies (no pending tag, no due amount)
        return policies.filter(policy => getPaymentStatus(policy) === 'fully paid');
      case "new-vehicle":
        // NEW: Filter for new vehicles
        return policies.filter(policy => getVehicleType(policy) === 'new');
      case "used-vehicle":
        // NEW: Filter for used vehicles
        return policies.filter(policy => getVehicleType(policy) === 'used');
      case "corporate":
        // NEW: Filter for corporate buyers
        return policies.filter(policy => getBuyerType(policy) === 'corporate');
      case "individual":
        // NEW: Filter for individual buyers
        return policies.filter(policy => getBuyerType(policy) === 'individual');
      default:
        return policies;
    }
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

  // Get stats for dashboard
  const getStats = () => {
    const total = policies.length;
    const completed = policies.filter(p => p.status === 'completed').length;
    const draft = policies.filter(p => p.status === 'draft').length;
    
    // Payment stats - UPDATED: Use consistent logic
    const paymentDue = policies.filter(p => isPaymentDue(p)).length;
    const fullyPaid = policies.filter(p => getPaymentStatus(p) === 'fully paid').length;
    
    // NEW: Vehicle type stats
    const newVehicle = policies.filter(p => getVehicleType(p) === 'new').length;
    const usedVehicle = policies.filter(p => getVehicleType(p) === 'used').length;
    
    // NEW: Buyer type stats
    const corporate = policies.filter(p => getBuyerType(p) === 'corporate').length;
    const individual = policies.filter(p => getBuyerType(p) === 'individual').length;
    
    return { 
      total, 
      completed, 
      draft,
      paymentDue,
      fullyPaid,
      newVehicle,
      usedVehicle,
      corporate,
      individual
    };
  };

  const stats = getStats();

  // Tab configuration - 9 tabs in a responsive grid (added corporate and individual)
  const tabs = [
    { 
      id: "all", 
      name: "All Policies", 
      count: stats.total,
      description: "View all insurance policies",
      color: "blue",
      activeClass: "bg-blue-500 text-white border-blue-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-blue-50 border-blue-200"
    },
    { 
      id: "completed", 
      name: "Completed", 
      count: stats.completed,
      description: "Policies that are completed",
      color: "green",
      activeClass: "bg-green-500 text-white border-green-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-green-50 border-green-200"
    },
    { 
      id: "draft", 
      name: "Draft", 
      count: stats.draft,
      description: "Policies in draft stage",
      color: "yellow",
      activeClass: "bg-yellow-500 text-white border-yellow-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-yellow-50 border-yellow-200"
    },
    { 
      id: "payment-due", 
      name: "Payment Due", 
      count: stats.paymentDue,
      description: "Policies with pending or partial payments",
      color: "red",
      activeClass: "bg-red-500 text-white border-red-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-red-50 border-red-200"
    },
    { 
      id: "fully-paid", 
      name: "Fully Paid", 
      count: stats.fullyPaid,
      description: "Policies with complete payments",
      color: "emerald",
      activeClass: "bg-emerald-500 text-white border-emerald-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-emerald-50 border-emerald-200"
    },
    { 
      id: "new-vehicle", 
      name: "New Vehicle", 
      count: stats.newVehicle,
      description: "Policies for new vehicles",
      color: "indigo",
      activeClass: "bg-indigo-500 text-white border-indigo-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-indigo-50 border-indigo-200"
    },
    { 
      id: "used-vehicle", 
      name: "Used Vehicle", 
      count: stats.usedVehicle,
      description: "Policies for used vehicles",
      color: "gray",
      activeClass: "bg-gray-500 text-white border-gray-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
    },
    { 
      id: "corporate", 
      name: "Corporate", 
      count: stats.corporate,
      description: "Corporate buyer policies",
      color: "purple",
      activeClass: "bg-purple-500 text-white border-purple-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-purple-50 border-purple-200"
    },
    { 
      id: "individual", 
      name: "Individual", 
      count: stats.individual,
      description: "Individual buyer policies",
      color: "pink",
      activeClass: "bg-pink-500 text-white border-pink-600",
      inactiveClass: "bg-white text-gray-700 hover:bg-pink-50 border-pink-200"
    }
  ];

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Insurance Policies
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? "Loading..." : `Total ${policies.length} policies • Showing ${filteredPolicies.length} in ${tabs.find(tab => tab.id === activeTab)?.name}`}
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

      {/* Status Tabs - 9 in a responsive grid (added corporate and individual) */}
      {!loading && policies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="p-4">
            {/* 9 Tabs in a responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md hover:scale-105 relative ${
                    activeTab === tab.id ? tab.activeClass : tab.inactiveClass
                  }`}
                >
                  <div className={`text-lg font-bold mb-1 ${
                    activeTab === tab.id ? 'text-white' : `text-${tab.color}-600`
                  }`}>
                    {tab.count}
                  </div>
                  <div className={`font-semibold text-xs text-center ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-800'
                  }`}>
                    {tab.name}
                  </div>
                  
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <div className="absolute -top-1 -right-1">
                      <div className={`w-2 h-2 bg-${tab.color}-500 rounded-full border-2 border-white`}></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Tab descriptions - show for active tab */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
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