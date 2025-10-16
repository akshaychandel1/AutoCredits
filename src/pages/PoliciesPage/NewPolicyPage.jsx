import React ,{ useState, useEffect, useRef, useCallback } from "react"; 
import {jsPDF} from 'jspdf'
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { z } from 'zod';
import {
  FaCar, FaInfoCircle,FaPlus,FaArrowRight, FaCalculator,
  FaMapMarkerAlt,FaCheckCircle,FaExclamationTriangle,FaCloudUploadAlt,FaListAlt,FaExternalLinkAlt, FaTags,FaTag,FaSpinner,FaMoneyBillWave, FaEdit,FaHistory ,
  FaUser,FaReceipt,FaEye,FaDownload,FaGift,
  FaPhone,
  FaEnvelope,
  FaSave,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaIdCard,
  FaFileUpload,
  FaCreditCard,
  FaUpload,
  FaTrash,
} from "react-icons/fa";
import { 
  Plus, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  FileText, 
  Save,
  CheckCircle, // ADD THIS
  AlertTriangle // ADD THIS
} from 'lucide-react';

import icici from './logos/ICICI.jpeg'
import hdfc from './logos/hdfc.jpeg'
import bajaj from './logos/bajaj.jpeg'
import indiau from './logos/indiaunited.jpeg'
import uindia from './logos/unitedindia.jpeg'
import nis from './logos/nis.jpeg'
import orient from './logos/orient.jpeg'
import tata from './logos/tata.jpeg'
import reliance from './logos/reliance.png'
import chola from './logos/chola.png'
import INRCurrencyInput from "../../components/INRCurrencyInput";
// ================== VALIDATION RULES ==================
const validationRules = {
  // Step 1: Case Details validation
   // Step 1: Case Details validation - UPDATED
  validateStep1: (form) => {
    const errors = {};

    // Buyer Type validation
    if (!form.buyer_type) {
      errors.buyer_type = "Buyer type is required";
    }

    // Employee Name validation (common for both types)
    if (!form.employeeName) {
      errors.employeeName = "Employee name is required";
    } else if (form.employeeName.length < 2) {
      errors.employeeName = "Employee name must be at least 2 characters";
    }

    // Mobile validation (common for both types)
    if (!form.mobile) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      errors.mobile = "Mobile number must be 10 digits";
    }

    // Email validation (common for both types)
    if (!form.email) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Individual buyer validations
    if (form.buyer_type === "individual") {
      // Customer Name validation
      if (!form.customerName) {
        errors.customerName = "Customer name is required";
      } else if (form.customerName.length < 2) {
        errors.customerName = "Customer name must be at least 2 characters";
      }

      // Gender validation
      if (!form.gender) {
        errors.gender = "Gender is required";
      }

      // PAN validation (if provided)
      if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
        errors.panNumber = "Please enter a valid PAN number";
      }

      // Aadhaar validation (if provided)
      if (form.aadhaarNumber && !/^\d{12}$/.test(form.aadhaarNumber.replace(/\s/g, ''))) {
        errors.aadhaarNumber = "Aadhaar number must be 12 digits";
      }
    }

    // Corporate buyer validations
    if (form.buyer_type === "corporate") {
      // Company Name validation
      if (!form.companyName) {
        errors.companyName = "Company name is required";
      } else if (form.companyName.length < 2) {
        errors.companyName = "Company name must be at least 2 characters";
      }

      // Contact Person Name validation
      if (!form.contactPersonName) {
        errors.contactPersonName = "Contact person name is required";
      } else if (form.contactPersonName.length < 2) {
        errors.contactPersonName = "Contact person name must be at least 2 characters";
      }

      // Company PAN validation
      if (!form.companyPanNumber) {
        errors.companyPanNumber = "Company PAN number is required";
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.companyPanNumber)) {
        errors.companyPanNumber = "Please enter a valid PAN number";
      }

      // GST Number validation
      if (!form.gstNumber) {
        errors.gstNumber = "GST number is required";
      } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber)) {
        errors.gstNumber = "Please enter a valid GST number";
      }
    }

    // Common validations for both buyer types
    // Address validation
    if (!form.residenceAddress) {
      errors.residenceAddress = form.buyer_type === "corporate" 
        ? "Office address is required" 
        : "Residence address is required";
    } else if (form.residenceAddress.length < 10) {
      errors.residenceAddress = "Please enter a complete address";
    }

    // Pincode validation
    if (!form.pincode) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    // City validation
    if (!form.city) {
      errors.city = "City is required";
    } else if (form.city.length < 2) {
      errors.city = "Please enter a valid city name";
    }

    // Alternate Phone validation (if provided)
    if (form.alternatePhone && !/^\d{10}$/.test(form.alternatePhone)) {
      errors.alternatePhone = "Alternate phone number must be 10 digits";
    }

    // Nominee validation (if any nominee field is filled)
    if (form.nomineeName || form.relation || form.nomineeAge) {
      if (!form.nomineeName) {
        errors.nomineeName = "Nominee name is required when adding nominee details";
      } else if (form.nomineeName.length < 2) {
        errors.nomineeName = "Nominee name must be at least 2 characters";
      }
      
      if (!form.relation) {
        errors.relation = "Nominee relation is required";
      }
      
      if (!form.nomineeAge) {
        errors.nomineeAge = "Nominee age is required";
      } else if (form.nomineeAge < 1 || form.nomineeAge > 130) {
        errors.nomineeAge = "Nominee age must be between 1 and 130 years";
      }
    }

    // Reference validation (if any reference field is filled)
    if (form.referenceName || form.referencePhone) {
      if (form.referenceName && form.referenceName.length < 2) {
        errors.referenceName = "Reference name must be at least 2 characters";
      }
      
      if (form.referencePhone && !/^\d{10}$/.test(form.referencePhone)) {
        errors.referencePhone = "Reference phone number must be 10 digits";
      }
    }

    return errors;
  },

  // Step 2: Vehicle Details validation
  validateStep2: (form) => {
    const errors = {};

    // City validation
    if (!form.regNo) {
      errors.city = "Registration Number is required";
    }

    // Vehicle Make validation
    if (!form.make) {
      errors.make = "Vehicle make is required";
    }

    // Vehicle Model validation
    if (!form.model) {
      errors.model = "Vehicle model is required";
    }

    // Vehicle Variant validation
    if (!form.variant) {
      errors.variant = "Vehicle variant is required";
    }

    // Engine Number validation
    if (!form.engineNo) {
      errors.engineNo = "Engine number is required";
    } else if (form.engineNo.length < 3) {
      errors.engineNo = "Please enter a valid engine number";
    }

    // Chassis Number validation
    if (!form.chassisNo) {
      errors.chassisNo = "Chassis number is required";
    } else if (form.chassisNo.length < 3) {
      errors.chassisNo = "Please enter a valid chassis number";
    }

    // Manufacture Date validation
    if (!form.makeMonth) {
      errors.makeMonth = "Manufacture month is required";
    }
    if (!form.makeYear) {
      errors.makeYear = "Manufacture year is required";
    } else if (form.makeYear) {
      const currentYear = new Date().getFullYear();
      const makeYear = parseInt(form.makeYear);
      if (makeYear < 1900 || makeYear > currentYear) {
        errors.makeYear = "Please enter a valid manufacture year";
      }
    }

    return errors;
  },

  // Step 3: Insurance Quotes validation
validateStep3: (form, acceptedQuote = null) => {
  const errors = {};

  // Primary validation: Require at least one insurance quote
  if (!form.insuranceQuotes || form.insuranceQuotes.length === 0) {
    errors.insuranceQuotes = "At least one insurance quote is required";
  }

  // CRITICAL: Require an accepted quote to proceed
  if (!acceptedQuote) {
    errors.acceptedQuote = "Please accept a quote to proceed to the next step";
  }

  // Optional: Validate individual quote fields if using old system
  if ((!form.insuranceQuotes || form.insuranceQuotes.length === 0) && !form.insurer) {
    if (!form.insurer) errors.insurer = "Insurance company is required";
    if (!form.coverageType) errors.coverageType = "Coverage type is required";
    if (!form.premium) {
      errors.premium = "Premium amount is required";
    } else if (parseFloat(form.premium) <= 0) {
      errors.premium = "Premium amount must be greater than 0";
    }
    if (!form.idv) {
      errors.idv = "IDV amount is required";
    } else if (parseFloat(form.idv) <= 0) {
      errors.idv = "IDV amount must be greater than 0";
    }
  }

  // NCB validation (applies to both systems)
  if (form.ncb && (parseFloat(form.ncb) < 0 || parseFloat(form.ncb) > 100)) {
    errors.ncb = "NCB discount must be between 0% and 100%";
  }

  return errors;
},

  // Step 4: New Policy Details validation
  validateStep4: (form) => {
    const errors = {};

    // Insurance Company validation
    if (!form.insuranceCompany) {
      errors.insuranceCompany = "Insurance company is required";
    }

    // Policy/Covernote Number validation (if policy is issued)
      if (!form.policyNumber) {
        errors.policyNumber = "Policy number is required";
    }

    // Issue Date validation (if provided)
    if (form.issueDate) {
      const issueDate = new Date(form.issueDate);
      const today = new Date();
    }

    // Due Date validation (if provided)
    if (form.policyStartDate && form.issueDate) {
      const policyStartDate = new Date(form.dueDate);
      
    }

    // NCB Discount validation (if provided)
    if (form.ncbDiscount && (parseFloat(form.ncbDiscount) < 0 || parseFloat(form.ncbDiscount) > 100)) {
      errors.ncbDiscount = "NCB discount must be between 0% and 100%";
    }

    // IDV Amount validation
    if (!form.idvAmount) {
      errors.idvAmount = "IDV amount is required";
    } else if (parseFloat(form.idvAmount) <= 0) {
      errors.idvAmount = "IDV amount must be greater than 0";
    }

    // Total Premium validation
    if (!form.totalPremium) {
      errors.totalPremium = "Total premium is required";
    } else if (parseFloat(form.totalPremium) <= 0) {
      errors.totalPremium = "Total premium must be greater than 0";
    }

    return errors;
  },

  // Step 5: Documents validation
  validateStep5: (form) => {
  const errors = {};

  // Check if documents exist and have at least one entry
  if (!form.documents || Object.keys(form.documents).length === 0) {
    errors.documents = "At least one document is required";
  }

  return errors;
},

  // Step 6: Payment validation
  validateStep6: (form) => {
    const errors = {};

    // Payment Made By validation
    if (!form.paymentMadeBy) {
      errors.paymentMadeBy = "Payment made by is required";
    }

    // Payment Mode validation
    if (!form.paymentMode) {
      errors.paymentMode = "Payment mode is required";
    }

    // Payment Amount validation
    if (!form.paymentAmount) {
      errors.paymentAmount = "Payment amount is required";
    } else if (parseFloat(form.paymentAmount) <= 0) {
      errors.paymentAmount = "Payment amount must be greater than 0";
    }

    // Payment Date validation
    if (!form.paymentDate) {
      errors.paymentDate = "Payment date is required";
    } else {
      const paymentDate = new Date(form.paymentDate);
      const today = new Date();
      
    }

    // Transaction ID validation
    if (!form.transactionId) {
      errors.transactionId = "Transaction ID is required";
    } else if (form.transactionId.length < 3) {
      errors.transactionId = "Please enter a valid transaction ID";
    }

    // Receipt Date validation
    if (!form.receiptDate) {
      errors.receiptDate = "Receipt date is required";
    } else if (form.paymentDate && form.receiptDate) {
      const receiptDate = new Date(form.receiptDate);
      const paymentDate = new Date(form.paymentDate);
      
      if (receiptDate < paymentDate) {
        errors.receiptDate = "Receipt date cannot be before payment date";
      }
    }

    // Bank Name validation
    if (!form.bankName) {
      errors.bankName = "Bank name is required";
    } else if (form.bankName.length < 2) {
      errors.bankName = "Please enter a valid bank name";
    }

    return errors;
  }
};

const steps = [
  "Case Details",
  "Vehicle Details",
  "Insurance Quotes",
  "Previous Policy",
  "New Policy Details",
  "Documents",
  "Payment",
  "Payout" 
];

const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1";

