import React ,{ useState, useEffect } from "react"; 
import {jsPDF} from 'jspdf'
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaCar,
  FaMapMarkerAlt,
  FaUser,
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
import { Plus, Download, ChevronUp, ChevronDown, Trash2, FileText, Save } from 'lucide-react';

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
// ================== VALIDATION RULES ==================
const validationRules = {
  // Step 1: Case Details validation
  validateStep1: (form) => {
    const errors = {};

    // Buyer Type validation
    if (!form.buyer_type) {
      errors.buyer_type = "Buyer type is required";
    }

    // Mobile validation
    if (!form.mobile) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      errors.mobile = "Mobile number must be 10 digits";
    }

    // Customer/Company Name validation
    if (!form.customerName) {
      errors.customerName = form.buyer_type === "corporate" 
        ? "Company name is required" 
        : "Customer name is required";
    } else if (form.customerName.length < 2) {
      errors.customerName = "Name must be at least 2 characters";
    }

    // Email validation
    if (!form.email) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Gender validation
    if (!form.gender) {
      errors.gender = "Gender is required";
    }

    // Marital Status validation
    if (!form.maritalStatus) {
      errors.maritalStatus = "Marital status is required";
    }

    // Date of Birth validation
    if (!form.dob) {
      errors.dob = "Date of birth is required";
    } else {
      const dob = new Date(form.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age < 18) {
        errors.dob = "Customer must be at least 18 years old";
      } else if (age > 100) {
        errors.dob = "Please enter a valid date of birth";
      }
    }

    // PAN validation (if provided)
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
      errors.panNumber = "Please enter a valid PAN number";
    }

    // Aadhaar validation (if provided)
    if (form.aadhaarNumber && !/^\d{12}$/.test(form.aadhaarNumber.replace(/\s/g, ''))) {
      errors.aadhaarNumber = "Aadhaar number must be 12 digits";
    }

    // Address validation
    if (!form.residenceAddress) {
      errors.residenceAddress = "Residence address is required";
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
    }

    // Nominee validation (if any nominee field is filled)
    if (form.nomineeName || form.relation || form.nomineeAge) {
      if (!form.nomineeName) {
        errors.nomineeName = "Nominee name is required when adding nominee details";
      }
      if (!form.relation) {
        errors.relation = "Nominee relation is required";
      }
      if (!form.nomineeAge) {
        errors.nomineeAge = "Nominee age is required";
      } else if (form.nomineeAge < 1 || form.nomineeAge > 120) {
        errors.nomineeAge = "Please enter a valid nominee age";
      }
    }

    return errors;
  },

  // Step 2: Vehicle Details validation
  validateStep2: (form) => {
    const errors = {};

    // City validation
    if (!form.city) {
      errors.city = "City is required";
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
 // Step 3: Insurance Quotes validation - RECOMMENDED
validateStep3: (form) => {
  const errors = {};

  // Primary validation: Require at least one insurance quote
  if (!form.insuranceQuotes || form.insuranceQuotes.length === 0) {
    errors.insuranceQuotes = "At least one insurance quote is required";
  }

  // Optional: Validate individual quote fields if using old system
  // This ensures backward compatibility
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

    // Policy Issued Status validation
    if (!form.policyIssued) {
      errors.policyIssued = "Policy issued status is required";
    }

    // Insurance Company validation
    if (!form.insuranceCompany) {
      errors.insuranceCompany = "Insurance company is required";
    }

    // Policy/Covernote Number validation (if policy is issued)
    if (form.policyIssued === "yes") {
      if (!form.policyNumber && !form.covernoteNumber) {
        errors.policyNumber = "Policy number or covernote number is required when policy is issued";
      }
    }

    // Issue Date validation (if provided)
    if (form.issueDate) {
      const issueDate = new Date(form.issueDate);
      const today = new Date();
      
      if (issueDate > today) {
        errors.issueDate = "Issue date cannot be in the future";
      }
    }

    // Due Date validation (if provided)
    if (form.dueDate && form.issueDate) {
      const dueDate = new Date(form.dueDate);
      const issueDate = new Date(form.issueDate);
      
      if (dueDate <= issueDate) {
        errors.dueDate = "Due date must be after issue date";
      }
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

    // Documents validation - require at least one uploaded document
    if (!form.documents || form.documents.length === 0) {
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
      
      if (paymentDate > today) {
        errors.paymentDate = "Payment date cannot be in the future";
      }
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
const CaseDetails = ({ form, handleChange, handleSave, isSaving, errors }) => (
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
      {/* <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-700 hover:shadow transition disabled:opacity-50"
      >
        <FaSave /> {isSaving ? "Saving..." : "Save Progress"}
      </button> */}
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

      {/* Mobile */}
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
            placeholder="Enter 10-digit mobile number"
            className={`w-full border rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.mobile ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
      </div>

      {/* Customer Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">
          {form.buyer_type === "corporate"
            ? "Company Name *"
            : "Customer Name *"}
        </label>
        <div className="flex items-center">
          <FaUser className="text-gray-400 mr-2" />
          <input
            type="text"
            name="customerName"
            value={form.customerName || ""}
            onChange={handleChange}
            placeholder={
              form.buyer_type === "corporate"
                ? "Enter company name"
                : "Enter customer name"
            }
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.customerName ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
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

      {/* Marital Status */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">
          Marital Status *
        </label>
        <select
          name="maritalStatus"
          value={form.maritalStatus || ""}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
            errors.maritalStatus ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select status</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
        </select>
        {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>}
      </div>

      {/* DOB */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">
          Date of Birth *
        </label>
        <input
          type="date"
          name="dob"
          value={form.dob || ""}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
            errors.dob ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
      </div>

      {/* Occupation */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">
          Occupation
        </label>
        <input
          type="text"
          name="occupation"
          value={form.occupation || ""}
          onChange={handleChange}
          placeholder="Enter occupation"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
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

      {/* Address */}
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-600">
          Residence Address *
        </label>
        <input
          type="text"
          name="residenceAddress"
          value={form.residenceAddress || ""}
          onChange={handleChange}
          placeholder="Enter complete address"
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

      {/* Nominee Info */}
      <div className="md:col-span-2">
        <h4 className="text-md font-semibold mt-6">Nominee Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
          <div>
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
          <div>
            <select
              name="relation"
              value={form.relation || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.relation ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select relation</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
            </select>
            {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation}</p>}
          </div>
          <div>
            <input
              type="number"
              name="nomineeAge"
              value={form.nomineeAge || ""}
              onChange={handleChange}
              placeholder="Nominee Age"
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
        <h4 className="text-md font-semibold mt-6">Reference Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
          <div>
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
    </div>
  </div>
);

// ================== STEP 2: Vehicle Details ==================
const VehicleDetails = ({ form, handleChange, handleSave, isSaving, errors }) => (
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
      {/* <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-700 hover:shadow transition disabled:opacity-50"
      >
        <FaSave /> {isSaving ? "Saving..." : "Save Progress"}
      </button> */}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-600">
          <FaMapMarkerAlt className="inline-block mr-2 text-gray-500" />
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

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">
          Vehicle Make *
        </label>
        <select
          name="make"
          value={form.make || ""}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
            errors.make ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select make</option>
          <option value="Maruti">Maruti</option>
          <option value="Hyundai">Hyundai</option>
          <option value="Honda">Honda</option>
        </select>
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
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
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

// ================== STEP 3: Insurance Quotes ==================

// const InsuranceQuotes = ({ form, handleChange, handleSave, isSaving, errors, onInsuranceQuotesUpdate }) => {
//   // Load quotes from localStorage or use empty array
//   const [quotes, setQuotes] = useState(() => {
//     try {
//       const savedQuotes = localStorage.getItem('insuranceQuotes');
//       return savedQuotes ? JSON.parse(savedQuotes) : [];
//     } catch (error) {
//       console.error('Error loading quotes from localStorage:', error);
//       return [];
//     }
//   });
  
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [selectedQuotes, setSelectedQuotes] = useState([]);
//   const [expandedQuotes, setExpandedQuotes] = useState([]);
//   const [manualQuote, setManualQuote] = useState({
//     insuranceCompany: '',
//     coverageType: 'comprehensive',
//     idv: '',
//     policyDuration: '1',
//     ncbDiscount: '0',
//     odAmount: '',
//     thirdPartyAmount: '',
//     premium: '',
//     addOns: {
//       zeroDep: { selected: false, amount: '', rate: '' },
//       consumables: { selected: false, amount: '', rate: '' },
//       roadSideAssist: { selected: false, amount: '', rate: '' },
//       keyReplacement: { selected: false, amount: '', rate: '' },
//       engineProtect: { selected: false, amount: '', rate: '' },
//       returnToInvoice: { selected: false, amount: '', rate: '' },
//       personalAccident: { selected: false, amount: '', rate: '' },
//       tyreProtection: { selected: false, amount: '', rate: '' },
//       emergencyMedical: { selected: false, amount: '', rate: '' }
//     }
//   });

//   // Save quotes to localStorage whenever quotes change
//   useEffect(() => {
//     try {
//       localStorage.setItem('insuranceQuotes', JSON.stringify(quotes));
//     } catch (error) {
//       console.error('Error saving quotes to localStorage:', error);
//     }
//   }, [quotes]);

//   // Insurance companies with real image paths and colors
//   const insuranceCompanies = [
//     { 
//       name: "ICICI Lombard", 
//       logo: icici,
//       fallbackLogo: "🏦",
//       color: "#FF6B35",
//       bgColor: "#FFF0EB"
//     },
//     { 
//       name: "HDFC Ergo", 
//       logo: hdfc,
//       fallbackLogo: "🏛️",
//       color: "#2E8B57",
//       bgColor: "#F0FFF0"
//     },
//     { 
//       name: "Bajaj Allianz", 
//       logo: bajaj,
//       fallbackLogo: "🛡️",
//       color: "#0056B3",
//       bgColor: "#F0F8FF"
//     },
//     { 
//       name: "New India Assurance", 
//       logo: indiau,
//       fallbackLogo: "🇮🇳",
//       color: "#FF8C00",
//       bgColor: "#FFF8F0"
//     },
//     { 
//       name: "United India", 
//       logo: uindia,
//       fallbackLogo: "🤝",
//       color: "#8B4513",
//       bgColor: "#FFF8F0"
//     },
//     { 
//       name: "National Insurance", 
//       logo: nis,
//       fallbackLogo: "🏢",
//       color: "#228B22",
//       bgColor: "#F0FFF0"
//     },
//     { 
//       name: "Oriental Insurance", 
//       logo: orient,
//       fallbackLogo: "🌅",
//       color: "#DC143C",
//       bgColor: "#FFF0F5"
//     },
//     { 
//       name: "Tata AIG", 
//       logo: tata,
//       fallbackLogo: "🚗",
//       color: "#0066CC",
//       bgColor: "#F0F8FF"
//     },
//     { 
//       name: "Reliance General", 
//       logo: reliance,
//       fallbackLogo: "⚡",
//       color: "#FF4500",
//       bgColor: "#FFF0EB"
//     },
//     { 
//       name: "Cholamandalam", 
//       logo: chola,
//       fallbackLogo: "💎",
//       color: "#800080",
//       bgColor: "#F8F0FF"
//     }
//   ];

//   // Add-on descriptions only (no fixed rates)
//   const addOnDescriptions = {
//     zeroDep: "Zero Depreciation Cover",
//     consumables: "Consumables Cover",
//     roadSideAssist: "Road Side Assistance",
//     keyReplacement: "Key & Lock Replacement",
//     engineProtect: "Engine Protect",
//     returnToInvoice: "Return to Invoice",
//     personalAccident: "Personal Accident Cover",
//     tyreProtection: "Tyre Protection",
//     emergencyMedical: "Emergency Medical"
//   };

//   // NCB options
//   const ncbOptions = [0, 20, 25, 35, 45, 50];

//   // Handle manual quote input changes
//   const handleManualQuoteChange = (e) => {
//     const { name, value } = e.target;
//     setManualQuote(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle add-on changes
//   const handleAddOnChange = (addOnKey, field, value) => {
//     setManualQuote(prev => {
//       const updatedAddOns = { ...prev.addOns };
      
//       if (field === 'selected') {
//         updatedAddOns[addOnKey] = {
//           ...updatedAddOns[addOnKey],
//           selected: value,
//           amount: '',
//           rate: ''
//         };
//       } else if (field === 'rate' && value && prev.idv) {
//         // Calculate amount when rate changes and IDV is available
//         const calculatedAmount = Math.round((parseFloat(prev.idv) || 0) * (parseFloat(value) / 100));
//         updatedAddOns[addOnKey] = {
//           ...updatedAddOns[addOnKey],
//           [field]: value,
//           amount: calculatedAmount.toString()
//         };
//       } else if (field === 'amount' && value && prev.idv) {
//         // Calculate rate when amount changes and IDV is available
//         const calculatedRate = ((parseFloat(value) || 0) / (parseFloat(prev.idv) || 1) * 100).toFixed(2);
//         updatedAddOns[addOnKey] = {
//           ...updatedAddOns[addOnKey],
//           [field]: value,
//           rate: calculatedRate
//         };
//       } else {
//         updatedAddOns[addOnKey] = {
//           ...updatedAddOns[addOnKey],
//           [field]: value
//         };
//       }

//       return {
//         ...prev,
//         addOns: updatedAddOns
//       };
//     });
//   };

//   // Auto-calculate add-ons when IDV changes
//   React.useEffect(() => {
//     if (manualQuote.idv) {
//       const updatedAddOns = { ...manualQuote.addOns };
//       let needsUpdate = false;

//       Object.keys(updatedAddOns).forEach(key => {
//         const addOn = updatedAddOns[key];
//         if (addOn.selected && addOn.rate) {
//           const calculatedAmount = Math.round((parseFloat(manualQuote.idv) || 0) * (parseFloat(addOn.rate) / 100));
//           if (calculatedAmount !== parseFloat(addOn.amount || 0)) {
//             updatedAddOns[key] = {
//               ...addOn,
//               amount: calculatedAmount.toString()
//             };
//             needsUpdate = true;
//           }
//         }
//       });

//       if (needsUpdate) {
//         setManualQuote(prev => ({
//           ...prev,
//           addOns: updatedAddOns
//         }));
//       }
//     }
//   }, [manualQuote.idv]);

//   // Calculate add-ons total
//   const calculateAddOnsTotal = () => {
//     return Object.entries(manualQuote.addOns).reduce((total, [key, addOn]) => {
//       if (addOn.selected) {
//         const amount = parseFloat(addOn.amount) || 0;
//         return total + amount;
//       }
//       return total;
//     }, 0);
//   };

//   // Calculate total premium including add-ons
//   const calculateTotalPremium = () => {
//     const basePremium = parseFloat(manualQuote.premium) || 0;
//     const addOnsTotal = calculateAddOnsTotal();
//     return basePremium + addOnsTotal;
//   };

//   // Add manual quote
//   const addManualQuote = () => {
//     if (!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || !manualQuote.premium) {
//       alert("Please fill all required fields: Insurance Company, Coverage Type, IDV, and Premium");
//       return;
//     }

//     const company = insuranceCompanies.find(c => c.name === manualQuote.insuranceCompany);
//     const addOnsPremium = calculateAddOnsTotal();
//     const totalPremium = calculateTotalPremium();

//     const newQuote = {
//       id: Date.now().toString(), // Add unique ID for better management
//       insuranceCompany: manualQuote.insuranceCompany,
//       companyLogo: company?.logo || '',
//       companyFallbackLogo: company?.fallbackLogo || '🏢',
//       companyColor: company?.color || '#000',
//       companyBgColor: company?.bgColor || '#fff',
//       coverageType: manualQuote.coverageType,
//       idv: parseFloat(manualQuote.idv),
//       policyDuration: parseInt(manualQuote.policyDuration),
//       ncbDiscount: parseInt(manualQuote.ncbDiscount),
//       odAmount: manualQuote.odAmount ? parseFloat(manualQuote.odAmount) : 0,
//       thirdPartyAmount: manualQuote.thirdPartyAmount ? parseFloat(manualQuote.thirdPartyAmount) : 0,
//       premium: parseFloat(manualQuote.premium),
//       totalPremium: totalPremium,
//       addOnsPremium: addOnsPremium,
//       selectedAddOns: Object.entries(manualQuote.addOns)
//         .filter(([_, addOn]) => addOn.selected)
//         .reduce((acc, [key, addOn]) => {
//           acc[key] = {
//             description: addOnDescriptions[key],
//             amount: parseFloat(addOn.amount) || 0,
//             rate: parseFloat(addOn.rate) || 0
//           };
//           return acc;
//         }, {}),
//       createdAt: new Date().toISOString()
//     };

//     const updatedQuotes = [...quotes, newQuote];
//     setQuotes(updatedQuotes);
    
//     if (onInsuranceQuotesUpdate) {
//       onInsuranceQuotesUpdate(updatedQuotes);
//     }

//     // Reset manual quote form
//     setManualQuote({
//       insuranceCompany: '',
//       coverageType: 'comprehensive',
//       idv: '',
//       policyDuration: '1',
//       ncbDiscount: '0',
//       odAmount: '',
//       thirdPartyAmount: '',
//       premium: '',
//       addOns: {
//         zeroDep: { selected: false, amount: '', rate: '' },
//         consumables: { selected: false, amount: '', rate: '' },
//         roadSideAssist: { selected: false, amount: '', rate: '' },
//         keyReplacement: { selected: false, amount: '', rate: '' },
//         engineProtect: { selected: false, amount: '', rate: '' },
//         returnToInvoice: { selected: false, amount: '', rate: '' },
//         personalAccident: { selected: false, amount: '', rate: '' },
//         tyreProtection: { selected: false, amount: '', rate: '' },
//         emergencyMedical: { selected: false, amount: '', rate: '' }
//       }
//     });
//   };

//   // Remove quote
//   const removeQuote = (index) => {
//     const updatedQuotes = quotes.filter((_, i) => i !== index);
//     setQuotes(updatedQuotes);
//     setSelectedQuotes(selectedQuotes.filter(selectedIndex => selectedIndex !== index));
//     setExpandedQuotes(expandedQuotes.filter(expandedIndex => expandedIndex !== index));
    
//     if (onInsuranceQuotesUpdate) {
//       onInsuranceQuotesUpdate(updatedQuotes);
//     }
//   };

//   // Clear all quotes
//   const clearAllQuotes = () => {
//     if (window.confirm('Are you sure you want to clear all quotes? This action cannot be undone.')) {
//       setQuotes([]);
//       setSelectedQuotes([]);
//       setExpandedQuotes([]);
//       localStorage.removeItem('insuranceQuotes');
      
//       if (onInsuranceQuotesUpdate) {
//         onInsuranceQuotesUpdate([]);
//       }
//     }
//   };

//   // Toggle quote selection
//   const toggleQuoteSelection = (index) => {
//     setSelectedQuotes(prev =>
//       prev.includes(index)
//         ? prev.filter(i => i !== index)
//         : [...prev, index]
//     );
//   };

//   // Toggle quote expansion
//   const toggleQuoteExpansion = (index) => {
//     setExpandedQuotes(prev =>
//       prev.includes(index)
//         ? prev.filter(i => i !== index)
//         : [...prev, index]
//     );
//   };

//   // Select all quotes
//   const selectAllQuotes = () => {
//     setSelectedQuotes(quotes.map((_, index) => index));
//   };

//   // Deselect all quotes
//   const deselectAllQuotes = () => {
//     setSelectedQuotes([]);
//   };

//   // Enhanced PDF generation with professional layout
//   const downloadSelectedQuotesPDF = () => {
//     if (selectedQuotes.length === 0) {
//       alert("Please select at least one quote to download");
//       return;
//     }

//     const selectedQuoteData = selectedQuotes.map(index => quotes[index]);
//     downloadQuotesPDF(selectedQuoteData);
//   };

//   // Professional PDF generation function
//   const downloadQuotesPDF = (quotesToDownload) => {
//     try {
//       setIsGenerating(true);
      
//       const pdf = new jsPDF();
//       const pageWidth = pdf.internal.pageSize.width;
//       const pageHeight = pdf.internal.pageSize.height;
//       const margin = 20;
//       const contentWidth = pageWidth - (2 * margin);

//       // Set professional color scheme
//       const primaryColor = [41, 128, 185];
//       const secondaryColor = [52, 152, 219];
//       const accentColor = [46, 204, 113];
//       const textColor = [51, 51, 51];
//       const lightGray = [245, 245, 245];

//       // Header with gradient effect
//       pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
//       pdf.rect(0, 0, pageWidth, 80, 'F');
      
//       // Company Logo and Title
//       pdf.setFontSize(24);
//       pdf.setFont('helvetica', 'bold');
//       pdf.setTextColor(255, 255, 255);
//       pdf.text('INSURANCE QUOTES COMPARISON', pageWidth / 2, 35, { align: 'center' });
      
//       pdf.setFontSize(12);
//       pdf.text('AutoCredit Insurance - Professional Quote Analysis', pageWidth / 2, 45, { align: 'center' });
      
//       // Customer Information Box
//       pdf.setFillColor(255, 255, 255);
//       pdf.rect(margin, 60, contentWidth, 25, 'F');
//       pdf.setDrawColor(200, 200, 200);
//       pdf.rect(margin, 60, contentWidth, 25, 'S');
      
//       pdf.setFontSize(10);
//       pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
//       pdf.setFont('helvetica', 'bold');
//       pdf.text('CUSTOMER DETAILS:', margin + 5, 70);
//       pdf.setFont('helvetica', 'normal');
//       pdf.text(`Name: ${form.customerName || 'Not Provided'}`, margin + 5, 77);
//       pdf.text(`Vehicle: ${form.make || ''} ${form.model || ''} ${form.variant || ''}`, margin + 80, 77);
//       pdf.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 5, 77, { align: 'right' });

//       let yPosition = 95;

//       // Summary Statistics
//       if (quotesToDownload.length > 1) {
//         const lowestPremium = Math.min(...quotesToDownload.map(q => q.totalPremium));
//         const highestPremium = Math.max(...quotesToDownload.map(q => q.totalPremium));
//         const avgPremium = quotesToDownload.reduce((sum, q) => sum + q.totalPremium, 0) / quotesToDownload.length;

//         pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
//         pdf.rect(margin, yPosition, contentWidth, 20, 'F');
//         pdf.setDrawColor(200, 200, 200);
//         pdf.rect(margin, yPosition, contentWidth, 20, 'S');
        
//         pdf.setFontSize(9);
//         pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
//         pdf.setFont('helvetica', 'bold');
//         pdf.text('QUOTE SUMMARY:', margin + 5, yPosition + 8);
//         pdf.setFont('helvetica', 'normal');
        
//         pdf.text(`Total Quotes: ${quotesToDownload.length}`, margin + 5, yPosition + 15);
//         pdf.text(`Lowest Premium: ₹${lowestPremium.toLocaleString('en-IN')}`, margin + 60, yPosition + 15);
//         pdf.text(`Highest Premium: ₹${highestPremium.toLocaleString('en-IN')}`, margin + 120, yPosition + 15);
//         pdf.text(`Average Premium: ₹${avgPremium.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPosition + 15, { align: 'right' });
        
//         yPosition += 30;
//       }

//       // Main Comparison Table
//       createProfessionalComparisonTable(pdf, quotesToDownload, margin, yPosition, pageWidth, pageHeight);

//       // Footer
//       const footerY = pageHeight - 15;
//       pdf.setFontSize(8);
//       pdf.setTextColor(100, 100, 100);
//       pdf.text('Generated by AutoCredit Insurance | Contact: support@autocredit.com | Phone: +91-XXXXX-XXXXX', 
//                pageWidth / 2, footerY, { align: 'center' });

//       const fileName = `insurance-quotes-${form.customerName || 'customer'}-${new Date().getTime()}.pdf`;
//       pdf.save(fileName);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       alert('Error generating PDF. Please try again.');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Professional table creation function
//   const createProfessionalComparisonTable = (pdf, quotes, startX, startY, pageWidth, pageHeight) => {
//     const margin = 20;
//     const tableWidth = pageWidth - (2 * margin);
    
//     // Enhanced column structure for better comparison
//     const colWidths = [
//       tableWidth * 0.16, // Company
//       tableWidth * 0.10, // Coverage
//       tableWidth * 0.12, // IDV
//       tableWidth * 0.10, // Base Premium
//       tableWidth * 0.08, // Add-ons
//       tableWidth * 0.08, // NCB
//       tableWidth * 0.12, // Total Premium
//       tableWidth * 0.08, // Duration
//       tableWidth * 0.16  // Key Features
//     ];
    
//     let yPosition = startY;
    
//     // Table headers
//     const headers = ['Insurance Company', 'Coverage', 'IDV (₹)', 'Base Premium', 'Add-ons', 'NCB %', 'Total Premium', 'Term', 'Key Features'];
    
//     // Draw professional table header
//     pdf.setFillColor(52, 152, 219);
//     pdf.rect(margin, yPosition, tableWidth, 12, 'F');
    
//     pdf.setFontSize(9);
//     pdf.setTextColor(255, 255, 255);
//     pdf.setFont('helvetica', 'bold');
    
//     let xPosition = margin;
//     headers.forEach((header, index) => {
//       pdf.text(header, xPosition + 2, yPosition + 8);
//       xPosition += colWidths[index];
//     });
    
//     yPosition += 12;
    
//     // Sort quotes by total premium (lowest first)
//     const sortedQuotes = [...quotes].sort((a, b) => a.totalPremium - b.totalPremium);
    
//     // Table rows
//     pdf.setTextColor(0, 0, 0);
//     pdf.setFont('helvetica', 'normal');
//     pdf.setFontSize(8);
    
//     sortedQuotes.forEach((quote, rowIndex) => {
//       // Check for page break
//       if (yPosition > pageHeight - 40) {
//         pdf.addPage();
//         yPosition = 20;
//         // Redraw header on new page
//         pdf.setFillColor(52, 152, 219);
//         pdf.rect(margin, yPosition, tableWidth, 12, 'F');
//         pdf.setFontSize(9);
//         pdf.setTextColor(255, 255, 255);
//         pdf.setFont('helvetica', 'bold');
        
//         let headerX = margin;
//         headers.forEach((header, index) => {
//           pdf.text(header, headerX + 2, yPosition + 8);
//           headerX += colWidths[index];
//         });
        
//         yPosition += 12;
//         pdf.setTextColor(0, 0, 0);
//         pdf.setFont('helvetica', 'normal');
//         pdf.setFontSize(8);
//       }
      
//       // Alternate row colors for better readability
//       if (rowIndex % 2 === 0) {
//         pdf.setFillColor(250, 250, 250);
//       } else {
//         pdf.setFillColor(255, 255, 255);
//       }
//       pdf.rect(margin, yPosition, tableWidth, 25, 'F');
//       pdf.setDrawColor(220, 220, 220);
//       pdf.rect(margin, yPosition, tableWidth, 25, 'S');
      
//       xPosition = margin;
      
//       // Company name (truncated if too long)
//       const companyName = quote.insuranceCompany.length > 12 ? 
//         quote.insuranceCompany.substring(0, 12) + '...' : quote.insuranceCompany;
//       pdf.setFont('helvetica', 'bold');
//       pdf.text(companyName, xPosition + 2, yPosition + 8);
//       xPosition += colWidths[0];
      
//       // Coverage type
//       pdf.setFont('helvetica', 'normal');
//       const coverageType = quote.coverageType === 'comprehensive' ? 'Comp' : '3rd Party';
//       pdf.text(coverageType, xPosition + 2, yPosition + 8);
//       xPosition += colWidths[1];
      
//       // IDV
//       pdf.text(`₹${(quote.idv || 0).toLocaleString('en-IN')}`, xPosition + 2, yPosition + 8);
//       xPosition += colWidths[2];
      
//       // Base Premium
//       pdf.text(`₹${(quote.premium || 0).toLocaleString('en-IN')}`, xPosition + 2, yPosition + 8);
//       xPosition += colWidths[3];
      
//       // Add-ons count with amount
//       const addOnsCount = Object.keys(quote.selectedAddOns || {}).length;
//       const addOnsText = addOnsCount > 0 ? 
//         `${addOnsCount} (₹${quote.addOnsPremium.toLocaleString('en-IN')})` : '0';
//       pdf.text(addOnsText, xPosition + 2, yPosition + 8);
//       xPosition += colWidths[4];
      
//       // NCB with discount amount
//       const ncbDiscountAmount = Math.round((quote.premium || 0) * (quote.ncbDiscount / 100));
//       pdf.text(`${quote.ncbDiscount}%`, xPosition + 2, yPosition + 8);
//       pdf.setFontSize(7);
//       pdf.setTextColor(0, 128, 0);
//       pdf.text(`(₹${ncbDiscountAmount.toLocaleString('en-IN')})`, xPosition + 2, yPosition + 13);
//       pdf.setFontSize(8);
//       pdf.setTextColor(0, 0, 0);
//       xPosition += colWidths[5];
      
//       // Total Premium (highlighted) - Mark best price
//       pdf.setFont('helvetica', 'bold');
//       if (rowIndex === 0 && sortedQuotes.length > 1) {
//         pdf.setTextColor(46, 204, 113); // Green for best price
//         pdf.text(`₹${(quote.totalPremium || 0).toLocaleString('en-IN')} ✓`, xPosition + 2, yPosition + 8);
//       } else {
//         pdf.setTextColor(0, 0, 0);
//         pdf.text(`₹${(quote.totalPremium || 0).toLocaleString('en-IN')}`, xPosition + 2, yPosition + 8);
//       }
//       pdf.setFont('helvetica', 'normal');
//       xPosition += colWidths[6];
      
//       // Duration
//       pdf.text(`${quote.policyDuration}Y`, xPosition + 2, yPosition + 8);
//       xPosition += colWidths[7];
      
//       // Key Features (first 2-3 add-ons or main features)
//       const addOnsList = Object.values(quote.selectedAddOns || {});
//       let keyFeatures = 'Basic';
//       if (addOnsList.length > 0) {
//         keyFeatures = addOnsList.slice(0, 2).map(addOn => 
//           addOn.description.split(' ')[0]
//         ).join(', ');
//         if (addOnsList.length > 2) {
//           keyFeatures += '...';
//         }
//       }
//       pdf.text(keyFeatures, xPosition + 2, yPosition + 8);
      
//       // Additional info in second line
//       pdf.setFontSize(7);
//       pdf.setTextColor(100, 100, 100);
//       const savedAmount = ncbDiscountAmount > 0 ? `Save: ₹${ncbDiscountAmount.toLocaleString('en-IN')}` : '';
//       pdf.text(savedAmount, margin + 2, yPosition + 18);
      
//       // Reset for next row
//       pdf.setFontSize(8);
//       pdf.setTextColor(0, 0, 0);
      
//       yPosition += 25;
//     });

//     // Add recommendation note if multiple quotes
//     if (sortedQuotes.length > 1) {
//       yPosition += 5;
//       pdf.setFontSize(9);
//       pdf.setTextColor(46, 204, 113);
//       pdf.setFont('helvetica', 'bold');
//       pdf.text('✓ Best Value: ' + sortedQuotes[0].insuranceCompany + ' (₹' + 
//                sortedQuotes[0].totalPremium.toLocaleString('en-IN') + ')', margin, yPosition);
//     }

//     return yPosition;
//   };

//   // Calculate current total premium for display
//   const currentTotalPremium = calculateTotalPremium();
//   const currentAddOnsTotal = calculateAddOnsTotal();

//   // Component for company logo with fallback
//   const CompanyLogo = ({ company, className = "w-8 h-8" }) => {
//     const [imgError, setImgError] = useState(false);

//     if (imgError || !company?.logo) {
//       return (
//         <div 
//           className={`${className} rounded-full flex items-center justify-center text-lg`}
//           style={{ backgroundColor: company?.bgColor }}
//         >
//           {company?.fallbackLogo}
//         </div>
//       );
//     }

//     return (
//       <img
//         src={company.logo}
//         alt={`${company.name} logo`}
//         className={`${className} rounded-full object-cover`}
//         onError={() => setImgError(true)}
//       />
//     );
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-semibold text-gray-800">Step 3: Insurance Quotes</h3>
//         {quotes.length > 0 && (
//           <button
//             onClick={clearAllQuotes}
//             className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
//           >
//             Clear All Quotes
//           </button>
//         )}
//       </div>
      
//       {/* Add Quote Form */}
//       <div className="bg-gray-50 rounded-lg p-6 mb-6">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Quote</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//           {/* Insurance Company */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Insurance Company *
//             </label>
//             <select
//               name="insuranceCompany"
//               value={manualQuote.insuranceCompany}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="">Select Company</option>
//               {insuranceCompanies.map((company, index) => (
//                 <option key={index} value={company.name}>
//                   {company.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Coverage Type */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Coverage Type *
//             </label>
//             <select
//               name="coverageType"
//               value={manualQuote.coverageType}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="comprehensive">Comprehensive</option>
//               <option value="thirdParty">Third Party</option>
//             </select>
//           </div>

//           {/* IDV */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               IDV (₹) *
//             </label>
//             <input
//               type="number"
//               name="idv"
//               value={manualQuote.idv}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="Enter IDV amount"
//             />
//           </div>

//           {/* Policy Duration */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Policy Duration (Years)
//             </label>
//             <select
//               name="policyDuration"
//               value={manualQuote.policyDuration}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="1">1 Year</option>
//               <option value="2">2 Years</option>
//               <option value="3">3 Years</option>
//             </select>
//           </div>

//           {/* NCB Discount */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               NCB Discount (%)
//             </label>
//             <select
//               name="ncbDiscount"
//               value={manualQuote.ncbDiscount}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               {ncbOptions.map(ncb => (
//                 <option key={ncb} value={ncb}>{ncb}%</option>
//               ))}
//             </select>
//           </div>

//           {/* OD Amount */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               OD Amount (₹)
//             </label>
//             <input
//               type="number"
//               name="odAmount"
//               value={manualQuote.odAmount}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="Enter OD amount"
//             />
//           </div>

//           {/* Third Party Amount */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               3rd Party Amount (₹)
//             </label>
//             <input
//               type="number"
//               name="thirdPartyAmount"
//               value={manualQuote.thirdPartyAmount}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="Enter 3rd party amount"
//             />
//           </div>

//           {/* Premium Amount */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Premium Amount (₹) *
//             </label>
//             <input
//               type="number"
//               name="premium"
//               value={manualQuote.premium}
//               onChange={handleManualQuoteChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="Enter premium amount"
//             />
//           </div>

//           {/* Premium Summary */}
//           <div className="col-span-full bg-purple-50 p-4 rounded-lg border border-purple-200">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//               <div>
//                 <span className="text-gray-600">Base Premium:</span>
//                 <div className="font-semibold text-lg">₹{(parseFloat(manualQuote.premium) || 0).toLocaleString('en-IN')}</div>
//               </div>
//               <div>
//                 <span className="text-gray-600">Add-ons Total:</span>
//                 <div className="font-semibold text-lg text-purple-600">₹{currentAddOnsTotal.toLocaleString('en-IN')}</div>
//               </div>
//               <div>
//                 <span className="text-gray-600">Total Premium:</span>
//                 <div className="font-semibold text-lg text-green-600">₹{currentTotalPremium.toLocaleString('en-IN')}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Add-ons Section */}
//         <div className="mb-6">
//           <h4 className="text-md font-semibold text-gray-800 mb-3">Add-ons (Optional)</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//             {Object.entries(addOnDescriptions).map(([key, description]) => (
//               <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white hover:border-purple-300 transition-colors">
//                 <input
//                   type="checkbox"
//                   checked={manualQuote.addOns[key].selected}
//                   onChange={(e) => handleAddOnChange(key, 'selected', e.target.checked)}
//                   className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
//                 />
//                 <div className="flex-1">
//                   <label className="text-sm font-medium text-gray-700 block mb-2">
//                     {description}
//                   </label>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Rate (%)</label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         value={manualQuote.addOns[key].rate}
//                         onChange={(e) => handleAddOnChange(key, 'rate', e.target.value)}
//                         className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
//                         placeholder="0.00%"
//                         disabled={!manualQuote.addOns[key].selected}
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500 block mb-1">Amount (₹)</label>
//                       <input
//                         type="number"
//                         value={manualQuote.addOns[key].amount}
//                         onChange={(e) => handleAddOnChange(key, 'amount', e.target.value)}
//                         className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
//                         placeholder="0"
//                         disabled={!manualQuote.addOns[key].selected}
//                       />
//                     </div>
//                   </div>
//                   {manualQuote.addOns[key].selected && manualQuote.idv && (
//                     <div className="text-xs text-gray-500 mt-1">
//                       Based on IDV: ₹{manualQuote.idv}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Add Quote Button */}
//         <button
//           onClick={addManualQuote}
//           disabled={!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || !manualQuote.premium}
//           className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
//         >
//           <Plus className="w-5 h-5 mr-2" />
//           Add Quote
//         </button>
//       </div>

//       {/* Quotes List */}
//       {quotes.length > 0 && (
//         <div className="space-y-6">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-semibold text-gray-800">
//               Generated Quotes ({quotes.length})
//             </h3>
            
//             <div className="flex gap-2">
//               <button
//                 onClick={selectAllQuotes}
//                 className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
//               >
//                 Select All
//               </button>
//               <button
//                 onClick={deselectAllQuotes}
//                 className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
//               >
//                 Deselect All
//               </button>
//               <button
//                 onClick={downloadSelectedQuotesPDF}
//                 disabled={selectedQuotes.length === 0 || isGenerating}
//                 className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
//               >
//                 <Download className="w-4 h-4 mr-1" />
//                 {isGenerating ? 'Generating...' : `Download Selected (${selectedQuotes.length})`}
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-6">
//             {quotes.map((quote, index) => {
//               const company = insuranceCompanies.find(c => c.name === quote.insuranceCompany);
//               const isExpanded = expandedQuotes.includes(index);
              
//               return (
//                 <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
//                   {/* Quote Header */}
//                   <div 
//                     className="p-4 text-white relative"
//                     style={{ backgroundColor: company?.color || '#0055AA' }}
//                   >
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center space-x-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedQuotes.includes(index)}
//                           onChange={() => toggleQuoteSelection(index)}
//                           className="w-5 h-5 text-white bg-white rounded border-white"
//                         />
//                         <CompanyLogo company={company} className="w-10 h-10" />
//                         <div>
//                           <h4 className="font-bold text-lg">{quote.insuranceCompany}</h4>
//                           <div className="flex items-center space-x-2 text-sm opacity-90">
//                             <span>IDV: ₹{quote.idv?.toLocaleString('en-IN')}</span>
//                             <span>•</span>
//                             <span>{quote.policyDuration} Year{quote.policyDuration > 1 ? 's' : ''}</span>
//                             <span>•</span>
//                             <span>NCB: {quote.ncbDiscount}%</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-3">
//                         <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
//                           {quote.coverageType === 'comprehensive' ? 'COMPREHENSIVE' : 'THIRD PARTY'}
//                         </span>
//                         <button
//                           onClick={() => toggleQuoteExpansion(index)}
//                           className="text-white hover:bg-black hover:bg-opacity-20 p-1 rounded"
//                         >
//                           {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                         </button>
//                         <button
//                           onClick={() => removeQuote(index)}
//                           className="text-white hover:bg-black hover:bg-opacity-20 p-1 rounded"
//                         >
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Quote Body - Only show if expanded */}
//                   {isExpanded && (
//                     <div className="p-6">
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         {/* Left Column - Premium Breakdown */}
//                         <div className="space-y-4">
//                           <h5 className="font-semibold text-gray-800 text-lg border-b pb-2">Premium Breakup</h5>
                          
//                           <div className="space-y-3">
//                             <div className="flex justify-between items-center">
//                               <span className="text-gray-600">Own Damage</span>
//                               <span className="font-semibold">₹{quote.odAmount?.toLocaleString('en-IN')}</span>
//                             </div>
                            
//                             <div className="flex justify-between items-center">
//                               <span className="text-gray-600">Basic Premium</span>
//                               <span className="font-semibold">₹{quote.premium?.toLocaleString('en-IN')}</span>
//                             </div>
                            
//                             <div className="flex justify-between items-center text-green-600">
//                               <span>NCB Discount {quote.ncbDiscount}%</span>
//                               <span>-₹{Math.round((quote.premium || 0) * (quote.ncbDiscount / 100)).toLocaleString('en-IN')}</span>
//                             </div>

//                             {Object.keys(quote.selectedAddOns || {}).length > 0 && (
//                               <div className="pt-2 border-t">
//                                 <div className="text-gray-600 mb-2">Add Ons</div>
//                                 <div className="space-y-2">
//                                   {Object.entries(quote.selectedAddOns).map(([key, addOn]) => (
//                                     <div key={key} className="flex justify-between items-center text-sm">
//                                       <span className="text-gray-500">{addOn.description}</span>
//                                       <span className="text-green-600 font-semibold">+₹{addOn.amount?.toLocaleString('en-IN')}</span>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
                            
//                             <div className="pt-3 border-t">
//                               <div className="flex justify-between items-center">
//                                 <span className="font-bold text-gray-800 text-lg">Total Premium</span>
//                                 <span className="font-bold text-green-600 text-xl">₹{quote.totalPremium?.toLocaleString('en-IN')}</span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Right Column - Additional Details */}
//                         <div className="space-y-4">
//                           <h5 className="font-semibold text-gray-800 text-lg border-b pb-2">Coverage Details</h5>
                          
//                           <div className="space-y-3">
//                             <div className="flex justify-between">
//                               <span className="text-gray-600">Policy Term</span>
//                               <span className="font-semibold">{quote.policyDuration} Year{quote.policyDuration > 1 ? 's' : ''}</span>
//                             </div>
                            
//                             <div className="flex justify-between">
//                               <span className="text-gray-600">Coverage Type</span>
//                               <span className="font-semibold">{quote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party'}</span>
//                             </div>
                            
//                             {quote.coverageType === 'thirdParty' && quote.thirdPartyAmount > 0 && (
//                               <div className="flex justify-between">
//                                 <span className="text-gray-600">3rd Party Cover</span>
//                                 <span className="font-semibold">₹{quote.thirdPartyAmount?.toLocaleString('en-IN')}</span>
//                               </div>
//                             )}

//                             <div className="pt-2">
//                               <div className="text-gray-600 mb-2">Included Add-ons</div>
//                               <div className="flex flex-wrap gap-2">
//                                 {Object.keys(quote.selectedAddOns || {}).length > 0 ? (
//                                   Object.entries(quote.selectedAddOns).map(([key, addOn]) => (
//                                     <span 
//                                       key={key} 
//                                       className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
//                                       style={{ backgroundColor: company?.bgColor, color: company?.color }}
//                                     >
//                                       {addOn.description}
//                                     </span>
//                                   ))
//                                 ) : (
//                                   <span className="text-gray-400 text-sm">No add-ons selected</span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {quotes.length === 0 && (
//         <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
//           <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
//           <h3 className="text-lg font-semibold mb-2">No Quotes Added Yet</h3>
//           <p>Use the form above to add insurance quotes from different companies</p>
//         </div>
//       )}
//     </div>
//   );
// };
// ================== STEP 3: Insurance Quotes ==================
const InsuranceQuotes = ({ form, handleChange, handleSave, isSaving, errors, onInsuranceQuotesUpdate }) => {
  // Use quotes from form props with localStorage fallback
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
  const [manualQuote, setManualQuote] = useState({
    insuranceCompany: '',
    coverageType: 'comprehensive',
    idv: '',
    policyDuration: '1',
    ncbDiscount: '0',
    odAmount: '',
    thirdPartyAmount: '',
    premium: '',
    addOns: {
      zeroDep: { selected: false, amount: '', rate: '' },
      consumables: { selected: false, amount: '', rate: '' },
      roadSideAssist: { selected: false, amount: '', rate: '' },
      keyReplacement: { selected: false, amount: '', rate: '' },
      engineProtect: { selected: false, amount: '', rate: '' },
      returnToInvoice: { selected: false, amount: '', rate: '' },
      personalAccident: { selected: false, amount: '', rate: '' },
      tyreProtection: { selected: false, amount: '', rate: '' },
      emergencyMedical: { selected: false, amount: '', rate: '' }
    }
  });

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
      console.log("🔄 Syncing quotes to parent:", quotes.length);
      onInsuranceQuotesUpdate(quotes);
    }
  }, [quotes, onInsuranceQuotesUpdate]);

  // Sync with form.insuranceQuotes when they change externally (edit mode)
  useEffect(() => {
    if (form.insuranceQuotes && JSON.stringify(form.insuranceQuotes) !== JSON.stringify(quotes)) {
      console.log("🔄 External quotes update detected:", form.insuranceQuotes.length);
      setQuotes(form.insuranceQuotes);
    }
  }, [form.insuranceQuotes]);

  // Debug effect
  useEffect(() => {
    console.log("💰 InsuranceQuotes Debug:");
    console.log("Local quotes:", quotes.length);
    console.log("Form insuranceQuotes:", form.insuranceQuotes?.length);
    console.log("Quotes match:", JSON.stringify(quotes) === JSON.stringify(form.insuranceQuotes));
  }, [quotes, form.insuranceQuotes]);

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

  // Handle manual quote input changes
  const handleManualQuoteChange = (e) => {
    const { name, value } = e.target;
    setManualQuote(prev => ({
      ...prev,
      [name]: value
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
          amount: '',
          rate: ''
        };
      } else if (field === 'rate' && value && prev.idv) {
        // Calculate amount when rate changes and IDV is available
        const calculatedAmount = Math.round((parseFloat(prev.idv) || 0) * (parseFloat(value) / 100));
        updatedAddOns[addOnKey] = {
          ...updatedAddOns[addOnKey],
          [field]: value,
          amount: calculatedAmount.toString()
        };
      } else if (field === 'amount' && value && prev.idv) {
        // Calculate rate when amount changes and IDV is available
        const calculatedRate = ((parseFloat(value) || 0) / (parseFloat(prev.idv) || 1) * 100).toFixed(2);
        updatedAddOns[addOnKey] = {
          ...updatedAddOns[addOnKey],
          [field]: value,
          rate: calculatedRate
        };
      } else {
        updatedAddOns[addOnKey] = {
          ...updatedAddOns[addOnKey],
          [field]: value
        };
      }

      return {
        ...prev,
        addOns: updatedAddOns
      };
    });
  };

  // Auto-calculate add-ons when IDV changes
  React.useEffect(() => {
    if (manualQuote.idv) {
      const updatedAddOns = { ...manualQuote.addOns };
      let needsUpdate = false;

      Object.keys(updatedAddOns).forEach(key => {
        const addOn = updatedAddOns[key];
        if (addOn.selected && addOn.rate) {
          const calculatedAmount = Math.round((parseFloat(manualQuote.idv) || 0) * (parseFloat(addOn.rate) / 100));
          if (calculatedAmount !== parseFloat(addOn.amount || 0)) {
            updatedAddOns[key] = {
              ...addOn,
              amount: calculatedAmount.toString()
            };
            needsUpdate = true;
          }
        }
      });

      if (needsUpdate) {
        setManualQuote(prev => ({
          ...prev,
          addOns: updatedAddOns
        }));
      }
    }
  }, [manualQuote.idv]);

  // Calculate add-ons total
  const calculateAddOnsTotal = () => {
    return Object.entries(manualQuote.addOns).reduce((total, [key, addOn]) => {
      if (addOn.selected) {
        const amount = parseFloat(addOn.amount) || 0;
        return total + amount;
      }
      return total;
    }, 0);
  };

  // Calculate total premium including add-ons
  const calculateTotalPremium = () => {
    const basePremium = parseFloat(manualQuote.premium) || 0;
    const addOnsTotal = calculateAddOnsTotal();
    return basePremium + addOnsTotal;
  };

  // Add manual quote
  const addManualQuote = () => {
    if (!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || !manualQuote.premium) {
      alert("Please fill all required fields: Insurance Company, Coverage Type, IDV, and Premium");
      return;
    }

    const company = insuranceCompanies.find(c => c.name === manualQuote.insuranceCompany);
    const addOnsPremium = calculateAddOnsTotal();
    const totalPremium = calculateTotalPremium();

    const newQuote = {
      id: Date.now().toString(),
      insuranceCompany: manualQuote.insuranceCompany,
      companyLogo: company?.logo || '',
      companyFallbackLogo: company?.fallbackLogo || '🏢',
      companyColor: company?.color || '#000',
      companyBgColor: company?.bgColor || '#fff',
      coverageType: manualQuote.coverageType,
      idv: parseFloat(manualQuote.idv),
      policyDuration: parseInt(manualQuote.policyDuration),
      ncbDiscount: parseInt(manualQuote.ncbDiscount),
      odAmount: manualQuote.odAmount ? parseFloat(manualQuote.odAmount) : 0,
      thirdPartyAmount: manualQuote.thirdPartyAmount ? parseFloat(manualQuote.thirdPartyAmount) : 0,
      premium: parseFloat(manualQuote.premium),
      totalPremium: totalPremium,
      addOnsPremium: addOnsPremium,
      selectedAddOns: Object.entries(manualQuote.addOns)
        .filter(([_, addOn]) => addOn.selected)
        .reduce((acc, [key, addOn]) => {
          acc[key] = {
            description: addOnDescriptions[key],
            amount: parseFloat(addOn.amount) || 0,
            rate: parseFloat(addOn.rate) || 0
          };
          return acc;
        }, {}),
      createdAt: new Date().toISOString()
    };

    const updatedQuotes = [...quotes, newQuote];
    console.log("➕ Adding new quote. Previous:", quotes.length, "New:", updatedQuotes.length);
    setQuotes(updatedQuotes);

    // Reset manual quote form
    setManualQuote({
      insuranceCompany: '',
      coverageType: 'comprehensive',
      idv: '',
      policyDuration: '1',
      ncbDiscount: '0',
      odAmount: '',
      thirdPartyAmount: '',
      premium: '',
      addOns: {
        zeroDep: { selected: false, amount: '', rate: '' },
        consumables: { selected: false, amount: '', rate: '' },
        roadSideAssist: { selected: false, amount: '', rate: '' },
        keyReplacement: { selected: false, amount: '', rate: '' },
        engineProtect: { selected: false, amount: '', rate: '' },
        returnToInvoice: { selected: false, amount: '', rate: '' },
        personalAccident: { selected: false, amount: '', rate: '' },
        tyreProtection: { selected: false, amount: '', rate: '' },
        emergencyMedical: { selected: false, amount: '', rate: '' }
      }
    });
  };

  // Remove quote
  const removeQuote = (index) => {
    console.log("🗑️ Removing quote at index:", index);
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
      
      // Clear localStorage too
      localStorage.removeItem('insuranceQuotes');
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
      tableWidth * 0.10, // Coverage
      tableWidth * 0.12, // IDV
      tableWidth * 0.10, // Base Premium
      tableWidth * 0.08, // Add-ons
      tableWidth * 0.08, // NCB
      tableWidth * 0.12, // Total Premium
      tableWidth * 0.08, // Duration
      tableWidth * 0.16  // Key Features
    ];
    
    let yPosition = startY;
    
    // Table headers
    const headers = ['Insurance Company', 'Coverage', 'IDV (₹)', 'Base Premium', 'Add-ons', 'NCB %', 'Total Premium', 'Term', 'Key Features'];
    
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
      const ncbDiscountAmount = Math.round((quote.premium || 0) * (quote.ncbDiscount / 100));
      pdf.text(`${quote.ncbDiscount}%`, xPosition + 2, yPosition + 8);
      pdf.setFontSize(7);
      pdf.setTextColor(0, 128, 0);
      pdf.text(`(₹${ncbDiscountAmount.toLocaleString('en-IN')})`, xPosition + 2, yPosition + 13);
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
      
      // Duration
      pdf.text(`${quote.policyDuration}Y`, xPosition + 2, yPosition + 8);
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
      const savedAmount = ncbDiscountAmount > 0 ? `Save: ₹${ncbDiscountAmount.toLocaleString('en-IN')}` : '';
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

  // Calculate current total premium for display
  const currentTotalPremium = calculateTotalPremium();
  const currentAddOnsTotal = calculateAddOnsTotal();

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
          <h3 className="text-lg font-semibold text-gray-800">Step 3: Insurance Quotes</h3>
          <p className="text-sm text-gray-500">
            Quotes: {quotes.length} | Required: At least 1
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

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-700">
              <strong>Quotes Status:</strong> {quotes.length} quote(s) added
            </p>
            <p className="text-xs text-blue-600">
              {quotes.length === 0 ? "Add at least one quote to proceed" : "You can now proceed to next step"}
            </p>
          </div>
          <button
            onClick={() => {
              console.log("=== QUOTES DEBUG ===");
              console.log("Local quotes:", quotes);
              console.log("Form insuranceQuotes:", form.insuranceQuotes);
              console.log("Can proceed:", quotes.length > 0);
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
            <select
              name="insuranceCompany"
              value={manualQuote.insuranceCompany}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Company</option>
              {insuranceCompanies.map((company, index) => (
                <option key={index} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Coverage Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Type *
            </label>
            <select
              name="coverageType"
              value={manualQuote.coverageType}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="thirdParty">Third Party</option>
            </select>
          </div>

          {/* IDV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IDV (₹) *
            </label>
            <input
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
              Policy Duration (Years)
            </label>
            <select
              name="policyDuration"
              value={manualQuote.policyDuration}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
            </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {ncbOptions.map(ncb => (
                <option key={ncb} value={ncb}>{ncb}%</option>
              ))}
            </select>
          </div>

          {/* OD Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OD Amount (₹)
            </label>
            <input
              type="number"
              name="odAmount"
              value={manualQuote.odAmount}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter OD amount"
            />
          </div>

          {/* Third Party Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3rd Party Amount (₹)
            </label>
            <input
              type="number"
              name="thirdPartyAmount"
              value={manualQuote.thirdPartyAmount}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 3rd party amount"
            />
          </div>

          {/* Premium Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Premium Amount (₹) *
            </label>
            <input
              type="number"
              name="premium"
              value={manualQuote.premium}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter premium amount"
            />
          </div>

          {/* Premium Summary */}
          <div className="col-span-full bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Base Premium:</span>
                <div className="font-semibold text-lg">₹{(parseFloat(manualQuote.premium) || 0).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-gray-600">Add-ons Total:</span>
                <div className="font-semibold text-lg text-purple-600">₹{currentAddOnsTotal.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Premium:</span>
                <div className="font-semibold text-lg text-green-600">₹{currentTotalPremium.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Add-ons (Optional)</h4>
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
                      <label className="text-xs text-gray-500 block mb-1">Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={manualQuote.addOns[key].rate}
                        onChange={(e) => handleAddOnChange(key, 'rate', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="0.00%"
                        disabled={!manualQuote.addOns[key].selected}
                      />
                    </div>
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
                  {manualQuote.addOns[key].selected && manualQuote.idv && (
                    <div className="text-xs text-gray-500 mt-1">
                      Based on IDV: ₹{manualQuote.idv}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Quote Button */}
        <button
          onClick={addManualQuote}
          disabled={!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || !manualQuote.premium}
          className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
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
              Generated Quotes ({quotes.length})
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
              
              return (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
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
                          <h4 className="font-bold text-lg">{quote.insuranceCompany}</h4>
                          <div className="flex items-center space-x-2 text-sm opacity-90">
                            <span>IDV: ₹{quote.idv?.toLocaleString('en-IN')}</span>
                            <span>•</span>
                            <span>{quote.policyDuration} Year{quote.policyDuration > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>NCB: {quote.ncbDiscount}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {quote.coverageType === 'comprehensive' ? 'COMPREHENSIVE' : 'THIRD PARTY'}
                        </span>
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
                            
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Basic Premium</span>
                              <span className="font-semibold">₹{quote.premium?.toLocaleString('en-IN')}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-green-600">
                              <span>NCB Discount {quote.ncbDiscount}%</span>
                              <span>-₹{Math.round((quote.premium || 0) * (quote.ncbDiscount / 100)).toLocaleString('en-IN')}</span>
                            </div>

                            {Object.keys(quote.selectedAddOns || {}).length > 0 && (
                              <div className="pt-2 border-t">
                                <div className="text-gray-600 mb-2">Add Ons</div>
                                <div className="space-y-2">
                                  {Object.entries(quote.selectedAddOns).map(([key, addOn]) => (
                                    <div key={key} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">{addOn.description}</span>
                                      <span className="text-green-600 font-semibold">+₹{addOn.amount?.toLocaleString('en-IN')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
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
                              <span className="font-semibold">{quote.policyDuration} Year{quote.policyDuration > 1 ? 's' : ''}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coverage Type</span>
                              <span className="font-semibold">{quote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party'}</span>
                            </div>
                            
                            {quote.coverageType === 'thirdParty' && quote.thirdPartyAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">3rd Party Cover</span>
                                <span className="font-semibold">₹{quote.thirdPartyAmount?.toLocaleString('en-IN')}</span>
                              </div>
                            )}

                            <div className="pt-2">
                              <div className="text-gray-600 mb-2">Included Add-ons</div>
                              <div className="flex flex-wrap gap-2">
                                {Object.keys(quote.selectedAddOns || {}).length > 0 ? (
                                  Object.entries(quote.selectedAddOns).map(([key, addOn]) => (
                                    <span 
                                      key={key} 
                                      className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                                      style={{ backgroundColor: company?.bgColor, color: company?.color }}
                                    >
                                      {addOn.description}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-400 text-sm">No add-ons selected</span>
                                )}
                              </div>
                            </div>
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

// ================== STEP 3.5: Previous Policy Details ==================
const PreviousPolicyDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 text-gray-700">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Step 4: Previous Policy Details
            </h3>
            <p className="text-xs text-gray-500">
              For renewal cases & policy already expired cases
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Previous Policy Information (All Fields Mandatory)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Company */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Insurance Company *
            </label>
            <input
              type="text"
              name="previousInsuranceCompany"
              value={form.previousInsuranceCompany || ""}
              onChange={handleChange}
              placeholder="Enter previous insurance company"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousInsuranceCompany ? "border-red-500" : "border-gray-300"
              }`}
            />
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
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousIssueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousIssueDate && <p className="text-red-500 text-xs mt-1">{errors.previousIssueDate}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Due Date *
            </label>
            <input
              type="date"
              name="previousDueDate"
              value={form.previousDueDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousDueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousDueDate && <p className="text-red-500 text-xs mt-1">{errors.previousDueDate}</p>}
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

          {/* NCB Discount */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              NCB Discount (%) *
            </label>
            <input
              type="number"
              name="previousNcbDiscount"
              value={form.previousNcbDiscount || ""}
              onChange={handleChange}
              placeholder="Enter NCB discount percentage"
              min="0"
              max="100"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousNcbDiscount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousNcbDiscount && <p className="text-red-500 text-xs mt-1">{errors.previousNcbDiscount}</p>}
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-5">
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Case Type Information
        </h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Renewal Case:</strong> Policy is about to expire or recently expired (within 30 days)</p>
          <p><strong>Policy Already Expired Case:</strong> Policy has been expired for more than 30 days</p>
          <p className="text-purple-600 font-medium">All fields in this section are mandatory for both case types</p>
        </div>
      </div>
    </div>
  );
};

// Add validation for Previous Policy Details
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

  if (!form.previousDueDate) {
    errors.previousDueDate = "Previous due date is required";
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

// ================== STEP 4: New Policy Details ==================
const NewPolicyDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
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
          </div>
        </div>
        {/* <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-700 hover:shadow transition disabled:opacity-50"
        >
          <FaSave /> {isSaving ? "Saving..." : "Save Progress"}
        </button> */}
      </div>

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Policy Status
        </h4>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Policy Issued Status *
        </label>
        <div className="flex gap-6 items-center mb-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="policyIssued"
              value="yes"
              checked={form.policyIssued === "yes"}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Yes - Policy Issued
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="policyIssued"
              value="no"
              checked={form.policyIssued === "no"}
              onChange={handleChange}
              className="h-4 w-4"
            />
            No - Pending
          </label>
        </div>
        {errors.policyIssued && <p className="text-red-500 text-xs mt-1 mb-3">{errors.policyIssued}</p>}
        <div
          className={`text-sm px-4 py-3 rounded-md border 
    ${
      form.policyIssued === "yes"
        ? "bg-green-50 border-green-300 text-green-700"
        : form.policyIssued === "no"
        ? "bg-red-50 border-red-300 text-red-700"
        : errors.policyIssued
        ? "bg-red-50 border-red-300 text-red-700"
        : "bg-yellow-50 border-yellow-300 text-yellow-700"
    }`}
        >
          {form.policyIssued === "yes" ? (
            <strong>Policy Issued:</strong>
          ) : form.policyIssued === "no" ? (
            <strong>Policy Pending:</strong>
          ) : (
            <strong>Status Unknown:</strong>
          )}{" "}
          {form.policyIssued === "yes"
            ? "Policy is successfully issued by the insurance company."
            : form.policyIssued === "no"
            ? "Policy details can be updated once the policy is issued by the insurance company."
            : errors.policyIssued
            ? "Please select policy status to proceed."
            : "Please select policy status."}
        </div>
      </div>

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Policy Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Insurance Company *
            </label>
            <input
              type="text"
              name="insuranceCompany"
              value={form.insuranceCompany || ""}
              onChange={handleChange}
              placeholder="Enter insurance company name"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.insuranceCompany ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.insuranceCompany && <p className="text-red-500 text-xs mt-1">{errors.insuranceCompany}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Number / Covernote Number
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
            <input
              type="text"
              name="covernoteNumber"
              value={form.covernoteNumber || ""}
              onChange={handleChange}
              placeholder="Covernote Number (Alternative)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {errors.policyNumber && <p className="text-red-500 text-xs mt-1">{errors.policyNumber}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Issue Date
            </label>
            <input
              type="date"
              name="issueDate"
              value={form.issueDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.issueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.issueDate && <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.dueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated based on issue date and duration
            </p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              NCB Discount (%)
            </label>
            <input
              type="number"
              name="ncbDiscount"
              value={form.ncbDiscount || ""}
              onChange={handleChange}
              placeholder="0"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.ncbDiscount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.ncbDiscount && <p className="text-red-500 text-xs mt-1">{errors.ncbDiscount}</p>}
            <p className="text-xs text-gray-500 mt-1">
              From customer requirements
            </p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Insurance Duration
            </label>
            <input
              type="text"
              name="insuranceDuration"
              value={form.insuranceDuration || ""}
              onChange={handleChange}
              placeholder="From customer requirements"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              IDV Amount (₹) *
            </label>
            <input
              type="number"
              name="idvAmount"
              value={form.idvAmount || ""}
              onChange={handleChange}
              placeholder="From accepted quote"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.idvAmount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.idvAmount && <p className="text-red-500 text-xs mt-1">{errors.idvAmount}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Total Premium (₹) *
            </label>
            <input
              type="number"
              name="totalPremium"
              value={form.totalPremium || ""}
              onChange={handleChange}
              placeholder="From accepted quote"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.totalPremium ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.totalPremium && <p className="text-red-500 text-xs mt-1">{errors.totalPremium}</p>}
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-5">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Policy Guidelines
        </h4>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
          <li>
            Policy details can be updated even after saving – they're not final
            until policy is issued.
          </li>
          <li>
            Due date is automatically calculated based on issue date and policy
            duration.
          </li>
          <li>
            IDV and premium amounts are pre-filled from the accepted quote but
            can be adjusted if needed.
          </li>
          <li>
            Policy or covernote number is required only when the policy is
            actually issued.
          </li>
        </ul>
      </div>
    </div>
  );
};

// ================== STEP 5: Documents ==================
// const Documents = ({ form, handleChange, handleSave, isSaving, errors }) => {
//   const [uploading, setUploading] = useState(false);

//   // Handle file selection
//   const handleFiles = async (e) => {
//     const files = Array.from(e.target.files);
    
//     if (files.length === 0) return;

//     console.log("🔄 Selected files:", files.length, "files:", files.map(f => f.name));

//     setUploading(true);

//     try {
//       // Upload files and get URLs
//       const uploadedUrls = await uploadFiles(files);
      
//       // Combine existing documents with new ones
//       const existingDocuments = form.documents || [];
//       const allDocuments = [...existingDocuments, ...uploadedUrls];
      
//       console.log("📄 Updated documents array:", allDocuments);
      
//       // Update form directly
//       handleChange({
//         target: {
//           name: 'documents',
//           value: allDocuments
//         }
//       });
      
//     } catch (error) {
//       console.error("❌ Error uploading files:", error);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Upload multiple files and return URLs
//   const uploadFiles = async (files) => {
//     const uploadPromises = files.map(file => uploadFile(file));
//     const results = await Promise.allSettled(uploadPromises);
    
//     const successfulUploads = results
//       .filter(result => result.status === 'fulfilled' && result.value.url)
//       .map(result => result.value.url);
    
//     console.log("✅ Successfully uploaded files:", successfulUploads);
//     return successfulUploads;
//   };

 

//   const uploadSingleFile = async (fileObj)=>{
//      try {
//       // Update status to uploading
//       // setUploadedFiles(prev => 
//       //   prev.map(f => 
//       //     f.id === fileObj.id 
//       //       ? { ...f, status: 'uploading', uploadProgress: 0 }
//       //       : f
//       //   )
//       // );

//       const formData = new FormData();
//       formData.append('file', fileObj);

//       let config = {
//   method: 'post',
//   maxBodyLength: Infinity,
//   url: 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/files',
//   headers: { 
//     'Content-Type': 'multipart/form-data',
//   },
//   data : formData
// };

// const response = await axios.request(config);
// console.log(response.data); 
//       // Update with successful response
//       // setUploadedFiles(prev => 
//       //   prev.map(f => 
//       //     f.id === fileObj.id 
//       //       ? { 
//       //           ...f, 
//       //           status: 'uploaded', 
//       //           uploadProgress: 100,
//       //           url: response.data.path || response.data.path, // Adjust based on your API response
//       //           response: response.data
//       //         }
//       //       : f
//       //   )
//       // );
//       // const [form,setForm] = useState([]);
//       // form.documents=uploadedFiles.map((e)=>e.url);
//       // handleChange(form);
//   //     handleChange({
//   // target: {
//   //   name: 'documents',
//   //   value: uploadedFiles.map((e)=>e.url)
//   // }
// // });
//       return response.data.path;
//     } catch (error) {
//       console.error(`Error uploading file ${fileObj.name}:`, error);
      
//       // setUploadedFiles(prev => 
//       //   prev.map(f => 
//       //     f.id === fileObj.id 
//       //       ? { 
//       //           ...f, 
//       //           status: 'error', 
//       //           error: error.message || 'Upload failed'
//       //         }
//       //       : f
//       //   )
//       // );
      
//       throw error;
//     }
//   }

//    // Upload single file
//   const uploadFile = async (file) => {
//     console.log(`🚀 Starting upload for: ${file.name}`);
    
//     try {
//       // Simulate upload process
//       // await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Create mock URL (replace with your actual upload logic)
//       // const mockUrl = `https://storage.googleapis.com/your-bucket/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
//   const mockUrl = await uploadSingleFile(file);    
//       console.log(`✅ Upload completed: ${file.name} -> ${mockUrl}`);
//       return { url: mockUrl, name: file.name };
      
//     } catch (error) {
//       console.error(`❌ Error uploading file ${file.name}:`, error);
//       throw error;
//     }
//   };

//   // Remove document from form.documents
//   const removeDocument = (index) => {
//     const currentDocuments = form.documents || [];
//     const updatedDocuments = currentDocuments.filter((_, i) => i !== index);
    
//     handleChange({
//       target: {
//         name: 'documents',
//         value: updatedDocuments
//       }
//     });
//   };

//   // Clear all documents
//   const clearAllDocuments = () => {
//     handleChange({
//       target: {
//         name: 'documents',
//         value: []
//       }
//     });
//   };

//   // Format file name from URL
//   const getFileNameFromUrl = (url) => {
//     return url.split('/').pop() || 'Document';
//   };

//   // Get file icon based on file extension
//   const getFileIcon = (url) => {
//     const fileName = url.toLowerCase();
//     if (fileName.includes('.pdf')) return '📄';
//     if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return '🖼️';
//     if (fileName.match(/\.(doc|docx)$/)) return '📝';
//     if (fileName.match(/\.(xls|xlsx)$/)) return '📊';
//     return '📎';
//   };

//   const currentDocuments = form.documents || [];

//   return (
//     <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
//       <div className="flex items-start justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-full bg-gray-100 text-gray-700">
//             <FaFileAlt />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800">
//               Step 5: Documents
//             </h3>
//             <p className="text-xs text-gray-500">
//               Upload and manage policy documents
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {currentDocuments.length > 0 && (
//             <button
//               type="button"
//               onClick={clearAllDocuments}
//               disabled={uploading}
//               className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 disabled:opacity-50"
//             >
//               <FaTrash /> Clear All
//             </button>
//           )}
//           {/* <button
//             type="button"
//             onClick={handleSave}
//             disabled={isSaving}
//             className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-700 hover:shadow transition disabled:opacity-50"
//           >
//             <FaSave /> {isSaving ? "Saving..." : "Save Progress"}
//           </button> */}
//         </div>
//       </div>

//       {errors.documents && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-600 text-sm">{errors.documents}</p>
//         </div>
//       )}

//       {/* Documents Count */}
//       <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
//         <div className="flex justify-between items-center">
//           <div>
//             <h4 className="font-semibold text-purple-800">Documents Status</h4>
//             <p className="text-xs text-purple-700">
//               Total Documents: {currentDocuments.length}
//             </p>
//           </div>
//           <button
//             onClick={() => {
//               console.log("=== CURRENT DOCUMENTS ===");
//               console.log("Form documents:", form.documents);
//               console.log("Current documents array:", currentDocuments);
//             }}
//             className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
//           >
//             Debug
//           </button>
//         </div>
//       </div>

//       {/* Upload Area */}
//       <div className="border rounded-xl p-5">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h4 className="text-md font-semibold text-gray-700">
//               Upload Documents
//             </h4>
//             <p className="text-sm text-gray-500 mt-1">
//               {currentDocuments.length} document(s) uploaded
//             </p>
//           </div>
//         </div>

//         {/* Upload Area */}
//         <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-gray-400 transition-colors">
//           <div className="flex justify-center mb-4 text-gray-500">
//             <FaUpload size={40} />
//           </div>
//           <p className="text-gray-600 font-medium mb-2">
//             Drag and drop files here
//           </p>
//           <p className="text-gray-400 text-sm mb-4">
//             or click to browse your files
//           </p>
          
//           <input
//             type="file"
//             multiple
//             onChange={handleFiles}
//             className="hidden"
//             id="file-upload"
//             accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
//             disabled={uploading}
//           />
//           <label
//             htmlFor="file-upload"
//             className={`inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-colors ${
//               uploading 
//                 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
//                 : 'bg-black text-white hover:bg-gray-800'
//             }`}
//           >
//             <FaFileUpload /> 
//             {uploading ? 'Uploading...' : 'Choose Multiple Files'}
//           </label>
          
//           <p className="text-gray-400 text-xs mt-4">
//             Supported: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT
//           </p>
//         </div>

//         {/* Documents List */}
//         {currentDocuments.length > 0 && (
//           <div className="mt-6">
//             <h5 className="text-md font-semibold text-gray-700 mb-4">
//               Uploaded Documents ({currentDocuments.length})
//             </h5>
            
//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {currentDocuments.map((documentUrl, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-white transition-colors"
//                 >
//                   <div className="flex items-center gap-3 flex-1 min-w-0">
//                     <span className="text-xl">
//                       {getFileIcon(documentUrl)}
//                     </span>
                    
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <p className="font-medium text-sm truncate">
//                           {getFileNameFromUrl(documentUrl)}
//                         </p>
//                         <span className="text-xs text-green-600 font-medium">
//                           ✓ Uploaded
//                         </span>
//                       </div>
                      
//                       <p className="text-xs text-gray-500 truncate mt-1">
//                         {documentUrl}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <a
//                       href={documentUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="p-2 text-green-600 hover:text-green-800"
//                       title="View document"
//                     >
//                       <FaFileAlt />
//                     </a>
                    
//                     <button
//                       onClick={() => removeDocument(index)}
//                       disabled={uploading}
//                       className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
//                       title="Remove document"
//                     >
//                       <FaTrash />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {currentDocuments.length === 0 && !uploading && (
//           <div className="text-center py-8">
//             <div className="text-gray-400 mb-2">
//               <FaFileAlt size={48} className="mx-auto" />
//             </div>
//             <p className="text-gray-500 text-sm">
//               No documents uploaded yet. Upload documents to continue.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// ================== STEP 5: Documents (Updated with Requirements & Tagging) ==================
const Documents = ({ form, handleChange, handleSave, isSaving, errors }) => {
  const [uploading, setUploading] = useState(false);

  // Document requirements based on case type
  const getDocumentRequirements = () => {
    const requirements = {
      newCar: {
        mandatory: ["Invoice"],
        optional: ["New Policy", "New policy covernote"]
      },
      usedCar: {
        mandatory: ["RC", "Form 29", "Form 30 page 1", "Form 30 page 2"],
        optional: ["New Policy", "New policy covernote", "Inspection report"]
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

    return requirements.usedCar; // Default to used car, you can make this dynamic
  };

  const documentRequirements = getDocumentRequirements();

  // Handle document tagging
  const handleDocumentTag = (index, tag) => {
    const currentTags = form.documentTags || [];
    const updatedTags = [...currentTags];
    updatedTags[index] = tag;
    
    handleChange({
      target: {
        name: 'documentTags',
        value: updatedTags
      }
    });
  };

  // Handle file selection - KEEP YOUR EXISTING WORKING CODE
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    console.log("🔄 Selected files:", files.length, "files:", files.map(f => f.name));

    setUploading(true);

    try {
      // Upload files and get URLs
      const uploadedUrls = await uploadFiles(files);
      
      // Combine existing documents with new ones
      const existingDocuments = form.documents || [];
      const allDocuments = [...existingDocuments, ...uploadedUrls];
      
      console.log("📄 Updated documents array:", allDocuments);
      
      // Update form directly
      handleChange({
        target: {
          name: 'documents',
          value: allDocuments
        }
      });
      
    } catch (error) {
      console.error("❌ Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple files and return URLs - KEEP YOUR EXISTING WORKING CODE
  const uploadFiles = async (files) => {
    const uploadPromises = files.map(file => uploadFile(file));
    const results = await Promise.allSettled(uploadPromises);
    
    const successfulUploads = results
      .filter(result => result.status === 'fulfilled' && result.value.url)
      .map(result => result.value.url);
    
    console.log("✅ Successfully uploaded files:", successfulUploads);
    return successfulUploads;
  };

  const uploadSingleFile = async (fileObj) => {
    try {
      const formData = new FormData();
      formData.append('file', fileObj);

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/files',
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        data: formData
      };

      const response = await axios.request(config);
      console.log(response.data); 
      return response.data.path;
    } catch (error) {
      console.error(`Error uploading file ${fileObj.name}:`, error);
      throw error;
    }
  }

  // Upload single file - KEEP YOUR EXISTING WORKING CODE
  const uploadFile = async (file) => {
    console.log(`🚀 Starting upload for: ${file.name}`);
    
    try {
      const mockUrl = await uploadSingleFile(file);    
      console.log(`✅ Upload completed: ${file.name} -> ${mockUrl}`);
      return { url: mockUrl, name: file.name };
      
    } catch (error) {
      console.error(`❌ Error uploading file ${file.name}:`, error);
      throw error;
    }
  };

  // Remove document from form.documents - KEEP YOUR EXISTING WORKING CODE
  const removeDocument = (index) => {
    const currentDocuments = form.documents || [];
    const updatedDocuments = currentDocuments.filter((_, i) => i !== index);
    
    handleChange({
      target: {
        name: 'documents',
        value: updatedDocuments
      }
    });
  };

  // Clear all documents - KEEP YOUR EXISTING WORKING CODE
  const clearAllDocuments = () => {
    handleChange({
      target: {
        name: 'documents',
        value: []
      }
    });
  };

  // Format file name from URL - KEEP YOUR EXISTING WORKING CODE
  const getFileNameFromUrl = (url) => {
    return url.split('/').pop() || 'Document';
  };

  // Get file icon based on file extension - KEEP YOUR EXISTING WORKING CODE
  const getFileIcon = (url) => {
    const fileName = url.toLowerCase();
    if (fileName.includes('.pdf')) return '📄';
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) return '🖼️';
    if (fileName.match(/\.(doc|docx)$/)) return '📝';
    if (fileName.match(/\.(xls|xlsx)$/)) return '📊';
    return '📎';
  };

  const currentDocuments = form.documents || [];

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
          {currentDocuments.length > 0 && (
            <button
              type="button"
              onClick={clearAllDocuments}
              disabled={uploading}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 disabled:opacity-50"
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

      {/* Document Requirements - NEW SECTION */}
      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Document Requirements
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-700 mb-2">Mandatory Documents</h5>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {documentRequirements.mandatory.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>
          
          {documentRequirements.optional.length > 0 && (
            <div>
              <h5 className="font-medium text-purple-700 mb-2">Optional Documents</h5>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {documentRequirements.optional.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Upload all documents first, then tag each document in the section below.
          </p>
        </div>
      </div>

      {/* Documents Count - YOUR EXISTING CODE */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-purple-800">Documents Status</h4>
            <p className="text-xs text-purple-700">
              Total Documents: {currentDocuments.length}
            </p>
          </div>
          <button
            onClick={() => {
              console.log("=== CURRENT DOCUMENTS ===");
              console.log("Form documents:", form.documents);
              console.log("Current documents array:", currentDocuments);
            }}
            className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Upload Area - YOUR EXISTING WORKING CODE */}
      <div className="border rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-md font-semibold text-gray-700">
              Upload Documents
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {currentDocuments.length} document(s) uploaded
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-gray-400 transition-colors">
          <div className="flex justify-center mb-4 text-gray-500">
            <FaUpload size={40} />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            Drag and drop files here
          </p>
          <p className="text-gray-400 text-sm mb-4">
            or click to browse your files
          </p>
          
          <input
            type="file"
            multiple
            onChange={handleFiles}
            className="hidden"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
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
            <FaFileUpload /> 
            {uploading ? 'Uploading...' : 'Choose Multiple Files'}
          </label>
          
          <p className="text-gray-400 text-xs mt-4">
            Supported: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT
          </p>
        </div>

        {/* Documents List - YOUR EXISTING WORKING CODE */}
        {currentDocuments.length > 0 && (
          <div className="mt-6">
            <h5 className="text-md font-semibold text-gray-700 mb-4">
              Uploaded Documents ({currentDocuments.length})
            </h5>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentDocuments.map((documentUrl, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">
                      {getFileIcon(documentUrl)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {getFileNameFromUrl(documentUrl)}
                        </p>
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Uploaded
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {documentUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 hover:text-green-800"
                      title="View document"
                    >
                      <FaFileAlt />
                    </a>
                    
                    <button
                      onClick={() => removeDocument(index)}
                      disabled={uploading}
                      className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
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

        {/* Empty State - YOUR EXISTING WORKING CODE */}
        {currentDocuments.length === 0 && !uploading && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <FaFileAlt size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              No documents uploaded yet. Upload documents to continue.
            </p>
          </div>
        )}

        {/* Tagging Section - NEW SECTION */}
        {currentDocuments.length > 0 && (
          <div className="border rounded-xl p-5 mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">
              Document Tagging
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Tag each uploaded document with its document type
            </p>
            
            <div className="space-y-4">
              {currentDocuments.map((documentUrl, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">
                      {getFileIcon(documentUrl)}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {getFileNameFromUrl(documentUrl)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select
                      value={form.documentTags?.[index] || ""}
                      onChange={(e) => handleDocumentTag(index, e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none min-w-48"
                    >
                      <option value="">Select document type</option>
                      {[...documentRequirements.mandatory, ...documentRequirements.optional].map((docType) => (
                        <option key={docType} value={docType}>{docType}</option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                    
                    {form.documentTags?.[index] && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Tagged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tagging Summary */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <strong>Tagging Progress:</strong> {form.documentTags?.filter(tag => tag && tag !== '').length || 0} of {currentDocuments.length} documents tagged
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// Add document tagging handler
const handleDocumentTag = (index, tag) => {
  const currentTags = form.documentTags || [];
  const updatedTags = [...currentTags];
  updatedTags[index] = tag;
  
  handleChange({
    target: {
      name: 'documentTags',
      value: updatedTags
    }
  });
};
// ================== STEP 6: Payment ==================
const Payment = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Ensure form fields are properly initialized
  useEffect(() => {
    // Initialize payment fields if they don't exist
    const initialFields = {
      paymentMadeBy: form.paymentMadeBy || "",
      paymentMode: form.paymentMode || "",
      paymentAmount: form.paymentAmount || "",
      paymentDate: form.paymentDate || "",
      transactionId: form.transactionId || "",
      receiptDate: form.receiptDate || "",
      bankName: form.bankName || ""
    };
    
    // Update form if any fields are missing
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
  }, []); 
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
        {/* <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-700 hover:shadow transition disabled:opacity-50"
        >
          <FaSave /> {isSaving ? "Saving..." : "Save Progress"}
        </button> */}
      </div>

      <div className="bg-purple-50 border rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Premium:</p>
          <p className="font-semibold text-lg">₹{form.totalPremium || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Insurance Company:</p>
          <p className="font-semibold">{form.insuranceCompany || "Not specified"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Policy Duration:</p>
          <p className="font-semibold">{form.insuranceDuration || "1YR"}</p>
        </div>
      </div>

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Payment Information
        </h4>
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMadeBy"
              value="Customer"
              checked={form.paymentMadeBy === "Customer"}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Customer
            <span className="text-gray-500 text-sm">
              (Cash, Cheque, or Online payment)
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMadeBy"
              value="In House"
              checked={form.paymentMadeBy === "In House"}
              onChange={handleChange}
              className="h-4 w-4"
            />
            In House
            <span className="text-gray-500 text-sm">
              (Deal adjustments or outstanding)
            </span>
          </label>
        </div>
        {errors.paymentMadeBy && <p className="text-red-500 text-xs mt-1 mb-3">{errors.paymentMadeBy}</p>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Payment Mode *
          </label>
          <select
            name="paymentMode"
            value={form.paymentMode || ""}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.paymentMode ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select payment mode</option>
            <option value="Online Transfer/UPI">Online Transfer/UPI</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Credit/Debit Card">Credit/Debit Card</option>
          </select>
          {errors.paymentMode && <p className="text-red-500 text-xs mt-1">{errors.paymentMode}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              name="paymentAmount"
              value={form.paymentAmount || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.paymentAmount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0"
            />
            {errors.paymentAmount && <p className="text-red-500 text-xs mt-1">{errors.paymentAmount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              name="paymentDate"
              value={form.paymentDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.paymentDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Transaction ID *
            </label>
            <input
              type="text"
              name="transactionId"
              value={form.transactionId || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.transactionId ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter transaction ID"
            />
            {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Receipt Date *
            </label>
            <input
              type="date"
              name="receiptDate"
              value={form.receiptDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.receiptDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.receiptDate && <p className="text-red-500 text-xs mt-1">{errors.receiptDate}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bank Name *
          </label>
          <input
            type="text"
            name="bankName"
            value={form.bankName || ""}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.bankName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter bank name"
          />
          {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
        </div>
      </div>

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Payment Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <p>
            <span className="text-gray-500">Payment By:</span>{" "}
            {form.paymentMadeBy || "Not set"}
          </p>
          <p>
            <span className="text-gray-500">Payment Mode:</span>{" "}
            {form.paymentMode || "Not set"}
          </p>
          <p>
            <span className="text-gray-500">Amount:</span> ₹
            {form.paymentAmount || 0}
          </p>
          <p>
            <span className="text-gray-500">Payment Date:</span>{" "}
            {form.paymentDate || "Not set"}
          </p>
        </div>
      </div>

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Payment Guidelines
        </h4>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
          <li>
            <span className="text-purple-600">Customer Payments:</span> Ensure all
            payment details are accurately recorded for accounting purposes.
          </li>
          <li>
            <span className="text-purple-600">Cheque Payments:</span> Verify
            cheque details and ensure sufficient funds before processing.
          </li>
          <li>
            <span className="text-purple-600">Online Payments:</span> Keep
            transaction ID for reference and reconciliation.
          </li>
          <li>
            <span className="text-purple-600">In-House Payments:</span> Used for
            deal adjustments or when payment is handled through other
            transactions.
          </li>
        </ul>
      </div>
    </div>
  );
};

// ================== STEP 8: Payout Details ==================
const PayoutDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Calculate derived values
  const odAmount = parseFloat(form.odAmount) || 0;
  const ncbAmount = odAmount * 0.10; // 10% of OD
  const subVention = parseFloat(form.subVention) || 0;
  const netAmount = ncbAmount - subVention;

  // Auto-calculate NCB when OD amount changes
  useEffect(() => {
    if (form.odAmount) {
      const calculatedNcb = (parseFloat(form.odAmount) * 0.10).toFixed(2);
      // Only update if the calculated value is different from current value
      if (parseFloat(form.ncbAmount || 0) !== parseFloat(calculatedNcb)) {
        handleChange({
          target: {
            name: 'ncbAmount',
            value: calculatedNcb
          }
        });
      }
    }
  }, [form.odAmount]);

  // Handle OD amount change manually to trigger NCB calculation
  const handleOdAmountChange = (e) => {
    const { name, value } = e.target;
    handleChange(e); // Update OD amount first
    
    // Then calculate and update NCB amount
    if (value) {
      const calculatedNcb = (parseFloat(value) * 0.10).toFixed(2);
      setTimeout(() => {
        handleChange({
          target: {
            name: 'ncbAmount',
            value: calculatedNcb
          }
        });
      }, 100);
    }
  };

  // Handle manual NCB input (if user wants to override)
  const handleNcbAmountChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    
    // If user manually sets NCB, show warning if it's not 10% of OD
    if (value && form.odAmount) {
      const expectedNcb = (parseFloat(form.odAmount) * 0.10).toFixed(2);
      const userNcb = parseFloat(value).toFixed(2);
      
      if (userNcb !== expectedNcb) {
        console.warn(`NCB manually set to ${userNcb}, but expected ${expectedNcb} (10% of OD)`);
      }
    }
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

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Payout Calculation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Net Premium */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Net Premium (₹) *
            </label>
            <input
              type="number"
              name="netPremium"
              value={form.netPremium || ""}
              onChange={handleChange}
              placeholder="Enter net premium amount"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.netPremium ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.netPremium && <p className="text-red-500 text-xs mt-1">{errors.netPremium}</p>}
          </div>

          {/* OD Amount */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              OD Amount (₹) *
            </label>
            <input
              type="number"
              name="odAmount"
              value={form.odAmount || ""}
              onChange={handleOdAmountChange}
              placeholder="Enter OD amount"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.odAmount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.odAmount && <p className="text-red-500 text-xs mt-1">{errors.odAmount}</p>}
            <p className="text-xs text-gray-500 mt-1">Own Damage Amount</p>
          </div>

          {/* NCB Amount (Auto-calculated as 10% of OD) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              NCB Amount (₹) *
            </label>
            <input
              type="number"
              name="ncbAmount"
              value={form.ncbAmount || ncbAmount}
              onChange={handleNcbAmountChange}
              placeholder="Auto-calculated as 10% of OD"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              10% of OD Amount ({odAmount.toLocaleString('en-IN')} × 10% = ₹{ncbAmount.toLocaleString('en-IN')})
            </p>
          </div>

          {/* Sub Vention */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Sub Vention (₹) *
            </label>
            <input
              type="number"
              name="subVention"
              value={form.subVention || ""}
              onChange={handleChange}
              placeholder="Enter sub vention amount"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.subVention ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.subVention && <p className="text-red-500 text-xs mt-1">{errors.subVention}</p>}
          </div>
        </div>

        {/* Real-time Calculation Display */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h5 className="font-semibold text-gray-700 mb-3">Real-time Calculation</h5>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">OD Amount:</span>
              <div className="font-semibold">₹{odAmount.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-gray-600">NCB (10%):</span>
              <div className="font-semibold text-purple-600">₹{ncbAmount.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-gray-600">Sub Vention:</span>
              <div className="font-semibold">₹{subVention.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-gray-600">Net Amount:</span>
              <div className="font-semibold text-green-600">₹{netAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Net Amount Calculation (Read-only) */}
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Final Calculation</p>
              <p className="text-lg font-semibold text-purple-700">
                Net Amount: ₹{netAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>Formula: NCB Amount - Sub Vention</div>
              <div>₹{ncbAmount.toLocaleString('en-IN')} - ₹{subVention.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-5">
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Payout Formula
        </h4>
        <div className="text-sm text-gray-600 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">NCB Amount:</span>
            <span>10% of OD Amount (OD × 0.10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Net Amount:</span>
            <span>NCB Amount - Sub Vention</span>
          </div>
          
          {/* Example Calculation */}
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm font-medium mb-2">Example Calculation:</p>
            <div className="space-y-1 text-xs">
              <div>If OD Amount = ₹10,000</div>
              <div>Then NCB Amount = ₹10,000 × 10% = ₹1,000</div>
              <div>If Sub Vention = ₹200</div>
              <div>Then Net Amount = ₹1,000 - ₹200 = ₹800</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add validation for Payout Details
const payoutValidation = (form) => {
  const errors = {};

  if (!form.netPremium) {
    errors.netPremium = "Net premium is required";
  } else if (parseFloat(form.netPremium) <= 0) {
    errors.netPremium = "Net premium must be greater than 0";
  }

  if (!form.odAmount) {
    errors.odAmount = "OD amount is required";
  } else if (parseFloat(form.odAmount) <= 0) {
    errors.odAmount = "OD amount must be greater than 0";
  }

  if (!form.ncbAmount) {
    errors.ncbAmount = "NCB amount is required";
  } else {
    const expectedNcb = (parseFloat(form.odAmount || 0) * 0.10).toFixed(2);
    const actualNcb = parseFloat(form.ncbAmount).toFixed(2);
    if (actualNcb !== expectedNcb) {
      errors.ncbAmount = `NCB should be 10% of OD (₹${expectedNcb})`;
    }
  }

  if (!form.subVention) {
    errors.subVention = "Sub vention is required";
  } else if (parseFloat(form.subVention) < 0) {
    errors.subVention = "Sub vention cannot be negative";
  }

  // Validate that net amount is not negative
  const ncbAmount = parseFloat(form.ncbAmount || 0);
  const subVention = parseFloat(form.subVention || 0);
  const netAmount = ncbAmount - subVention;
  
  if (netAmount < 0) {
    errors.subVention = "Sub vention cannot be greater than NCB amount";
  }

  return errors;
};

// ================== MAIN COMPONENT ==================
// const NewPolicyPage = () => {
//   const [step, setStep] = useState(1);
//   const [form, setForm] = useState({
//     buyer_type: "individual",
//     insurance_category: "motor",
//     status: "draft",
//     ts: Date.now(),
//     created_by: "ADMIN123" // Replace with actual user ID
//   });
//   const [policyId, setPolicyId] = useState(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState("");
// ================== MAIN COMPONENT ==================
// NewPolicyPage.jsx

// ================== MAIN COMPONENT ==================
const NewPolicyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    buyer_type: "individual",
    insurance_category: "motor",
    status: "draft",
    ts: Date.now(),
    created_by: "ADMIN123",
    insuranceQuotes: [] // ← ADDED THIS LINE
  });
  const [policyId, setPolicyId] = useState(id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!id);
  const [loadingPolicy, setLoadingPolicy] = useState(!!id);

  // ============ ADD THE CLEAR LOCALSTORAGE EFFECT HERE ============
  useEffect(() => {
    if (!isEditMode && !id) {
      console.log("🧹 Clearing localStorage for new case");
      localStorage.removeItem('insuranceQuotes');
      
      // Also clear any old quote fields in form
      setForm(prev => ({
        ...prev,
        insurer: "",
        coverageType: "", 
        premium: "",
        idv: "",
        ncb: "",
        duration: "",
        insuranceQuotes: []
      }));
    }
  }, [isEditMode, id]);
    
  // ============ ADD THE CLEAR LOCALSTORAGE EFFECT HERE ============
  useEffect(() => {
    if (!isEditMode && !id) {
      console.log("🧹 Clearing localStorage for new case");
      localStorage.removeItem('insuranceQuotes');
      
      // Also clear any old quote fields in form
      setForm(prev => ({
        ...prev,
        insurer: "",
        coverageType: "", 
        premium: "",
        idv: "",
        ncb: "",
        duration: "",
        insuranceQuotes: []
      }));
    }
  }, [isEditMode, id]);
  // 
  // Enhanced debug form state changes
  useEffect(() => {
    console.log("=== FORM STATE UPDATED ===");
    console.log("Full form:", form);
    console.log("Insurance Quotes:", form.insuranceQuotes);
    console.log("Insurance Quotes length:", form.insuranceQuotes?.length);
    console.log("Documents array:", form.documents);
  }, [form]);

  // Debug when component mounts
  useEffect(() => {
    console.log("Component mounted - Edit Mode:", isEditMode, "Policy ID:", id);
  }, [isEditMode, id]);

  useEffect(() => {
    if (id) {
      fetchPolicyData(id);
    }
  }, [id]);

  // Enhanced function to fetch policy data for editing
  const fetchPolicyData = async (policyId) => {
    setLoadingPolicy(true);
    try {
      console.log("🔍 Fetching policy data for ID:", policyId);
      const response = await axios.get(`${API_BASE_URL}/policies/${policyId}`);
      const policyData = response.data;
      
      console.log("📦 Full API Response:", policyData);
      
      // Check if we have the expected data structure
      if (!policyData || !policyData.data) {
        console.error("❌ No policy data received from API");
        setSaveMessage("❌ No policy data found for this ID");
        return;
      }

      // Extract the actual data from response.data.data
      const actualData = policyData.data;
      console.log("📊 Actual Policy Data:", actualData);
      
      // COMPREHENSIVE DEBUG: Check all possible locations for insuranceQuotes
      console.log("🔍 COMPREHENSIVE DEBUG - Checking insuranceQuotes:");
      console.log(" - insuranceQuotes in root:", actualData.insuranceQuotes);
      console.log(" - insurance_quote in root:", actualData.insurance_quote);
      console.log(" - All root keys:", Object.keys(actualData));
      
      // Check nested structures
      if (actualData.insurance_quote) {
        console.log(" - insurance_quote keys:", Object.keys(actualData.insurance_quote));
      }
      
      // Create a clean transformed data object
      const transformedData = {
        // Basic Info
        buyer_type: actualData.buyer_type || "individual",
        insurance_category: actualData.insurance_category || "motor",
        status: actualData.status || "draft",
        
        // Customer Details (Step 1)
        customerName: actualData.customer_details?.name || "",
        mobile: actualData.customer_details?.mobile || "",
        email: actualData.customer_details?.email || "",
        gender: actualData.customer_details?.gender || "",
        maritalStatus: actualData.customer_details?.maritalStatus || "",
        dob: actualData.customer_details?.dob || "",
        occupation: actualData.customer_details?.occupation || "",
        panNumber: actualData.customer_details?.panNumber || "",
        aadhaarNumber: actualData.customer_details?.aadhaarNumber || "",
        residenceAddress: actualData.customer_details?.residenceAddress || "",
        pincode: actualData.customer_details?.pincode || "",
        city: actualData.customer_details?.city || "",
        
        // Nominee Details (Step 1)
        nomineeName: actualData.nominee?.name || "",
        relation: actualData.nominee?.relation || "",
        nomineeAge: actualData.nominee?.age || "",
        
        // Reference Details (Step 1)
        referenceName: actualData.refrence?.name || "",
        referencePhone: actualData.refrence?.phone || "",
        
        // Vehicle Details (Step 2)
        make: actualData.vehicle_details?.make || "",
        model: actualData.vehicle_details?.model || "",
        variant: actualData.vehicle_details?.variant || "",
        engineNo: actualData.vehicle_details?.engineNo || "",
        chassisNo: actualData.vehicle_details?.chassisNo || "",
        makeMonth: actualData.vehicle_details?.makeMonth || "",
        makeYear: actualData.vehicle_details?.makeYear || "",
        
        // Insurance Quotes (Step 3) - ADDED THIS SECTION WITH FALLBACK
        insuranceQuotes: actualData.insuranceQuotes || actualData.insurance_quotes || [],
        
        // Insurance Quote (Step 3)
        insurer: actualData.insurance_quote?.insurer || "",
        coverageType: actualData.insurance_quote?.coverageType || "",
        premium: actualData.insurance_quote?.premium || "",
        idv: actualData.insurance_quote?.idv || "",
        ncb: actualData.insurance_quote?.ncb || "",
        duration: actualData.insurance_quote?.duration || "",
        
         // Add these for Previous Policy (Step 4)
  previousInsuranceCompany: actualData.previous_policy.insuranceCompany || "",
  previousPolicyNumber: actualData.previous_policy.policyNumber ||" ",
  previousPolicyType: actualData.previous_policy.policyType || "",
  previousIssueDate: actualData.previous_policy.issueDate || "",
  previousDueDate: actualData.previous_policy.dueDate || "",
  previousClaimTaken: actualData.previous_policy.claimTakenLastYear ||"",
  previousNcbDiscount: actualData.previous_policy.ncbDiscount || "",
        // Policy Info (Step 5)
        policyIssued: actualData.policy_info?.policyIssued || "",
        insuranceCompany: actualData.policy_info?.insuranceCompany || "",
        policyNumber: actualData.policy_info?.policyNumber || "",
        covernoteNumber: actualData.policy_info?.covernoteNumber || "",
        issueDate: actualData.policy_info?.issueDate || "",
        dueDate: actualData.policy_info?.dueDate || "",
        ncbDiscount: actualData.policy_info?.ncbDiscount || "",
        insuranceDuration: actualData.policy_info?.insuranceDuration || "",
        idvAmount: actualData.policy_info?.idvAmount || "",
        totalPremium: actualData.policy_info?.totalPremium || "",
        
        // Payment Info (Step 7)
        paymentMadeBy: actualData.payment_info?.paymentMadeBy || "",
        paymentMode: actualData.payment_info?.paymentMode || "",
        paymentAmount: actualData.payment_info?.paymentAmount || "",
        paymentDate: actualData.payment_info?.paymentDate || "",
        transactionId: actualData.payment_info?.transactionId || "",
        receiptDate: actualData.payment_info?.receiptDate || "",
        bankName: actualData.payment_info?.bankName || "",
         
        // Add these for Payout
  netPremium: actualData.payout.netPremium || "",
  odAmount: actualData.payout.odAmount || "",
  ncbAmount: actualData.payout.ncbAmount || "",
  subVention: actualData.payout.subVention || "",
        // Documents (Step 6)
        documents: actualData.documents || [],
        
        // Metadata
        ts: actualData.ts || Date.now(),
        created_by: actualData.created_by || "ADMIN123"
      };
      
      console.log(" Transformed Form Data:", transformedData);
      console.log(" Final insuranceQuotes after transformation:", transformedData.insuranceQuotes);
      console.log(" Final insuranceQuotes length:", transformedData.insuranceQuotes.length);
      
      // Set the form with the transformed data
      setForm(transformedData);
      setSaveMessage(" Policy data loaded successfully! You can now edit the form.");
      
    } catch (error) {
      console.error(" Error fetching policy data:", error);
      console.error(" Error details:", error.response?.data);
      setSaveMessage(` Error loading policy data: ${error.message}`);
    } finally {
      setLoadingPolicy(false);
    }
  };

  // Enhanced handleChange to properly handle all field types
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
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
    
    // Handle special cases for different input types
    if (type === "number") {
      setForm((f) => ({ ...f, [name]: value === "" ? "" : Number(value) }));
      return;
    }
    
    // Handle documents array separately - this is called from Documents component
    if (name === "documents" && Array.isArray(value)) {
      console.log(" Updating documents array:", value);
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // Handle insuranceQuotes array separately - this is called from InsuranceQuotes component
    if (name === "insuranceQuotes" && Array.isArray(value)) {
      console.log(" Updating insuranceQuotes array:", value);
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // Default case for text inputs
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Special handler for documents from Documents component
  const handleDocumentsUpdate = (documentsArray) => {
    console.log(" Documents updated in main component:", documentsArray);
    setForm((f) => ({ ...f, documents: documentsArray }));
  };

  // Special handler for insurance quotes from InsuranceQuotes component
  const handleInsuranceQuotesUpdate = (quotesArray) => {
    console.log(" Insurance quotes updated in main component:", quotesArray);
    console.log(" Previous quotes:", form.insuranceQuotes);
    console.log(" New quotes count:", quotesArray.length);
    
    setForm((f) => ({ 
      ...f, 
      insuranceQuotes: quotesArray 
    }));
  };

  // Special handler for complex objects
  const handleNestedChange = (section, field, value) => {
    setForm((f) => ({
      ...f,
      [section]: {
        ...f[section],
        [field]: value
      }
    }));
  };

  // Validation function for current step
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
        stepErrors = validationRules.validateStep3(form);
        break;
       case 4:  // New validation for Previous Policy
      stepErrors = previousPolicyValidation(form);
      break;
    case 5:
      stepErrors = validationRules.validateStep4(form);
      break;
    case 6:
      stepErrors = validationRules.validateStep5(form);
      break;
    case 7:
      stepErrors = validationRules.validateStep6(form);
      break;
    case 8:  // New validation for Payout
      stepErrors = payoutValidation(form);
      break;
    default:
      stepErrors = {};
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Create initial policy (POST request) - UPDATED to include insuranceQuotes
  const createPolicy = async () => {
    try {
      setIsSaving(true);
      
      const policyData = {
        buyer_type: form.buyer_type || "individual",
        customer_details: {
          name: form.customerName || "",
          mobile: form.mobile || "",
          email: form.email || "",
          gender: form.gender || "",
          maritalStatus: form.maritalStatus || "",
          dob: form.dob || "",
          occupation: form.occupation || "",
          panNumber: form.panNumber || "",
          aadhaarNumber: form.aadhaarNumber || "",
          residenceAddress: form.residenceAddress || "",
          pincode: form.pincode || "",
          city: form.city || ""
        },
        nominee: {
          name: form.nomineeName || "",
          relation: form.relation || "",
          age: form.nomineeAge || ""
        },
        refrence: {
          name: form.referenceName || "",
          phone: form.referencePhone || ""
        },
        insurance_category: form.insurance_category || "motor",
        status: form.status || "draft",
        insuranceQuotes: form.insuranceQuotes || [], // ← ADDED THIS LINE
        ts: Date.now(),
        created_by: form.created_by || "ADMIN123"
      };

      console.log(" Creating policy with insuranceQuotes:", policyData.insuranceQuotes);
      console.log("Creating policy with data:", policyData);

      const response = await axios.post(`${API_BASE_URL}/policies`, policyData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.data && response.data.id) {
        setPolicyId(response.data.id);
        setSaveMessage("Policy created successfully!");
        return response.data.id;
      } else {
        throw new Error("No policy ID in response");
      }
    } catch (error) {
      console.error("Error creating policy:", error);
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

  // Enhanced update policy (PUT request) with comprehensive insuranceQuotes handling
  const updatePolicy = async () => {
    try {
      setIsSaving(true);
      
      // If no policy ID exists and we're not in edit mode, create one first
      if (!policyId && !isEditMode) {
        console.log("No policy ID found, creating new policy...");
        const newPolicyId = await createPolicy();
        if (!newPolicyId) {
          throw new Error("Failed to create policy");
        }
        setPolicyId(newPolicyId);
        return;
      }

      // Ensure we have a policy ID at this point
      if (!policyId) {
        throw new Error("Policy ID is required for update");
      }

      let updateData = {};
      
      // Map step data according to your API schema
      switch (step) {
        case 1: // Case Details
          updateData = {
            buyer_type: form.buyer_type,
            customer_details: {
              name: form.customerName || "",
              mobile: form.mobile || "",
              email: form.email || "",
              gender: form.gender || "",
              maritalStatus: form.maritalStatus || "",
              dob: form.dob || "",
              occupation: form.occupation || "",
              panNumber: form.panNumber || "",
              aadhaarNumber: form.aadhaarNumber || "",
              residenceAddress: form.residenceAddress || "",
              pincode: form.pincode || "",
              city: form.city || ""
            },
            nominee: {
              name: form.nomineeName || "",
              relation: form.relation || "",
              age: form.nomineeAge || ""
            },
            refrence: {
              name: form.referenceName || "",
              phone: form.referencePhone || ""
            }
          };
          break;
        case 2: // Vehicle Details
          updateData = {
            vehicle_details: {
              city: form.city || "",
              make: form.make || "",
              model: form.model || "",
              variant: form.variant || "",
              engineNo: form.engineNo || "",
              chassisNo: form.chassisNo || "",
              makeMonth: form.makeMonth || "",
              makeYear: form.makeYear || ""
            }
          };
          break;
        case 3: // Insurance Quotes
          updateData = {
            insurance_quote: {
              insurer: form.insurer || "",
              coverageType: form.coverageType || "",
              premium: form.premium || "",
              idv: form.idv || "",
              ncb: form.ncb || "",
              duration: form.duration || ""
            }
          };
          break;
          case 4: // Previous Policy Details
     updateData = {
    previous_policy: {  // Changed from previous_policy to previous_policy
      insuranceCompany: form.previousInsuranceCompany || "",
      policyNumber: form.previousPolicyNumber || "",
      policyType: form.previousPolicyType || "",
      issueDate: form.previousIssueDate || "",
      dueDate: form.previousDueDate || "",
      claimTakenLastYear: form.previousClaimTaken || "",
      ncbDiscount: form.previousNcbDiscount || 0
    }
  };
  break;
        case 5: // New Policy Details
          updateData = {
            policy_info: {
              policyIssued: form.policyIssued || "",
              insuranceCompany: form.insuranceCompany || "",
              policyNumber: form.policyNumber || "",
              covernoteNumber: form.covernoteNumber || "",
              issueDate: form.issueDate || "",
              dueDate: form.dueDate || "",
              ncbDiscount: form.ncbDiscount || "",
              insuranceDuration: form.insuranceDuration || "",
              idvAmount: form.idvAmount || "",
              totalPremium: form.totalPremium || ""
            }
          };
          break;
        case 6: // Documents
          updateData = {
            documents: form.documents || []
          };
          break;
        case 7: // Payment
          updateData = {
            payment_info: {
              paymentMadeBy: form.paymentMadeBy || "",
              paymentMode: form.paymentMode || "",
              paymentAmount: form.paymentAmount || "",
              paymentDate: form.paymentDate || "",
              transactionId: form.transactionId || "",
              receiptDate: form.receiptDate || "",
              bankName: form.bankName || ""
            }
          };
          break;
          case 8: // Payout Details
  updateData = {
    payout: {  // Ensure this matches your backend expectation
      netPremium: form.netPremium || 0,
      odAmount: form.odAmount || 0,
      ncbAmount: form.ncbAmount || 0,
      subVention: form.subVention || 0,
      netAmount: (form.ncbAmount || 0) - (form.subVention || 0)
    }
  };
  break;
        default:
          updateData = {};
      }

      // CRITICAL: ALWAYS include insuranceQuotes in every update
      updateData.insuranceQuotes = form.insuranceQuotes || [];
      
      console.log(" Sending insuranceQuotes to API:", updateData.insuranceQuotes);
      console.log(" insuranceQuotes length being sent:", updateData.insuranceQuotes.length);

      console.log(`${isEditMode ? 'Updating' : 'Saving'} policy ${policyId} with:`, updateData);

      const response = await axios.put(`${API_BASE_URL}/policies/${policyId}`, updateData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log(" API Response:", response.data);
      
      setSaveMessage(isEditMode ? " Policy updated successfully!" : " Progress saved successfully!");
      
      return response.data;
    } catch (error) {
      console.error("Error updating policy:", error);
      let errorMessage = "Error saving progress";
      
      if (error.response) {
        errorMessage = `Save error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        console.error(" API Error details:", error.response.data);
      } else if (error.request) {
        errorMessage = "Network error: No response from server";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setSaveMessage(` ${errorMessage}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateCurrentStep()) {
      setSaveMessage(" Please fix the validation errors before saving");
      return;
    }
    
    try {
      await updatePolicy();
    } catch (error) {
      // Error handling is done in updatePolicy
    }
  };

  // Handle form completion and navigation - UPDATED to ensure insuranceQuotes are saved
  const handleFinish = async () => {
    if (!validateCurrentStep()) {
      setSaveMessage(" Please fix the validation errors before finishing");
      return;
    }

    try {
      setIsSaving(true);
      
      // Final update with completed status - include ALL data
      const finalData = {
        // Include all sections to ensure complete data
        buyer_type: form.buyer_type,
        customer_details: {
          name: form.customerName,
          mobile: form.mobile,
          email: form.email,
          gender: form.gender,
          maritalStatus: form.maritalStatus,
          dob: form.dob,
          occupation: form.occupation,
          panNumber: form.panNumber,
          aadhaarNumber: form.aadhaarNumber,
          residenceAddress: form.residenceAddress,
          pincode: form.pincode,
          city: form.city
        },
        nominee: {
          name: form.nomineeName,
          relation: form.relation,
          age: form.nomineeAge
        },
        refrence: {
          name: form.referenceName,
          phone: form.referencePhone
        },
        vehicle_details: {
          city: form.city,
          make: form.make,
          model: form.model,
          variant: form.variant,
          engineNo: form.engineNo,
          chassisNo: form.chassisNo,
          makeMonth: form.makeMonth,
          makeYear: form.makeYear
        },
        insurance_quote: {
          insurer: form.insurer,
          coverageType: form.coverageType,
          premium: form.premium,
          idv: form.idv,
          ncb: form.ncb,
          duration: form.duration
        },
         // Add Previous Policy section
  previous_policy: {
    insuranceCompany: form.previousInsuranceCompany || "",
    policyNumber: form.previousPolicyNumber || "",
    policyType: form.previousPolicyType || "",
    issueDate: form.previousIssueDate || "",
    dueDate: form.previousDueDate || "",
    claimTakenLastYear: form.previousClaimTaken || "",
    ncbDiscount: form.previousNcbDiscount || 0
  },
        insurance_quotes: form.insuranceQuotes || [], // ← ADDED THIS LINE
        policy_info: {
          policyIssued: form.policyIssued,
          insuranceCompany: form.insuranceCompany,
          policyNumber: form.policyNumber,
          covernoteNumber: form.covernoteNumber,
          issueDate: form.issueDate,
          dueDate: form.dueDate,
          ncbDiscount: form.ncbDiscount,
          insuranceDuration: form.insuranceDuration,
          idvAmount: form.idvAmount,
          totalPremium: form.totalPremium
        },
        documents: form.documents || [],
        payment_info: {
          paymentMadeBy: form.paymentMadeBy,
          paymentMode: form.paymentMode,
          paymentAmount: form.paymentAmount,
          paymentDate: form.paymentDate,
          transactionId: form.transactionId,
          receiptDate: form.receiptDate,
          bankName: form.bankName
        },
         payout: {
    netPremium: form.netPremium || 0,
    odAmount: form.odAmount || 0,
    ncbAmount: form.ncbAmount || 0,
    subVention: form.subVention || 0,
    netAmount: (form.ncbAmount || 0) - (form.subVention || 0)
  },
  
        status: "completed",
        completed_at: Date.now(),
        ts: form.ts,
        created_by: form.created_by
      };

      console.log(` Finalizing policy with insuranceQuotes:`, finalData.insuranceQuotes);
      console.log(`Finalizing policy ${policyId} with complete data:`, finalData);

      const response = await axios.put(`${API_BASE_URL}/policies/${policyId}`, finalData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      setSaveMessage(" Policy completed successfully! Redirecting to policies page...");
      setIsCompleted(true);
      
      setTimeout(() => {
        navigate("/policies");
      }, 2000);
      
    } catch (error) {
      console.error("Error completing policy:", error);
      setSaveMessage(" Error completing policy. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (step === steps.length) {
      await handleFinish();
      return;
    }

    if (!validateCurrentStep()) {
      setSaveMessage(" Please fix the validation errors before proceeding");
      return;
    }

    try {
      await updatePolicy();
      setStep((s) => Math.min(s + 1, steps.length));
      setErrors({});
      setSaveMessage(""); // Clear previous messages
    } catch (error) {
      console.log("Save failed, staying on current step");
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
    setSaveMessage(""); // Clear previous messages
  };

  const progressPercent = Math.round(((step - 1) / (steps.length - 1)) * 100);
  const nextLabel = step < steps.length ? `Next: ${steps[step]}` : "Finish";

  // Enhanced step props with additional handlers
  const stepProps = {
    form,
    handleChange,
    handleSave,
    isSaving,
    errors,
    // Additional handlers for specific components
    onDocumentsUpdate: handleDocumentsUpdate,
    onInsuranceQuotesUpdate: handleInsuranceQuotesUpdate // ← ADDED THIS LINE
  };

  // Loading state
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
              : saveMessage.includes("") || saveMessage.includes("completed successfully") || saveMessage.includes("successfully")
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

        {/* Debug Section - Always visible in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <div className="flex justify-between items-center">
               <div>
                <h4 className="font-semibold text-yellow-800">Case Info</h4>
                <p className="text-xs text-yellow-700">
                  Edit Mode: {isEditMode ? 'Yes' : 'No'} | 
                  Policy ID: {policyId || 'Not set'} | 
                  Step: {step} | 
                  Saving: {isSaving ? 'Yes' : 'No'} |
                  Quotes: {form.insuranceQuotes?.length || 0} 
              </div> 
              <button
                onClick={() => {
                  console.log("=== CURRENT FORM STATE ===");
                  console.log("Full form:", form);
                  console.log("Documents:", form.documents);
                  console.log("Payment:", {
                    paymentMadeBy: form.paymentMadeBy,
                    paymentMode: form.paymentMode,
                    paymentAmount: form.paymentAmount
                  });
                  console.log("Insurance Quotes:", form.insuranceQuotes); // ← ADDED THIS LINE
                  console.log("Errors:", errors);
                }}
                className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
              >
                Debug Form
              </button>
            </div>
            <div className="mt-2 text-xs text-yellow-700 grid grid-cols-2 md:grid-cols-4 gap-1">
              <div>Customer: "{form.customerName || 'Empty'}"</div>
              <div>Mobile: "{form.mobile || 'Empty'}"</div>
              <div>Documents: {form.documents?.length || 0} files</div>
              <div>Quotes: {form.insuranceQuotes?.length || 0} quotes</div> 
            </div>
          </div>
        )}*/}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              {isEditMode ? 'Edit Insurance Case' : 'New Insurance Case'} 
              {policyId && ` #${policyId}`}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditMode ? 'Edit existing insurance case' : 'Create a new insurance case'}
              {isEditMode && " - All fields are pre-filled with existing data"}
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
              Step {step} of {steps.length}
            </div>
            <div className="text-sm text-gray-500">
              {progressPercent}% Complete
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="h-2 bg-black rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {steps.map((title, idx) => {
              const i = idx + 1;
              const isCompleted = i < step;
              const isCurrent = i === step;

              return (
                <div
                  key={title}
                  className="flex-1 relative flex flex-col items-center"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500 text-white shadow-sm"
                        : isCurrent
                        ? "bg-white border-2 border-purple-600 text-purple-600 shadow-sm"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <FaCheck /> : i}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Render current step component */}
        {step === 1 && <CaseDetails {...stepProps} />}
        {step === 2 && <VehicleDetails {...stepProps} />}
        {step === 3 && <InsuranceQuotes {...stepProps} />}
        {step === 4 && <PreviousPolicyDetails {...stepProps} />}      {/* New */}
        {step === 5 && <NewPolicyDetails {...stepProps} />}
        {step === 6 && <Documents {...stepProps} />}
        {step === 7 && <Payment {...stepProps} />}      
        {step === 8 && <PayoutDetails {...stepProps} />} 

        {/* Navigation Buttons */}
        <div className="mt-8 bg-transparent p-4 rounded-md flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={prevStep}
              disabled={step === 1 || isCompleted || isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <FaChevronLeft /> Previous
            </button>
            <div className="text-sm text-gray-500">
              Step {step} of {steps.length}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* <button
              onClick={handleSave}
              disabled={isSaving || isCompleted}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <FaSave /> {isSaving ? "Saving..." : "Save Progress"}
            </button> */}

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
  );
};

export default NewPolicyPage;