// ================== STEP 1: Case Details ==================
const CaseDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Relationship options for auto-suggest
  const relationshipOptions = [
    "Spouse", "Child", "Parent", "Sibling", "Grandparent", "Grandchild",
    "Uncle", "Aunt", "Nephew", "Niece", "Cousin", "Father-in-law",
    "Mother-in-law", "Brother-in-law", "Sister-in-law", "Son-in-law",
    "Daughter-in-law", "Step Father", "Step Mother", "Step Son",
    "Step Daughter", "Step Brother", "Step Sister", "Adopted Son",
    "Adopted Daughter", "Foster Child", "Legal Guardian", "Trust",
    "Friend", "Business Partner", "Employee", "Employer", "Other"
  ];

  // State for relationship suggestions
  const [relationshipSuggestions, setRelationshipSuggestions] = useState([]);
  const [showRelationshipSuggestions, setShowRelationshipSuggestions] = useState(false);

  // Handle relationship input change for auto-suggest
  const handleRelationshipChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value) {
      const filtered = relationshipOptions.filter(relation =>
        relation.toLowerCase().includes(value.toLowerCase())
      );
      setRelationshipSuggestions(filtered);
      setShowRelationshipSuggestions(true);
    } else {
      setRelationshipSuggestions([]);
      setShowRelationshipSuggestions(false);
    }
  };

  // Select relationship from suggestions
  const selectRelationship = (relation) => {
    handleChange({
      target: {
        name: 'relation',
        value: relation
      }
    });
    setShowRelationshipSuggestions(false);
    setRelationshipSuggestions([]);
  };

  // Handle vehicle type change (New Car / Used Car)
  const handleVehicleTypeChange = (vehicleType) => {
    handleChange({
      target: {
        name: 'vehicleType',
        value: vehicleType
      }
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaUser />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Step 1: Customer Information
            </h3>
            <p className="text-xs text-gray-500">
              Fill personal, contact and nominee details
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Buyer Type */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Buyer Type *
          </label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="buyer_type"
                value="individual"
                checked={form.buyer_type === "individual"}
                onChange={handleChange}
                className="form-radio"
              />
              <span>Individual</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="buyer_type"
                value="corporate"
                checked={form.buyer_type === "corporate"}
                onChange={handleChange}
                className="form-radio"
              />
              <span>Company</span>
            </label>
          </div>
          {errors.buyer_type && <p className="text-red-500 text-xs mt-1">{errors.buyer_type}</p>}
        </div>

        {/* Vehicle Type Toggle - Common for both Individual and Corporate */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Type *
          </label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="vehicleType"
                value="new"
                checked={form.vehicleType === "new"}
                onChange={() => handleVehicleTypeChange("new")}
                className="form-radio"
              />
              <span>New Car</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="vehicleType"
                value="used"
                checked={form.vehicleType === "used"}
                onChange={() => handleVehicleTypeChange("used")}
                className="form-radio"
              />
              <span>Used Car</span>
            </label>
          </div>
          {errors.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>}
          
          {/* Vehicle Type Tag Display */}
          {form.vehicleType && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                form.vehicleType === "new" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {form.vehicleType === "new" ? (
                  <>
                    <FaCar className="mr-1" /> New Vehicle
                  </>
                ) : (
                  <>
                    <FaHistory className="mr-1" /> Used Vehicle
                  </>
                )}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {form.vehicleType === "new" 
                  ? "Step 3 (Previous Policy) will be disabled for new vehicles" 
                  : "Step 3 (Previous Policy) will be required for used vehicles"}
              </p>
            </div>
          )}
        </div>

        {/* Individual Fields */}
        {form.buyer_type === "individual" && (
          <>
            {/* Employee Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Employee Name *
              </label>
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="employeeName"
                  value={form.employeeName || ""}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.employeeName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.employeeName && <p className="text-red-500 text-xs mt-1">{errors.employeeName}</p>}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Customer Name *
              </label>
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName || ""}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.customerName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Mobile Number *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 px-3 py-2 border border-gray-200 rounded-l-md bg-gray-50">
                  +91
                </span>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile || ""}
                  onChange={handleChange} 
                  maxLength = '10'
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full border rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* Alternate Phone Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Alternate Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 px-3 py-2 border border-gray-200 rounded-l-md bg-gray-50">
                  +91
                </span>
                <input
                  type="text"
                  name="alternatePhone"
                  value={form.alternatePhone || ""}
                  maxLength='10'
                  onChange={handleChange}
                  placeholder="Enter alternate number"
                  className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Email Address *
              </label>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-400 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Gender *
              </label>
              <select
                name="gender"
                value={form.gender || ""}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* PAN */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={form.panNumber || ""}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.panNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
            </div>

            {/* Aadhaar */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Aadhaar Number
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                value={form.aadhaarNumber || ""}
                onChange={handleChange}
                placeholder="1234 5678 9012"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.aadhaarNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
            </div>
          </>
        )}

        {/* Corporate Fields */}
        {form.buyer_type === "corporate" && (
          <>
            {/* Employee Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Employee Name *
              </label>
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="employeeName"
                  value={form.employeeName || ""}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.employeeName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.employeeName && <p className="text-red-500 text-xs mt-1">{errors.employeeName}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Company Name *
              </label>
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName || ""}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.companyName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Contact Person Name *
              </label>
              <input
                type="text"
                name="contactPersonName"
                value={form.contactPersonName || ""}
                onChange={handleChange}
                placeholder="Enter contact person name"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.contactPersonName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.contactPersonName && <p className="text-red-500 text-xs mt-1">{errors.contactPersonName}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Mobile Number *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 px-3 py-2 border border-gray-200 rounded-l-md bg-gray-50">
                  +91
                </span>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile || ""}
                  onChange={handleChange}
                  maxLength='10'
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full border rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* Alternate Phone Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Alternate Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 px-3 py-2 border border-gray-200 rounded-l-md bg-gray-50">
                  +91
                </span>
                <input
                  type="text"
                  name="alternatePhone"
                  value={form.alternatePhone || ""}
                  onChange={handleChange}
                  placeholder="Enter alternate number"
                  maxLength="10"
                  className="w-full border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Email Address *
              </label>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-400 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                  placeholder="Enter company email address"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* PAN Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                PAN Number *
              </label>
              <input
                type="text"
                name="companyPanNumber"
                value={form.companyPanNumber || ""}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.companyPanNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.companyPanNumber && <p className="text-red-500 text-xs mt-1">{errors.companyPanNumber}</p>}
            </div>

            {/* GST Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                GST Number *
              </label>
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber || ""}
                onChange={handleChange}
                placeholder="Enter GST number"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.gstNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.gstNumber && <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>}
            </div>
          </>
        )}

        {/* Address Fields (Common for both) */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            {form.buyer_type === "corporate" ? "Office Address *" : "Residence Address *"}
          </label>
          <input
            type="text"
            name="residenceAddress"
            value={form.residenceAddress || ""}
            onChange={handleChange}
            placeholder={form.buyer_type === "corporate" ? "Enter complete office address" : "Enter complete address"}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.residenceAddress ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.residenceAddress && <p className="text-red-500 text-xs mt-1">{errors.residenceAddress}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={form.pincode || ""}
            onChange={handleChange}
            placeholder="123456"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.pincode ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={form.city || ""}
            onChange={handleChange}
            placeholder="Enter city"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        {/* Nominee Info (Common for both, optional) */}
        <div className="md:col-span-2">
          <h4 className="text-md font-semibold mt-6">Nominee Information (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Nominee Name
              </label>
              <input
                type="text"
                name="nomineeName"
                value={form.nomineeName || ""}
                onChange={handleChange}
                placeholder="Nominee Name"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.nomineeName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nomineeName && <p className="text-red-500 text-xs mt-1">{errors.nomineeName}</p>}
            </div>
            
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Relationship
              </label>
              <input
                type="text"
                name="relation"
                value={form.relation || ""}
                onChange={handleRelationshipChange}
                onFocus={() => {
                  if (form.relation) {
                    const filtered = relationshipOptions.filter(relation =>
                      relation.toLowerCase().includes(form.relation.toLowerCase())
                    );
                    setRelationshipSuggestions(filtered);
                    setShowRelationshipSuggestions(true);
                  } else {
                    setRelationshipSuggestions(relationshipOptions);
                    setShowRelationshipSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowRelationshipSuggestions(false), 200);
                }}
                placeholder="Type relationship"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.relation ? "border-red-500" : "border-gray-300"
                }`}
              />
              
              {/* Relationship Suggestions Dropdown */}
              {showRelationshipSuggestions && relationshipSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {relationshipSuggestions.map((relation, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => selectRelationship(relation)}
                    >
                      {relation}
                    </div>
                  ))}
                </div>
              )}
              
              {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation}</p>}
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Nominee Age
              </label>
              <input
                type="number"
                name="nomineeAge"
                value={form.nomineeAge || ""}
                onChange={handleChange}
                placeholder="Nominee Age"
                min="1"
                max="130"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.nomineeAge ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nomineeAge && <p className="text-red-500 text-xs mt-1">{errors.nomineeAge}</p>}
            </div>
          </div>
        </div>

        {/* Reference Info */}
        <div className="md:col-span-2">
          <h4 className="text-md font-semibold mt-6">Reference Information (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Reference Name
              </label>
              <input
                type="text"
                name="referenceName"
                value={form.referenceName || ""}
                onChange={handleChange}
                placeholder="Reference Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Reference Phone Number
              </label>
              <input
                type="text"
                name="referencePhone"
                value={form.referencePhone || ""}
                onChange={handleChange}
                placeholder="Reference Phone Number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Type Summary */}
        {form.vehicleType && (
          <div className="md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Vehicle Type Summary</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  form.vehicleType === "new" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                }`}>
                  {form.vehicleType === "new" ? <FaCar /> : <FaHistory />}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {form.vehicleType === "new" ? "New Vehicle" : "Used Vehicle"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {form.vehicleType === "new" 
                      ? "Previous policy details will not be required" 
                      : "Previous policy details will be required in Step 3"}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                form.vehicleType === "new" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {form.vehicleType === "new" ? "NEW" : "USED"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ================== STEP 2: Vehicle Details ==================
const VehicleDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Vehicle make options for auto-suggest
  const vehicleMakes = [
    "Maruti Suzuki", "Hyundai", "Honda", "Tata", "Mahindra", "Toyota",
    "Kia", "Volkswagen", "Skoda", "Renault", "Ford", "MG Motor",
    "Nissan", "BMW", "Mercedes-Benz", "Audi", "Volvo", "Jeep",
    "Land Rover", "Jaguar", "Porsche", "Fiat", "Chevrolet", "Mitsubishi",
    "Force Motors", "Isuzu", "Lexus", "Mini", "Citroen", "Peugeot"
  ];

  // State for vehicle make suggestions
  const [vehicleMakeSuggestions, setVehicleMakeSuggestions] = useState([]);
  const [showVehicleMakeSuggestions, setShowVehicleMakeSuggestions] = useState(false);

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
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Registration Number *
          </label>
          <input
            type="text"
            name="regNo"
            value={form.regNo || ""}
            onChange={handleChange}
            placeholder="Enter Vehicle Number"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
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

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Vehicle Model *
          </label>
          <input
            type="text"
            name="model"
            value={form.model || ""}
            onChange={handleChange}
            placeholder="Select model"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.model ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
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
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.engineNo ? "border-red-500" : "border-gray-300"
            }`}
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
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.chassisNo ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.chassisNo && <p className="text-red-500 text-xs mt-1">{errors.chassisNo}</p>}
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
            will be verified during policy issuance.
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== STEP 3: Previous Policy Details ==================
const PreviousPolicyDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Insurance companies options with more companies
  const insuranceCompanies = [
    "ICICI Lombard", "HDFC Ergo", "Bajaj Allianz", "New India Assurance", 
    "United India", "National Insurance", "Oriental Insurance", "Tata AIG",
    "Reliance General", "Cholamandalam", "SBI General", "Royal Sundaram",
    "Go Digit", "Acko", "Liberty General", "Future Generali", "IFFCO Tokio",
    "Shriram General", "Edelweiss General", "Kotak General", "Magma HDI",
    "Raheja QBE", "Universal Sompo", "Bharti AXA", "Aditya Birla Health"
  ];

  // NCB options
  const ncbOptions = [0, 20, 25, 35, 45, 50];

  // Policy duration options based on vehicle type
  const getPolicyDurations = (vehicleType) => {
    if (vehicleType === "new") {
      return ["1yr OD + 3yr TP", "2yr OD + 2yr TP", "3yr OD + 3yr TP"];
    } else {
      return ["1 Year"]; // Used cars get only 1 year option
    }
  };

  const policyDurations = getPolicyDurations(form.vehicleType);

  // State for auto-suggest
  const [insuranceCompanySuggestions, setInsuranceCompanySuggestions] = useState([]);
  const [showInsuranceCompanySuggestions, setShowInsuranceCompanySuggestions] = useState(false);
  
  const [ncbSuggestions, setNcbSuggestions] = useState([]);
  const [showNcbSuggestions, setShowNcbSuggestions] = useState(false);
  
  const [durationSuggestions, setDurationSuggestions] = useState([]);
  const [showDurationSuggestions, setShowDurationSuggestions] = useState(false);

  // Calculate min date for policy start (cannot be before issue date)
  const getMinPolicyStartDate = () => {
    return form.previousIssueDate || ''; // If issue date exists, use it as min
  };

  // Calculate policy end date: start date + duration - 1 day
  const calculatePolicyEndDate = (startDate, duration) => {
    if (!startDate || !duration) return '';
    
    const durationYears = parseInt(duration.match(/\d+/)?.[0]) || 1;
    const start = new Date(startDate);
    const end = new Date(start);
    
    // Add years and subtract 1 day
    end.setFullYear(start.getFullYear() + durationYears);
    end.setDate(end.getDate() - 1);
    
    return end.toISOString().split('T')[0];
  };

  // Handle issue date change
  const handleIssueDateChange = (e) => {
    const issueDate = e.target.value;
    handleChange(e);
    
    // If policy start date exists and is before the new issue date, reset it
    if (form.previousPolicyStartDate && issueDate) {
      const startDate = new Date(form.previousPolicyStartDate);
      const newIssueDate = new Date(issueDate);
      
      if (startDate < newIssueDate) {
        handleChange({
          target: {
            name: 'previousPolicyStartDate',
            value: issueDate // Set start date to issue date
          }
        });
        
        // Also recalculate end date if duration exists
        if (form.previousPolicyDuration) {
          const newEndDate = calculatePolicyEndDate(issueDate, form.previousPolicyDuration);
          handleChange({
            target: {
              name: 'previousPolicyEndDate',
              value: newEndDate
            }
          });
        }
      }
    }
  };

  // Handle policy start date change and auto-calculate end date
  const handlePolicyStartDateChange = (e) => {
    const startDate = e.target.value;
    const issueDate = form.previousIssueDate;
    
    // Validate: Start date cannot be before issue date
    if (issueDate && startDate) {
      const start = new Date(startDate);
      const issue = new Date(issueDate);
      
      if (start < issue) {
        // Show error and don't update
        alert("Policy start date cannot be before issue date!");
        return;
      }
    }
    
    handleChange(e);
    
    // If duration is selected, auto-calculate end date
    if (startDate && form.previousPolicyDuration) {
      const endDate = calculatePolicyEndDate(startDate, form.previousPolicyDuration);
      
      handleChange({
        target: {
          name: 'previousPolicyEndDate',
          value: endDate
        }
      });
    }
  };

  // Handle duration change and auto-calculate end date
  const handleDurationChange = (duration) => {
    handleChange({
      target: {
        name: 'previousPolicyDuration',
        value: duration
      }
    });

    // If start date exists, auto-calculate end date
    if (form.previousPolicyStartDate) {
      const endDate = calculatePolicyEndDate(form.previousPolicyStartDate, duration);
      
      handleChange({
        target: {
          name: 'previousPolicyEndDate',
          value: endDate
        }
      });
    }
  };

  // Auto-suggest handlers for insurance company
  const handleInsuranceCompanyChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value) {
      const filtered = insuranceCompanies.filter(company =>
        company.toLowerCase().includes(value.toLowerCase())
      );
      setInsuranceCompanySuggestions(filtered);
      setShowInsuranceCompanySuggestions(true);
    } else {
      setShowInsuranceCompanySuggestions(false);
    }
  };

  // Auto-suggest handlers for NCB
  const handleNcbChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value) {
      const filtered = ncbOptions.filter(ncb =>
        ncb.toString().includes(value)
      );
      setNcbSuggestions(filtered);
      setShowNcbSuggestions(true);
    } else {
      setShowNcbSuggestions(false);
    }
  };

  // Auto-suggest handlers for duration
  const handleDurationInputChange = (e) => {
    const value = e.target.value;
    
    if (value) {
      const filtered = policyDurations.filter(duration =>
        duration.toLowerCase().includes(value.toLowerCase())
      );
      setDurationSuggestions(filtered);
      setShowDurationSuggestions(true);
    } else {
      setShowDurationSuggestions(false);
    }
  };

  // Select from suggestions
  const selectInsuranceCompany = (company) => {
    handleChange({
      target: {
        name: 'previousInsuranceCompany',
        value: company
      }
    });
    setShowInsuranceCompanySuggestions(false);
  };

  const selectNcb = (ncb) => {
    handleChange({
      target: {
        name: 'previousNcbDiscount',
        value: ncb.toString()
      }
    });
    setShowNcbSuggestions(false);
  };

  const selectDuration = (duration) => {
    handleDurationChange(duration);
    setShowDurationSuggestions(false);
  };

  // Example calculation display
  const getExampleText = () => {
    if (form.previousPolicyStartDate && form.previousPolicyDuration) {
      const durationYears = parseInt(form.previousPolicyDuration.match(/\d+/)?.[0]) || 1;
      const startDate = new Date(form.previousPolicyStartDate);
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + durationYears);
      endDate.setDate(endDate.getDate() - 1);
      
      return `Example: ${startDate.toLocaleDateString()} + ${durationYears} Year(s) - 1 Day = ${endDate.toLocaleDateString()}`;
    }
    return "Policy end date is calculated as: Start Date + Duration - 1 Day";
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Step 3: Previous Policy Details
            </h3>
            <p className="text-xs text-gray-500">
              For renewal cases & policy already expired cases
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Type Info Banner */}
      {form.vehicleType && (
        <div className={`mb-6 p-4 rounded-lg border ${
          form.vehicleType === "new" 
            ? "bg-green-50 border-green-200" 
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {form.vehicleType === "new" ? (
                <FaCar className="w-5 h-5 text-green-600" />
              ) : (
                <FaHistory className="w-5 h-5 text-blue-600" />
              )}
              <div>
                <h4 className="font-semibold text-gray-800">
                  {form.vehicleType === "new" ? "New Vehicle" : "Used Vehicle"}
                </h4>
                <p className="text-sm text-gray-600">
                  {form.vehicleType === "new" 
                    ? "Available policy durations: 1yr OD + 3yr TP, 2yr OD + 2yr TP, 3yr OD + 3yr TP"
                    : "Policy duration: 1 Year (default for used vehicles)"
                  }
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              form.vehicleType === "new" 
                ? "bg-green-100 text-green-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {form.vehicleType === "new" ? "NEW" : "USED"}
            </span>
          </div>
        </div>
      )}

      {/* Date Calculation Info */}
      {/* <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">Date Calculation Rules</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>Issue Date</strong>: Can be any date (past or future)</li>
              <li>• <strong>Policy Start Date</strong>: Cannot be before Issue Date</li>
              <li>• <strong>Policy End Date</strong>: Start Date + Duration - 1 Day</li>
              <li className="text-xs text-purple-600 mt-2">{getExampleText()}</li>
            </ul>
          </div>
        </div>
      </div> */}

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Previous Policy Information (All Fields Mandatory)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Company - Auto-suggest */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Insurance Company *
            </label>
            <div className="relative">
              <input
                type="text"
                name="previousInsuranceCompany"
                value={form.previousInsuranceCompany || ""}
                onChange={handleInsuranceCompanyChange}
                onFocus={() => {
                  if (form.previousInsuranceCompany) {
                    const filtered = insuranceCompanies.filter(company =>
                      company.toLowerCase().includes(form.previousInsuranceCompany.toLowerCase())
                    );
                    setInsuranceCompanySuggestions(filtered);
                  } else {
                    setInsuranceCompanySuggestions(insuranceCompanies);
                  }
                  setShowInsuranceCompanySuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowInsuranceCompanySuggestions(false), 200);
                }}
                placeholder="Type insurance company"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.previousInsuranceCompany ? "border-red-500" : "border-gray-300"
                }`}
              />
              
              {showInsuranceCompanySuggestions && insuranceCompanySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {insuranceCompanySuggestions.map((company, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => selectInsuranceCompany(company)}
                    >
                      {company}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.previousInsuranceCompany && <p className="text-red-500 text-xs mt-1">{errors.previousInsuranceCompany}</p>}
          </div>

          {/* Policy Number */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Number *
            </label>
            <input
              type="text"
              name="previousPolicyNumber"
              value={form.previousPolicyNumber || ""}
              onChange={handleChange}
              placeholder="Enter previous policy number"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousPolicyNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousPolicyNumber && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyNumber}</p>}
          </div>

          {/* Policy Type */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Type *
            </label>
            <select
              name="previousPolicyType"
              value={form.previousPolicyType || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousPolicyType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select policy type</option>
              <option value="comprehensive">Comprehensive</option>
              <option value="thirdParty">Third Party</option>
            </select>
            {errors.previousPolicyType && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyType}</p>}
          </div>

          {/* Issue Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Issue Date *
            </label>
            <input
              type="date"
              name="previousIssueDate"
              value={form.previousIssueDate || ""}
              onChange={handleIssueDateChange}
              // No max restriction - can be future date
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousIssueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousIssueDate && <p className="text-red-500 text-xs mt-1">{errors.previousIssueDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              The date when policy was issued (can be past or future date)
            </p>
          </div>

          {/* Policy Start Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Start Date *
            </label>
            <input
              type="date"
              name="previousPolicyStartDate"
              value={form.previousPolicyStartDate || ""}
              onChange={handlePolicyStartDateChange}
              min={getMinPolicyStartDate()} // Cannot be before issue date
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousPolicyStartDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousPolicyStartDate && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyStartDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {form.previousIssueDate 
                ? `Cannot be before ${new Date(form.previousIssueDate).toLocaleDateString()}`
                : "Policy coverage start date"
              }
            </p>
          </div>

          {/* Policy Duration - Auto-suggest */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Duration *
            </label>
            <div className="relative">
              <input
                type="text"
                name="previousPolicyDuration"
                value={form.previousPolicyDuration || ""}
                onChange={handleDurationInputChange}
                onFocus={() => {
                  setDurationSuggestions(policyDurations);
                  setShowDurationSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowDurationSuggestions(false), 200);
                }}
                placeholder={
                  form.vehicleType === "new" 
                    ? "Type duration (e.g., 1yr OD + 3yr TP)" 
                    : "1 Year (default for used vehicles)"
                }
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.previousPolicyDuration ? "border-red-500" : "border-gray-300"
                }`}
                readOnly={form.vehicleType === "used"} // Read-only for used cars
              />
              
              {showDurationSuggestions && durationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {durationSuggestions.map((duration, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => selectDuration(duration)}
                    >
                      {duration}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.previousPolicyDuration && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyDuration}</p>}
            
            {/* Auto-set duration for used cars */}
            {form.vehicleType === "used" && !form.previousPolicyDuration && (
              <button
                type="button"
                onClick={() => handleDurationChange("1 Year")}
                className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
              >
                Set to 1 Year (Used Car Default)
              </button>
            )}
          </div>

          {/* Policy End Date (Auto-calculated) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy End Date *
            </label>
            <input
              type="date"
              name="previousPolicyEndDate"
              value={form.previousPolicyEndDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousPolicyEndDate ? "border-red-500" : "border-gray-300"
              }`}
              readOnly
            />
            {errors.previousPolicyEndDate && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyEndDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated: Start Date + Duration - 1 Day
              {form.previousPolicyStartDate && form.previousPolicyDuration && (
                <span className="text-green-600 font-medium">
                  {" "}✓ Calculated
                </span>
              )}
            </p>
          </div>

          {/* Claim Taken Last Year */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Claim Taken Last Year *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="previousClaimTaken"
                  value="yes"
                  checked={form.previousClaimTaken === "yes"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="previousClaimTaken"
                  value="no"
                  checked={form.previousClaimTaken === "no"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                No
              </label>
            </div>
            {errors.previousClaimTaken && <p className="text-red-500 text-xs mt-1">{errors.previousClaimTaken}</p>}
          </div>

          {/* NCB Discount - Auto-suggest */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              NCB Discount (%) *
            </label>
            <div className="relative">
              <input
                type="text"
                name="previousNcbDiscount"
                value={form.previousNcbDiscount || ""}
                onChange={handleNcbChange}
                onFocus={() => {
                  setNcbSuggestions(ncbOptions);
                  setShowNcbSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowNcbSuggestions(false), 200);
                }}
                placeholder="Type NCB percentage"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.previousNcbDiscount ? "border-red-500" : "border-gray-300"
                }`}
              />
              
              {showNcbSuggestions && ncbSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {ncbSuggestions.map((ncb, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => selectNcb(ncb)}
                    >
                      {ncb}%
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.previousNcbDiscount && <p className="text-red-500 text-xs mt-1">{errors.previousNcbDiscount}</p>}
          </div>
        </div>

        {/* Real-time Calculation Example */}
        {/* {form.previousPolicyStartDate && form.previousPolicyDuration && form.previousPolicyEndDate && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <FaCalculator className="w-4 h-4" />
              <span className="font-semibold">Calculation Verified:</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {form.previousPolicyStartDate} + {form.previousPolicyDuration} - 1 Day = {form.previousPolicyEndDate}
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
};

// Updated validation function
// Add this validation function before the main component
const previousPolicyValidation = (form) => {
  const errors = {};

  if (!form.previousInsuranceCompany) {
    errors.previousInsuranceCompany = "Previous insurance company is required";
  }

  if (!form.previousPolicyNumber) {
    errors.previousPolicyNumber = "Previous policy number is required";
  }

  if (!form.previousPolicyType) {
    errors.previousPolicyType = "Previous policy type is required";
  }

  if (!form.previousIssueDate) {
    errors.previousIssueDate = "Previous issue date is required";
  }

  if (!form.previousPolicyStartDate) {
    errors.previousPolicyStartDate = "Previous policy start date is required";
  }

  if (!form.previousPolicyDuration) {
    errors.previousPolicyDuration = "Previous policy duration is required";
  }

  if (!form.previousPolicyEndDate) {
    errors.previousPolicyEndDate = "Previous policy end date is required";
  }

  if (!form.previousClaimTaken) {
    errors.previousClaimTaken = "Claim history is required";
  }

  if (!form.previousNcbDiscount) {
    errors.previousNcbDiscount = "Previous NCB discount is required";
  } else if (parseFloat(form.previousNcbDiscount) < 0 || parseFloat(form.previousNcbDiscount) > 100) {
    errors.previousNcbDiscount = "NCB discount must be between 0% and 100%";
  }

  return errors;
};
// ================== STEP 4: Insurance Quotes ==================
const InsuranceQuotes = ({ form, handleChange, handleSave, isSaving, errors, onInsuranceQuotesUpdate, onQuoteAccepted, isEditMode = false }) => {
  // Use quotes from form props with localStorage fallback
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isCoverageSuggestionsOpen, setIsCoverageSuggestionsOpen] = useState(false);
  const [quotes, setQuotes] = useState(() => {
    try {
      // Priority 1: Quotes from form (for edit mode)
      if (form.insuranceQuotes && form.insuranceQuotes.length > 0) {
        console.log("🔄 Loading quotes from form:", form.insuranceQuotes.length);
        return form.insuranceQuotes;
      }
      // Priority 2: Quotes from localStorage (for new cases)
      const savedQuotes = localStorage.getItem('insuranceQuotes');
      return savedQuotes ? JSON.parse(savedQuotes) : [];
    } catch (error) {
      console.error('Error loading quotes:', error);
      return [];
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [expandedQuotes, setExpandedQuotes] = useState([]);
  const [acceptedQuote, setAcceptedQuote] = useState(null);
  
  // Determine NCB eligibility based on previous claim
  const isNcbEligible = form.previousClaimTaken !== "yes";
  
  // Set default NCB value based on claim status
  const getDefaultNcb = () => {
    if (!isNcbEligible) {
      return "0"; // 0% if claim was taken
    }
    return "25"; // 25% default if no claim
  };

  // Policy duration options based on vehicle type - FIXED TO SHOW CORRECT LABELS
  const getPolicyDurationOptions = (vehicleType) => {
    if (vehicleType === "new") {
      return [
        { value: "1yr OD + 3yr TP", label: "1yr OD + 3yr TP" },
        { value: "2yr OD + 3yr TP", label: "2yr OD + 3yr TP" },
        { value: "3yr OD + 3yr TP", label: "3yr OD + 3yr TP" },
      ];
    } else {
      return [
        { value: "1", label: "1 Year" }
      ]; // Only 1 year for used cars
    }
  };

  const policyDurationOptions = getPolicyDurationOptions(form.vehicleType);

  // Set default policy duration based on vehicle type
  const getDefaultPolicyDuration = () => {
    return form.vehicleType === "new" ? "1yr OD + 3yr TP" : "1";
  };

  const [manualQuote, setManualQuote] = useState({
    insuranceCompany: '',
    coverageType: 'comprehensive',
    idv: '',
    policyDuration: getDefaultPolicyDuration(),
    ncbDiscount: getDefaultNcb(),
    odAmount: '0', // Default to 0
    thirdPartyAmount: '0', // Default to 0
    addOnsAmount: '0', // Default to 0
    premium: '',
    addOns: {
      zeroDep: { selected: false, amount: '0', rate: '0' },
      consumables: { selected: false, amount: '0', rate: '0' },
      roadSideAssist: { selected: false, amount: '0', rate: '0' },
      keyReplacement: { selected: false, amount: '0', rate: '0' },
      engineProtect: { selected: false, amount: '0', rate: '0' },
      returnToInvoice: { selected: false, amount: '0', rate: '0' },
      personalAccident: { selected: false, amount: '0', rate: '0' },
      tyreProtection: { selected: false, amount: '0', rate: '0' },
      emergencyMedical: { selected: false, amount: '0', rate: '0' }
    }
  });

  // Update policy duration options when vehicle type changes
  useEffect(() => {
    const newOptions = getPolicyDurationOptions(form.vehicleType);
    
    // If current policy duration is not available for the new vehicle type, reset to default
    if (!newOptions.find(option => option.value === manualQuote.policyDuration)) {
      setManualQuote(prev => ({
        ...prev,
        policyDuration: getDefaultPolicyDuration()
      }));
    }
  }, [form.vehicleType]);

  // ============ CALCULATION FUNCTIONS ============

  // Calculate NCB discount amount (on OD amount only)
  const calculateNcbDiscount = () => {
    const odAmount = parseFloat(manualQuote.odAmount || 0) || 0;
    const ncbDiscount = parseFloat(manualQuote.ncbDiscount || 0) || 0;
    return Math.round(odAmount * (ncbDiscount / 100));
  };

  // Calculate OD amount after NCB discount
  const calculateOdAfterNcb = () => {
    const odAmount = parseFloat(manualQuote.odAmount || 0) || 0;
    const ncbDiscountAmount = calculateNcbDiscount();
    return odAmount - ncbDiscountAmount;
  };

  // Calculate add-ons total - Only includes add-ons with amount > 0 in calculation
  const calculateAddOnsTotal = () => {
    const individualAddOnsTotal = Object.entries(manualQuote.addOns).reduce((total, [key, addOn]) => {
      if (addOn.selected && parseFloat(addOn.amount || 0) > 0) {
        const amount = parseFloat(addOn.amount || 0) || 0;
        return total + amount;
      }
      return total;
    }, 0);
    
    const singleAddOnsAmount = parseFloat(manualQuote.addOnsAmount || 0) || 0;
    
    return individualAddOnsTotal + singleAddOnsAmount;
  };

  // Get included add-ons (selected but with 0 amount) for display
  const getIncludedAddOns = () => {
    return Object.entries(manualQuote.addOns)
      .filter(([key, addOn]) => addOn.selected && parseFloat(addOn.amount || 0) === 0)
      .map(([key, addOn]) => addOnDescriptions[key]);
  };

  // Calculate total premium with GST as (odAmountAfterNcb + thirdPartyAmount + addOnsTotal) + 18% GST
  const calculateTotalPremium = () => {
    const odAmountAfterNcb = calculateOdAfterNcb();
    const thirdPartyAmount = parseFloat(manualQuote.thirdPartyAmount || 0) || 0;
    const addOnsTotal = calculateAddOnsTotal();
    
    const baseAmount = odAmountAfterNcb + thirdPartyAmount + addOnsTotal;
    const gstAmount = baseAmount * 0.18;
    const totalWithGst = baseAmount + gstAmount;
    
    return Math.round(totalWithGst);
  };

  // Calculate base premium without GST for display
  const calculateBasePremium = () => {
    const odAmount = parseFloat(manualQuote.odAmount || 0) || 0;
    const thirdPartyAmount = parseFloat(manualQuote.thirdPartyAmount || 0) || 0;
    const addOnsTotal = calculateAddOnsTotal();
    
    return odAmount + thirdPartyAmount + addOnsTotal;
  };

  // Calculate GST amount for display
  const calculateGstAmount = () => {
    const odAmountAfterNcb = calculateOdAfterNcb();
    const thirdPartyAmount = parseFloat(manualQuote.thirdPartyAmount || 0) || 0;
    const addOnsTotal = calculateAddOnsTotal();
    const taxableAmount = odAmountAfterNcb + thirdPartyAmount + addOnsTotal;
    return taxableAmount * 0.18;
  };

  // Calculate current totals for display
  const currentBasePremium = calculateBasePremium();
  const currentGstAmount = calculateGstAmount();
  const currentTotalPremium = calculateTotalPremium();
  const currentAddOnsTotal = calculateAddOnsTotal();
  const currentNcbDiscountAmount = calculateNcbDiscount();
  const currentOdAfterNcb = calculateOdAfterNcb();

  // ============ END CALCULATION FUNCTIONS ============

  // Load accepted quote in edit mode
  useEffect(() => {
    if (isEditMode && quotes.length > 0 && !acceptedQuote) {
      // Strategy 1: Look for quote with accepted flag
      let previouslyAcceptedQuote = quotes.find(quote => quote.accepted === true);
      
      // Strategy 2: If no accepted flag, use the first quote (fallback)
      if (!previouslyAcceptedQuote && quotes.length > 0) {
        previouslyAcceptedQuote = quotes[0];
        console.log("🔄 No accepted flag found, using first quote as fallback");
      }
      
      if (previouslyAcceptedQuote) {
        console.log("🔄 Loading accepted quote in edit mode:", previouslyAcceptedQuote.insuranceCompany);
        setAcceptedQuote(previouslyAcceptedQuote);
        
        // Notify parent component
        if (onQuoteAccepted) {
          onQuoteAccepted(previouslyAcceptedQuote);
        }
      }
    }
  }, [isEditMode, quotes, acceptedQuote, onQuoteAccepted]);

  // Function to accept a quote for policy creation
  const acceptQuote = (quote) => {
    setAcceptedQuote(quote);
    console.log("✅ Quote accepted:", quote.insuranceCompany, "Premium: ₹" + quote.totalPremium);
    
    // Call callback to inform parent component
    if (onQuoteAccepted) {
      onQuoteAccepted(quote);
    }
  };

  // Function to unaccept quote
  const unacceptQuote = () => {
    setAcceptedQuote(null);
    console.log("❌ Quote unaccepted");
    
    // Call callback to inform parent component
    if (onQuoteAccepted) {
      onQuoteAccepted(null);
    }
  };

  // Update manualQuote when claim status changes
  useEffect(() => {
    setManualQuote(prev => ({
      ...prev,
      ncbDiscount: getDefaultNcb()
    }));
  }, [form.previousClaimTaken]);

  // Save quotes to localStorage AND sync with parent form
  useEffect(() => {
    try {
      localStorage.setItem('insuranceQuotes', JSON.stringify(quotes));
      console.log("💾 Saved quotes to localStorage:", quotes.length);
    } catch (error) {
      console.error('Error saving quotes to localStorage:', error);
    }
  }, [quotes]);

  // Sync quotes with parent form whenever quotes change
  useEffect(() => {
    if (onInsuranceQuotesUpdate) {
      const currentQuotes = quotes || [];
      const formQuotes = form.insuranceQuotes || [];
      
      if (JSON.stringify(currentQuotes) !== JSON.stringify(formQuotes)) {
        console.log("🔄 Syncing quotes to parent:", quotes.length);
        onInsuranceQuotesUpdate(quotes);
      }
    }
  }, [quotes, onInsuranceQuotesUpdate, form.insuranceQuotes]);

  // Sync with form.insuranceQuotes when they change externally (edit mode)
  useEffect(() => {
    if (form.insuranceQuotes && JSON.stringify(form.insuranceQuotes) !== JSON.stringify(quotes)) {
      console.log("🔄 External quotes update detected:", form.insuranceQuotes.length);
      setQuotes(form.insuranceQuotes);
    }
  }, [form.insuranceQuotes]);

  // Insurance companies with real image paths and colors
  const insuranceCompanies = [
    { 
      name: "ICICI Lombard", 
      logo: icici,
      fallbackLogo: "🏦",
      color: "#FF6B35",
      bgColor: "#FFF0EB"
    },
    { 
      name: "HDFC Ergo", 
      logo: hdfc,
      fallbackLogo: "🏛️",
      color: "#2E8B57",
      bgColor: "#F0FFF0"
    },
    { 
      name: "Bajaj Allianz", 
      logo: bajaj,
      fallbackLogo: "🛡️",
      color: "#0056B3",
      bgColor: "#F0F8FF"
    },
    { 
      name: "New India Assurance", 
      logo: indiau,
      fallbackLogo: "🇮🇳",
      color: "#FF8C00",
      bgColor: "#FFF8F0"
    },
    { 
      name: "United India", 
      logo: uindia,
      fallbackLogo: "🤝",
      color: "#8B4513",
      bgColor: "#FFF8F0"
    },
    { 
      name: "National Insurance", 
      logo: nis,
      fallbackLogo: "🏢",
      color: "#228B22",
      bgColor: "#F0FFF0"
    },
    { 
      name: "Oriental Insurance", 
      logo: orient,
      fallbackLogo: "🌅",
      color: "#DC143C",
      bgColor: "#FFF0F5"
    },
    { 
      name: "Tata AIG", 
      logo: tata,
      fallbackLogo: "🚗",
      color: "#0066CC",
      bgColor: "#F0F8FF"
    },
    { 
      name: "Reliance General", 
      logo: reliance,
      fallbackLogo: "⚡",
      color: "#FF4500",
      bgColor: "#FFF0EB"
    },
    { 
      name: "Cholamandalam", 
      logo: chola,
      fallbackLogo: "💎",
      color: "#800080",
      bgColor: "#F8F0FF"
    }
  ];

  // Add-on descriptions only (no fixed rates)
  const addOnDescriptions = {
    zeroDep: "Zero Depreciation Cover",
    consumables: "Consumables Cover",
    roadSideAssist: "Road Side Assistance",
    keyReplacement: "Key & Lock Replacement",
    engineProtect: "Engine Protect",
    returnToInvoice: "Return to Invoice",
    personalAccident: "Personal Accident Cover",
    tyreProtection: "Tyre Protection",
    emergencyMedical: "Emergency Medical"
  };

  // NCB options
  const ncbOptions = [0, 20, 25, 35, 45, 50];

  // Handle manual quote input changes - PROPERLY HANDLES EMPTY VALUES
  const handleManualQuoteChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent NCB changes if not eligible
    if (name === "ncbDiscount" && !isNcbEligible) {
      return;
    }
    
    // Handle empty values for numeric fields - convert empty to "0"
    let processedValue = value;
    if (['odAmount', 'thirdPartyAmount', 'addOnsAmount', 'idv'].includes(name)) {
      processedValue = value === '' ? '0' : value;
    }
    
    setManualQuote(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Handle add-on changes
  const handleAddOnChange = (addOnKey, field, value) => {
    setManualQuote(prev => {
      const updatedAddOns = { ...prev.addOns };
      
      if (field === 'selected') {
        updatedAddOns[addOnKey] = {
          ...updatedAddOns[addOnKey],
          selected: value,
          // Keep existing amount and rate when toggling selection
          amount: updatedAddOns[addOnKey].amount || '0',
          rate: updatedAddOns[addOnKey].rate || '0'
        };
      } else {
        // For amount/rate changes, ensure we have a value (default to '0' if empty)
        const safeValue = value === '' ? '0' : value;
        updatedAddOns[addOnKey] = {
          ...updatedAddOns[addOnKey],
          [field]: safeValue
        };
      }

      return {
        ...prev,
        addOns: updatedAddOns
      };
    });
  };

  // Select all add-ons with 0 amount
  const selectAllAddOns = () => {
    setManualQuote(prev => {
      const updatedAddOns = { ...prev.addOns };
      Object.keys(updatedAddOns).forEach(key => {
        updatedAddOns[key] = {
          ...updatedAddOns[key],
          selected: true,
          amount: '0' // Set all to 0 amount when selecting all
        };
      });
      return {
        ...prev,
        addOns: updatedAddOns
      };
    });
  };

  // Deselect all add-ons
  const deselectAllAddOns = () => {
    setManualQuote(prev => {
      const updatedAddOns = { ...prev.addOns };
      Object.keys(updatedAddOns).forEach(key => {
        updatedAddOns[key] = {
          ...updatedAddOns[key],
          selected: false,
          amount: '0'
        };
      });
      return {
        ...prev,
        addOns: updatedAddOns
      };
    });
  };

  // Add manual quote - HANDLES EMPTY VALUES PROPERLY
  const addManualQuote = () => {
    console.log("🔍 Add Quote Button Clicked - Current Values:", {
      insuranceCompany: manualQuote.insuranceCompany,
      coverageType: manualQuote.coverageType,
      idv: manualQuote.idv,
      odAmount: manualQuote.odAmount,
      thirdPartyAmount: manualQuote.thirdPartyAmount,
      isInsuranceCompanyValid: !!manualQuote.insuranceCompany,
      isCoverageTypeValid: !!manualQuote.coverageType,
      isIdvValid: !!manualQuote.idv,
      isButtonEnabled: !!(manualQuote.insuranceCompany && manualQuote.coverageType && manualQuote.idv)
    });

    if (!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv) {
      alert("Please fill all required fields: Insurance Company, Coverage Type, and IDV");
      return;
    }

    const company = insuranceCompanies.find(c => c.name === manualQuote.insuranceCompany);
    const addOnsPremium = calculateAddOnsTotal();
    const ncbDiscountAmount = calculateNcbDiscount();
    const odAmountAfterNcb = calculateOdAfterNcb();
    const totalPremium = calculateTotalPremium();
    const basePremium = calculateBasePremium();
    const gstAmount = calculateGstAmount();

    // Get the policy duration label - FIXED: Use the actual value as label for new vehicles
    const policyDurationLabel = manualQuote.policyDuration;

    // Prepare selected add-ons - include ALL selected add-ons (both with 0 and >0 amount)
    const selectedAddOns = Object.entries(manualQuote.addOns)
      .filter(([_, addOn]) => addOn.selected)
      .reduce((acc, [key, addOn]) => {
        acc[key] = {
          description: addOnDescriptions[key],
          amount: parseFloat(addOn.amount || 0) || 0,
          rate: parseFloat(addOn.rate || 0) || 0,
          included: parseFloat(addOn.amount || 0) === 0 // Flag to indicate included (0 amount)
        };
        return acc;
      }, {});

    const newQuote = {
      id: Date.now().toString(),
      insuranceCompany: manualQuote.insuranceCompany,
      companyLogo: company?.logo || '',
      companyFallbackLogo: company?.fallbackLogo || '🏢',
      companyColor: company?.color || '#000',
      companyBgColor: company?.bgColor || '#fff',
      coverageType: manualQuote.coverageType,
      idv: parseFloat(manualQuote.idv || 0) || 0,
      policyDuration: manualQuote.policyDuration,
      policyDurationLabel: policyDurationLabel, // Use the descriptive label directly
      ncbDiscount: parseInt(manualQuote.ncbDiscount),
      ncbDiscountAmount: ncbDiscountAmount,
      odAmount: parseFloat(manualQuote.odAmount || 0) || 0,
      odAmountAfterNcb: odAmountAfterNcb,
      thirdPartyAmount: parseFloat(manualQuote.thirdPartyAmount || 0) || 0,
      addOnsAmount: parseFloat(manualQuote.addOnsAmount || 0) || 0,
      premium: basePremium,
      gstAmount: gstAmount,
      totalPremium: totalPremium,
      addOnsPremium: addOnsPremium,
      selectedAddOns: selectedAddOns,
      includedAddOns: getIncludedAddOns(), // Store included add-ons separately
      createdAt: new Date().toISOString(),
      accepted: false // Initialize as not accepted
    };

    const updatedQuotes = [...quotes, newQuote];
    console.log("➕ Adding new quote. Previous:", quotes.length, "New:", updatedQuotes.length);
    setQuotes(updatedQuotes);

    // Reset manual quote form but keep NCB setting based on eligibility
    setManualQuote({
      insuranceCompany: '',
      coverageType: 'comprehensive',
      idv: '',
      policyDuration: getDefaultPolicyDuration(),
      ncbDiscount: getDefaultNcb(),
      odAmount: '0', // Reset to 0
      thirdPartyAmount: '0', // Reset to 0
      addOnsAmount: '0', // Reset to 0
      premium: '',
      addOns: {
        zeroDep: { selected: false, amount: '0', rate: '0' },
        consumables: { selected: false, amount: '0', rate: '0' },
        roadSideAssist: { selected: false, amount: '0', rate: '0' },
        keyReplacement: { selected: false, amount: '0', rate: '0' },
        engineProtect: { selected: false, amount: '0', rate: '0' },
        returnToInvoice: { selected: false, amount: '0', rate: '0' },
        personalAccident: { selected: false, amount: '0', rate: '0' },
        tyreProtection: { selected: false, amount: '0', rate: '0' },
        emergencyMedical: { selected: false, amount: '0', rate: '0' }
      }
    });
  };

  // Remove quote
  const removeQuote = (index) => {
    console.log("🗑️ Removing quote at index:", index);
    const quoteToRemove = quotes[index];
    
    // If removing the accepted quote, unaccept it first
    if (acceptedQuote && acceptedQuote.id === quoteToRemove.id) {
      unacceptQuote();
    }
    
    const updatedQuotes = quotes.filter((_, i) => i !== index);
    setQuotes(updatedQuotes);
    setSelectedQuotes(selectedQuotes.filter(selectedIndex => selectedIndex !== index));
    setExpandedQuotes(expandedQuotes.filter(expandedIndex => expandedIndex !== index));
  };

  // Clear all quotes
  const clearAllQuotes = () => {
    if (window.confirm('Are you sure you want to clear all quotes? This action cannot be undone.')) {
      console.log("🧹 Clearing all quotes");
      const updatedQuotes = [];
      setQuotes(updatedQuotes);
      setSelectedQuotes([]);
      setExpandedQuotes([]);
      setAcceptedQuote(null);
      
      // Clear localStorage too
      localStorage.removeItem('insuranceQuotes');
      
      // Notify parent about quote unacceptance
      if (onQuoteAccepted) {
        onQuoteAccepted(null);
      }
    }
  };

  // Toggle quote selection
  const toggleQuoteSelection = (index) => {
    setSelectedQuotes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Toggle quote expansion
  const toggleQuoteExpansion = (index) => {
    setExpandedQuotes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Select all quotes
  const selectAllQuotes = () => {
    setSelectedQuotes(quotes.map((_, index) => index));
  };

  // Deselect all quotes
  const deselectAllQuotes = () => {
    setSelectedQuotes([]);
  };

  // Enhanced PDF generation with professional layout
  const downloadSelectedQuotesPDF = () => {
    if (selectedQuotes.length === 0) {
      alert("Please select at least one quote to download");
      return;
    }

    const selectedQuoteData = selectedQuotes.map(index => quotes[index]);
    downloadQuotesPDF(selectedQuoteData);
  };

  // Professional PDF generation function
  const downloadQuotesPDF = (quotesToDownload) => {
    try {
      setIsGenerating(true);
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);

      // Set professional color scheme
      const primaryColor = [41, 128, 185];
      const secondaryColor = [52, 152, 219];
      const accentColor = [46, 204, 113];
      const textColor = [51, 51, 51];
      const lightGray = [245, 245, 245];

      // Header with gradient effect
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 80, 'F');
      
      // Company Logo and Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('INSURANCE QUOTES COMPARISON', pageWidth / 2, 35, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('AutoCredit Insurance - Professional Quote Analysis', pageWidth / 2, 45, { align: 'center' });
      
      // Customer Information Box
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, 60, contentWidth, 25, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, 60, contentWidth, 25, 'S');
      
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CUSTOMER DETAILS:', margin + 5, 70);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${form.customerName || 'Not Provided'}`, margin + 5, 77);
      pdf.text(`Vehicle: ${form.make || ''} ${form.model || ''} ${form.variant || ''}`, margin + 80, 77);
      pdf.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 5, 77, { align: 'right' });

      let yPosition = 95;

      // Summary Statistics
      if (quotesToDownload.length > 1) {
        const lowestPremium = Math.min(...quotesToDownload.map(q => q.totalPremium));
        const highestPremium = Math.max(...quotesToDownload.map(q => q.totalPremium));
        const avgPremium = quotesToDownload.reduce((sum, q) => sum + q.totalPremium, 0) / quotesToDownload.length;

        pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        pdf.rect(margin, yPosition, contentWidth, 20, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin, yPosition, contentWidth, 20, 'S');
        
        pdf.setFontSize(9);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('QUOTE SUMMARY:', margin + 5, yPosition + 8);
        pdf.setFont('helvetica', 'normal');
        
        pdf.text(`Total Quotes: ${quotesToDownload.length}`, margin + 5, yPosition + 15);
        pdf.text(`Lowest Premium: ₹${lowestPremium.toLocaleString('en-IN')}`, margin + 60, yPosition + 15);
        pdf.text(`Highest Premium: ₹${highestPremium.toLocaleString('en-IN')}`, margin + 120, yPosition + 15);
        pdf.text(`Average Premium: ₹${avgPremium.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPosition + 15, { align: 'right' });
        
        yPosition += 30;
      }

      // Main Comparison Table
      createProfessionalComparisonTable(pdf, quotesToDownload, margin, yPosition, pageWidth, pageHeight);

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by AutoCredit Insurance | Contact: support@autocredit.com | Phone: +91-XXXXX-XXXXX', 
               pageWidth / 2, footerY, { align: 'center' });

      const fileName = `insurance-quotes-${form.customerName || 'customer'}-${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Professional table creation function
  const createProfessionalComparisonTable = (pdf, quotes, startX, startY, pageWidth, pageHeight) => {
    const margin = 20;
    const tableWidth = pageWidth - (2 * margin);
    
    // Enhanced column structure for better comparison
    const colWidths = [
      tableWidth * 0.16, // Company
      tableWidth * 0.12, // Coverage
      tableWidth * 0.12, // IDV
      tableWidth * 0.10, // Base Premium
      tableWidth * 0.08, // Add-ons
      tableWidth * 0.08, // NCB
      tableWidth * 0.12, // Total Premium
      tableWidth * 0.12, // Duration
      tableWidth * 0.10  // Key Features
    ];
    
    let yPosition = startY;
    
    // Table headers
    const headers = ['Insurance Company', 'Coverage', 'IDV (₹)', 'Base Premium', 'Add-ons', 'NCB %', 'Total Premium', 'Policy Term', 'Key Features'];
    
    // Draw professional table header
    pdf.setFillColor(52, 152, 219);
    pdf.rect(margin, yPosition, tableWidth, 12, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    
    let xPosition = margin;
    headers.forEach((header, index) => {
      pdf.text(header, xPosition + 2, yPosition + 8);
      xPosition += colWidths[index];
    });
    
    yPosition += 12;
    
    // Sort quotes by total premium (lowest first)
    const sortedQuotes = [...quotes].sort((a, b) => a.totalPremium - b.totalPremium);
    
    // Table rows
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    sortedQuotes.forEach((quote, rowIndex) => {
      // Check for page break
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
        // Redraw header on new page
        pdf.setFillColor(52, 152, 219);
        pdf.rect(margin, yPosition, tableWidth, 12, 'F');
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        
        let headerX = margin;
        headers.forEach((header, index) => {
          pdf.text(header, headerX + 2, yPosition + 8);
          headerX += colWidths[index];
        });
        
        yPosition += 12;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
      }
      
      // Alternate row colors for better readability
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.rect(margin, yPosition, tableWidth, 25, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(margin, yPosition, tableWidth, 25, 'S');
      
      xPosition = margin;
      
      // Company name (truncated if too long)
      const companyName = quote.insuranceCompany.length > 12 ? 
        quote.insuranceCompany.substring(0, 12) + '...' : quote.insuranceCompany;
      pdf.setFont('helvetica', 'bold');
      pdf.text(companyName, xPosition + 2, yPosition + 8);
      xPosition += colWidths[0];
      
      // Coverage type
      pdf.setFont('helvetica', 'normal');
      const coverageType = quote.coverageType === 'comprehensive' ? 'Comp' : '3rd Party';
      pdf.text(coverageType, xPosition + 2, yPosition + 8);
      xPosition += colWidths[1];
      
      // IDV
      pdf.text(`₹${(quote.idv || 0).toLocaleString('en-IN')}`, xPosition + 2, yPosition + 8);
      xPosition += colWidths[2];
      
      // Base Premium
      pdf.text(`₹${(quote.premium || 0).toLocaleString('en-IN')}`, xPosition + 2, yPosition + 8);
      xPosition += colWidths[3];
      
      // Add-ons count with amount
      const addOnsCount = Object.keys(quote.selectedAddOns || {}).length;
      const addOnsText = addOnsCount > 0 ? 
        `${addOnsCount} (₹${quote.addOnsPremium.toLocaleString('en-IN')})` : '0';
      pdf.text(addOnsText, xPosition + 2, yPosition + 8);
      xPosition += colWidths[4];
      
      // NCB with discount amount
      pdf.text(`${quote.ncbDiscount}%`, xPosition + 2, yPosition + 8);
      pdf.setFontSize(7);
      pdf.setTextColor(0, 128, 0);
      pdf.text(`(₹${(quote.ncbDiscountAmount || 0).toLocaleString('en-IN')})`, xPosition + 2, yPosition + 13);
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      xPosition += colWidths[5];
      
      // Total Premium (highlighted) - Mark best price
      pdf.setFont('helvetica', 'bold');
      if (rowIndex === 0 && sortedQuotes.length > 1) {
        pdf.setTextColor(46, 204, 113); // Green for best price
        pdf.text(`₹${(quote.totalPremium || 0).toLocaleString('en-IN')} ✓`, xPosition + 2, yPosition + 8);
      } else {
        pdf.setTextColor(0, 0, 0);
        pdf.text(`₹${(quote.totalPremium || 0).toLocaleString('en-IN')}`, xPosition + 2, yPosition + 8);
      }
      pdf.setFont('helvetica', 'normal');
      xPosition += colWidths[6];
      
      // Policy Duration - Use the descriptive label directly
      const durationText = quote.policyDurationLabel || quote.policyDuration;
      pdf.text(durationText, xPosition + 2, yPosition + 8);
      xPosition += colWidths[7];
      
      // Key Features (first 2-3 add-ons or main features)
      const addOnsList = Object.values(quote.selectedAddOns || {});
      let keyFeatures = 'Basic';
      if (addOnsList.length > 0) {
        keyFeatures = addOnsList.slice(0, 2).map(addOn => 
          addOn.description.split(' ')[0]
        ).join(', ');
        if (addOnsList.length > 2) {
          keyFeatures += '...';
        }
      }
      pdf.text(keyFeatures, xPosition + 2, yPosition + 8);
      
      // Additional info in second line
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      const savedAmount = quote.ncbDiscountAmount > 0 ? `Save: ₹${quote.ncbDiscountAmount.toLocaleString('en-IN')}` : '';
      pdf.text(savedAmount, margin + 2, yPosition + 18);
      
      // Reset for next row
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      
      yPosition += 25;
    });

    // Add recommendation note if multiple quotes
    if (sortedQuotes.length > 1) {
      yPosition += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(46, 204, 113);
      pdf.setFont('helvetica', 'bold');
      pdf.text('✓ Best Value: ' + sortedQuotes[0].insuranceCompany + ' (₹' + 
               sortedQuotes[0].totalPremium.toLocaleString('en-IN') + ')', margin, yPosition);
    }

    return yPosition;
  };

  // Component for company logo with fallback
  const CompanyLogo = ({ company, className = "w-8 h-8" }) => {
    const [imgError, setImgError] = useState(false);

    if (imgError || !company?.logo) {
      return (
        <div 
          className={`${className} rounded-full flex items-center justify-center text-lg`}
          style={{ backgroundColor: company?.bgColor }}
        >
          {company?.fallbackLogo}
        </div>
      );
    }

    return (
      <img
        src={company.logo}
        alt={`${company.name} logo`}
        className={`${className} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Step 4: Insurance Quotes</h3>
          <p className="text-sm text-gray-500">
            Quotes: {quotes.length} | Required: At least 1 | {acceptedQuote ? `✅ ${acceptedQuote.insuranceCompany} Accepted` : '❌ No Quote Accepted'}
            {isEditMode && acceptedQuote && <span className="text-green-600 ml-2">• Loaded from saved data</span>}
          </p>
        </div>
        {quotes.length > 0 && (
          <button
            onClick={clearAllQuotes}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All Quotes
          </button>
        )}
      </div>

      {/* Validation Error Display */}
      {errors.insuranceQuotes && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.insuranceQuotes}</p>
        </div>
      )}

      {/* Accepted Quote Validation Error */}
      {errors.acceptedQuote && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-600 text-sm font-medium">{errors.acceptedQuote}</p>
          </div>
          <p className="text-red-500 text-xs mt-1">
            You must accept a quote before proceeding to the next step
          </p>
        </div>
      )}

      {/* Quote Acceptance Status */}
      {acceptedQuote && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Quote Accepted</h4>
                <p className="text-sm text-green-600">
                  {acceptedQuote.insuranceCompany} - ₹{acceptedQuote.totalPremium?.toLocaleString('en-IN')}
                  {acceptedQuote.ncbDiscount > 0 && ` (with ${acceptedQuote.ncbDiscount}% NCB)`}
                </p>
              </div>
            </div>
            <button
              onClick={unacceptQuote}
              className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
            >
              Change Quote
            </button>
          </div>
        </div>
      )}

      {/* NCB Eligibility Status */}
      <div className={`mb-4 p-3 rounded-lg border ${
        !isNcbEligible 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              !isNcbEligible ? 'text-red-700' : 'text-green-700'
            }`}>
              <strong>NCB Status:</strong> {!isNcbEligible ? 'Not Eligible' : 'Eligible'}
            </p>
            <p className={`text-xs ${
              !isNcbEligible ? 'text-red-600' : 'text-green-600'
            }`}>
              {!isNcbEligible 
                ? 'Claim was taken in previous policy - NCB set to 0%' 
                : 'No claim in previous policy - Default NCB is 25% (can be changed)'
              }
            </p>
          </div>
          {!isNcbEligible && (
            <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold">
              NCB LOST
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-700">
              <strong>Quotes Status:</strong> {quotes.length} quote(s) added
            </p>
            <p className="text-xs text-blue-600">
              {quotes.length === 0 ? "Add at least one quote to proceed" : 
               acceptedQuote ? "✅ Quote accepted - can proceed to next step" : 
               "❌ Please accept a quote to proceed to next step"}
            </p>
          </div>
          <button
            onClick={() => {
              console.log("=== QUOTES DEBUG ===");
              console.log("Local quotes:", quotes);
              console.log("Form insuranceQuotes:", form.insuranceQuotes);
              console.log("Previous Claim:", form.previousClaimTaken);
              console.log("NCB Eligible:", isNcbEligible);
              console.log("Accepted Quote:", acceptedQuote);
              console.log("Can proceed:", quotes.length > 0 && acceptedQuote !== null);
            }}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Debug Quotes
          </button>
        </div>
      </div>
      
      {/* Add Quote Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Quote</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Insurance Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Company *
            </label>
            <div className="relative">
              <input
                type="text"
                name="insuranceCompany"
                value={manualQuote.insuranceCompany}
                onChange={handleManualQuoteChange}
                onFocus={() => setIsSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Insurance Company"
              />
              
              {/* Dropdown suggestions */}
              {isSuggestionsOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {insuranceCompanies
                    .filter(company => 
                      company.name.toLowerCase().includes(manualQuote.insuranceCompany.toLowerCase())
                    )
                    .map((company, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setManualQuote(prev => ({
                            ...prev,
                            insuranceCompany: company.name
                          }));
                          setIsSuggestionsOpen(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-2">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={`${company.name} logo`}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                              style={{ backgroundColor: company.bgColor, color: company.color }}
                            >
                              {company.fallbackLogo}
                            </div>
                          )}
                          <span>{company.name}</span>
                        </div>
                      </div>
                    ))
                  }
                  
                  {/* No results message */}
                  {insuranceCompanies.filter(company => 
                    company.name.toLowerCase().includes(manualQuote.insuranceCompany.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No insurance companies found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coverage Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Type *
            </label>
            <div className="relative">
              <input
                type="text"
                name="coverageType"
                value={manualQuote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party'}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  if (value.includes('comp') || value.includes('comp')) {
                    setManualQuote(prev => ({ ...prev, coverageType: 'comprehensive' }));
                  } else if (value.includes('third') || value.includes('3rd')) {
                    setManualQuote(prev => ({ ...prev, coverageType: 'thirdParty' }));
                  }
                }}
                onFocus={() => setIsCoverageSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setIsCoverageSuggestionsOpen(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type Comprehensive or Third Party"
              />
              
              {/* Dropdown suggestions */}
              {isCoverageSuggestionsOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div
                    onClick={() => {
                      setManualQuote(prev => ({ ...prev, coverageType: 'comprehensive' }));
                      setIsCoverageSuggestionsOpen(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors border-b border-gray-100"
                  >
                    Comprehensive
                  </div>
                  <div
                    onClick={() => {
                      setManualQuote(prev => ({ ...prev, coverageType: 'thirdParty' }));
                      setIsCoverageSuggestionsOpen(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    Third Party
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* IDV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IDV (₹) *
            </label>
            <INRCurrencyInput
              type="number"
              name="idv"
              value={manualQuote.idv}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter IDV amount"
            />
          </div>

          {/* Policy Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Duration *
            </label>
            <select
              name="policyDuration"
              value={manualQuote.policyDuration}
              onChange={handleManualQuoteChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                form.vehicleType === "used" 
                  ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed" 
                  : "border-gray-300"
              }`}
              disabled={form.vehicleType === "used"}
            >
              {policyDurationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {form.vehicleType === "used" && option.value === "1" ? '(Used Car Default)' : ''}
                </option>
              ))}
            </select>
            {form.vehicleType === "used" && (
              <p className="text-xs text-gray-500 mt-1">
                Used vehicles are limited to 1 Year policy duration
              </p>
            )}
          </div>

          {/* NCB Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NCB Discount (%)
            </label>
            <select
              name="ncbDiscount"
              value={manualQuote.ncbDiscount}
              onChange={handleManualQuoteChange}
              disabled={!isNcbEligible}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                !isNcbEligible 
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'border-gray-300'
              }`}
            >
              {ncbOptions.map(ncb => (
                <option key={ncb} value={ncb}>
                  {ncb}% {!isNcbEligible && ncb === 0 ? '(Auto-set)' : ''}
                </option>
              ))}
            </select>
            {!isNcbEligible && (
              <p className="text-xs text-red-600 mt-1">
                NCB disabled - claim was taken in previous policy
              </p>
            )}
          </div>

          {/* OD Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OD Amount (₹) <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <INRCurrencyInput
              type="number"
              name="odAmount"
              value={manualQuote.odAmount}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter OD amount (optional)"
            />
          </div>

          {/* Third Party Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3rd Party Amount (₹) <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <INRCurrencyInput
              type="number"
              name="thirdPartyAmount"
              value={manualQuote.thirdPartyAmount}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 3rd party amount (optional)"
            />
          </div>

          {/* Add Ons Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Ons (₹) <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <INRCurrencyInput
              type="number"
              name="addOnsAmount"
              value={manualQuote.addOnsAmount}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter add-ons amount (optional)"
            />
          </div>

          {/* Add-ons Input Fields (Optional checkboxes) */}
          <div className="col-span-full">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold text-gray-800">Additional Add-ons (Optional)</h4>
              <div className="flex gap-2">
                <button
                  onClick={selectAllAddOns}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Select All (₹0)
                </button>
                <button
                  onClick={deselectAllAddOns}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select add-ons with ₹0 amount to include them without charges, or enter custom amounts for premium calculation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(addOnDescriptions).map(([key, description]) => (
                <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white hover:border-purple-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={manualQuote.addOns[key].selected}
                    onChange={(e) => handleAddOnChange(key, 'selected', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      {description}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          value={manualQuote.addOns[key].amount}
                          onChange={(e) => handleAddOnChange(key, 'amount', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="0"
                          disabled={!manualQuote.addOns[key].selected}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Included Add-ons Display */}
          {getIncludedAddOns().length > 0 && (
            <div className="col-span-full bg-green-50 p-4 rounded-lg border border-green-200">
              <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Included Add-ons (₹0)
              </h5>
              <div className="flex flex-wrap gap-2">
                {getIncludedAddOns().map((addOn, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    ✓ {addOn}
                  </span>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-2">
                These add-ons are included in the quote at no extra cost and will be displayed to customers.
              </p>
            </div>
          )}

          {/* Premium Summary */}
          <div className="col-span-full bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Base Premium:</span>
                <div className="font-semibold text-lg">₹{currentBasePremium.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">(OD + 3rd Party + Add-ons)</div>
              </div>
              <div>
                <span className="text-gray-600">Add-ons Total:</span>
                <div className="font-semibold text-lg text-purple-600">₹{currentAddOnsTotal.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">(Only add-ons with amount &gt; 0)</div>
              </div>
              <div>
                <span className="text-gray-600">NCB Discount:</span>
                <div className="font-semibold text-lg text-green-600">-₹{currentNcbDiscountAmount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">(On OD Amount only)</div>
              </div>
              <div>
                <span className="text-gray-600">GST (18%):</span>
                <div className="font-semibold text-lg text-blue-600">₹{currentGstAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Premium:</span>
                <div className="font-semibold text-lg text-green-600">₹{currentTotalPremium.toLocaleString('en-IN')}</div>
              </div>
            </div>
            
            {/* Detailed Breakdown */}
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">OD Amount:</span>
                  <div>₹{(parseFloat(manualQuote.odAmount || 0) || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">OD After NCB:</span>
                  <div>₹{currentOdAfterNcb.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">3rd Party Amount:</span>
                  <div>₹{(parseFloat(manualQuote.thirdPartyAmount || 0) || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Taxable Amount:</span>
                  <div>₹{(currentOdAfterNcb + (parseFloat(manualQuote.thirdPartyAmount || 0) || 0) + currentAddOnsTotal).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Quote Button */}
        <button
          onClick={addManualQuote}
          disabled={!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv}
          className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
          title={
            !manualQuote.insuranceCompany ? "Insurance Company is required" :
            !manualQuote.coverageType ? "Coverage Type is required" :
            !manualQuote.idv ? "IDV is required" :
            "Add Quote"
          }
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Quote
        </button>
      </div>

      {/* Quotes List */}
      {quotes.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Generated Quotes ({quotes.length}) {acceptedQuote && <span className="text-green-600 text-sm">• 1 Accepted</span>}
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={selectAllQuotes}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAllQuotes}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={downloadSelectedQuotesPDF}
                disabled={selectedQuotes.length === 0 || isGenerating}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                {isGenerating ? 'Generating...' : `Download Selected (${selectedQuotes.length})`}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {quotes.map((quote, index) => {
              const company = insuranceCompanies.find(c => c.name === quote.insuranceCompany);
              const isExpanded = expandedQuotes.includes(index);
              const isAccepted = acceptedQuote && acceptedQuote.id === quote.id;
              
              // Separate included add-ons (amount = 0) from premium add-ons (amount > 0)
              const premiumAddOns = Object.entries(quote.selectedAddOns || {})
                .filter(([_, addOn]) => addOn.amount > 0);
              const includedAddOns = Object.entries(quote.selectedAddOns || {})
                .filter(([_, addOn]) => addOn.amount === 0);
              
              return (
                <div key={index} className={`border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white ${
                  isAccepted ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`}>
                  {/* Quote Header */}
                  <div 
                    className="p-4 text-white relative"
                    style={{ backgroundColor: company?.color || '#0055AA' }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedQuotes.includes(index)}
                          onChange={() => toggleQuoteSelection(index)}
                          className="w-5 h-5 text-white bg-white rounded border-white"
                        />
                        <CompanyLogo company={company} className="w-10 h-10" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-lg">{quote.insuranceCompany}</h4>
                            {isAccepted && (
                              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                ACCEPTED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm opacity-90">
                            <span>IDV: ₹{quote.idv?.toLocaleString('en-IN')}</span>
                            <span>•</span>
                            {/* FIXED: Use policyDurationLabel directly */}
                            <span>{quote.policyDurationLabel}</span>
                            <span>•</span>
                            <span>NCB: {quote.ncbDiscount}%</span>
                            {!isNcbEligible && (
                              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                NCB Lost
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xl font-bold">₹{quote.totalPremium?.toLocaleString('en-IN')}</div>
                          <div className="text-sm opacity-90">
                            Total Premium
                          </div>
                        </div>
                        {!isAccepted && (
                          <button
                            onClick={() => acceptQuote(quote)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Accept Quote
                          </button>
                        )}
                        <button
                          onClick={() => toggleQuoteExpansion(index)}
                          className="text-white hover:bg-black hover:bg-opacity-20 p-1 rounded"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => removeQuote(index)}
                          className="text-white hover:bg-black hover:bg-opacity-20 p-1 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quote Body - Only show if expanded */}
                  {isExpanded && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Premium Breakdown */}
                        <div className="space-y-4">
                          <h5 className="font-semibold text-gray-800 text-lg border-b pb-2">Premium Breakup</h5>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Own Damage</span>
                              <span className="font-semibold">₹{quote.odAmount?.toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-green-600">
                              <span>NCB Discount {quote.ncbDiscount}% (on OD)</span>
                              <span>-₹{(quote.ncbDiscountAmount || 0).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-gray-600">OD After NCB</span>
                              <span className="font-semibold">₹{(quote.odAmountAfterNcb || 0).toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">3rd Party Amount</span>
                              <span className="font-semibold">₹{quote.thirdPartyAmount?.toLocaleString('en-IN')}</span>
                            </div>

                            {/* Premium Add-ons (with amount > 0) */}
                            {premiumAddOns.length > 0 && (
                              <div className="pt-2 border-t">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-gray-600">Premium Add-ons</span>
                                  <span className="font-semibold text-purple-600">+₹{quote.addOnsPremium?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="space-y-2">
                                  {premiumAddOns.map(([key, addOn]) => (
                                    <div key={key} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">{addOn.description}</span>
                                      <span className="font-semibold text-green-600">
                                        +₹{addOn.amount?.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-gray-600">Taxable Amount</span>
                              <span className="font-semibold">₹{((quote.odAmountAfterNcb || 0) + (quote.thirdPartyAmount || 0) + (quote.addOnsPremium || 0)).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">GST (18%)</span>
                              <span className="font-semibold text-blue-600">+₹{quote.gstAmount?.toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="pt-3 border-t">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-lg">Total Premium</span>
                                <span className="font-bold text-green-600 text-xl">₹{quote.totalPremium?.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Additional Details */}
                        <div className="space-y-4">
                          <h5 className="font-semibold text-gray-800 text-lg border-b pb-2">Coverage Details</h5>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Policy Term</span>
                              {/* FIXED: Use policyDurationLabel directly */}
                              <span className="font-semibold">{quote.policyDurationLabel}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coverage Type</span>
                              <span className="font-semibold">{quote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party'}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">IDV</span>
                              <span className="font-semibold">₹{quote.idv?.toLocaleString('en-IN')}</span>
                            </div>

                            {/* Included Add-ons Section */}
                            {includedAddOns.length > 0 && (
                              <div className="pt-2">
                                <div className="text-green-600 font-medium mb-2 flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Included Add-ons (₹0)
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {includedAddOns.map(([key, addOn]) => (
                                    <span 
                                      key={key} 
                                      className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                                    >
                                      ✓ {addOn.description}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Premium Add-ons Section */}
                            {premiumAddOns.length > 0 && (
                              <div className="pt-2">
                                <div className="text-purple-600 font-medium mb-2">Premium Add-ons</div>
                                <div className="flex flex-wrap gap-2">
                                  {premiumAddOns.map(([key, addOn]) => (
                                    <span 
                                      key={key} 
                                      className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                                      style={{ backgroundColor: company?.bgColor, color: company?.color }}
                                    >
                                      {addOn.description} (₹{addOn.amount.toLocaleString('en-IN')})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Object.keys(quote.selectedAddOns || {}).length === 0 && (
                              <div className="pt-2">
                                <span className="text-gray-400 text-sm">No add-ons selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {quotes.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Quotes Added Yet</h3>
          <p>Add at least one insurance quote to proceed to the next step</p>
          {errors.insuranceQuotes && (
            <p className="text-red-500 text-sm mt-2">
              ❌ {errors.insuranceQuotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
// ================== STEP 5: New Policy Details ==================
const NewPolicyDetails = ({ form, handleChange, handleSave, isSaving, errors, acceptedQuote }) => {
  // Insurance companies dropdown options (same as InsuranceQuotes)
  const insuranceCompanies = [
    "ICICI Lombard",
    "HDFC Ergo", 
    "Bajaj Allianz",
    "New India Assurance",
    "United India",
    "National Insurance",
    "Oriental Insurance",
    "Tata AIG",
    "Reliance General",
    "Cholamandalam",
    "Other"
  ];

  // NCB options dropdown (same as InsuranceQuotes)
  const ncbOptions = [0, 20, 25, 35, 45, 50];

  // Policy duration options based on vehicle type (same as InsuranceQuotes)
  const getPolicyDurationOptions = (vehicleType) => {
    if (vehicleType === "new") {
      return [
        { value: "1yr OD + 3yr TP", label: "1yr OD + 3yr TP", odYears: 1, tpYears: 3 },
        { value: "2yr OD + 3yr TP", label: "2yr OD + 3yr TP", odYears: 2, tpYears: 3 },
        { value: "3yr OD + 3yr TP", label: "3yr OD + 3yr TP", odYears: 3, tpYears: 3 }
      ];
    } else {
      return [
        { value: "1 Year", label: "1 Year", odYears: 1, tpYears: 1 }
      ]; // Only 1 year for used cars
    }
  };

  const policyDurationOptions = getPolicyDurationOptions(form.vehicleType);

  // Track the last accepted quote to detect changes
  const [lastAcceptedQuoteId, setLastAcceptedQuoteId] = useState(null);

  // Function to calculate expiry date based on policy start date and duration (with -1 day)
  const calculateExpiryDate = (policyStartDate, years) => {
    if (!policyStartDate || !years) return '';
    
    const startDate = new Date(policyStartDate);
    const expiry = new Date(startDate);
    
    // Add years and subtract 1 day
    expiry.setFullYear(expiry.getFullYear() + parseInt(years));
    expiry.setDate(expiry.getDate() - 1);
    
    return expiry.toISOString().split('T')[0];
  };

  // Calculate separate OD and TP expiry dates
  const calculateSeparateExpiryDates = (policyStartDate, durationOption) => {
    if (!policyStartDate || !durationOption) return { odExpiry: '', tpExpiry: '' };
    
    const selectedOption = policyDurationOptions.find(opt => opt.value === durationOption);
    if (!selectedOption) return { odExpiry: '', tpExpiry: '' };
    
    const odExpiry = calculateExpiryDate(policyStartDate, selectedOption.odYears);
    const tpExpiry = calculateExpiryDate(policyStartDate, selectedOption.tpYears);
    
    return { odExpiry, tpExpiry };
  };

  // Handle issue date change
  const handleIssueDateChange = (e) => {
    const issueDate = e.target.value;
    handleChange(e);
    
    // If policy start date exists and is before the new issue date, reset it
    if (form.policyStartDate && issueDate) {
      const startDate = new Date(form.policyStartDate);
      const newIssueDate = new Date(issueDate);
      
      if (startDate < newIssueDate) {
        handleChange({
          target: {
            name: 'policyStartDate',
            value: issueDate // Set start date to issue date
          }
        });
        
        // Also recalculate expiry dates if duration exists
        if (form.insuranceDuration) {
          const { odExpiry, tpExpiry } = calculateSeparateExpiryDates(issueDate, form.insuranceDuration);
          handleChange({
            target: { name: 'odExpiryDate', value: odExpiry }
          });
          handleChange({
            target: { name: 'tpExpiryDate', value: tpExpiry }
          });
        }
      }
    }
  };

  // Handle policy start date change - auto-calculate expiry dates
  const handlePolicyStartDateChange = (e) => {
    const startDate = e.target.value;
    const issueDate = form.issueDate;
    
    // Validate: Start date cannot be before issue date
    if (issueDate && startDate) {
      const start = new Date(startDate);
      const issue = new Date(issueDate);
      
      if (start < issue) {
        // Show error and don't update
        alert("Policy start date cannot be before issue date!");
        return;
      }
    }
    
    handleChange(e);
    
    // Auto-calculate expiry dates if duration exists
    if (startDate && form.insuranceDuration) {
      const { odExpiry, tpExpiry } = calculateSeparateExpiryDates(startDate, form.insuranceDuration);
      
      handleChange({
        target: { name: 'odExpiryDate', value: odExpiry }
      });
      handleChange({
        target: { name: 'tpExpiryDate', value: tpExpiry }
      });
    }
  };

  // Handle insurance duration change - auto-calculate expiry dates
  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    handleChange(e);
    
    // Auto-calculate expiry dates if policy start date exists
    if (form.policyStartDate && newDuration) {
      const { odExpiry, tpExpiry } = calculateSeparateExpiryDates(form.policyStartDate, newDuration);
      
      handleChange({
        target: { name: 'odExpiryDate', value: odExpiry }
      });
      handleChange({
        target: { name: 'tpExpiryDate', value: tpExpiry }
      });
    }
  };

  // Effect to auto-fill when acceptedQuote changes (including when editing)
 // Function to get duration value from accepted quote
const getDurationValueFromQuote = (quote, vehicleType) => {
  if (vehicleType === "new") {
    // For new cars, map the policyDuration to the appropriate option
    if (quote.policyDuration === 1) {
      return "1yr OD + 3yr TP";
    } else if (quote.policyDuration === 3) {
      return "3yr OD + 3yr TP";
    } else if (quote.policyDuration === 2) {
      return "2yr OD + 2yr TP"; // If you have this option
    } else {
      // Fallback: convert number to years format
      return `${quote.policyDuration} Year${quote.policyDuration > 1 ? 's' : ''}`;
    }
  } else {
    // For used cars, always use "1 Year"
    return "1 Year";
  }
};

// Enhanced debug function to log what's happening
const logAutoFillDetails = (quote, durationValue) => {
  console.log("📋 Auto-fill Details:", {
    quoteId: quote.id,
    insuranceCompany: quote.insuranceCompany,
    originalDuration: quote.policyDuration,
    vehicleType: form.vehicleType,
    mappedDuration: durationValue,
    availableOptions: policyDurationOptions.map(opt => opt.value)
  });
};

// Effect to auto-fill when acceptedQuote changes (including when editing)
useEffect(() => {
  if (acceptedQuote) {
    console.log("🔄 Processing accepted quote:", acceptedQuote.insuranceCompany, "ID:", acceptedQuote.id);
    
    // Check if this is a different quote than the last one we processed
    const isDifferentQuote = acceptedQuote.id !== lastAcceptedQuoteId;
    
    if (isDifferentQuote) {
      console.log("🔄 New/different quote accepted, auto-filling policy details...");
      
      // Auto-fill policy details from accepted quote
      handleChange({
        target: { name: 'insuranceCompany', value: acceptedQuote.insuranceCompany }
      });
      handleChange({
        target: { name: 'idvAmount', value: acceptedQuote.idv.toString() }
      });
      handleChange({
        target: { name: 'totalPremium', value: acceptedQuote.totalPremium.toString() }
      });
      handleChange({
        target: { name: 'ncbDiscount', value: acceptedQuote.ncbDiscount.toString() }
      });
      
      // Auto-fill insurance duration from accepted quote
      const durationValue = getDurationValueFromQuote(acceptedQuote, form.vehicleType);
      handleChange({
        target: { name: 'insuranceDuration', value: durationValue }
      });
      
      logAutoFillDetails(acceptedQuote, durationValue);
      console.log("✅ Policy details updated with accepted quote including duration:", durationValue);
      
      // Update the last processed quote ID
      setLastAcceptedQuoteId(acceptedQuote.id);
    } else {
      console.log("ℹ️ Same quote as before, no need to re-fill");
    }
  } else {
    console.log("❌ No accepted quote available");
    // Reset the tracker if no quote is accepted
    setLastAcceptedQuoteId(null);
  }
}, [acceptedQuote, lastAcceptedQuoteId, handleChange, form.vehicleType]);
  // Reset form when accepted quote is removed
  useEffect(() => {
    if (!acceptedQuote && lastAcceptedQuoteId) {
      console.log("🔄 Accepted quote was removed, clearing policy fields");
      setLastAcceptedQuoteId(null);
    }
  }, [acceptedQuote, lastAcceptedQuoteId, handleChange]);

  // Get selected duration option details
  const selectedDurationOption = policyDurationOptions.find(opt => opt.value === form.insuranceDuration);

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaFileAlt />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Step 5: New Policy Details
            </h3>
            {acceptedQuote && (
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <CheckCircle className="w-4 h-4" />
                Auto-filled from accepted quote: {acceptedQuote.insuranceCompany}
                {lastAcceptedQuoteId && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Quote ID: {lastAcceptedQuoteId})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Type Info Banner */}
      {form.vehicleType && (
        <div className={`mb-4 p-4 rounded-lg border ${
          form.vehicleType === "new" 
            ? "bg-green-50 border-green-200" 
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {form.vehicleType === "new" ? (
                <FaCar className="w-5 h-5 text-green-600" />
              ) : (
                <FaHistory className="w-5 h-5 text-blue-600" />
              )}
              <div>
                <h4 className="font-semibold text-gray-800">
                  {form.vehicleType === "new" ? "New Vehicle" : "Used Vehicle"}
                </h4>
                <p className="text-sm text-gray-600">
                  {form.vehicleType === "new" 
                    ? "Available policy durations: 1yr OD + 3yr TP, 3yr OD + 3yr TP"
                    : "Policy duration: 1 Year (default for used vehicles)"
                  }
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              form.vehicleType === "new" 
                ? "bg-green-100 text-green-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {form.vehicleType === "new" ? "NEW" : "USED"}
            </span>
          </div>
        </div>
      )}

      {/* Date Calculation Info */}
      <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">Date Calculation Rules</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>Issue Date</strong>: Can be any date (past or future)</li>
              <li>• <strong>Policy Start Date</strong>: Cannot be before Issue Date</li>
              <li>• <strong>OD & TP Expiry Dates</strong>: Start Date + Duration - 1 Day</li>
              <li className="text-xs text-purple-600 mt-2">
                {selectedDurationOption && form.policyStartDate ? 
                  `Example: ${form.policyStartDate} + ${selectedDurationOption.odYears} Year(s) - 1 Day = OD Expiry, + ${selectedDurationOption.tpYears} Year(s) - 1 Day = TP Expiry` : 
                  "Expiry dates are calculated as: Start Date + Duration - 1 Day"
                }
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quote Acceptance Status Banner */}
      {acceptedQuote ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">
                  {lastAcceptedQuoteId === acceptedQuote.id ? "Quote Accepted & Auto-Filled" : "New Quote Accepted - Updating..."}
                </h4>
                <p className="text-sm text-green-600">
                  {acceptedQuote.insuranceCompany} - ₹{acceptedQuote.totalPremium?.toLocaleString('en-IN')}
                  {acceptedQuote.ncbDiscount > 0 && ` (with ${acceptedQuote.ncbDiscount}% NCB)`}
                </p>
              </div>
            </div>
            <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
              {lastAcceptedQuoteId === acceptedQuote.id ? "✅ Ready for Policy Creation" : "🔄 Updating Fields..."}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-700 text-sm font-medium">
                <strong>Case Status: Pending Quote Acceptance</strong>
              </p>
              <p className="text-yellow-600 text-sm">
                Please accept a quote in Step 4 to auto-fill policy details
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Policy Information {acceptedQuote && (
            <span className="text-green-600 text-sm">
              (Auto-filled from {lastAcceptedQuoteId === acceptedQuote.id ? "current" : "new"} accepted quote)
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Company - Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Insurance Company *
            </label>
            <select
              name="insuranceCompany"
              value={form.insuranceCompany || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.insuranceCompany ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Insurance Company</option>
              {insuranceCompanies.map((company, index) => (
                <option key={index} value={company}>
                  {company}
                </option>
              ))}
            </select>
            {acceptedQuote && form.insuranceCompany === acceptedQuote.insuranceCompany && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                From accepted quote
                {lastAcceptedQuoteId !== acceptedQuote.id && <span className="text-orange-500"> (Updating...)</span>}
              </p>
            )}
            {errors.insuranceCompany && <p className="text-red-500 text-xs mt-1">{errors.insuranceCompany}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Number
            </label>
            <input
              type="text"
              name="policyNumber"
              value={form.policyNumber || ""}
              onChange={handleChange}
              placeholder="Policy Number"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.policyNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.policyNumber && <p className="text-red-500 text-xs mt-1">{errors.policyNumber}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Issue Date *
            </label>
            <input
              type="date"
              name="issueDate"
              value={form.issueDate || ""}
              onChange={handleIssueDateChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.issueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.issueDate && <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Policy issuance date (can be past or future)
            </p>
          </div>

          {/* Policy Start Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Start Date *
            </label>
            <input
              type="date"
              name="policyStartDate"
              value={form.policyStartDate || ""}
              onChange={handlePolicyStartDateChange}
              min={form.issueDate || ''} // Cannot be before issue date
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.policyStartDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.policyStartDate && <p className="text-red-500 text-xs mt-1">{errors.policyStartDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {form.issueDate 
                ? `Cannot be before ${new Date(form.issueDate).toLocaleDateString()}`
                : "Policy coverage start date"
              }
            </p>
          </div>

          {/* Insurance Duration - Dropdown */}
          {/* Insurance Duration - Dropdown */}
<div>
  <label className="block mb-1 text-sm font-medium text-gray-600">
    Insurance Duration *
  </label>
  <select
    name="insuranceDuration"
    value={form.insuranceDuration || ""}
    onChange={handleDurationChange}
    className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
      errors.insuranceDuration ? "border-red-500" : "border-gray-300"
    } ${
      form.vehicleType === "used" ? "bg-gray-100 cursor-not-allowed" : ""
    }`}
    disabled={form.vehicleType === "used"} // Disabled for used cars
  >
    <option value="">Select Duration</option>
    {policyDurationOptions.map((option, index) => (
      <option key={index} value={option.value}>
        {option.label} {form.vehicleType === "used" && option.value === "1 Year" ? '(Used Car Default)' : ''}
      </option>
    ))}
  </select>
  
  {/* Auto-fill status */}
  {acceptedQuote && form.insuranceDuration && (
    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
      <CheckCircle className="w-3 h-3" />
      Auto-filled from accepted quote: {acceptedQuote.policyDuration} Year{acceptedQuote.policyDuration > 1 ? 's' : ''}
      {form.vehicleType === "new" && (
        <span className="text-blue-600">
          ({form.insuranceDuration})
        </span>
      )}
    </p>
  )}
  
  {errors.insuranceDuration && <p className="text-red-500 text-xs mt-1">{errors.insuranceDuration}</p>}
  
  {form.vehicleType === "used" && (
    <p className="text-xs text-gray-500 mt-1">
      Used vehicles are limited to 1 Year policy duration (auto-filled from accepted quote)
    </p>
  )}
  
  {form.vehicleType === "new" && acceptedQuote && (
    <p className="text-xs text-blue-600 mt-1">
      Duration taken from accepted quote: {acceptedQuote.policyDuration} Year{acceptedQuote.policyDuration > 1 ? 's' : ''}
    </p>
  )}
</div>

          {/* OD Expiry Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              OD Expiry Date *
            </label>
            <input
              type="date"
              name="odExpiryDate"
              value={form.odExpiryDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.odExpiryDate ? "border-red-500" : "border-gray-300"
              }`}
              readOnly
            />
            {errors.odExpiryDate && <p className="text-red-500 text-xs mt-1">{errors.odExpiryDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated: Start Date + OD Duration - 1 Day
              {form.policyStartDate && form.insuranceDuration && (
                <span className="text-green-600 font-medium">
                  {" "}✓ Calculated
                </span>
              )}
            </p>
          </div>

          {/* TP Expiry Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              TP Expiry Date *
            </label>
            <input
              type="date"
              name="tpExpiryDate"
              value={form.tpExpiryDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.tpExpiryDate ? "border-red-500" : "border-gray-300"
              }`}
              readOnly
            />
            {errors.tpExpiryDate && <p className="text-red-500 text-xs mt-1">{errors.tpExpiryDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated: Start Date + TP Duration - 1 Day
              {form.policyStartDate && form.insuranceDuration && (
                <span className="text-green-600 font-medium">
                  {" "}✓ Calculated
                </span>
              )}
            </p>
          </div>

          {/* NCB Discount - Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              NCB Discount (%)
            </label>
            <select
              name="ncbDiscount"
              value={form.ncbDiscount || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.ncbDiscount ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select NCB %</option>
              {ncbOptions.map(ncb => (
                <option key={ncb} value={ncb}>
                  {ncb}%
                </option>
              ))}
            </select>
            {acceptedQuote && form.ncbDiscount === acceptedQuote.ncbDiscount.toString() && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                From accepted quote: {acceptedQuote.ncbDiscount}%
              </p>
            )}
            {errors.ncbDiscount && <p className="text-red-500 text-xs mt-1">{errors.ncbDiscount}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              IDV Amount (₹) *
            </label>
            <INRCurrencyInput
              type="number"
              name="idvAmount"
              value={form.idvAmount || ""}
              onChange={handleChange}
              placeholder="From accepted quote"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.idvAmount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {acceptedQuote && form.idvAmount === acceptedQuote.idv.toString() && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                From accepted quote: ₹{acceptedQuote.idv?.toLocaleString('en-IN')}
              </p>
            )}
            {errors.idvAmount && <p className="text-red-500 text-xs mt-1">{errors.idvAmount}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Total Premium (₹) *
            </label>
            <INRCurrencyInput
              type="number"
              name="totalPremium"
              value={form.totalPremium || ""}
              onChange={handleChange}
              placeholder="From accepted quote"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.totalPremium ? "border-red-500" : "border-gray-300"
              }`}
            />
            {acceptedQuote && form.totalPremium === acceptedQuote.totalPremium.toString() && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                From accepted quote: ₹{acceptedQuote.totalPremium?.toLocaleString('en-IN')}
              </p>
            )}
            {errors.totalPremium && <p className="text-red-500 text-xs mt-1">{errors.totalPremium}</p>}
          </div>
        </div>

        {/* Real-time Calculation Example */}
        {/* {form.policyStartDate && form.insuranceDuration && form.odExpiryDate && form.tpExpiryDate && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <FaCalculator className="w-4 h-4" />
              <span className="font-semibold">Calculation Verified:</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {form.policyStartDate} + {selectedDurationOption?.odYears || 0} Year(s) - 1 Day = {form.odExpiryDate} (OD)
            </p>
            <p className="text-sm text-green-600">
              {form.policyStartDate} + {selectedDurationOption?.tpYears || 0} Year(s) - 1 Day = {form.tpExpiryDate} (TP)
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
};
// ================== STEP 6: Documents (Updated with Requirements & Tagging) ==================
const Documents = ({ form, handleChange, handleSave, isSaving, errors }) => {
  const [uploading, setUploading] = useState(false);
  const [customTagInputs, setCustomTagInputs] = useState({});
  const [showCustomInputs, setShowCustomInputs] = useState({});

  // Document requirements based on case type
  const getDocumentRequirements = () => {
    const requirements = {
      newCar: {
        mandatory: ["Invoice"],
        optional: []
      },
      usedCar: {
        mandatory: ["RC", "Form 29", "Form 30 page 1", "Form 30 page 2", "Pan Number", "GST/Adhaar Card"],
        optional: []
      },
      usedCarRenewal: {
        mandatory: ["RC", "Previous Year Policy"],
        optional: []
      },
      policyExpired: {
        mandatory: ["RC", "Previous Year Policy"],
        optional: []
      }
    };

    return requirements.usedCar;
  };

  const documentRequirements = getDocumentRequirements();

  // Enhanced file extension detection
  const getFileExtensionFromFile = (file) => {
    if (!file) return '';

    // Priority 1: From file name
    if (file.name) {
      const nameParts = file.name.split('.');
      if (nameParts.length > 1) {
        const ext = nameParts.pop().toLowerCase();
        // Map common extensions to ensure consistency
        const extensionMap = {
          'jpeg': 'jpg',
          'jpe': 'jpg',
          'jfif': 'jpg',
          'jif': 'jpg'
        };
        return extensionMap[ext] || ext;
      }
    }

    // Priority 2: From MIME type
    if (file.type) {
      const mimeToExt = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/pjpeg': 'jpg',
        'image/jfif': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/bmp': 'bmp',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/plain': 'txt',
        'application/zip': 'zip',
        'application/x-rar-compressed': 'rar'
      };
      return mimeToExt[file.type] || '';
    }

    return '';
  };

  // Handle document tagging
  const handleDocumentTag = (docId, tag) => {
    const currentTags = form.documentTags || {};
    const updatedTags = { ...currentTags };
    
    if (tag === "other") {
      updatedTags[docId] = "";
      setShowCustomInputs(prev => ({
        ...prev,
        [docId]: true
      }));
      setCustomTagInputs(prev => ({
        ...prev,
        [docId]: ""
      }));
    } else {
      updatedTags[docId] = tag;
      setShowCustomInputs(prev => ({
        ...prev,
        [docId]: false
      }));
    }
    
    handleChange({
      target: {
        name: 'documentTags',
        value: updatedTags
      }
    });
  };

  // Handle custom tag input
  const handleCustomTagInput = (docId, value) => {
    setCustomTagInputs(prev => ({
      ...prev,
      [docId]: value
    }));

    const currentTags = form.documentTags || {};
    const updatedTags = {
      ...currentTags,
      [docId]: value
    };
    
    handleChange({
      target: {
        name: 'documentTags',
        value: updatedTags
      }
    });
  };

  // Handle file selection
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    console.log("🔄 Selected files:", files.length, "files:", files.map(f => ({ 
      name: f.name, 
      type: f.type, 
      size: f.size,
      detectedExtension: getFileExtensionFromFile(f)
    })));

    setUploading(true);

    try {
      const uploadedFiles = await uploadFiles(files);
      const existingDocuments = form.documents || {};
      const newDocuments = { ...existingDocuments };
      
      uploadedFiles.forEach((uploadedFile, index) => {
        const docId = `doc_${Date.now()}_${index}`;
        newDocuments[docId] = uploadedFile;
      });
      
      console.log("📄 Updated documents object:", newDocuments);
      
      handleChange({
        target: {
          name: 'documents',
          value: newDocuments
        }
      });
      
    } catch (error) {
      console.error("❌ Error uploading files:", error);
      alert(`Error uploading files: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Upload multiple files
  const uploadFiles = async (files) => {
    console.log(`📤 Starting upload for ${files.length} files...`);
    
    const uploadPromises = files.map(file => uploadFile(file));
    const results = await Promise.allSettled(uploadPromises);
    
    const successfulUploads = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);
    
    const failedUploads = results.filter(result => result.status === 'rejected');
    
    if (failedUploads.length > 0) {
      console.warn(`⚠️ ${failedUploads.length} files failed to upload`);
      failedUploads.forEach((result, index) => {
        console.error(`Failed upload ${index + 1}:`, result.reason);
      });
      
      if (successfulUploads.length === 0) {
        throw new Error('All files failed to upload');
      }
    }
    
    console.log(`✅ Successfully uploaded ${successfulUploads.length} files`);
    return successfulUploads;
  };

  // Upload single file with enhanced metadata
  const uploadFile = async (file) => {
    const fileExtension = getFileExtensionFromFile(file);
    
    console.log(`🚀 Starting upload for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, type: ${file.type}, detected extension: ${fileExtension})`);
    
    try {
      const fileUrl = await uploadSingleFile(file, fileExtension);
      
      console.log(`✅ Upload completed: ${file.name} -> ${fileUrl}`);
      
      return {
        url: fileUrl,
        name: file.name,
        originalName: file.name,
        extension: fileExtension,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        mimeType: file.type,
        lastModified: file.lastModified
      };
      
    } catch (error) {
      console.error(`❌ Error uploading file ${file.name}:`, error);
      throw error;
    }
  };

  const uploadSingleFile = async (fileObj, detectedExtension) => {
    try {
      const formData = new FormData();
      formData.append('file', fileObj);

      // Add comprehensive file metadata
      formData.append('fileName', fileObj.name);
      formData.append('fileType', fileObj.type);
      formData.append('originalExtension', detectedExtension);
      formData.append('preserveExtension', 'true');
      formData.append('timestamp', Date.now().toString());

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/files',
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        data: formData,
        timeout: 60000 // 60 seconds timeout
      };

      const response = await axios.request(config);
      console.log(`📡 Upload response for ${fileObj.name}:`, response.data);
      
      if (!response.data.path) {
        throw new Error('No file path returned from server');
      }
      
      return response.data.path;
    } catch (error) {
      console.error(`Error uploading file ${fileObj.name}:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // Remove document
  const removeDocument = (docId) => {
    const currentDocuments = form.documents || {};
    const updatedDocuments = { ...currentDocuments };
    delete updatedDocuments[docId];
    
    const currentTags = form.documentTags || {};
    const updatedTags = { ...currentTags };
    delete updatedTags[docId];

    handleChange({
      target: {
        name: 'documents',
        value: updatedDocuments
      }
    });
    
    handleChange({
      target: {
        name: 'documentTags',
        value: updatedTags
      }
    });

    setCustomTagInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[docId];
      return newInputs;
    });

    setShowCustomInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[docId];
      return newInputs;
    });
  };

  // Clear all documents
  const clearAllDocuments = () => {
    if (window.confirm("Are you sure you want to remove all documents?")) {
      handleChange({
        target: {
          name: 'documents',
          value: {}
        }
      });
      
      handleChange({
        target: {
          name: 'documentTags',
          value: {}
        }
      });
      
      setCustomTagInputs({});
      setShowCustomInputs({});
    }
  };

  // Format file name from URL - ENHANCED
  const getFileNameFromUrl = (fileObj) => {
    if (typeof fileObj === 'string') {
      const url = fileObj;
      const fileName = url.split('/').pop() || 'Document';
      // Try to extract extension from URL
      const urlExt = getFileExtension(fileObj);
      if (urlExt && !fileName.includes('.')) {
        return `${fileName}.${urlExt}`;
      }
      return fileName;
    }
    return fileObj?.originalName || fileObj?.name || 'Document';
  };

  // Get file URL
  const getFileUrl = (fileObj) => {
    if (typeof fileObj === 'string') {
      return fileObj;
    }
    return fileObj?.url || '';
  };

  // Get correct file extension for display and download
  const getFileExtension = (fileObj) => {
    if (!fileObj) return 'file';
    
    // If it's a file object with extension property
    if (fileObj.extension && fileObj.extension !== '') {
      return fileObj.extension;
    }
    
    // If it's a file object with name
    if (fileObj.name) {
      const nameParts = fileObj.name.split('.');
      if (nameParts.length > 1) {
        return nameParts.pop().toLowerCase();
      }
    }
    
    // If it's a string URL
    if (typeof fileObj === 'string') {
      const urlParts = fileObj.split('.');
      if (urlParts.length > 1) {
        const ext = urlParts.pop().toLowerCase();
        return ext.split('?')[0]; // Remove query parameters
      }
    }
    
    // Fallback to type-based detection
    if (fileObj.type) {
      const typeMap = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/pjpeg': 'jpg',
        'image/jfif': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/bmp': 'bmp',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/plain': 'txt'
      };
      return typeMap[fileObj.type] || 'file';
    }
    
    return 'file';
  };

  // Get file icon based on file extension
  const getFileIcon = (fileObj) => {
    const extension = getFileExtension(fileObj);
    const fileIcons = {
      pdf: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      bmp: '🖼️',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      txt: '📃'
    };
    return fileIcons[extension] || '📎';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ENHANCED download function with proper extension handling
  const downloadFile = async (fileObj) => {
    try {
      const fileUrl = getFileUrl(fileObj);
      const originalFileName = getFileNameFromUrl(fileObj);
      const fileExtension = getFileExtension(fileObj);
      
      // Ensure the file name has the correct extension
      let downloadFileName = originalFileName;
      const currentExt = downloadFileName.toLowerCase().split('.').pop();
      const correctExt = fileExtension.toLowerCase();
      
      // Fix common extension issues
      const extensionFixes = {
        'jffif': 'jpg',
        'jfif': 'jpg',
        'jpe': 'jpg',
        'jif': 'jpg'
      };
      
      const finalExtension = extensionFixes[correctExt] || correctExt;
      
      if (!downloadFileName.toLowerCase().endsWith(`.${finalExtension}`)) {
        // Remove any existing extension and add the correct one
        downloadFileName = downloadFileName.replace(/\.[^/.]+$/, "") + '.' + finalExtension;
      }
      
      console.log(`📥 Downloading: ${downloadFileName} (corrected extension: ${finalExtension}) from ${fileUrl}`);

      // Method 1: Fetch with proper MIME type handling
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Determine correct MIME type based on extension
      const extensionToMime = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain'
      };
      
      const mimeType = extensionToMime[finalExtension] || blob.type || 'application/octet-stream';
      
      // Create blob with correct MIME type
      const correctedBlob = new Blob([blob], { type: mimeType });
      const blobUrl = window.URL.createObjectURL(correctedBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      console.log(`✅ Download initiated: ${downloadFileName} with MIME type: ${mimeType}`);
      
    } catch (error) {
      console.error('❌ Error downloading file with blob method:', error);
      
      // Fallback method: Direct link with correct extension
      console.log('🔄 Trying fallback download method...');
      const fileUrl = getFileUrl(fileObj);
      const originalFileName = getFileNameFromUrl(fileObj);
      const fileExtension = getFileExtension(fileObj);
      
      const extensionFixes = {
        'jffif': 'jpg',
        'jfif': 'jpg',
        'jpe': 'jpg',
        'jif': 'jpg'
      };
      
      const finalExtension = extensionFixes[fileExtension] || fileExtension;
      let downloadFileName = originalFileName;
      
      if (!downloadFileName.toLowerCase().endsWith(`.${finalExtension}`)) {
        downloadFileName = downloadFileName.replace(/\.[^/.]+$/, "") + '.' + finalExtension;
      }
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = downloadFileName;
      link.target = '_blank';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Fallback download initiated: ${downloadFileName}`);
    }
  };

  // Get current documents count
  const currentDocuments = form.documents || {};
  const documentsCount = Object.keys(currentDocuments).length;
  const taggedDocumentsCount = Object.values(form.documentTags || {}).filter(tag => tag && tag !== '').length;

  // Check if we should show custom input
  const shouldShowCustomInput = (docId) => {
    return showCustomInputs[docId] === true;
  };

  // Get dropdown value
  const getDropdownValue = (docId) => {
    const currentTag = form.documentTags?.[docId];
    if (!currentTag) return "";
    
    if ([...documentRequirements.mandatory, ...documentRequirements.optional].includes(currentTag)) {
      return currentTag;
    }
    
    return "other";
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaFileAlt />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Step 6: Documents
            </h3>
            <p className="text-xs text-gray-500">
              Upload and manage policy documents with tagging
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {documentsCount > 0 && (
            <button
              type="button"
              onClick={clearAllDocuments}
              disabled={uploading}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              <FaTrash /> Clear All
            </button>
          )}
        </div>
      </div>

      {errors.documents && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.documents}</p>
        </div>
      )}

      {/* Document Requirements */}
      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Document Requirements
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              Documents
            </h5>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {documentRequirements.mandatory.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>
          
          {documentRequirements.optional.length > 0 && (
            <div>
              <h5 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-purple-600" />
                Optional Documents
              </h5>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {documentRequirements.optional.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <strong>Note:</strong> Upload all documents first, then tag each document in the section below.
          </p>
        </div>
      </div>

      {/* Documents Count */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-purple-800">Documents Status</h4>
            <p className="text-xs text-purple-700">
              Total Documents: {documentsCount} | Tagged: {taggedDocumentsCount}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              documentsCount > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {documentsCount > 0 ? 'Documents Ready' : 'No Documents'}
            </span>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-md font-semibold text-gray-700">
              Upload Documents
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {documentsCount} document(s) uploaded • {taggedDocumentsCount} tagged
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-gray-400 transition-colors">
          <div className="flex justify-center mb-4 text-gray-500">
            <FaCloudUploadAlt size={40} />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            Drag and drop files here
          </p>
          <p className="text-gray-400 text-sm mb-4">
            or click to browse your files (Multiple files supported)
          </p>
          
          <input
            type="file"
            multiple
            onChange={handleFiles}
            className="hidden"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors ${
              uploading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <FaFileUpload /> 
                Choose Multiple Files
              </>
            )}
          </label>
          
          <p className="text-gray-400 text-xs mt-4">
            Supported: PDF, JPG, PNG, GIF, WEBP, BMP, DOC, DOCX, XLS, XLSX, TXT • Max file size: 10MB each
          </p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <FaSpinner className="animate-spin" />
              Uploading files... Please wait.
            </p>
          </div>
        )}

        {/* Documents List */}
        {documentsCount > 0 && (
          <div className="mt-6">
            <h5 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaListAlt />
              Uploaded Documents ({documentsCount})
            </h5>
            
            <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-2">
              {Object.entries(currentDocuments).map(([docId, fileObj]) => (
                <div
                  key={docId}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">
                      {getFileIcon(fileObj)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {getFileNameFromUrl(fileObj)}
                        </p>
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <FaCheckCircle size={10} />
                          Uploaded
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                        <span>{formatFileSize(fileObj.size)}</span>
                        <span>•</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          {getFileExtension(fileObj).toUpperCase()}
                        </span>
                        {fileObj.type && (
                          <>
                            <span>•</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {fileObj.type}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download Button */}
                    <button
                      onClick={() => downloadFile(fileObj)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Download document"
                    >
                      <FaDownload />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => removeDocument(docId)}
                      disabled={uploading}
                      className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                      title="Remove document"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {documentsCount === 0 && !uploading && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <FaFileAlt size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              No documents uploaded yet. Upload documents to continue.
            </p>
          </div>
        )}

        {/* Tagging Section */}
        {documentsCount > 0 && (
          <div className="border rounded-xl p-5 mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaTags />
              Document Tagging
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Tag each uploaded document with its document type. Select "Other" for custom document types.
            </p>
            
            <div className="space-y-4">
              {Object.entries(currentDocuments).map(([docId, fileObj]) => (
                <div key={docId} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-gray-50 gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">
                      {getFileIcon(fileObj)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {getFileNameFromUrl(fileObj)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.size)}
                        </p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          {getFileExtension(fileObj).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
                    <div className="flex flex-col md:flex-row gap-3 w-full">
                      <select
                        value={getDropdownValue(docId)}
                        onChange={(e) => handleDocumentTag(docId, e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none w-full md:w-48"
                      >
                        <option value="">Select document type</option>
                        <optgroup label="Documents">
                          {documentRequirements.mandatory.map((docType) => (
                            <option key={docType} value={docType}>{docType}</option>
                          ))}
                        </optgroup>
                        {documentRequirements.optional.length > 0 && (
                          <optgroup label="Optional">
                            {documentRequirements.optional.map((docType) => (
                              <option key={docType} value={docType}>{docType}</option>
                            ))}
                          </optgroup>
                        )}
                        <option value="other">Other (Custom)</option>
                      </select>
                      
                      {shouldShowCustomInput(docId) && (
                        <input
                          type="text"
                          value={customTagInputs[docId] || ""}
                          onChange={(e) => handleCustomTagInput(docId, e.target.value)}
                          placeholder="Enter custom document name"
                          className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none w-full md:w-48"
                        />
                      )}
                    </div>
                    
                    {form.documentTags?.[docId] && form.documentTags[docId] !== "" && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap flex items-center gap-1">
                        <FaTag size={10} />
                        {form.documentTags[docId]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tagging Summary */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <FaCheckCircle />
                <strong>Tagging Progress:</strong> {taggedDocumentsCount} of {documentsCount} documents tagged
              </p>
              {taggedDocumentsCount === documentsCount && documentsCount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ All documents have been tagged! You can proceed to the next step.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ================== STEP 7: Payment ==================
const Payment = ({ 
  form, 
  handleChange, 
  handleSave, 
  isSaving, 
  errors, 
  paymentHistory = [], 
  totalPremium, 
  onNextStep, 
  paymentLedger: propPaymentLedger, 
  onPaymentLedgerUpdate,
  acceptedQuote
}) => {
  // Format number in Indian digit format (e.g., 10,00,000)
  const formatIndianNumber = (number) => {
    if (!number && number !== 0) return '0';
    
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    
    // Handle decimal numbers
    const [integerPart, decimalPart] = num.toFixed(2).split('.');
    
    // Indian numbering system: 1,00,000 format
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    
    if (otherNumbers !== '') {
      const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
      return decimalPart ? `${formatted}.${decimalPart}` : formatted;
    }
    
    return decimalPart ? `${lastThree}.${decimalPart}` : lastThree;
  };

  // Comprehensive list of Indian banks for auto-suggest
  const indianBanks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Axis Bank",
    "Union Bank of India",
    "Bank of India",
    "Indian Bank",
    "Central Bank of India",
    "IndusInd Bank",
    "Kotak Mahindra Bank",
    "Yes Bank",
    "IDBI Bank",
    "IDFC First Bank",
    "Bandhan Bank",
    "Federal Bank",
    "RBL Bank",
    "South Indian Bank",
    "Karnataka Bank",
    "Karur Vysya Bank",
    "City Union Bank",
    "DCB Bank",
    "Jammu & Kashmir Bank",
    "Dhanlaxmi Bank",
    "DBS Bank India",
    "Citibank India",
    "Standard Chartered Bank",
    "HSBC Bank India",
    "Deutsche Bank",
    "Baroda Rajasthan Kshetriya Gramin Bank",
    "Andhra Pradesh Grameena Vikas Bank",
    "Andhra Pragathi Grameena Bank",
    "Saptagiri Grameena Bank",
    "Chaitanya Godavari Grameena Bank",
    "Assam Gramin Vikash Bank",
    "Madhya Bihar Gramin Bank",
    "Bihar Gramin Bank",
    "Chhattisgarh Rajya Gramin Bank",
    "Saurashtra Gramin Bank",
    "Baroda Gujarat Gramin Bank",
    "Himachal Pradesh Gramin Bank",
    "Ellaquai Dehati Bank",
    "Jammu and Kashmir Grameen Bank",
    "Jharkhand Rajya Gramin Bank",
    "Karnataka Gramin Bank",
    "Karnataka Vikas Grameena Bank",
    "Kerala Gramin Bank",
    "Madhya Pradesh Gramin Bank",
    "Maharashtra Gramin Bank",
    "Manipur Rural Bank",
    "Meghalaya Rural Bank",
    "Mizoram Rural Bank",
    "Nagaland Rural Bank",
    "Odisha Gramya Bank",
    "Puduvai Bharathiar Grama Bank",
    "Punjab Gramin Bank",
    "Rajasthan Marudhara Gramin Bank",
    "Tamil Nadu Grama Bank",
    "Telangana Grameena Bank",
    "Tripura Gramin Bank",
    "Uttar Bihar Gramin Bank",
    "Uttarakhand Gramin Bank",
    "Uttar Pradesh Gramin Bank",
    "West Bengal Gramin Bank"
  ];

  // State for bank suggestions
  const [bankSuggestions, setBankSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeBankIndex, setActiveBankIndex] = useState(-1);

  // State for editing payment
  const [editingPayment, setEditingPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // State for subvention/discount
  const [showSubventionForm, setShowSubventionForm] = useState(false);
  const [subventionAmount, setSubventionAmount] = useState('');
  const [subventionReason, setSubventionReason] = useState('');
  const [subventionEntries, setSubventionEntries] = useState([]);

  // Use the final premium amount directly from acceptedQuote
  const finalPremiumAmount = acceptedQuote?.totalPremium || 0;

  // Calculate total customer payments (both direct and via in house)
  const calculateTotalCustomerPayments = () => {
    return paymentLedger
      .filter(payment => payment.paymentMadeBy === "Customer" && payment.type !== "subvention_refund")
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Calculate remaining amount that customer can pay
  const calculateCustomerRemainingAmount = () => {
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const netAmount = finalPremiumAmount - totalSubventionRefund;
    return Math.max(netAmount - totalCustomerPayments, 0);
  };

  // Calculate payment progress percentage (based only on customer payments)
  const calculatePaymentProgress = () => {
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const netPremium = Math.max(finalPremiumAmount - totalSubventionRefund, 0);
    
    return netPremium > 0 ? Math.min((totalCustomerPayments / netPremium) * 100, 100) : 100;
  };

  // Calculate overall payment status (based only on customer payments)
  const calculateOverallPaymentStatus = () => {
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const netPremium = Math.max(finalPremiumAmount - totalSubventionRefund, 0);
    
    return totalCustomerPayments >= netPremium ? 'Fully Paid' : 'Payment Pending';
  };
  
  // Payment modes for Customer (includes subvention)
  const customerPaymentModeOptions = [
    "Online Transfer/UPI",
    "Cash",
    "Cheque",
    "Credit/Debit Card",
    "Subvention"
  ];

  // Payment modes for In House (excludes subvention)
  const inHousePaymentModeOptions = [
    "Online Transfer/UPI",
    "Cash",
    "Cheque",
    "Credit/Debit Card"
  ];

  // Payment made by options
  const paymentMadeByOptions = [
    { value: "Customer", label: "Customer" },
    { value: "In House", label: "In House" }
  ];

  // State for payment ledger - use prop if provided, otherwise local state
  const [paymentLedger, setPaymentLedger] = useState(propPaymentLedger || paymentHistory || []);
  
  // State for auto credit amount - equals final premium minus subvention refunds
  const [autoCreditAmount, setAutoCreditAmount] = useState(finalPremiumAmount || "");

  // Calculate total subvention refund amount
  const calculateTotalSubventionRefund = () => {
    return paymentLedger
      .filter(payment => payment.type === "subvention_refund")
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // NEW: Handle adding individual subvention amounts one by one
  const handleAddSubventionEntry = () => {
    if (!subventionAmount || subventionAmount <= 0) {
      alert("Please enter a valid subvention amount");
      return;
    }

    const amount = parseFloat(subventionAmount);
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const remainingSubventionCapacity = finalPremiumAmount - totalSubventionRefund;

    if (amount > remainingSubventionCapacity) {
      alert(`Subvention amount cannot exceed remaining capacity of ₹${formatIndianNumber(remainingSubventionCapacity)}`);
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      amount: amount,
      reason: subventionReason || "Subvention discount"
    };

    setSubventionEntries(prev => [...prev, newEntry]);
    setSubventionAmount('');
    setSubventionReason('');
  };

  // NEW: Handle final subvention submission
  const handleSubventionRefund = async () => {
    if (subventionEntries.length === 0) {
      alert("Please add at least one subvention entry");
      return;
    }

    const totalSubventionAmount = subventionEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExistingSubvention = calculateTotalSubventionRefund();
    
    if (totalSubventionAmount > finalPremiumAmount) {
      alert("Total subvention amount cannot exceed final premium amount");
      return;
    }

    try {
      // Create subvention refund entries for each subvention entry
      const subventionRefunds = subventionEntries.map(entry => ({
        id: Date.now().toString() + '_subvention_refund_' + entry.id,
        date: new Date().toISOString().split('T')[0],
        description: `Subvention Refund - ${entry.reason}`,
        amount: entry.amount,
        mode: "Subvention Refund",
        status: 'Completed',
        transactionId: 'N/A',
        bankName: 'N/A',
        paymentMadeBy: "In House",
        receiptDate: new Date().toISOString().split('T')[0],
        payoutBy: "Customer",
        type: "subvention_refund"
      }));

      const updatedLedger = [...paymentLedger, ...subventionRefunds];
      
      // Update auto credit status if needed
      const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
      
      setPaymentLedger(updatedLedgerWithAutoCreditStatus);
      
      // Notify parent component about ledger update
      if (onPaymentLedgerUpdate) {
        onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
      }
      
      // Update payment status and totals
      const totalCustomerPayments = calculateTotalCustomerPayments();
      const paymentStatus = calculateOverallPaymentStatus();

      const paymentData = {
        payment_info: {
          paymentMadeBy: form.paymentMadeBy,
          paymentMode: form.paymentMode || "",
          paymentAmount: parseFloat(form.paymentAmount) || 0,
          paymentDate: form.paymentDate || '',
          transactionId: form.transactionId || '',
          receiptDate: form.receiptDate || '',
          bankName: form.bankName || '',
          subvention_payment: "Subvention Refund Applied",
          paymentStatus: paymentStatus,
          totalPaidAmount: totalCustomerPayments,
          totalSubventionRefund: totalSubventionAmount + totalExistingSubvention
        },
        payment_ledger: updatedLedgerWithAutoCreditStatus
      };

      console.log("💰 Adding subvention refunds:", paymentData);

      // Save to backend
      await handleSave(paymentData);
      
      // Clear subvention form and entries
      setSubventionEntries([]);
      setSubventionAmount('');
      setSubventionReason('');
      setShowSubventionForm(false);
      
      alert(`Subvention refunds totaling ₹${formatIndianNumber(totalSubventionAmount)} added successfully!`);
      
    } catch (error) {
      console.error('Error saving subvention refund:', error);
      alert('Error saving subvention refund. Please try again.');
    }
  };

  // NEW: Remove individual subvention entry
  const handleRemoveSubventionEntry = (entryId) => {
    setSubventionEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Check if auto credit entry exists and get its status
  const getAutoCreditEntry = () => {
    return paymentLedger.find(payment => payment.type === "auto_credit");
  };

  // Calculate auto credit status based on customer payments
  const calculateAutoCreditStatus = () => {
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const netPremium = Math.max(finalPremiumAmount - totalSubventionRefund, 0);
    
    const autoCreditEntry = getAutoCreditEntry();
    
    if (!autoCreditEntry) return 'Not Created';
    
    if (totalCustomerPayments >= netPremium) {
      return 'Completed';
    } else {
      return 'Pending';
    }
  };

  // Handle bank name input change with auto-suggest
  const handleBankNameChange = (e, bankType = 'customer') => {
    const value = e.target.value;
    
    // Update the form state
    if (bankType === 'customer') {
      handleChange({
        target: {
          name: 'customerBankName',
          value: value
        }
      });
    } else if (bankType === 'inHouse') {
      handleChange({
        target: {
          name: 'inHouseBankName',
          value: value
        }
      });
    } else if (bankType === 'autoCredit') {
      handleChange({
        target: {
          name: 'autoCreditBankName',
          value: value
        }
      });
    }
    
    // Show suggestions if input is not empty
    if (value.length > 0) {
      const filteredBanks = indianBanks.filter(bank =>
        bank.toLowerCase().includes(value.toLowerCase())
      );
      setBankSuggestions(filteredBanks);
      setShowSuggestions(true);
      setActiveBankIndex(-1);
    } else {
      setShowSuggestions(false);
      setBankSuggestions([]);
    }
  };

  // Handle bank suggestion selection
  const handleBankSelect = (bankName, bankType = 'customer') => {
    if (bankType === 'customer') {
      handleChange({
        target: {
          name: 'customerBankName',
          value: bankName
        }
      });
    } else if (bankType === 'inHouse') {
      handleChange({
        target: {
          name: 'inHouseBankName',
          value: bankName
        }
      });
    } else if (bankType === 'autoCredit') {
      handleChange({
        target: {
          name: 'autoCreditBankName',
          value: bankName
        }
      });
    }
    setShowSuggestions(false);
    setBankSuggestions([]);
    setActiveBankIndex(-1);
  };

  // Handle keyboard navigation for bank suggestions
  const handleBankKeyDown = (e, bankType = 'customer') => {
    if (!showSuggestions) return;

    let bankFieldValue;
    if (bankType === 'customer') {
      bankFieldValue = form.customerBankName;
    } else if (bankType === 'inHouse') {
      bankFieldValue = form.inHouseBankName;
    } else if (bankType === 'autoCredit') {
      bankFieldValue = form.autoCreditBankName;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveBankIndex(prev => 
          prev < bankSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveBankIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeBankIndex >= 0 && bankSuggestions[activeBankIndex]) {
          handleBankSelect(bankSuggestions[activeBankIndex], bankType);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveBankIndex(-1);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.bank-suggestions-container')) {
        setShowSuggestions(false);
        setActiveBankIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle radio button change
  const handleRadioChange = (fieldName, value) => {
    handleChange({ 
      target: { 
        name: fieldName, 
        value: value 
      } 
    });
  };

  // Handle auto credit amount change
  const handleAutoCreditChange = (e) => {
    const value = e.target.value;
    setAutoCreditAmount(value);
    handleChange({
      target: {
        name: 'autoCreditAmount',
        value: value
      }
    });
  };

  // EDIT PAYMENT FUNCTIONS - FIXED TO ALLOW PROPER TEXT INPUT
  const handleEditPayment = (payment) => {
    console.log("Editing payment:", payment);
    setEditingPayment(payment.id);
    setEditFormData({
      date: payment.date,
      description: payment.description,
      amount: payment.amount,
      mode: payment.mode,
      status: payment.status,
      transactionId: payment.transactionId || '',
      bankName: payment.bankName || '',
      paymentMadeBy: payment.paymentMadeBy,
      receiptDate: payment.receiptDate || payment.date,
      payoutBy: payment.payoutBy
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle different input types appropriately
    if (type === 'number') {
      setEditFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveEdit = async () => {
    console.log("Saving edited payment:", editFormData);
    
    if (!editFormData.amount || !editFormData.date || !editFormData.mode) {
      alert("Please fill all required fields (Amount, Date, and Payment Mode)");
      return;
    }

    try {
      const updatedLedger = paymentLedger.map(payment => 
        payment.id === editingPayment 
          ? { 
              ...payment, 
              ...editFormData,
              amount: typeof editFormData.amount === 'string' ? parseFloat(editFormData.amount) || 0 : editFormData.amount
            }
          : payment
      );

      console.log("Updated ledger after edit:", updatedLedger);

      // Update auto credit status if needed
      const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
      
      setPaymentLedger(updatedLedgerWithAutoCreditStatus);
      
      // Notify parent component about ledger update
      if (onPaymentLedgerUpdate) {
        onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
      }
      
      // Update payment status and totals
      const totalCustomerPayments = calculateTotalCustomerPayments();
      const paymentStatus = calculateOverallPaymentStatus();

      const paymentData = {
        payment_info: {
          paymentMadeBy: form.paymentMadeBy || "Customer",
          paymentMode: form.paymentMode || "",
          paymentAmount: parseFloat(form.paymentAmount) || 0,
          paymentDate: form.paymentDate || '',
          transactionId: form.transactionId || '',
          receiptDate: form.receiptDate || '',
          bankName: form.bankName || '',
          subvention_payment: form.paymentMode?.includes('Subvention') ? form.paymentMode : "No Subvention",
          paymentStatus: paymentStatus,
          totalPaidAmount: totalCustomerPayments
        },
        payment_ledger: updatedLedgerWithAutoCreditStatus
      };

      console.log("Saving payment data after edit:", paymentData);

      // Save to backend
      await handleSave(paymentData);
      
      // Close edit form
      setEditingPayment(null);
      setEditFormData({});
      
      alert("Payment updated successfully!");
      
    } catch (error) {
      console.error('Error saving edited payment:', error);
      alert('Error saving edited payment. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setEditFormData({});
  };

  // Add payment to ledger function for Customer
  const addCustomerPaymentToLedger = async () => {
    if (!form.customerPaymentAmount || !form.customerPaymentDate || !form.customerPaymentMode) {
      alert("Please fill all required payment fields for Customer payment");
      return;
    }

    const paymentAmount = parseFloat(form.customerPaymentAmount);
    const customerRemainingAmount = calculateCustomerRemainingAmount();

    // Check if payment amount exceeds remaining amount
    if (paymentAmount > customerRemainingAmount) {
      alert(`Payment amount cannot exceed remaining amount of ₹${formatIndianNumber(customerRemainingAmount)}`);
      return;
    }

    const newPayment = {
      id: Date.now().toString() + '_customer',
      date: form.customerPaymentDate,
      description: `Customer Payment - ${form.customerPaymentMode}`,
      amount: paymentAmount,
      mode: form.customerPaymentMode,
      status: 'Completed',
      transactionId: form.customerTransactionId || 'N/A',
      bankName: form.customerBankName || 'N/A',
      paymentMadeBy: "Customer",
      receiptDate: form.customerReceiptDate || form.customerPaymentDate,
      payoutBy: "Customer",
      type: "customer_payment"
    };

    const updatedLedger = [...paymentLedger, newPayment];
    
    // Update auto credit status if it exists
    const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
    
    setPaymentLedger(updatedLedgerWithAutoCreditStatus);
    
    // Notify parent component about ledger update
    if (onPaymentLedgerUpdate) {
      onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
    }
    
    // Update payment status and totals
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const paymentStatus = calculateOverallPaymentStatus();

    const paymentData = {
      payment_info: {
        paymentMadeBy: "Customer",
        paymentMode: form.customerPaymentMode,
        paymentAmount: paymentAmount,
        paymentDate: form.customerPaymentDate,
        transactionId: form.customerTransactionId || '',
        receiptDate: form.customerReceiptDate || form.customerPaymentDate,
        bankName: form.customerBankName || '',
        subvention_payment: form.customerPaymentMode.includes('Subvention') ? form.customerPaymentMode : "No Subvention",
        paymentStatus: paymentStatus,
        totalPaidAmount: totalCustomerPayments
      },
      payment_ledger: updatedLedgerWithAutoCreditStatus
    };

    console.log("💰 Adding Customer payment to ledger:", paymentData);

    try {
      // Save to backend
      await handleSave(paymentData);
      
      // Clear customer payment form (keep payment mode for convenience)
      handleChange({ target: { name: 'customerPaymentAmount', value: '' } });
      handleChange({ target: { name: 'customerPaymentDate', value: '' } });
      handleChange({ target: { name: 'customerTransactionId', value: '' } });
      handleChange({ target: { name: 'customerReceiptDate', value: '' } });
      handleChange({ target: { name: 'customerBankName', value: '' } });
      
    } catch (error) {
      console.error('Error saving customer payment:', error);
      alert('Error saving customer payment. Please try again.');
    }
  };

  // Add payment to ledger function for In House
  const addInHousePaymentToLedger = async () => {
    if (!form.inHousePaymentAmount || !form.inHousePaymentDate || !form.inHousePaymentMode || 
        !form.autoCreditPaymentMode || !form.autoCreditPaymentDate) {
      alert("Please fill all required payment fields for In House payment");
      return;
    }

    const paymentAmount = parseFloat(form.inHousePaymentAmount);
    const customerRemainingAmount = calculateCustomerRemainingAmount();

    // Check if payment amount exceeds remaining amount
    if (paymentAmount > customerRemainingAmount) {
      alert(`Payment amount cannot exceed remaining amount of ₹${formatIndianNumber(customerRemainingAmount)}`);
      return;
    }

    // Check if auto credit entry already exists for this premium
    const existingAutoCredit = getAutoCreditEntry();

    let updatedLedger = [...paymentLedger];

    // Add auto credit entry only if it doesn't exist
    if (!existingAutoCredit) {
      const totalSubventionRefund = calculateTotalSubventionRefund();
      const netPremium = Math.max(finalPremiumAmount - totalSubventionRefund, 0);
      
      const autoCreditPayment = {
        id: Date.now().toString() + '_auto_credit',
        date: form.autoCreditPaymentDate,
        description: `Auto Credit to Insurance Company - ${form.autoCreditPaymentMode}`,
        amount: netPremium,
        mode: form.autoCreditPaymentMode,
        status: 'Pending', // Initially pending until customer pays full amount
        transactionId: form.autoCreditTransactionId || 'N/A',
        bankName: form.autoCreditBankName || 'N/A',
        paymentMadeBy: "In House",
        receiptDate: form.autoCreditPaymentDate,
        payoutBy: "Auto Credit to Insurance Company",
        type: "auto_credit"
      };
      updatedLedger.push(autoCreditPayment);
    }

    // Create customer payment entry (money received from customer)
    const customerPaymentEntry = {
      id: Date.now().toString() + '_inhouse_customer',
      date: form.inHousePaymentDate,
      description: `Customer Payment via In House - ${form.inHousePaymentMode}`,
      amount: paymentAmount,
      mode: form.inHousePaymentMode,
      status: 'Completed',
      transactionId: form.inHouseTransactionId || 'N/A',
      bankName: form.inHouseBankName || 'N/A',
      paymentMadeBy: "Customer",
      receiptDate: form.inHouseReceiptDate || form.inHousePaymentDate,
      payoutBy: "In House",
      type: "customer_payment_via_inhouse"
    };

    updatedLedger.push(customerPaymentEntry);
    
    // Update auto credit status based on total customer payments
    const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
    
    setPaymentLedger(updatedLedgerWithAutoCreditStatus);
    
    // Notify parent component about ledger update
    if (onPaymentLedgerUpdate) {
      onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
    }
    
    // Update payment status and totals
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const paymentStatus = calculateOverallPaymentStatus();

    const paymentData = {
      payment_info: {
        paymentMadeBy: "In House",
        autoCreditAmount: finalPremiumAmount,
        autoCreditPaymentMode: form.autoCreditPaymentMode,
        autoCreditPaymentDate: form.autoCreditPaymentDate,
        autoCreditTransactionId: form.autoCreditTransactionId || '',
        autoCreditBankName: form.autoCreditBankName || '',
        paymentMode: form.inHousePaymentMode,
        paymentAmount: paymentAmount,
        paymentDate: form.inHousePaymentDate,
        transactionId: form.inHouseTransactionId || '',
        receiptDate: form.inHouseReceiptDate || form.inHousePaymentDate,
        bankName: form.inHouseBankName || '',
        subvention_payment: "No Subvention", // In House payments don't have subvention
        paymentStatus: paymentStatus,
        totalPaidAmount: totalCustomerPayments
      },
      payment_ledger: updatedLedgerWithAutoCreditStatus
    };

    console.log("💰 Adding In House payment to ledger:", paymentData);

    try {
      // Save to backend
      await handleSave(paymentData);
      
      // Clear in house payment form (keep payment mode for convenience)
      handleChange({ target: { name: 'inHousePaymentAmount', value: '' } });
      handleChange({ target: { name: 'inHousePaymentDate', value: '' } });
      handleChange({ target: { name: 'inHouseTransactionId', value: '' } });
      handleChange({ target: { name: 'inHouseReceiptDate', value: '' } });
      handleChange({ target: { name: 'inHouseBankName', value: '' } });
      
    } catch (error) {
      console.error('Error saving in house payment:', error);
      alert('Error saving in house payment. Please try again.');
    }
  };

  // Update auto credit status based on total customer payments
  const updateAutoCreditStatus = (ledger) => {
    const totalCustomerPayments = ledger
      .filter(payment => payment.paymentMadeBy === "Customer" && payment.type !== "subvention_refund")
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const netPremium = Math.max(finalPremiumAmount - totalSubventionRefund, 0);
    
    const autoCreditEntry = ledger.find(payment => payment.type === "auto_credit");
    
    if (autoCreditEntry) {
      const newStatus = totalCustomerPayments >= netPremium ? 'Completed' : 'Pending';
      
      return ledger.map(payment => 
        payment.type === "auto_credit" 
          ? { ...payment, status: newStatus }
          : payment
      );
    }
    
    return ledger;
  };

  // DELETE PAYMENT FUNCTION
  const deletePaymentFromLedger = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    const paymentToDelete = paymentLedger.find(payment => payment.id === paymentId);
    let updatedLedger = paymentLedger.filter(payment => payment.id !== paymentId);
    
    // Update auto credit status after deletion
    updatedLedger = updateAutoCreditStatus(updatedLedger);
    
    setPaymentLedger(updatedLedger);
    
    // Notify parent component about ledger update
    if (onPaymentLedgerUpdate) {
      onPaymentLedgerUpdate(updatedLedger);
    }
    
    // Update payment status and totals
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const paymentStatus = calculateOverallPaymentStatus();

    const paymentData = {
      payment_info: {
        paymentMadeBy: form.paymentMadeBy,
        paymentMode: form.paymentMode,
        paymentAmount: 0,
        paymentDate: form.paymentDate || '',
        transactionId: form.transactionId || '',
        receiptDate: form.receiptDate || '',
        bankName: form.bankName || '',
        subvention_payment: "No Subvention",
        paymentStatus: paymentStatus,
        totalPaidAmount: totalCustomerPayments
      },
      payment_ledger: updatedLedger
    };

    console.log("🗑️ Updated payment data after deletion:", paymentData);

    try {
      // Save updated data to backend
      await handleSave(paymentData);
      
      // Update form state with new totals
      handleChange({
        target: {
          name: 'paymentStatus',
          value: paymentStatus
        }
      });

      handleChange({
        target: {
          name: 'totalPaidAmount',
          value: totalCustomerPayments
        }
      });

    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment. Please try again.');
    }
  };

  // Handle next step
  const handleNextStep = async () => {
    const totalCustomerPayments = calculateTotalCustomerPayments();
    const paymentStatus = calculateOverallPaymentStatus();
    
    const finalPaymentData = {
      payment_info: {
        paymentMadeBy: form.paymentMadeBy,
        paymentMode: form.paymentMode,
        paymentAmount: parseFloat(form.paymentAmount) || 0,
        paymentDate: form.paymentDate,
        transactionId: form.transactionId || '',
        receiptDate: form.receiptDate || '',
        bankName: form.bankName || '',
        subvention_payment: form.paymentMode.includes('Subvention') ? form.paymentMode : "No Subvention",
        paymentStatus: paymentStatus,
        totalPaidAmount: totalCustomerPayments
      },
      payment_ledger: paymentLedger
    };

    console.log("💰 Final payment data before next step:", finalPaymentData);

    // Update payment status in form
    handleChange({
      target: {
        name: 'paymentStatus',
        value: paymentStatus
      }
    });

    handleChange({
      target: {
        name: 'totalPaidAmount',
        value: totalCustomerPayments
      }
    });

    // Save current state before proceeding
    try {
      await handleSave(finalPaymentData);
      
      setTimeout(() => {
        if (onNextStep && typeof onNextStep === 'function') {
          onNextStep();
        } else {
          console.error('onNextStep is not a function');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error saving before next step:', error);
    }
  };

  // Calculate total subvention amount from ledger
  const calculateTotalSubvention = () => {
    const subventionModes = [
      "Bank Subvention", 
      "Dealer Subvention",
      "Manufacturer Subvention",
      "Special Offer Subvention",
      "Subvention" // Generic subvention
    ];
    
    return paymentLedger
      .filter(payment => 
        subventionModes.some(mode => 
          payment.mode?.toLowerCase().includes(mode.toLowerCase()) ||
          payment.description?.toLowerCase().includes('subvention')
        ) && payment.paymentMadeBy === "Customer"
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Calculate money distribution
  const calculateAutoCreditAmountTotal = () => {
    return paymentLedger
      .filter(payment => payment.payoutBy === "Auto Credit to Insurance Company")
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateCustomerReceivedAmount = () => {
    return paymentLedger
      .filter(payment => payment.payoutBy === "Customer")
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateInHouseReceivedAmount = () => {
    return paymentLedger
      .filter(payment => payment.payoutBy === "In House")
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Check if auto credit entry exists
  const autoCreditExists = paymentLedger.some(payment => payment.type === "auto_credit");
  const autoCreditStatus = calculateAutoCreditStatus();
  const totalCustomerPayments = calculateTotalCustomerPayments();
  const totalSubventionRefund = calculateTotalSubventionRefund();
  const customerRemainingAmount = calculateCustomerRemainingAmount();
  const paymentProgress = calculatePaymentProgress();
  const overallPaymentStatus = calculateOverallPaymentStatus();
  const netPremium = Math.max(finalPremiumAmount - totalSubventionRefund, 0);

  // NEW: Check if payout should be disabled
  const isPayoutDisabled = customerRemainingAmount > 0;

  // Ensure form fields are properly initialized
  useEffect(() => {
    const initialFields = {
      paymentMadeBy: form.paymentMadeBy || "Customer",
      customerPaymentMode: form.customerPaymentMode || "",
      customerPaymentAmount: form.customerPaymentAmount || "",
      customerPaymentDate: form.customerPaymentDate || "",
      customerTransactionId: form.customerTransactionId || "",
      customerReceiptDate: form.customerReceiptDate || "",
      customerBankName: form.customerBankName || "",
      inHousePaymentMode: form.inHousePaymentMode || "",
      inHousePaymentAmount: form.inHousePaymentAmount || "",
      inHousePaymentDate: form.inHousePaymentDate || "",
      inHouseTransactionId: form.inHouseTransactionId || "",
      inHouseReceiptDate: form.inHouseReceiptDate || "",
      inHouseBankName: form.inHouseBankName || "",
      autoCreditPaymentMode: form.autoCreditPaymentMode || "",
      autoCreditPaymentDate: form.autoCreditPaymentDate || "",
      autoCreditTransactionId: form.autoCreditTransactionId || "",
      autoCreditBankName: form.autoCreditBankName || "",
      autoCreditAmount: form.autoCreditAmount || netPremium,
      subvention_payment: form.subvention_payment || "No Subvention"
    };
    
    Object.keys(initialFields).forEach(key => {
      if (!form[key] && initialFields[key] !== "") {
        handleChange({
          target: {
            name: key,
            value: initialFields[key]
          }
        });
      }
    });
    
    if (netPremium) {
      setAutoCreditAmount(netPremium);
    }
  }, [finalPremiumAmount, totalSubventionRefund]);

  // Update ledger when propPaymentLedger changes
  useEffect(() => {
    if (propPaymentLedger && propPaymentLedger.length >= 0) {
      setPaymentLedger(propPaymentLedger);
    }
  }, [propPaymentLedger]);

  const paymentStatusColor = overallPaymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  
  const totalSubvention = calculateTotalSubvention();
  const customerReceived = calculateCustomerReceivedAmount();
  const inHouseReceived = calculateInHouseReceivedAmount();
  const autoCreditTotal = calculateAutoCreditAmountTotal();

  // Bank Suggestions Component
  const BankSuggestions = ({ bankType = 'customer' }) => {
    if (!showSuggestions || bankSuggestions.length === 0) return null;

    return (
      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
        {bankSuggestions.map((bank, index) => (
          <div
            key={bank}
            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
              index === activeBankIndex ? 'bg-blue-50 border border-blue-200' : ''
            } ${index !== bankSuggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
            onClick={() => handleBankSelect(bank, bankType)}
            onMouseEnter={() => setActiveBankIndex(index)}
          >
            <div className="text-sm text-gray-800">{bank}</div>
          </div>
        ))}
      </div>
    );
  };

  // UPDATED: Subvention Form Component with one-by-one entry
  const SubventionForm = ({ 
    setShowSubventionForm, 
    calculateTotalSubventionRefund,
    finalPremiumAmount,
    formatIndianNumber 
  }) => {
    const [localSubventionEntries, setLocalSubventionEntries] = useState([]);
    const [localSubventionAmount, setLocalSubventionAmount] = useState('');
    const [localSubventionReason, setLocalSubventionReason] = useState('');

    const totalSubventionAmount = localSubventionEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExistingSubvention = calculateTotalSubventionRefund();
    const remainingCapacity = finalPremiumAmount - totalExistingSubvention - totalSubventionAmount;

    const handleAmountChange = (e) => {
      const value = e.target.value;
      setLocalSubventionAmount(value);
    };

    const handleAddSubventionEntry = () => {
      const amount = parseFloat(localSubventionAmount);
      if (!amount || amount <= 0) {
        alert("Please enter a valid subvention amount");
        return;
      }

      if (amount > remainingCapacity) {
        alert(`Subvention amount cannot exceed remaining capacity of ₹${formatIndianNumber(remainingCapacity)}`);
        return;
      }

      const newEntry = {
        id: Date.now(),
        amount: amount,
        reason: localSubventionReason || 'No reason provided'
      };
      setLocalSubventionEntries([...localSubventionEntries, newEntry]);
      setLocalSubventionAmount('');
      setLocalSubventionReason('');
    };

    const handleRemoveSubventionEntry = (id) => {
      setLocalSubventionEntries(localSubventionEntries.filter(entry => entry.id !== id));
    };

    const handleSubventionRefund = async () => {
      if (localSubventionEntries.length === 0) {
        alert("Please add at least one subvention entry");
        return;
      }

      const totalSubventionAmount = localSubventionEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const totalExistingSubvention = calculateTotalSubventionRefund();
      
      if (totalSubventionAmount > finalPremiumAmount) {
        alert("Total subvention amount cannot exceed final premium amount");
        return;
      }

      try {
        // Create subvention refund entries for each subvention entry
        const subventionRefunds = localSubventionEntries.map(entry => ({
          id: Date.now().toString() + '_subvention_refund_' + entry.id,
          date: new Date().toISOString().split('T')[0],
          description: `Subvention Refund - ${entry.reason}`,
          amount: entry.amount,
          mode: "Subvention Refund",
          status: 'Completed',
          transactionId: 'N/A',
          bankName: 'N/A',
          paymentMadeBy: "In House",
          receiptDate: new Date().toISOString().split('T')[0],
          payoutBy: "Customer",
          type: "subvention_refund"
        }));

        const updatedLedger = [...paymentLedger, ...subventionRefunds];
        
        // Update auto credit status if needed
        const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
        
        setPaymentLedger(updatedLedgerWithAutoCreditStatus);
        
        // Notify parent component about ledger update
        if (onPaymentLedgerUpdate) {
          onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
        }
        
        // Update payment status and totals
        const totalCustomerPayments = calculateTotalCustomerPayments();
        const paymentStatus = calculateOverallPaymentStatus();

        const paymentData = {
          payment_info: {
            paymentMadeBy: form.paymentMadeBy,
            paymentMode: form.paymentMode || "",
            paymentAmount: parseFloat(form.paymentAmount) || 0,
            paymentDate: form.paymentDate || '',
            transactionId: form.transactionId || '',
            receiptDate: form.receiptDate || '',
            bankName: form.bankName || '',
            subvention_payment: "Subvention Refund Applied",
            paymentStatus: paymentStatus,
            totalPaidAmount: totalCustomerPayments,
            totalSubventionRefund: totalSubventionAmount + totalExistingSubvention
          },
          payment_ledger: updatedLedgerWithAutoCreditStatus
        };

        console.log("💰 Adding subvention refunds:", paymentData);

        // Save to backend
        await handleSave(paymentData);
        
        // Clear subvention form and entries
        setLocalSubventionEntries([]);
        setLocalSubventionAmount('');
        setLocalSubventionReason('');
        setShowSubventionForm(false);
        
        alert(`Subvention refunds totaling ₹${formatIndianNumber(totalSubventionAmount)} added successfully!`);
        
      } catch (error) {
        console.error('Error saving subvention refund:', error);
        alert('Error saving subvention refund. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaGift className="text-green-600" />
            Add Subvention Refund (One by One)
          </h3>
          
          <div className="space-y-4">
            {/* Current Subvention Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Existing Subvention:</p>
                  <p className="font-semibold">₹{formatIndianNumber(totalExistingSubvention)}</p>
                </div>
                <div>
                  <p className="text-gray-600">New Subvention:</p>
                  <p className="font-semibold text-green-600">₹{formatIndianNumber(totalSubventionAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Remaining Capacity:</p>
                  <p className="font-semibold">₹{formatIndianNumber(remainingCapacity)}</p>
                </div>
              </div>
            </div>

            {/* Add Subvention Entry Form */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-semibold mb-3">Add Subvention Entry</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Subvention Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={localSubventionAmount}
                    onChange={handleAmountChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Enter amount"
                    min="0"
                    max={remainingCapacity}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: ₹{formatIndianNumber(remainingCapacity)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Reason for Subvention
                  </label>
                  <input
                    type="text"
                    value={localSubventionReason}
                    onChange={(e) => setLocalSubventionReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="e.g., Customer discount, Special offer, etc."
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddSubventionEntry}
                  disabled={!localSubventionAmount || parseFloat(localSubventionAmount) <= 0 || parseFloat(localSubventionAmount) > remainingCapacity}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaPlus /> Add to List
                </button>
              </div>
            </div>

            {/* Subvention Entries List */}
            {localSubventionEntries.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">Subvention Entries ({localSubventionEntries.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {localSubventionEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">₹{formatIndianNumber(entry.amount)}</p>
                        <p className="text-sm text-gray-600">{entry.reason}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSubventionEntry(entry.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove entry"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total New Subvention:</span>
                    <span className="font-bold text-green-600">₹{formatIndianNumber(totalSubventionAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Subvention reduces the amount customer needs to pay. 
                The auto credit amount will be adjusted automatically. Payout will be enabled only when customer fully pays the remaining amount.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div>
              {localSubventionEntries.length > 0 && (
                <p className="text-sm text-gray-600">
                  Total: ₹{formatIndianNumber(totalSubventionAmount)} across {localSubventionEntries.length} entries
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSubventionForm(false);
                  setLocalSubventionEntries([]);
                  setLocalSubventionAmount('');
                  setLocalSubventionReason('');
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubventionRefund}
                disabled={localSubventionEntries.length === 0}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Subvention Refunds
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // FIXED: Edit Form Component with proper text input handling
  // FIXED: Edit Form Component with proper text input handling
const EditPaymentForm = ({ payment, onSave, onCancel }) => {
  const [localEditForm, setLocalEditForm] = useState(editFormData);

  const handleLocalChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle different input types appropriately
    if (type === 'number') {
      // For number inputs, store as string while typing, parse only on save
      setLocalEditForm(prev => ({
        ...prev,
        [name]: value // Keep as string for free typing
      }));
    } else {
      setLocalEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Also update the main editFormData for consistency
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? value : value // Keep numbers as strings for now
    }));
  };

  const handleLocalSave = () => {
    // Validate required fields
    if (!localEditForm.amount || !localEditForm.date || !localEditForm.mode) {
      alert("Please fill all required fields (Amount, Date, and Payment Mode)");
      return;
    }

    // Parse amount to number only when saving
    const amountToSave = parseFloat(localEditForm.amount);
    if (isNaN(amountToSave) || amountToSave <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const formDataToSave = {
      ...localEditForm,
      amount: amountToSave
    };
    
    console.log("Saving local form:", formDataToSave);
    onSave(formDataToSave);
  };

  // Get appropriate payment mode options based on who made the payment
  const getPaymentModeOptions = () => {
    return localEditForm.paymentMadeBy === "Customer" 
      ? customerPaymentModeOptions 
      : inHousePaymentModeOptions;
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit Payment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={localEditForm.date}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₹) *</label>
            <input
              type="number"
              name="amount"
              value={localEditForm.amount}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Payment Mode *</label>
            <select
              name="mode"
              value={localEditForm.mode}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select payment mode</option>
              {getPaymentModeOptions().map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              name="status"
              value={localEditForm.status}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Transaction ID</label>
            <input
              type="text"
              name="transactionId"
              value={localEditForm.transactionId}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter transaction ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={localEditForm.bankName}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter bank name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={localEditForm.description}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Receipt Date</label>
            <input
              type="date"
              name="receiptDate"
              value={localEditForm.receiptDate}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Payment Made By</label>
            <select
              name="paymentMadeBy"
              value={localEditForm.paymentMadeBy}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled // Keep this disabled as we shouldn't change who made the payment
            >
              <option value="Customer">Customer</option>
              <option value="In House">In House</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Payout By</label>
            <select
              name="payoutBy"
              value={localEditForm.payoutBy}
              onChange={handleLocalChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Customer">Customer</option>
              <option value="In House">In House</option>
              <option value="Auto Credit to Insurance Company">Auto Credit to Insurance Company</option>
            </select>
          </div>
        </div>

        {/* Show current values for reference */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Values:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-600">Amount:</span> ₹{formatIndianNumber(payment.amount)}</div>
            <div><span className="text-gray-600">Date:</span> {payment.date}</div>
            <div><span className="text-gray-600">Mode:</span> {payment.mode}</div>
            <div><span className="text-gray-600">Status:</span> {payment.status}</div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLocalSave}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaCreditCard />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            7: Payment
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSubventionForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaGift /> Add Subvention
          </button>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColor}`}>
            {overallPaymentStatus}
          </div>
        </div>
      </div>

      {/* Payment Summary Card */}
      <div className="bg-purple-50 border rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Final Premium:</p>
            <p className="font-semibold text-lg text-blue-600">₹{formatIndianNumber(finalPremiumAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedQuote ? `From ${acceptedQuote.insuranceCompany}` : 'From accepted quote'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subvention:</p>
            <p className="font-semibold text-lg text-green-600">₹{formatIndianNumber(totalSubventionRefund)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Premium:</p>
            <p className="font-semibold text-lg text-purple-600">₹{formatIndianNumber(netPremium)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer Paid:</p>
            <p className="font-semibold text-lg text-blue-600">₹{formatIndianNumber(totalCustomerPayments)}</p>
          </div>
        </div>
        
        {/* Subvention Breakdown */}
        {totalSubventionRefund > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-800 mb-2">Subvention Applied</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Subvention:</span>
                <span className="font-semibold text-green-600 ml-2">₹{formatIndianNumber(totalSubventionRefund)}</span>
              </div>
              <div>
                <span className="text-gray-600">Original Premium:</span>
                <span className="font-semibold ml-2">₹{formatIndianNumber(finalPremiumAmount)}</span>
              </div>
              <div>
                <span className="text-gray-600">Customer Pays:</span>
                <span className="font-semibold text-green-600 ml-2">₹{formatIndianNumber(netPremium)}</span>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              ✅ Customer gets ₹{formatIndianNumber(totalSubventionRefund)} discount
            </p>
          </div>
        )}
        
        {/* Payout Distribution */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-white rounded-lg border">
          <div className="text-center">
            <p className="text-sm text-gray-500">Auto Credit to Insurance Co.</p>
            <p className="font-semibold text-green-600">₹{formatIndianNumber(autoCreditTotal)}</p>
            {autoCreditExists && (
              <p className={`text-xs mt-1 ${
                autoCreditStatus === 'Completed' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {autoCreditStatus === 'Completed' ? '✓ Completed' : '⏳ Pending - Customer paid ₹' + formatIndianNumber(totalCustomerPayments) + '/' + formatIndianNumber(netPremium)}
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Customer Payments</p>
            <p className="font-semibold text-blue-600">₹{formatIndianNumber(totalCustomerPayments)}</p>
            <p className="text-xs text-gray-500 mt-1">All payments from customer</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Subvention Amount</p>
            <p className="font-semibold text-purple-600">₹{formatIndianNumber(totalSubvention)}</p>
            <p className="text-xs text-gray-500 mt-1">Paid by third parties</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Received by In House</p>
            <p className="font-semibold text-orange-600">₹{formatIndianNumber(inHouseReceived)}</p>
            <p className="text-xs text-gray-500 mt-1">Handled by in-house team</p>
          </div>
        </div>
        
        {/* Progress Bar - Adjusted for subvention */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Payment Progress (After Subvention)</span>
            <span>{Math.round(paymentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                customerRemainingAmount <= 0 ? 'bg-green-600' : 'bg-yellow-500'
              }`}
              style={{ 
                width: `${paymentProgress}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Progress: ₹{formatIndianNumber(totalCustomerPayments)} / ₹{formatIndianNumber(netPremium)} 
            {totalSubventionRefund > 0 && ` (After ₹${formatIndianNumber(totalSubventionRefund)} subvention)`}
          </p>
        </div>
      </div>

      {/* Payment Made By Radio Buttons */}
      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Payment Made By
        </h4>
        <div className="flex gap-6">
          {paymentMadeByOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMadeBy"
                value={option.value}
                checked={form.paymentMadeBy === option.value}
                onChange={() => handleRadioChange('paymentMadeBy', option.value)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.paymentMadeBy && <p className="text-red-500 text-xs mt-2">{errors.paymentMadeBy}</p>}
      </div>

      {/* Customer Payment Section */}
      {form.paymentMadeBy === "Customer" && (
        <div className="border rounded-xl p-5 mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-4">
            Customer Payment
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Payment Mode *
              </label>
              <select
                name="customerPaymentMode"
                value={form.customerPaymentMode || ""}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.customerPaymentMode ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select payment mode</option>
                {customerPaymentModeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.customerPaymentMode && <p className="text-red-500 text-xs mt-1">{errors.customerPaymentMode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                name="customerPaymentAmount"
                value={form.customerPaymentAmount || ""}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.customerPaymentAmount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
                max={customerRemainingAmount}
                step="0.01"
              />
              {errors.customerPaymentAmount && <p className="text-red-500 text-xs mt-1">{errors.customerPaymentAmount}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₹{formatIndianNumber(customerRemainingAmount)} (Customer can pay up to ₹{formatIndianNumber(netPremium)} total)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                name="customerPaymentDate"
                value={form.customerPaymentDate || ""}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.customerPaymentDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.customerPaymentDate && <p className="text-red-500 text-xs mt-1">{errors.customerPaymentDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                name="customerTransactionId"
                value={form.customerTransactionId || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter transaction ID (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">Optional for cash payments</p>
            </div>

            <div className="bank-suggestions-container relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="customerBankName"
                value={form.customerBankName || ""}
                onChange={(e) => handleBankNameChange(e, 'customer')}
                onKeyDown={(e) => handleBankKeyDown(e, 'customer')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Start typing bank name..."
                autoComplete="off"
              />
              <BankSuggestions bankType="customer" />
              <p className="text-xs text-gray-500 mt-1">Required for bank transfers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Receipt Date
              </label>
              <input
                type="date"
                name="customerReceiptDate"
                value={form.customerReceiptDate || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Date when receipt was issued</p>
            </div>
          </div>

          {/* Add Payment Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={addCustomerPaymentToLedger}
              disabled={!form.customerPaymentAmount || !form.customerPaymentDate || !form.customerPaymentMode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPlus /> Add Customer Payment to Ledger
            </button>
          </div>
        </div>
      )}

      {/* In House Payment Section */}
      {form.paymentMadeBy === "In House" && (
        <div className="border rounded-xl p-5 mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-4">
            In House Payment
          </h4>

          {/* Auto Credit to Insurance Company */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-800 mb-3">Auto Credit to Insurance Company</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="autoCreditAmount"
                  value={autoCreditAmount || ""}
                  onChange={handleAutoCreditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter auto credit amount"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto credit amount: ₹{formatIndianNumber(netPremium)} 
                  {totalSubventionRefund > 0 && ` (After ₹${formatIndianNumber(totalSubventionRefund)} subvention)`}
                </p>
                {autoCreditExists && (
                  <p className={`text-xs mt-1 ${
                    autoCreditStatus === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {autoCreditStatus === 'Completed' 
                      ? '✓ Auto credit completed - Customer paid full amount' 
                      : `⏳ Auto credit pending - Customer paid ₹${formatIndianNumber(totalCustomerPayments)}/${formatIndianNumber(netPremium)}`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Mode *
                </label>
                <select
                  name="autoCreditPaymentMode"
                  value={form.autoCreditPaymentMode || ""}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.autoCreditPaymentMode ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select payment mode</option>
                  {inHousePaymentModeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.autoCreditPaymentMode && <p className="text-red-500 text-xs mt-1">{errors.autoCreditPaymentMode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="autoCreditPaymentDate"
                  value={form.autoCreditPaymentDate || ""}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.autoCreditPaymentDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.autoCreditPaymentDate && <p className="text-red-500 text-xs mt-1">{errors.autoCreditPaymentDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="autoCreditTransactionId"
                  value={form.autoCreditTransactionId || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter transaction ID (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Optional for cash payments</p>
              </div>

              <div className="bank-suggestions-container relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="autoCreditBankName"
                  value={form.autoCreditBankName || ""}
                  onChange={(e) => handleBankNameChange(e, 'autoCredit')}
                  onKeyDown={(e) => handleBankKeyDown(e, 'autoCredit')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Start typing bank name..."
                  autoComplete="off"
                />
                <BankSuggestions bankType="autoCredit" />
                <p className="text-xs text-gray-500 mt-1">Required for bank transfers</p>
              </div>
            </div>
          </div>

          {/* Payment Made by Customer */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-800 mb-3">Payment Made by Customer</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Mode *
                </label>
                <select
                  name="inHousePaymentMode"
                  value={form.inHousePaymentMode || ""}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.inHousePaymentMode ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select payment mode</option>
                  {customerPaymentModeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.inHousePaymentMode && <p className="text-red-500 text-xs mt-1">{errors.inHousePaymentMode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  name="inHousePaymentAmount"
                  value={form.inHousePaymentAmount || ""}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.inHousePaymentAmount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                  max={customerRemainingAmount}
                  step="0.01"
                />
                {errors.inHousePaymentAmount && <p className="text-red-500 text-xs mt-1">{errors.inHousePaymentAmount}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ₹{formatIndianNumber(customerRemainingAmount)} (Customer can pay up to ₹{formatIndianNumber(netPremium)} total)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="inHousePaymentDate"
                  value={form.inHousePaymentDate || ""}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.inHousePaymentDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.inHousePaymentDate && <p className="text-red-500 text-xs mt-1">{errors.inHousePaymentDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="inHouseTransactionId"
                  value={form.inHouseTransactionId || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter transaction ID (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Optional for cash payments</p>
              </div>

              <div className="bank-suggestions-container relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="inHouseBankName"
                  value={form.inHouseBankName || ""}
                  onChange={(e) => handleBankNameChange(e, 'inHouse')}
                  onKeyDown={(e) => handleBankKeyDown(e, 'inHouse')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Start typing bank name..."
                  autoComplete="off"
                />
                <BankSuggestions bankType="inHouse" />
                <p className="text-xs text-gray-500 mt-1">Required for bank transfers</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Receipt Date
                </label>
                <input
                  type="date"
                  name="inHouseReceiptDate"
                  value={form.inHouseReceiptDate || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Date when receipt was issued</p>
              </div>
            </div>
          </div>

          {/* Add Payment Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={addInHousePaymentToLedger}
              disabled={!form.inHousePaymentAmount || !form.inHousePaymentDate || !form.inHousePaymentMode || 
                       !form.autoCreditPaymentMode || !form.autoCreditPaymentDate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPlus /> Add Customer Payment via In House
            </button>
          </div>
        </div>
      )}

      {/* Payment Ledger Section */}
      <div className="border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-700">
            Payment Ledger
          </h4>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {paymentLedger.length} payment(s) recorded
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColor}`}>
              {overallPaymentStatus}
            </span>
          </div>
        </div>
        
        {paymentLedger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">Date</th>
                  <th className="text-left p-3 font-medium text-gray-600">Description</th>
                  <th className="text-left p-3 font-medium text-gray-600">Payment Mode</th>
                  <th className="text-left p-3 font-medium text-gray-600">Made By</th>
                  <th className="text-left p-3 font-medium text-gray-600">Payout By</th>
                  <th className="text-right p-3 font-medium text-gray-600">Amount</th>
                  <th className="text-left p-3 font-medium text-gray-600">Status</th>
                  <th className="text-center p-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentLedger.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-gray-700">{payment.date}</td>
                    <td className="p-3 text-gray-700">
                      {payment.description}
                      {payment.type === "subvention_refund" && (
                        <span className="ml-2 px-1 bg-green-100 text-green-800 text-xs rounded">Subvention</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-700">
                      {payment.mode}
                      {payment.mode.includes('Subvention') && !payment.type === "subvention_refund" && (
                        <span className="ml-2 px-1 bg-blue-100 text-blue-800 text-xs rounded">Subvention</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-700">{payment.paymentMadeBy}</td>
                    <td className="p-3 text-gray-700">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        payment.payoutBy === "Auto Credit to Insurance Company" 
                          ? "bg-green-100 text-green-800"
                          : payment.payoutBy === "Customer"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {payment.payoutBy}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-medium ${
                      payment.type === "subvention_refund" ? "text-green-600" : "text-blue-600"
                    }`}>
                      {payment.type === "subvention_refund" ? '-' : ''}₹{formatIndianNumber(payment.amount)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        payment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          title="Edit payment"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => deletePaymentFromLedger(payment.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          title="Delete payment"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan="5" className="p-3 text-right font-medium text-gray-700">Total Customer Paid:</td>
                  <td className="p-3 text-right font-bold text-gray-800">
                    ₹{formatIndianNumber(totalCustomerPayments)}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${paymentStatusColor}`}>
                      {overallPaymentStatus}
                    </span>
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaReceipt className="mx-auto text-3xl mb-3 text-gray-300" />
            <p>No payment records found</p>
            <p className="text-sm">Add payments using the form above</p>
          </div>
        )}
      </div>

      {/* Subvention Form Modal */}
      {showSubventionForm && (
        <SubventionForm
          setShowSubventionForm={setShowSubventionForm}
          calculateTotalSubventionRefund={calculateTotalSubventionRefund}
          finalPremiumAmount={finalPremiumAmount}
          formatIndianNumber={formatIndianNumber}
        />
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <EditPaymentForm
          payment={paymentLedger.find(p => p.id === editingPayment)}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Next Step Button */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {paymentLedger.length > 0 ? (
            customerRemainingAmount <= 0 ? (
              <span className="text-green-600">✅ All customer payments completed</span>
            ) : (
              <span className="text-yellow-600">⚠️ ₹{formatIndianNumber(customerRemainingAmount)} payment pending from customer</span>
            )
          ) : (
            <span className="text-red-600">Please add at least one payment</span>
          )}
        </div>
        
        <button
          onClick={handleNextStep}
          disabled={isPayoutDisabled || paymentLedger.length === 0 || isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Proceed to Payout"} 
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

// ================== STEP 8: Payout Details ==================
const PayoutDetails = ({ form, handleChange, handleSave, isSaving, errors, acceptedQuote, totalPremium, paymentLedger = [] }) => {
  const [showLossWarning, setShowLossWarning] = useState(false);
  const [calculatedNetAmount, setCalculatedNetAmount] = useState(null);

  // Calculate subvention from payment ledger
  const calculateSubventionFromLedger = (ledger) => {
    if (!ledger || !Array.isArray(ledger)) return 0;
    
    const subventionModes = [
      "Bank Subvention", 
      "Dealer Subvention",
      "Manufacturer Subvention",
      "Special Offer Subvention",
      "Subvention"
    ];
    
    const subventionPayments = ledger.filter(payment => 
      payment.category === 'subvention' || 
      subventionModes.some(mode => 
        payment.mode?.toLowerCase().includes(mode.toLowerCase()) ||
        payment.description?.toLowerCase().includes(mode.toLowerCase())
      ) ||
      payment.notes?.toLowerCase().includes('subvention') ||
      payment.paymentType === 'subvention'
    );
    
    const totalSubvention = subventionPayments.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);
    
    console.log("💰 Subvention calculation:", {
      totalPayments: ledger.length,
      subventionPayments: subventionPayments.length,
      totalSubvention
    });
    
    return totalSubvention;
  };

  const subventionFromLedger = calculateSubventionFromLedger(paymentLedger);
  const currentSubvention = parseFloat(form.subVention || 0);

  // Debug: Log the accepted quote to see what data we're receiving
  useEffect(() => {
    console.log("🔍 PayoutDetails - Accepted Quote:", acceptedQuote);
    console.log("🔍 PayoutDetails - OD Amount from quote:", acceptedQuote?.odAmount);
    console.log("🔍 PayoutDetails - Addons from quote:", acceptedQuote?.addOnsPremium);
    console.log("🔍 PayoutDetails - Insurer from quote:", acceptedQuote?.insuranceCompany);
    console.log("🔍 PayoutDetails - Subvention from ledger:", subventionFromLedger);
  }, [acceptedQuote, subventionFromLedger]);

  // Calculate OD + Addon total from accepted quote
  const calculateOdAddonTotal = () => {
    if (!acceptedQuote) return 0;
    
    const odAmount = acceptedQuote.odAmount || 0;
    const addOnsPremium = acceptedQuote.addOnsPremium || 0;
    const odAddonTotal = odAmount + addOnsPremium;
    
    console.log("💰 OD + Addon Calculation:", { odAmount, addOnsPremium, odAddonTotal });
    return odAddonTotal;
  };

  // Auto-populate from accepted quote when component mounts
  useEffect(() => {
    if (acceptedQuote) {
      console.log("📊 Auto-populating payout from accepted quote:", acceptedQuote);
      
      // Set net premium from accepted quote total premium
      if (acceptedQuote.totalPremium && !form.netPremium) {
        const premiumValue = parseFloat(acceptedQuote.totalPremium);
        console.log("💰 Setting net premium from quote:", premiumValue);
        handleChange({
          target: {
            name: 'netPremium',
            value: premiumValue
          }
        });
      }
      
      // Set OD + Addon amount from accepted quote
      if (!form.odAddonAmount) {
        const odAddonTotal = calculateOdAddonTotal();
        if (odAddonTotal > 0) {
          console.log("💰 Setting OD + Addon amount from quote:", odAddonTotal);
          handleChange({
            target: {
              name: 'odAddonAmount',
              value: odAddonTotal
            }
          });
        }
      }
      
      // DO NOT set default percentage - let user enter it
      // Only set insurer if available
      if (acceptedQuote.insuranceCompany && !form.insuranceCompany) {
        console.log("🏢 Setting insurer from quote:", acceptedQuote.insuranceCompany);
        handleChange({
          target: {
            name: 'insuranceCompany',
            value: acceptedQuote.insuranceCompany
          }
        });
      }
    }
  }, [acceptedQuote]);

  // Auto-populate subvention from payment ledger
  useEffect(() => {
    if (subventionFromLedger > 0 && currentSubvention === 0) {
      console.log("💰 Setting subvention from payment ledger:", subventionFromLedger);
      handleChange({
        target: { 
          name: 'subVention', 
          value: subventionFromLedger.toString() 
        }
      });
    }
  }, [subventionFromLedger, currentSubvention, handleChange]);

  // NEW: Clear subvention when payment ledger changes (when subvention payments are deleted)
  useEffect(() => {
    // Recalculate subvention from updated ledger
    const updatedSubvention = calculateSubventionFromLedger(paymentLedger);
    
    // If the current subvention value is greater than the actual subvention from ledger,
    // it means subvention payments were deleted, so clear the field
    if (parseFloat(form.subVention || 0) > updatedSubvention) {
      console.log("🔄 Clearing subvention field due to payment ledger changes");
      handleChange({
        target: {
          name: 'subVention',
          value: updatedSubvention.toString()
        }
      });
    }
  }, [paymentLedger, form.subVention, handleChange]);

  // Also populate from total premium if available
  useEffect(() => {
    if (totalPremium && totalPremium > 0 && !form.netPremium) {
      console.log("💰 Setting net premium from totalPremium:", totalPremium);
      handleChange({
        target: {
          name: 'netPremium',
          value: parseFloat(totalPremium)
        }
      });
    }
  }, [totalPremium]);

  // Check for loss condition and show warning
  const checkForLoss = (netAmount) => {
    const isLoss = parseFloat(netAmount) < 0;
    setShowLossWarning(isLoss);
    return isLoss;
  };

  // Calculate Net Amount based on formula: (OD + Addon × Percentage%) - Subvention
  const calculateNetAmount = () => {
    const odAddonAmount = parseFloat(form.odAddonAmount) || 0;
    const percentage = parseFloat(form.odAddonPercentage) || 0;
    const subVention = parseFloat(form.subVention) || 0;
    
    if (odAddonAmount && percentage >= 0) {
      const calculatedAmount = (odAddonAmount * (percentage / 100)) - subVention;
      const amount = calculatedAmount.toFixed(2);
      
      // Check if this calculation results in loss
      checkForLoss(amount);
      setCalculatedNetAmount(amount);
      
      return amount;
    }
    setCalculatedNetAmount(null);
    setShowLossWarning(false);
    return null;
  };

  // Auto-calculate Net Amount when dependencies change
  useEffect(() => {
    const calculatedAmount = calculateNetAmount();
    
    // Only update if the calculated value is different from current value and not a loss
    if (calculatedAmount !== null && 
        parseFloat(form.netAmount || 0) !== parseFloat(calculatedAmount) &&
        !checkForLoss(calculatedAmount)) {
      console.log("🔄 Auto-calculating Net Amount:", calculatedAmount);
      handleChange({
        target: {
          name: 'netAmount',
          value: calculatedAmount
        }
      });
    }
  }, [form.odAddonAmount, form.odAddonPercentage, form.subVention]);

  // Handle manual calculation trigger
  const handleCalculate = () => {
    const calculatedNetAmount = calculateNetAmount();
    if (calculatedNetAmount !== null) {
      const isLoss = checkForLoss(calculatedNetAmount);
      
      if (!isLoss) {
        handleChange({
          target: {
            name: 'netAmount',
            value: calculatedNetAmount
          }
        });
      }
    }
  };

  // Handle force calculation despite loss warning
  const handleForceCalculate = () => {
    if (calculatedNetAmount !== null) {
      handleChange({
        target: {
          name: 'netAmount',
          value: calculatedNetAmount
        }
      });
      setShowLossWarning(false);
    }
  };

  // Get calculation breakdown for display
  const getCalculationBreakdown = () => {
    const odAddonAmount = parseFloat(form.odAddonAmount) || 0;
    const percentage = parseFloat(form.odAddonPercentage) || 0;
    const subVention = parseFloat(form.subVention) || 0;
    const percentageAmount = odAddonAmount * (percentage / 100);
    const netAmount = percentageAmount - subVention;

    return {
      odAddonAmount,
      percentage,
      subVention,
      percentageAmount,
      netAmount
    };
  };

  const breakdown = getCalculationBreakdown();
  const odAddonTotalFromQuote = calculateOdAddonTotal();

  // Calculate total paid from payment ledger
  const totalPaid = paymentLedger.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

  // Get color for net amount based on value
  const getNetAmountColor = (amount) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-orange-600';
  };

  // Get background color for net amount based on value
  const getNetAmountBgColor = (amount) => {
    if (amount > 0) return 'bg-green-50 border-green-200';
    if (amount < 0) return 'bg-red-50 border-red-200';
    return 'bg-orange-50 border-orange-200';
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaCreditCard />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Step 8: Payout Details
            </h3>
            <p className="text-xs text-gray-500">
              Financial breakdown and calculations
            </p>
          </div>
        </div>
      </div>

      {/* Loss Warning Modal */}
      {showLossWarning && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-red-700">Loss Detected!</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                The calculated net amount is <span className="font-bold text-red-600">₹{calculatedNetAmount}</span>, which indicates a loss.
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Please review your inputs:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>OD + Addon Amount: ₹{breakdown.odAddonAmount.toLocaleString('en-IN')}</li>
                <li>Percentage: {breakdown.percentage}%</li>
                <li>Subvention: ₹{breakdown.subVention.toLocaleString('en-IN')}</li>
                <li>Calculated Amount: (₹{breakdown.odAddonAmount.toLocaleString('en-IN')} × {breakdown.percentage}%) - ₹{breakdown.subVention.toLocaleString('en-IN')} = ₹{calculatedNetAmount}</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 font-medium">
                💡 Recommendation: Check if your OD + Addons percentage is too low or Subvention amount is too high.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLossWarning(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleForceCalculate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Information Card */}
      {acceptedQuote && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h4 className="text-md font-semibold text-blue-700 mb-3 flex items-center">
            <FaInfoCircle className="mr-2" />
            Accepted Quote Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Insurer:</span>
              <div className="font-semibold">{acceptedQuote.insuranceCompany || 'Not specified'}</div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Total Premium:</span>
              <div className="font-semibold">₹{parseFloat(acceptedQuote.totalPremium || 0).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">OD Amount:</span>
              <div className="font-semibold">₹{parseFloat(acceptedQuote.odAmount || 0).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Add-ons:</span>
              <div className="font-semibold">₹{parseFloat(acceptedQuote.addOnsPremium || 0).toLocaleString('en-IN')}</div>
            </div>
            {acceptedQuote.coverageType && (
              <div className="md:col-span-2">
                <span className="text-blue-600 font-medium">Coverage:</span>
                <div>{acceptedQuote.coverageType}</div>
              </div>
            )}
            {acceptedQuote.idv && (
              <div className="md:col-span-2">
                <span className="text-blue-600 font-medium">IDV:</span>
                <div>₹{parseFloat(acceptedQuote.idv).toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Ledger Information */}
      {paymentLedger.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <h4 className="text-md font-semibold text-green-700 mb-3 flex items-center">
            <FaMoneyBillWave className="mr-2" />
            Payment Ledger Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-medium">Total Payments:</span>
              <div className="font-semibold">₹{totalPaid.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-green-600 font-medium">Subvention Payments:</span>
              <div className="font-semibold text-blue-600">₹{subventionFromLedger.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-green-600 font-medium">Number of Payments:</span>
              <div className="font-semibold">{paymentLedger.length}</div>
            </div>
          </div>
          
          {/* Subvention Payment Details */}
          {subventionFromLedger > 0 && (
            <div className="mt-4">
              <h5 className="font-medium text-green-700 text-sm mb-2">Subvention Payment Details:</h5>
              <div className="space-y-1 text-xs">
                {paymentLedger
                  .filter(payment => 
                    payment.category === 'subvention' || 
                    payment.mode?.toLowerCase().includes('subvention') ||
                    payment.notes?.toLowerCase().includes('subvention') ||
                    payment.paymentType === 'subvention'
                  )
                  .map((payment, index) => (
                    <div key={payment.id || index} className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded">
                      <span>{payment.date} - {payment.mode}</span>
                      <span className="font-semibold">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show warning if no accepted quote */}
      {!acceptedQuote && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <h4 className="text-md font-semibold text-red-700 mb-2">
            ⚠️ No Accepted Quote Found
          </h4>
          <p className="text-sm text-red-600">
            Please go back to the Insurance Quotes step and accept a quote first.
          </p>
        </div>
      )}

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
          <FaCalculator className="mr-2" />
          Payout Calculation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Net Premium */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Net Premium (₹) *
            </label>
            <INRCurrencyInput
              type="number"
              step="0.01"
              name="netPremium"
              value={form.netPremium || ""}
              onChange={handleChange}
              placeholder="Enter net premium amount"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.netPremium ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.netPremium && <p className="text-red-500 text-xs mt-1">{errors.netPremium}</p>}
            {acceptedQuote?.totalPremium && (
              <p className="text-xs text-blue-500 mt-1">
                From quote: ₹{parseFloat(acceptedQuote.totalPremium).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* OD + Addon Amount */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              OD + Addon Amount (₹) *
            </label>
            <INRCurrencyInput
              type="number"
              step="0.01"
              name="odAddonAmount"
              value={form.odAddonAmount || ""}
              onChange={handleChange}
              placeholder="Enter OD + Addon amount"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.odAddonAmount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.odAddonAmount && <p className="text-red-500 text-xs mt-1">{errors.odAddonAmount}</p>}
            {odAddonTotalFromQuote > 0 && (
              <p className="text-xs text-blue-500 mt-1">
                From quote: ₹{odAddonTotalFromQuote.toLocaleString('en-IN')} 
                (OD: ₹{parseFloat(acceptedQuote.odAmount || 0).toLocaleString('en-IN')} + 
                Add-ons: ₹{parseFloat(acceptedQuote.addOnsPremium || 0).toLocaleString('en-IN')})
              </p>
            )}
          </div>

          {/* Percentage of OD + Addons */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Percentage of OD + Addons (%) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                name="odAddonPercentage"
                value={form.odAddonPercentage || ""}
                onChange={handleChange}
                placeholder="10"
                max="100"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.odAddonPercentage ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="text-gray-500 font-medium whitespace-nowrap">%</span>
            </div>
            {errors.odAddonPercentage && <p className="text-red-500 text-xs mt-1">{errors.odAddonPercentage}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Enter the percentage to apply on OD + Addon amount (e.g., 80%, 90%, 100%)
            </p>
          </div>

          {/* Sub Vention */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Sub Vention (₹) *
            </label>
            <INRCurrencyInput
              type="number"
              step="0.01"
              name="subVention"
              value={form.subVention || ""}
              onChange={handleChange}
              placeholder="Enter subvention amount"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.subVention ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.subVention && <p className="text-red-500 text-xs mt-1">{errors.subVention}</p>}
            {subventionFromLedger > 0 && (
              <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                <FaInfoCircle className="w-3 h-3" />
                Auto-detected: ₹{subventionFromLedger.toLocaleString('en-IN')} from payment ledger
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Amount to be deducted from the calculated percentage</p>
          </div>
        </div>

        {/* Loss Warning Banner */}
        {showLossWarning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <span className="text-red-700 font-semibold">Loss Warning!</span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              The calculated net amount is ₹{calculatedNetAmount}. Please check your OD + Addons percentage or Subvention amount.
            </p>
          </div>
        )}

        {/* Calculated Net Amount */}
        <div className={`border rounded-lg p-4 mb-4 ${getNetAmountBgColor(parseFloat(form.netAmount || 0))}`}>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Calculated Net Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            name="netAmount"
            value={form.netAmount || ""}
            onChange={handleChange}
            readOnly
            className={`w-full border rounded-md px-3 py-3 text-lg font-semibold bg-white focus:outline-none focus:ring-2 ${
              parseFloat(form.netAmount || 0) > 0 ? 'border-green-300 focus:ring-green-500 text-green-800' :
              parseFloat(form.netAmount || 0) < 0 ? 'border-red-300 focus:ring-red-500 text-red-800' :
              'border-orange-300 focus:ring-orange-500 text-orange-800'
            }`}
            placeholder="Calculated amount will appear here"
          />
          {errors.netAmount && <p className="text-red-500 text-xs mt-1">{errors.netAmount}</p>}
          
          {/* Net Amount Status */}
          {form.netAmount && (
            <div className={`text-xs font-medium mt-2 ${
              parseFloat(form.netAmount) > 0 ? 'text-green-700' :
              parseFloat(form.netAmount) < 0 ? 'text-red-700' :
              'text-orange-700'
            }`}>
              {parseFloat(form.netAmount) > 0 ? '✅ Positive net amount' :
               parseFloat(form.netAmount) < 0 ? '⚠️ Negative net amount (Subvention exceeds calculated amount)' :
               '⚖️ Zero net amount (Subvention equals calculated amount)'}
            </div>
          )}
        </div>

        {/* Real-time Calculation Display */}
        {form.odAddonAmount && form.odAddonPercentage && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="font-semibold text-gray-700 mb-3">Calculation Breakdown</h5>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-600">OD + Addon:</span>
                <div className="font-semibold">₹{breakdown.odAddonAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-gray-600">Percentage:</span>
                <div className="font-semibold">{breakdown.percentage}%</div>
              </div>
              <div>
                <span className="text-gray-600">Percentage Amount:</span>
                <div className="font-semibold text-purple-600">
                  ₹{breakdown.percentageAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Sub Vention:</span>
                <div className="font-semibold text-red-600">
                  - ₹{breakdown.subVention.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Net Amount:</span>
                <div className={`font-semibold text-lg ${getNetAmountColor(breakdown.netAmount)}`}>
                  ₹{breakdown.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            {/* Formula Display */}
            <div className="mt-4 p-3 bg-white border border-gray-300 rounded-md">
              <div className="text-xs text-gray-600 font-mono text-center">
                <strong>Formula:</strong> (OD + Addon × Percentage%) - Subvention = Net Amount
              </div>
              <div className="text-xs text-gray-600 font-mono text-center mt-1">
                ({breakdown.odAddonAmount} × {breakdown.percentage}%) - {breakdown.subVention} = {breakdown.netAmount}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ================== PAYOUT VALIDATION ==================
const payoutValidation = (form, acceptedQuote) => {
  const errors = {};

  // Net Premium validation
  if (!form.netPremium) {
    errors.netPremium = "Net premium is required";
  } else if (parseFloat(form.netPremium) <= 0) {
    errors.netPremium = "Net premium must be greater than 0";
  }

  // OD + Addon validation
  if (!form.odAddonAmount) {
    errors.odAddonAmount = "OD + Addon amount is required";
  } else if (parseFloat(form.odAddonAmount) <= 0) {
    errors.odAddonAmount = "OD + Addon amount must be greater than 0";
  }

  // Percentage of OD + Addons validation
  if (!form.odAddonPercentage) {
    errors.odAddonPercentage = "Percentage of OD + Addons is required";
  } else if (parseFloat(form.odAddonPercentage) <= 0) {
    errors.odAddonPercentage = "Percentage must be greater than 0";
  } else if (parseFloat(form.odAddonPercentage) > 100) {
    errors.odAddonPercentage = "Percentage cannot exceed 100%";
  }

  // Subvention validation
  // if (!form.subVention) {
  //   errors.subVention = "Subvention amount is required";
  // } else if (parseFloat(form.subVention) < 0) {
  //   errors.subVention = "Subvention cannot be negative";
  // }

  // Net Amount calculation validation - REMOVED non-negative constraint
  if (form.odAddonAmount && form.odAddonPercentage && form.subVention) {
    const odAddonAmount = parseFloat(form.odAddonAmount);
    const percentage = parseFloat(form.odAddonPercentage);
    const subVention = parseFloat(form.subVention);
    
    const calculatedNetAmount = (odAddonAmount * (percentage / 100)) - subVention;
    
    // Validate that calculated net amount matches the provided net amount
    if (form.netAmount && Math.abs(calculatedNetAmount - parseFloat(form.netAmount)) > 0.01) {
      errors.netAmount = `Net amount should be ₹${calculatedNetAmount.toFixed(2)} based on calculation: (OD+Addon × ${percentage}%) - Subvention`;
    }
  }

  // Cross-validation with accepted quote
  if (acceptedQuote) {
    const acceptedTotalPremium = acceptedQuote.totalPremium || 0;
    const netPremium = parseFloat(form.netPremium) || 0;
    
    if (netPremium > acceptedTotalPremium) {
      errors.netPremium = `Net premium (₹${netPremium}) cannot exceed accepted quote premium (₹${acceptedTotalPremium})`;
    }

    // Validate OD + Addon against accepted quote components
    const acceptedOD = acceptedQuote.odAmount || 0;
    const acceptedAddons = acceptedQuote.addOnsPremium || 0;
    const acceptedODAddonTotal = acceptedOD + acceptedAddons;
    const odAddonAmount = parseFloat(form.odAddonAmount) || 0;
    
    if (odAddonAmount > acceptedODAddonTotal) {
      errors.odAddonAmount = `OD+Addon (₹${odAddonAmount}) cannot exceed accepted quote OD+Addons total (₹${acceptedODAddonTotal})`;
    }
  }

  return errors;
};
// ================== MAIN COMPONENT ==================
const NewPolicyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const hasClearedStorage = useRef(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    buyer_type: "individual",
    vehicleType: "", // NEW: Added vehicleType field
    insurance_category: "motor",
    status: "draft",
    ts: Date.now(),
    created_by: "ADMIN123",
    insuranceQuotes: [],
    previousClaimTaken: "no",
    // Corporate fields
    companyName: "",
    employeeName: "",
    contactPersonName: "",
    companyPanNumber: "",
    gstNumber: "",
    // Individual fields
    customerName: "",
    mobile: "",
    email: "",
    age: "",
    gender: "",
    panNumber: "",
    aadhaarNumber: "",
    residenceAddress: "",
    pincode: "",
    city: "",
    alternatePhone: "",
    // Nominee fields
    nomineeName: "",
    relation: "",
    nomineeAge: "",
    // Reference fields
    referenceName: "",
    referencePhone: "",
    // Vehicle fields
    regNo: "",
    make: "",
    model: "",
    variant: "",
    engineNo: "",
    chassisNo: "",
    makeMonth: "",
    makeYear: "",
    // Previous Policy fields
    previousInsuranceCompany: "",
    previousPolicyNumber: "",
    previousPolicyType: "",
    previousIssueDate: "",
    previousPolicyStartDate: "", 
    previousPolicyDuration: "", 
    previousPolicyEndDate: "", 
    previousDueDate: "",
    previousNcbDiscount: "",
    // Insurance Quote fields
    insurer: "",
    coverageType: "",
    premium: "",
    idv: "",
    ncb: "",
    duration: "",
    // New Policy fields
    policyIssued: "",
    insuranceCompany: "",
    policyNumber: "",
    covernoteNumber: "",
    issueDate: "",
    policyStartDate: "",
    dueDate: "",
    ncbDiscount: "",
    insuranceDuration: "",
    idvAmount: "",
    totalPremium: "",
    // Documents - changed to object for tagging
    documents: {},
    documentTags: {},
    // Payment fields
    paymentMadeBy: "Customer",
    paymentMode: "",
    paymentAmount: "",
    paymentDate: "",
    transactionId: "",
    receiptDate: "",
    bankName: "",
    subvention_payment: "No Subvention",
    paymentStatus: "Payment Pending",
    totalPaidAmount: 0,
    // Payout fields
    netPremium: "",
    odAddonPercentage: 10, // default value
    odAddonAmount: "", // NEW: Added missing field
    netAmount: "", // NEW: Added missing field
    odAmount: "",
    ncbAmount: "",
    subVention: "",
    // Additional fields
    policyPrefilled: false
  });
  const [policyId, setPolicyId] = useState(id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!id);
  const [loadingPolicy, setLoadingPolicy] = useState(!!id);
  const [acceptedQuote, setAcceptedQuote] = useState(null);
  const [paymentLedger, setPaymentLedger] = useState([]);

  const steps = [
    "Case Details",
    "Vehicle Details", 
    "Previous Policy",
    "Insurance Quotes",
    "New Policy",
    "Documents",
    "Payment",
    "Payout"
  ];

  // NEW: Function to get actual steps based on vehicle type
  const getSteps = () => {
    if (form.vehicleType === "new") {
      return steps.filter(step => step !== "Previous Policy");
    }
    return steps;
  };

  // NEW: Function to get actual step number for navigation
  const getActualStep = (displayStep) => {
    if (form.vehicleType === "new" && displayStep >= 3) {
      return displayStep + 1;
    }
    return displayStep;
  };

  // NEW: Function to get display step number
  const getDisplayStep = (actualStep) => {
    if (form.vehicleType === "new" && actualStep >= 3) {
      return actualStep - 1;
    }
    return actualStep;
  };

  // NEW: Function to handle step click
  const handleStepClick = (clickedStep) => {
    if (isSaving || isCompleted) return;
    
    const actualStep = getActualStep(clickedStep);
    
    // Validate if we can navigate to this step
    if (clickedStep < getDisplayStep(step)) {
      // Going back - always allowed
      setStep(actualStep);
      setErrors({});
      setSaveMessage("");
    } else if (clickedStep === getDisplayStep(step)) {
      // Current step - do nothing
      return;
    } else {
      // Going forward - validate current step first
      if (validateCurrentStep()) {
        setStep(actualStep);
        setErrors({});
        setSaveMessage("");
      } else {
        setSaveMessage("❌ Please fix the validation errors before proceeding");
      }
    }
  };

  // Enhanced function to calculate total premium
  const getTotalPremium = () => {
    console.log("🔍 Calculating total premium...");
    
    // First check if we have an accepted quote with premium
    if (acceptedQuote && acceptedQuote.premium) {
      console.log("✅ Using premium from accepted quote:", acceptedQuote.premium);
      return parseFloat(acceptedQuote.premium);
    }
    
    // Then check if we have premium in the insurance quote section
    if (form.premium) {
      console.log("✅ Using premium from form.premium:", form.premium);
      return parseFloat(form.premium);
    }
    
    // Then check if we have totalPremium in policy info
    if (form.totalPremium) {
      console.log("✅ Using premium from form.totalPremium:", form.totalPremium);
      return parseFloat(form.totalPremium);
    }
    
    // Check insurance quotes array
    if (form.insuranceQuotes && form.insuranceQuotes.length > 0) {
      const acceptedQuoteFromArray = form.insuranceQuotes.find(quote => quote.accepted === true);
      if (acceptedQuoteFromArray && acceptedQuoteFromArray.premium) {
        console.log("✅ Using premium from accepted quote in insuranceQuotes array:", acceptedQuoteFromArray.premium);
        return parseFloat(acceptedQuoteFromArray.premium);
      }
    }
    
    console.log("❌ No premium found, defaulting to 0");
    // Default to 0 if no premium found
    return 0;
  };

  const totalPremium = getTotalPremium();

  // Debug effect to track premium calculation
  useEffect(() => {
    console.log("💰 Premium Calculation Debug:");
    console.log("   - acceptedQuote:", acceptedQuote);
    console.log("   - form.premium:", form.premium);
    console.log("   - form.totalPremium:", form.totalPremium);
    console.log("   - form.insuranceQuotes:", form.insuranceQuotes);
    console.log("   - Calculated totalPremium:", totalPremium);
    console.log("   - Vehicle Type:", form.vehicleType);
  }, [acceptedQuote, form.premium, form.totalPremium, form.insuranceQuotes, totalPremium, form.vehicleType]);

  // Debug effect for payment ledger
  useEffect(() => {
    console.log("💰 Payment Ledger Updated:", {
      ledger: paymentLedger,
      length: paymentLedger.length,
      total: paymentLedger.reduce((sum, p) => sum + p.amount, 0)
    });
  }, [paymentLedger]);

  const handleQuoteAccepted = (quote) => {
    console.log("✅ Quote accepted in parent:", quote);
    setAcceptedQuote(quote);
    
    if (policyId) {
      setTimeout(() => {
        updatePolicy();
      }, 500);
    }
  };

  // ENHANCED: Function to update payment ledger from Payment component
  const handlePaymentLedgerUpdate = (ledger) => {
    console.log("💰 Payment ledger updated in main component:", {
      ledger: ledger,
      length: ledger.length,
      total: ledger.reduce((sum, payment) => sum + payment.amount, 0)
    });
    setPaymentLedger(ledger);
    
    // Update form with payment status and total paid amount
    const totalPaid = ledger.reduce((sum, payment) => sum + payment.amount, 0);
    const paymentStatus = totalPaid >= totalPremium ? 'Fully Paid' : 'Payment Pending';
    
    setForm(prev => ({
      ...prev,
      totalPaidAmount: totalPaid,
      paymentStatus: paymentStatus
    }));
  };

  // ============ FIXED CLEAR LOCALSTORAGE EFFECT ============
  useEffect(() => {
    if (!isEditMode && !id && !hasClearedStorage.current) {
      console.log("🧹 Clearing localStorage for new case");
      localStorage.removeItem('insuranceQuotes');
      
      setForm(prev => ({
        ...prev,
        insurer: "",
        coverageType: "", 
        premium: "",
        idv: "",
        ncb: "",
        duration: "",
        insuranceQuotes: [],
        previousClaimTaken: "no",
        vehicleType: "" // Reset vehicle type for new case
      }));
      
      setAcceptedQuote(null);
      setPaymentLedger([]); // Clear payment ledger for new case
      hasClearedStorage.current = true;
    }
  }, [isEditMode, id]);

  // Debug when component mounts
  useEffect(() => {
    console.log("Component mounted - Edit Mode:", isEditMode, "Policy ID:", id);
  }, [isEditMode, id]);

  useEffect(() => {
    if (id) {
      fetchPolicyData(id);
    }
  }, [id]);

  // Enhanced function to fetch policy data for editing with proper mapping including vehicleType
  const fetchPolicyData = async (policyId) => {
    setLoadingPolicy(true);
    try {
      console.log("🔍 Fetching policy data for ID:", policyId);
      const response = await axios.get(`${API_BASE_URL}/policies/${policyId}`);
      const policyData = response.data;
      
      console.log("📦 Full API Response:", policyData);
      
      if (!policyData || !policyData.data) {
        console.error("❌ No policy data received from API");
        setSaveMessage("❌ No policy data found for this ID");
        return;
      }

      const actualData = policyData.data;
      console.log("📊 Actual Policy Data:", actualData);
      
      // Transform documents array to object with tagging
      const documentsObject = {};
      const documentTagsObject = {};
      if (actualData.documents && Array.isArray(actualData.documents)) {
        actualData.documents.forEach((doc, index) => {
          const docId = `doc_${index}`;
          documentsObject[docId] = doc;
          documentTagsObject[docId] = doc.tag || ""; // Initialize tags as empty
        });
      }

      // Find accepted quote from insurance_quotes array
      let acceptedQuoteData = null;
      if (actualData.insurance_quotes && Array.isArray(actualData.insurance_quotes)) {
        acceptedQuoteData = actualData.insurance_quotes.find(quote => quote.accepted === true);
        if (!acceptedQuoteData && actualData.insurance_quotes.length > 0) {
          acceptedQuoteData = actualData.insurance_quotes[0]; // Fallback to first quote
        }
      }

      // Create a clean transformed data object with ALL fields properly mapped including vehicleType
      const transformedData = {
        // Basic info
        buyer_type: actualData.buyer_type || "individual",
        vehicleType: actualData.vehicleType || "used", // NEW: Default to used for backward compatibility
        insurance_category: actualData.insurance_category || "motor",
        status: actualData.status || "draft",
        
        // Customer details - handle both individual and corporate
        customerName: actualData.customer_details?.name || "",
        mobile: actualData.customer_details?.mobile || "",
        email: actualData.customer_details?.email || "",
        employeeName: actualData.customer_details?.employeeName || "",
        age: actualData.customer_details?.age || "", // ADDED: age field
        gender: actualData.customer_details?.gender || "",
        panNumber: actualData.customer_details?.panNumber || "",
        aadhaarNumber: actualData.customer_details?.aadhaarNumber || "",
        residenceAddress: actualData.customer_details?.residenceAddress || "",
        pincode: actualData.customer_details?.pincode || "",
        city: actualData.customer_details?.city || "",
        alternatePhone: actualData.customer_details?.alternatePhone || "",
        
        // Corporate fields
        companyName: actualData.customer_details?.companyName || "",
        contactPersonName: actualData.customer_details?.contactPersonName || "",
        companyPanNumber: actualData.customer_details?.companyPanNumber || "",
        gstNumber: actualData.customer_details?.gstNumber || "",
        
        // Nominee
        nomineeName: actualData.nominee?.name || "",
        relation: actualData.nominee?.relation || "",
        nomineeAge: actualData.nominee?.age || "",
        
        // Reference - FIXED: Corrected spelling from 'refrence' to 'reference'
        referenceName: actualData.reference?.name || actualData.refrence?.name || "",
        referencePhone: actualData.reference?.phone || actualData.refrence?.phone || "",
        
        // Vehicle details
        regNo: actualData.vehicle_details?.regNo || "",
        make: actualData.vehicle_details?.make || "",
        model: actualData.vehicle_details?.model || "",
        variant: actualData.vehicle_details?.variant || "",
        engineNo: actualData.vehicle_details?.engineNo || "",
        chassisNo: actualData.vehicle_details?.chassisNo || "",
        makeMonth: actualData.vehicle_details?.makeMonth || "",
        makeYear: actualData.vehicle_details?.makeYear || "",
        
        // Previous policy
        previousInsuranceCompany: actualData.previous_policy?.insuranceCompany || "",
        previousPolicyNumber: actualData.previous_policy?.policyNumber || "",
        previousPolicyType: actualData.previous_policy?.policyType || "",
        previousIssueDate: actualData.previous_policy?.issueDate || "",
        previousDueDate: actualData.previous_policy?.dueDate || "",
        previousPolicyStartDate: actualData.previous_policy?.policyStartDate || "", 
        previousPolicyDuration: actualData.previous_policy?.policyDuration || "",
        previousPolicyEndDate: actualData.previous_policy?.policyEndDate || "",
        previousClaimTaken: actualData.previous_policy?.claimTakenLastYear || "no",
        previousNcbDiscount: actualData.previous_policy?.ncbDiscount || "",
        
        // Insurance quotes
        insuranceQuotes: actualData.insurance_quotes || [],
        
        // Insurance quote (legacy)
        insurer: actualData.insurance_quote?.insurer || "",
        coverageType: actualData.insurance_quote?.coverageType || "",
        premium: actualData.insurance_quote?.premium || "",
        idv: actualData.insurance_quote?.idv || "",
        ncb: actualData.insurance_quote?.ncb || "",
        duration: actualData.insurance_quote?.duration || "",
        
        // Policy info
        policyIssued: actualData.policy_info?.policyIssued || "",
        insuranceCompany: actualData.policy_info?.insuranceCompany || "",
        policyNumber: actualData.policy_info?.policyNumber || "",
        covernoteNumber: actualData.policy_info?.covernoteNumber || "",
        issueDate: actualData.policy_info?.issueDate || "",
        policyStartDate: actualData.policy_info?.policyStartDate || "",
        dueDate: actualData.policy_info?.dueDate || "",
        ncbDiscount: actualData.policy_info?.ncbDiscount || "",
        insuranceDuration: actualData.policy_info?.insuranceDuration || "",
        idvAmount: actualData.policy_info?.idvAmount || "",
        totalPremium: actualData.policy_info?.totalPremium || "",
        
        // Payment info
        paymentMadeBy: actualData.payment_info?.paymentMadeBy || "Customer",
        paymentMode: actualData.payment_info?.paymentMode || "",
        paymentAmount: actualData.payment_info?.paymentAmount || "",
        paymentDate: actualData.payment_info?.paymentDate || "",
        transactionId: actualData.payment_info?.transactionId || "",
        receiptDate: actualData.payment_info?.receiptDate || "",
        bankName: actualData.payment_info?.bankName || "",
        subvention_payment: actualData.payment_info?.subvention_payment || "No Subvention",
        paymentStatus: actualData.payment_info?.paymentStatus || "Payment Pending",
        totalPaidAmount: actualData.payment_info?.totalPaidAmount || 0,
         
        // Payout
        netPremium: actualData.payout?.netPremium || "",
        odAmount: actualData.payout?.odAmount || "",
        ncbAmount: actualData.payout?.ncbAmount || "",
        subVention: actualData.payout?.subVention || "",
        odAddonPercentage: actualData.payout?.odAddonPercentage || 10, // ADDED
        odAddonAmount: actualData.payout?.odAddonAmount || "", // ADDED
        netAmount: actualData.payout?.netAmount || "", // ADDED
        
        // Documents as object
        documents: documentsObject,
        documentTags: documentTagsObject,
        
        // System fields
        ts: actualData.ts || Date.now(),
        created_by: actualData.created_by || "ADMIN123",
        policyPrefilled: true
      };
      
      console.log("✅ Transformed Form Data:", transformedData);
      console.log("📋 Previous Claim Taken:", transformedData.previousClaimTaken);
      console.log("🚗 Vehicle Type:", transformedData.vehicleType);
      console.log("💰 Insurance Quotes after transformation:", transformedData.insuranceQuotes);
      console.log("📄 Documents as object:", transformedData.documents);
      console.log("💳 Payment Info:", {
        paymentMadeBy: transformedData.paymentMadeBy,
        paymentMode: transformedData.paymentMode,
        paymentAmount: transformedData.paymentAmount,
        paymentStatus: transformedData.paymentStatus,
        totalPaidAmount: transformedData.totalPaidAmount
      });
      
      setForm(transformedData);
      
      // Set accepted quote
      if (acceptedQuoteData) {
        console.log("✅ Setting accepted quote from data:", acceptedQuoteData);
        setAcceptedQuote(acceptedQuoteData);
      }
      
      // Set payment ledger from payment history if available
      if (actualData.payment_ledger && Array.isArray(actualData.payment_ledger)) {
        console.log("💰 Setting payment ledger from API:", actualData.payment_ledger);
        setPaymentLedger(actualData.payment_ledger);
      } else if (actualData.payment_info?.paymentHistory && Array.isArray(actualData.payment_info.paymentHistory)) {
        console.log("💰 Setting payment ledger from payment history:", actualData.payment_info.paymentHistory);
        setPaymentLedger(actualData.payment_info.paymentHistory);
      } else {
        console.log("💰 No payment ledger found in API response");
        setPaymentLedger([]);
      }
      
      setSaveMessage("✅ Policy data loaded successfully! You can now edit the form.");
      
    } catch (error) {
      console.error("❌ Error fetching policy data:", error);
      console.error("❌ Error details:", error.response?.data);
      setSaveMessage(`❌ Error loading policy data: ${error.message}`);
    } finally {
      setLoadingPolicy(false);
    }
  };

  // Enhanced handleChange to properly handle all field types including vehicleType
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    if (type === "radio") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
      return;
    }
    
    if (type === "number") { 
      setForm((f) => ({ ...f, [name]: value === "" ? "" : Number(value) }));
      return;
    }
    
    // Handle documents object updates
    if (name.startsWith("documents.")) {
      const docId = name.split('.')[1];
      setForm((f) => ({ 
        ...f, 
        documents: {
          ...f.documents,
          [docId]: value
        }
      }));
      return;
    }
    
    // Handle document tags updates
    if (name.startsWith("documentTags.")) {
      const docId = name.split('.')[1];
      setForm((f) => ({ 
        ...f, 
        documentTags: {
          ...f.documentTags,
          [docId]: value
        }
      }));
      return;
    }
    
    if (name === "insuranceQuotes" && Array.isArray(value)) {
      console.log("💰 Updating insuranceQuotes array:", value);
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    if (name === "previousClaimTaken" && value === "yes") {
      setForm((f) => ({ 
        ...f, 
        [name]: value,
        ncb: "0%"
      }));
      return;
    }
    
    // Handle vehicleType change - special logic
    if (name === "vehicleType") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Updated documents update handler for object format
  const handleDocumentsUpdate = (documentsObject) => {
    console.log("📄 Documents updated in main component (object):", documentsObject);
    setForm((f) => ({ 
      ...f, 
      documents: documentsObject,
      // Initialize empty tags for new documents
      documentTags: Object.keys(documentsObject).reduce((tags, docId) => ({
        ...tags,
        [docId]: f.documentTags?.[docId] || ""
      }), {})
    }));
  };

  // ============ FIXED INSURANCE QUOTES UPDATE ============
  const handleInsuranceQuotesUpdate = useCallback((quotesArray) => {
    // Prevent infinite loop by checking if quotes actually changed
    const currentQuotes = form.insuranceQuotes || [];
    const newQuotes = quotesArray || [];
    
    // Only update if quotes actually changed
    if (JSON.stringify(currentQuotes) !== JSON.stringify(newQuotes)) {
      console.log("💰 Insurance quotes updated in main component:", newQuotes.length, "quotes");
      setForm((f) => ({ 
        ...f, 
        insuranceQuotes: newQuotes 
      }));
    }
  }, [form.insuranceQuotes]);

  const handleNestedChange = (section, field, value) => {
    setForm((f) => ({
      ...f,
      [section]: {
        ...f[section],
        [field]: value
      }
    }));
  };

  // Validation functions - UPDATED to handle vehicle type
  const validateCurrentStep = () => {
    let stepErrors = {};
    
    switch (step) {
      case 1:
        stepErrors = validationRules.validateStep1(form);
        break;
      case 2:
        stepErrors = validationRules.validateStep2(form);
        break;
      case 3:
        // Only validate previous policy for used cars
        if (form.vehicleType === "used") {
          stepErrors = previousPolicyValidation(form);
        }
        break;
      case 4:
        stepErrors = validationRules.validateStep3(form, acceptedQuote);
        break;
      case 5:
        stepErrors = validationRules.validateStep4(form);
        break;
      case 6:
        stepErrors = validationRules.validateStep5(form);
        break;
      case 7:
        if (paymentLedger.length === 0) {
          stepErrors = validationRules.validateStep6(form);
          if (Object.keys(stepErrors).length > 0) {
            stepErrors.paymentLedger = "Please add at least one payment or fill all payment fields";
          }
        }
        break;
      case 8:
        stepErrors = payoutValidation(form, acceptedQuote);
        break;
      default:
        stepErrors = {};
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // ============ FIXED DATA SANITIZATION FUNCTIONS ============
  const sanitizeDataForAPI = (data) => {
    const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
      // Remove undefined, null, and empty strings
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      // Ensure numbers are properly formatted
      if (typeof value === 'number' && isNaN(value)) {
        return 0;
      }
      return value;
    }));

    // Clean up insurance quotes to remove any circular references or React components
    if (sanitized.insurance_quotes && Array.isArray(sanitized.insurance_quotes)) {
      sanitized.insurance_quotes = sanitized.insurance_quotes.map(quote => ({
        id: quote.id || `quote_${Date.now()}`,
        insuranceCompany: quote.insuranceCompany || '',
        coverageType: quote.coverageType || 'comprehensive',
        idv: parseFloat(quote.idv) || 0,
        policyDuration: parseInt(quote.policyDuration) || 1,
        ncbDiscount: parseInt(quote.ncbDiscount) || 0,
        odAmount: parseFloat(quote.odAmount) || 0,
        thirdPartyAmount: parseFloat(quote.thirdPartyAmount) || 0,
        addOnsAmount: parseFloat(quote.addOnsAmount) || 0,
        premium: parseFloat(quote.premium) || 0,
        gstAmount: parseFloat(quote.gstAmount) || 0,
        totalPremium: parseFloat(quote.totalPremium) || 0,
        addOnsPremium: parseFloat(quote.addOnsPremium) || 0,
        selectedAddOns: quote.selectedAddOns || {},
        includedAddOns: quote.includedAddOns || [],
        accepted: Boolean(quote.accepted),
        createdAt: quote.createdAt || new Date().toISOString(),
        // Remove any React component references
        companyLogo: undefined,
        companyFallbackLogo: undefined,
        companyColor: undefined,
        companyBgColor: undefined
      }));
    }

    // Clean up payment ledger
    if (sanitized.payment_ledger && Array.isArray(sanitized.payment_ledger)) {
      sanitized.payment_ledger = sanitized.payment_ledger.map(payment => ({
        id: payment.id || `payment_${Date.now()}`,
        date: payment.date || '',
        description: payment.description || '',
        amount: parseFloat(payment.amount) || 0,
        mode: payment.mode || '',
        status: payment.status || 'Completed',
        transactionId: payment.transactionId || '',
        bankName: payment.bankName || '',
        paymentMadeBy: payment.paymentMadeBy || 'Customer',
        receiptDate: payment.receiptDate || payment.date || '',
        payoutBy: payment.payoutBy || 'Customer',
        type: payment.type || 'customer_payment'
      }));
    }

    // Clean up documents
    if (sanitized.documents && Array.isArray(sanitized.documents)) {
      sanitized.documents = sanitized.documents.map(doc => {
        if (typeof doc === 'string') {
          return { url: doc, tag: '' };
        }
        return {
          url: doc.url || '',
          name: doc.name || '',
          originalName: doc.originalName || '',
          extension: doc.extension || '',
          type: doc.type || '',
          size: doc.size || 0,
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
          tag: doc.tag || ''
        };
      });
    }

    return sanitized;
  };

  const createPolicy = async () => {
    try {
      setIsSaving(true);
      
      // Prepare customer details based on buyer type - UPDATED with all fields
      const customerDetails = {
        name: form.customerName || "",
        mobile: form.mobile || "",
        email: form.email || "",
        residenceAddress: form.residenceAddress || "",
        pincode: form.pincode || "",
        city: form.city || "",
        alternatePhone: form.alternatePhone || "",
        employeeName: form.employeeName || "",
        age: form.age || "", // ADDED: age field
        gender: form.gender || "",
        panNumber: form.panNumber || "",
        aadhaarNumber: form.aadhaarNumber || "",
        companyName: form.companyName || "", // ADDED: corporate fields
        contactPersonName: form.contactPersonName || "",
        companyPanNumber: form.companyPanNumber || "",
        gstNumber: form.gstNumber || ""
      };

      const policyData = {
        buyer_type: form.buyer_type || "individual",
        vehicleType: form.vehicleType || "used", // NEW: Include vehicleType
        customer_details: customerDetails,
        nominee: {
          name: form.nomineeName || "",
          relation: form.relation || "",
          age: form.nomineeAge || ""
        },
        reference: { // FIXED: Corrected spelling from 'refrence' to 'reference'
          name: form.referenceName || "",
          phone: form.referencePhone || ""
        },
        insurance_category: form.insurance_category || "motor",
        status: form.status || "pending",
        insurance_quotes: form.insuranceQuotes || [],
        ts: Date.now(),
        created_by: form.created_by || "ADMIN123",
        policyPrefilled: form.policyPrefilled || false // ADDED: policyPrefilled field
      };

      // Sanitize data before sending
      const sanitizedData = sanitizeDataForAPI(policyData);
      
      console.log("📝 Creating policy with sanitized data:", sanitizedData);

      const response = await axios.post(`${API_BASE_URL}/policies`, sanitizedData, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      });
      
      if (response.data && response.data.id) {
        setPolicyId(response.data.id);
        setSaveMessage("✅ Policy created successfully!");
        return response.data.id;
      } else {
        throw new Error("No policy ID in response");
      }
    } catch (error) {
      console.error("❌ Error creating policy:", error);
      let errorMessage = "Error creating policy";
      
      if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage = "Network error: No response from server";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setSaveMessage(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // ENHANCED updatePolicy function with vehicleType support and data sanitization
  const updatePolicy = async (overrideData = null) => {
    try {
      setIsSaving(true);
      
      if (!policyId && !isEditMode) {
        console.log("📝 No policy ID found, creating new policy...");
        const newPolicyId = await createPolicy();
        if (!newPolicyId) {
          throw new Error("Failed to create policy");
        }
        setPolicyId(newPolicyId);
        return;
      }

      if (!policyId) {
        throw new Error("Policy ID is required for update");
      }

      let updateData = {};
      
      // If overrideData is provided, use it directly (for payment data)
      if (overrideData) {
        console.log("🔄 Using override data for update:", overrideData);
        updateData = overrideData;
      } else {
        // Standard step-based update data - UPDATED with vehicleType
        switch (step) {
          case 1:
            // Prepare customer details based on buyer type - UPDATED with all fields
            const customerDetails = {
              name: form.customerName || "",
              mobile: form.mobile || "",
              email: form.email || "",
              residenceAddress: form.residenceAddress || "",
              pincode: form.pincode || "",
              city: form.city || "",
              alternatePhone: form.alternatePhone || "",
              employeeName: form.employeeName || "",
              age: form.age || "", // ADDED: age field
              gender: form.gender || "",
              panNumber: form.panNumber || "",
              aadhaarNumber: form.aadhaarNumber || "",
              companyName: form.companyName || "", // ADDED: corporate fields
              contactPersonName: form.contactPersonName || "",
              companyPanNumber: form.companyPanNumber || "",
              gstNumber: form.gstNumber || ""
            };

            updateData = {
              buyer_type: form.buyer_type,
              vehicleType: form.vehicleType, // NEW: Include vehicleType
              customer_details: customerDetails,
              nominee: {
                name: form.nomineeName || "",
                relation: form.relation || "",
                age: form.nomineeAge || ""
              },
              reference: { // FIXED: Corrected spelling
                name: form.referenceName || "",
                phone: form.referencePhone || ""
              },
              policyPrefilled: form.policyPrefilled || false // ADDED
            };
            break;
          case 2:
            updateData = {
              vehicle_details: {
                regNo: form.regNo || "",
                make: form.make || "",
                model: form.model || "",
                variant: form.variant || "",
                engineNo: form.engineNo || "",
                chassisNo: form.chassisNo || "",
                makeMonth: form.makeMonth || "",
                makeYear: form.makeYear || ""
              },
              vehicleType: form.vehicleType // NEW: Include vehicleType in vehicle details update
            };
            break;
          case 3:
            // Only update previous policy for used cars
            if (form.vehicleType === "used") {
              updateData = {
                previous_policy: {
                  insuranceCompany: form.previousInsuranceCompany || "",
                  policyNumber: form.previousPolicyNumber || "",
                  policyType: form.previousPolicyType || "",
                  issueDate: form.previousIssueDate || "",
                  policyStartDate: form.previousPolicyStartDate || "",
                  policyDuration: form.previousPolicyDuration || "",
                  policyEndDate: form.previousPolicyEndDate || "",
                  dueDate: form.previousDueDate || "",
                  claimTakenLastYear: form.previousClaimTaken || "no",
                  ncbDiscount: parseFloat(form.previousNcbDiscount) || 0
                }
              };
            }
            break;
          case 4:
            updateData = {
              insurance_quote: {
                insurer: form.insurer || "",
                coverageType: form.coverageType || "",
                premium: parseFloat(form.premium) || 0,
                idv: parseFloat(form.idv) || 0,
                ncb: form.ncb || "",
                duration: form.duration || ""
              }
            };
            break;
          case 5:
            updateData = {
              policy_info: {
                policyIssued: form.policyIssued || "", // ADDED: missing field
                insuranceCompany: form.insuranceCompany || "",
                policyNumber: form.policyNumber || "",
                covernoteNumber: form.covernoteNumber || "", // ADDED: missing field
                issueDate: form.issueDate || "",
                policyStartDate: form.policyStartDate || "", // ADDED: missing field
                dueDate: form.dueDate || "",
                ncbDiscount: parseFloat(form.ncbDiscount) || 0,
                insuranceDuration: form.insuranceDuration || "",
                idvAmount: parseFloat(form.idvAmount) || 0,
                totalPremium: parseFloat(form.totalPremium) || 0
              }
            };
            break;
          case 6:
            // FIXED: Convert documents object to array properly
            const documentsArray = Object.entries(form.documents || {}).map(([docId, doc]) => ({
              ...doc,
              id: docId,
              tag: form.documentTags?.[docId] || ""
            }));
            updateData = {
              documents: documentsArray
            };
            break;
          case 7:
            // FIXED: Payment data structure with ledger
            const totalPaid = paymentLedger.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
            const paymentStatus = totalPaid >= totalPremium ? 'Fully Paid' : 'Payment Pending';
            
            updateData = {
              payment_info: {
                paymentMadeBy: form.paymentMadeBy || "",
                paymentMode: form.paymentMode || "",
                paymentAmount: parseFloat(form.paymentAmount) || 0,
                paymentDate: form.paymentDate || "",
                transactionId: form.transactionId || "",
                receiptDate: form.receiptDate || "",
                bankName: form.bankName || "",
                subvention_payment: form.subvention_payment || "No Subvention",
                paymentStatus: paymentStatus,
                totalPaidAmount: totalPaid
              },
              payment_ledger: paymentLedger
            };
            break;
          case 8:
            updateData = {
              payout: {
                netPremium: parseFloat(form.netPremium) || 0,
                odAmount: parseFloat(form.odAmount) || 0,
                ncbAmount: parseFloat(form.ncbAmount) || 0,
                subVention: parseFloat(form.subVention) || 0,
                odAddonPercentage: parseFloat(form.odAddonPercentage) || 10, // ADDED: missing field
                odAddonAmount: parseFloat(form.odAddonAmount) || 0, // ADDED: missing field
                netAmount: parseFloat(form.netAmount) || 0 // ADDED: missing field
              },
              payment_ledger: paymentLedger,
            };
            break;
          default:
            updateData = {};
        }
      }

      // Always include insurance quotes in updates
      if (form.insuranceQuotes && form.insuranceQuotes.length > 0) {
        updateData.insurance_quotes = form.insuranceQuotes;
      }
      
      // Include payment ledger if it exists and not already included
      if (paymentLedger.length > 0 && !updateData.payment_ledger) {
        updateData.payment_ledger = paymentLedger;
      }

      const totalPaidAmount = paymentLedger.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      const remainingAmount = (parseFloat(totalPremium) || 0) - totalPaidAmount;
      if (remainingAmount === 0 && totalPaidAmount > 0) {
        updateData.status = 'payment completed';
      }

      // Sanitize data before sending
      const sanitizedUpdateData = sanitizeDataForAPI(updateData);

      // DEBUG: Log exactly what's being sent
      console.log("🚀 SENDING SANITIZED DATA TO BACKEND:", {
        policyId,
        updateData: sanitizedUpdateData,
        hasPaymentInfo: !!sanitizedUpdateData.payment_info,
        hasPaymentLedger: !!sanitizedUpdateData.payment_ledger,
        paymentLedgerLength: sanitizedUpdateData.payment_ledger?.length || 0,
        insuranceQuotesLength: sanitizedUpdateData.insurance_quotes?.length || 0,
        vehicleType: form.vehicleType
      });

      const response = await axios.put(`${API_BASE_URL}/policies/${policyId}`, sanitizedUpdateData, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      });
      
      console.log("✅ API Response:", response.data);
      
      setSaveMessage(isEditMode ? "✅ Policy updated successfully!" : "✅ Progress saved successfully!");
      
      return response.data;
    } catch (error) {
      console.error("❌ Error updating policy:", error);
      let errorMessage = "Error saving progress";
      
      if (error.response) {
        errorMessage = `Save error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        console.error("❌ API Error details:", error.response.data);
      } else if (error.request) {
        errorMessage = "Network error: No response from server";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setSaveMessage(`❌ ${errorMessage}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // ENHANCED handleSave function to accept payment data
  const handleSave = async (paymentData = null) => {
    if (!validateCurrentStep()) {
      setSaveMessage("❌ Please fix the validation errors before saving");
      return;
    }
    
    try {
      // If paymentData is provided, use it for update
      if (paymentData) {
        console.log("💾 Saving payment data:", paymentData);
        await updatePolicy(paymentData);
      } else {
        await updatePolicy();
      }
    } catch (error) {
      // Error handling is done in updatePolicy
    }
  };

  // NEW: Handle Save and Exit
  const handleSaveAndExit = async () => {
    try {
      setIsSaving(true);
      
      // Save current progress first
      if (policyId) {
        await updatePolicy();
      } else {
        await createPolicy();
      }
      
      // Navigate back to policies page after successful save
      setTimeout(() => {
        navigate("/policies");
      }, 1000);
      
    } catch (error) {
      console.error("❌ Error saving before exit:", error);
      setSaveMessage("❌ Error saving progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!validateCurrentStep()) {
      setSaveMessage("❌ Please fix the validation errors before finishing");
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare customer details based on buyer type - UPDATED with all fields
      const customerDetails = {
        name: form.customerName,
        mobile: form.mobile,
        email: form.email,
        residenceAddress: form.residenceAddress,
        pincode: form.pincode,
        city: form.city,
        alternatePhone: form.alternatePhone || "",
        employeeName: form.employeeName || "",
        age: form.age || "", // ADDED: age field
        gender: form.gender,
        panNumber: form.panNumber,
        aadhaarNumber: form.aadhaarNumber,
        companyName: form.companyName || "", // ADDED: corporate fields
        contactPersonName: form.contactPersonName || "",
        companyPanNumber: form.companyPanNumber || "",
        gstNumber: form.gstNumber || ""
      };

      // Convert documents object to array for final save
      const documentsArray = Object.entries(form.documents || {}).map(([docId, doc]) => ({
        ...doc,
        id: docId,
        tag: form.documentTags?.[docId] || ""
      }));

      // Calculate final payment status
      const totalPaid = paymentLedger.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      const paymentStatus = totalPaid >= totalPremium ? 'Fully Paid' : 'Payment Pending';

      const finalData = {
        buyer_type: form.buyer_type,
        vehicleType: form.vehicleType, // NEW: Include vehicleType
        customer_details: customerDetails,
        nominee: {
          name: form.nomineeName,
          relation: form.relation,
          age: form.nomineeAge
        },
        reference: { // FIXED: Corrected spelling
          name: form.referenceName,
          phone: form.referencePhone
        },
        vehicle_details: {
          regNo: form.regNo,
          make: form.make,
          model: form.model,
          variant: form.variant,
          engineNo: form.engineNo,
          chassisNo: form.chassisNo,
          makeMonth: form.makeMonth,
          makeYear: form.makeYear
        },
        previous_policy: form.vehicleType === "used" ? {
          insuranceCompany: form.previousInsuranceCompany || "",
          policyNumber: form.previousPolicyNumber || "",
          policyType: form.previousPolicyType || "",
          issueDate: form.previousIssueDate || "",
          policyStartDate: form.previousPolicyStartDate || "",
          policyDuration: form.previousPolicyDuration || "",
          policyEndDate: form.previousPolicyEndDate || "",
          dueDate: form.previousDueDate || "",
          claimTakenLastYear: form.previousClaimTaken || "no",
          ncbDiscount: parseFloat(form.previousNcbDiscount) || 0
        } : {},
        insurance_quote: {
          insurer: form.insurer,
          coverageType: form.coverageType,
          premium: parseFloat(form.premium) || 0,
          idv: parseFloat(form.idv) || 0,
          ncb: form.ncb,
          duration: form.duration
        },
        insurance_quotes: form.insuranceQuotes || [],
        policy_info: {
          policyIssued: form.policyIssued, // ADDED: missing field
          insuranceCompany: form.insuranceCompany,
          policyNumber: form.policyNumber,
          covernoteNumber: form.covernoteNumber, // ADDED: missing field
          issueDate: form.issueDate,
          policyStartDate: form.policyStartDate,          
          dueDate: form.dueDate,
          ncbDiscount: parseFloat(form.ncbDiscount) || 0,
          insuranceDuration: form.insuranceDuration,
          idvAmount: parseFloat(form.idvAmount) || 0,
          totalPremium: parseFloat(form.totalPremium) || 0
        },
        documents: documentsArray,
        payment_info: {
          paymentMadeBy: form.paymentMadeBy,
          paymentMode: form.paymentMode,
          paymentAmount: parseFloat(form.paymentAmount) || 0,
          paymentDate: form.paymentDate,
          transactionId: form.transactionId,
          receiptDate: form.receiptDate,
          bankName: form.bankName,
          subvention_payment: form.subvention_payment || "No Subvention",
          paymentStatus: paymentStatus,
          totalPaidAmount: totalPaid
        },
        payment_ledger: paymentLedger,
        payout: {
          netPremium: parseFloat(form.netPremium) || 0,
          odAmount: parseFloat(form.odAmount) || 0,
          ncbAmount: parseFloat(form.ncbAmount) || 0,
          subVention: parseFloat(form.subVention) || 0,
          odAddonPercentage: parseFloat(form.odAddonPercentage) || 10, // ADDED: missing field
          odAddonAmount: parseFloat(form.odAddonAmount) || 0, // ADDED: missing field
          netAmount: parseFloat(form.netAmount) || 0 // ADDED: missing field
        },
        status: "completed",
        completed_at: Date.now(),
        ts: form.ts,
        created_by: form.created_by,
        policyPrefilled: form.policyPrefilled || false // ADDED: missing field
      };

      // Sanitize final data
      const sanitizedFinalData = sanitizeDataForAPI(finalData);

      console.log(`✅ Finalizing policy with vehicle type:`, form.vehicleType);
      console.log(`✅ Finalizing policy ${policyId} with complete data:`, sanitizedFinalData);

      const response = await axios.put(`${API_BASE_URL}/policies/${policyId}`, sanitizedFinalData, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      });

      setSaveMessage("✅ Policy completed successfully! Redirecting to policies page...");
      setIsCompleted(true);
      
      setTimeout(() => {
        navigate("/policies");
      }, 2000);
      
    } catch (error) {
      console.error("❌ Error completing policy:", error);
      setSaveMessage("❌ Error completing policy. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    // NEW: Skip step 3 for new cars
    if (form.vehicleType === "new" && step === 2) {
      // Skip directly to step 4 (Insurance Quotes) from step 2
      setStep(4);
      setErrors({});
      setSaveMessage("");
      return;
    }

    if (step === steps.length) {
      await handleFinish();
      return;
    }

    if (!validateCurrentStep()) {
      setSaveMessage("❌ Please fix the validation errors before proceeding");
      return;
    }

    try {
      await updatePolicy();
      // NEW: Skip step 3 for new cars
      const nextStepValue = form.vehicleType === "new" && step === 2 ? 4 : step + 1;
      setStep(nextStepValue);
      setErrors({});
      setSaveMessage("");
    } catch (error) {
      console.log("Save failed, staying on current step");
    }
  };

  const prevStep = () => {
    // NEW: Handle going back from step 4 for new cars
    if (form.vehicleType === "new" && step === 4) {
      setStep(2); // Go back to Vehicle Details
    } else {
      setStep((s) => Math.max(s - 1, 1));
    }
    setErrors({});
    setSaveMessage("");
  };

  // NEW: Updated progress calculation to account for skipped step
  const progressPercent = Math.round(((getDisplayStep(step) - 1) / (getSteps().length - 1)) * 100);

  // NEW: Updated next label to show correct step name
  const getNextLabel = () => {
    if (step < steps.length) {
      if (form.vehicleType === "new" && step === 2) {
        return "Next: Insurance Quotes"; // Skip Previous Policy
      }
      return `Next: ${steps[step]}`;
    }
    return "Finish";
  };

  const nextLabel = getNextLabel();

  const stepProps = {
    form,
    handleChange,
    handleSave,
    isSaving,
    errors,
    onDocumentsUpdate: handleDocumentsUpdate,
    onInsuranceQuotesUpdate: handleInsuranceQuotesUpdate,
    isNcbEligible: form.previousClaimTaken !== "yes",
    acceptedQuote,
    onQuoteAccepted: handleQuoteAccepted,
    totalPremium,
    onNextStep: nextStep,
    paymentLedger,
    onPaymentLedgerUpdate: handlePaymentLedgerUpdate,
    isEditMode: !!id 
  };

  if (loadingPolicy) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">
                Edit Insurance Case #{id}
              </h1>
              <p className="text-sm text-gray-500">Loading policy data...</p>
            </div>
            <Link
              to="/policies"
              className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-600 hover:shadow"
            >
              <FaChevronLeft /> Back to Cases
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading policy data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {saveMessage && (
          <div className={`mb-4 p-3 rounded-md ${
            saveMessage.includes("❌") || saveMessage.includes("Error") || saveMessage.includes("validation") 
              ? "bg-red-100 text-red-700 border border-red-300" 
              : saveMessage.includes("✅") || saveMessage.includes("completed successfully") || saveMessage.includes("successfully")
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-purple-100 text-purple-700 border border-purple-300"
          }`}>
            {saveMessage}
            {isCompleted && (
              <div className="text-sm mt-1">
                Redirecting to policies page...
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              {isEditMode ? 'Edit Insurance Case' : 'New Insurance Case'} 
              {policyId && ` #${policyId}`}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditMode ? 'Edit existing insurance case' : 'Create a new insurance case'}
              {isEditMode && " - All fields are pre-filled with existing data"}
              {form.vehicleType && ` - Vehicle Type: ${form.vehicleType === 'new' ? 'New Car' : 'Used Car'}`}
            </p>
          </div>
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-600 hover:shadow"
          >
            <FaChevronLeft /> Back to Cases
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {/* NEW: Updated step display to account for skipped step */}
              Step {getDisplayStep(step)} of {getSteps().length}
            </div>
            <div className="text-sm text-gray-500">
              {progressPercent}% Complete
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="h-2  rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {getSteps().map((title, idx) => {
              const displayStep = idx + 1;
              const actualStep = getActualStep(displayStep);
              const isCompleted = displayStep < getDisplayStep(step);
              const isCurrent = displayStep === getDisplayStep(step);

              return (
                <div
                  key={title}
                  className="flex-1 relative flex flex-col items-center cursor-pointer"
                  onClick={() => handleStepClick(displayStep)}
                  title={`Click to go to ${title}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                        : isCurrent
                        ? "bg-white border-2 border-purple-600 text-purple-600 shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {isCompleted ? <FaCheck /> : displayStep}
                  </div>
                  <div
                    className={`mt-2 text-xs text-center font-medium ${
                      isCompleted
                        ? "text-green-600"
                        : isCurrent
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  >
                    {title}
                  </div>
                  {/* NEW: Show vehicle type indicator on step 2 */}
                  {title === "Vehicle Details" && form.vehicleType && (
                    <div className={`mt-1 px-2 py-0.5 rounded-full text-xs ${
                      form.vehicleType === "new" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {form.vehicleType === "new" ? "NEW" : "USED"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step components */}
        {step === 1 && <CaseDetails {...stepProps} />}
        {step === 2 && <VehicleDetails {...stepProps} />}
        {/* NEW: Only show Previous Policy for used cars */}
        {step === 3 && form.vehicleType === "used" && <PreviousPolicyDetails {...stepProps} />}
        {step === 4 && <InsuranceQuotes {...stepProps} />}
        {step === 5 && <NewPolicyDetails {...stepProps} acceptedQuote={acceptedQuote} />}
        {step === 6 && <Documents {...stepProps} />}
        {step === 7 && <Payment {...stepProps} totalPremium={totalPremium} />}
        {step === 8 && <PayoutDetails {...stepProps} />}

        {/* FIXED FOOTER */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={prevStep}
                  disabled={step === 1 || isCompleted || isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <FaChevronLeft /> Previous
                </button>
                
                <button
                  onClick={handleSaveAndExit}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <FaSave className="text-gray-600" />
                  {isSaving ? "Saving..." : "Save & Exit"}
                </button>
                
                <div className="text-sm text-gray-500 hidden md:block">
                  {/* NEW: Updated step display */}
                  Step {getDisplayStep(step)} of {getSteps().length}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 hidden md:block">
                  Progress: {progressPercent}%
                </div>
                
                <button
                  onClick={nextStep}
                  disabled={isCompleted || isSaving}
                  className="inline-flex items-center gap-3 px-5 py-2 rounded-md bg-purple-600 text-white text-sm hover:opacity-95 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Processing..." : nextLabel} 
                  {!isSaving && step < steps.length && <FaChevronRight />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add padding to bottom to account for fixed footer */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default NewPolicyPage;
