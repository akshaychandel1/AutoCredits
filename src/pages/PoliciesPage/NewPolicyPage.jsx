import React ,{ useState, useEffect, useRef, useCallback, useMemo } from "react"; 
import {jsPDF} from 'jspdf'
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { z } from 'zod';
import {
  FaCar, FaInfoCircle,FaPlus,FaArrowRight, FaCalculator,
  FaMapMarkerAlt,FaCheckCircle,FaExclamationTriangle,FaCloudUploadAlt,FaListAlt,FaExternalLinkAlt, FaTags,FaTag,FaSpinner,FaMoneyBillWave, FaEdit,FaHistory ,
  FaUser,FaReceipt,FaEye,FaDownload,FaGift,FaUserTie,FaBuilding,
  FaPhone,FaFileContract,FaShieldAlt,FaUsers,
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
  FileText, Edit,
  Save,
  CheckCircle, // ADD THIS
  AlertTriangle // ADD THIS
} from 'lucide-react';
import PDFGenerationService from "./PDFGenerationService";
import { useLocation } from 'react-router-dom';
import INRCurrencyInput from "../../components/INRCurrencyInput";
// import VehicleDetails from "./VehicleDetails";
// ================== VALIDATION RULES ==================
const validationRules = {
  // Step 1: Case Details validation - UNCHANGED
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

  // Step 2: Vehicle Details validation - UNCHANGED
  validateStep2: (form) => {
    const errors = {};

    // Registration Number validation
    if (!form.regNo) {
      errors.regNo = "Registration Number is required";
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

  // Step 3: Insurance Quotes validation - FIXED: Allow 0 for premium fields
 validateStep3: (form, acceptedQuote = null) => {
  const errors = {};

  // Use new system if insuranceQuotes array exists and has items
  if (form.insuranceQuotes && form.insuranceQuotes.length > 0) {
    // New system validation
    if (form.insuranceQuotes.length === 0) {
      errors.insuranceQuotes = "At least one insurance quote is required";
    }

    if (!acceptedQuote) {
      errors.acceptedQuote = "Please accept a quote to proceed";
    }

  } else {
    // Old system validation
    if (!form.insurer) errors.insurer = "Insurance company is required";
    if (!form.coverageType) errors.coverageType = "Coverage type is required";
    
    if (!form.premium && form.premium !== 0) {
      errors.premium = "Premium amount is required";
    } else if (parseFloat(form.premium) < 0) {
      errors.premium = "Premium amount must be 0 or greater";
    }
    
    if (!form.idv && form.idv !== 0) {
      errors.idv = "IDV amount is required";
    } else if (parseFloat(form.idv) < 0) {
      errors.idv = "IDV amount must be 0 or greater";
    }
  }

  // Common validation
  if (form.ncb !== null && form.ncb !== undefined && form.ncb !== '') {
    const ncbValue = parseFloat(form.ncb);
    if (isNaN(ncbValue) || ncbValue < 0 || ncbValue > 100) {
      errors.ncb = "NCB discount must be between 0% and 100%";
    }
  }

  return errors;
},

  // Step 4: New Policy Details validation - FIXED: Allow 0 for appropriate fields
  validateStep4: (form) => {
    const errors = {};

    // Insurance Company validation
    if (!form.insuranceCompany) {
      errors.insuranceCompany = "Insurance company is required";
    }

    // Policy/Covernote Number validation
    if (!form.policyNumber) {
      errors.policyNumber = "Policy number is required";
    }

    // Issue Date validation
    if (!form.issueDate) {
      errors.issueDate = "Issue date is required";
    }

    // Policy Start Date validation
    if (!form.policyStartDate) {
      errors.policyStartDate = "Policy start date is required";
    }

    // Insurance Duration validation
    if (!form.insuranceDuration) {
      errors.insuranceDuration = "Insurance duration is required";
    }

    // NCB Discount validation - Allow 0%
    if (form.ncbDiscount !== null && form.ncbDiscount !== undefined && form.ncbDiscount !== '') {
      const ncbValue = parseFloat(form.ncbDiscount);
      if (isNaN(ncbValue) || ncbValue < 0 || ncbValue > 100) {
        errors.ncbDiscount = "NCB discount must be between 0% and 100%";
      }
    }

    // IDV Amount validation - Allow 0 (for comprehensive policies with only TP)
    if (!form.idvAmount && form.idvAmount !== 0) {
      errors.idvAmount = "IDV amount is required";
    } else {
      const idvValue = parseFloat(form.idvAmount);
      if (isNaN(idvValue) || idvValue < 0) { // Changed <= to < to allow 0
        errors.idvAmount = "IDV amount must be 0 or greater";
      }
    }

    // Total Premium validation - Allow 0 (for free policies or special cases)
    if (!form.totalPremium && form.totalPremium !== 0) {
      errors.totalPremium = "Total premium is required";
    } else {
      const premiumValue = parseFloat(form.totalPremium);
      if (isNaN(premiumValue) || premiumValue < 0) { // Changed <= to < to allow 0
        errors.totalPremium = "Total premium must be 0 or greater";
      }
    }

    // Expiry date validations based on policy type
    if (form.policyType === "comprehensive" || form.policyType === "standalone") {
      if (!form.odExpiryDate) {
        errors.odExpiryDate = "OD expiry date is required";
      }
    }
    
    if (form.policyType === "comprehensive" || form.policyType === "thirdParty") {
      if (!form.tpExpiryDate) {
        errors.tpExpiryDate = "TP expiry date is required";
      }
    }

    return errors;
  },

  // Step 5: Documents validation - UNCHANGED
  validateStep5: (form) => {
    const errors = {};

    // Check if documents exist and have at least one entry
    if (!form.documents || Object.keys(form.documents).length === 0) {
      errors.documents = "At least one document is required";
    }

    return errors;
  },

  // Step 6: Payment validation - FIXED: Payment amount should NOT allow 0
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

    // Payment Amount validation - DO NOT allow 0 (payment should be > 0)
    if (!form.paymentAmount) {
      errors.paymentAmount = "Payment amount is required";
    } else {
      const paymentValue = parseFloat(form.paymentAmount);
      if (isNaN(paymentValue) || paymentValue <= 0) { // Keep <= 0 for payment
        errors.paymentAmount = "Payment amount must be greater than 0";
      }
    }

    // Payment Date validation
    if (!form.paymentDate) {
      errors.paymentDate = "Payment date is required";
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
    "Spouse", "Son", "Mother", "Father", "Daughter", "Child", "Brother", "Sister", "Grandparent", "Father-in-law",
    "Mother-in-law", "Brother-in-law", "Sister-in-law", "Son-in-law", "Daughter-in-law",
  ];

  // Credit type options - UPDATED: Added Broker option
  const creditTypeOptions = [
    { value: "auto", label: "Autocredits India LLP" },
    { value: "broker", label: "Broker" },
    { value: "showroom", label: "Showroom" },
    { value: "customer", label: "Customer" }
  ];

  // Broker name suggestions - NEW: Added broker name options
  const brokerNameOptions = [
    "ABC Insurance Brokers",
    "XYZ Financial Services", 
    "SecureLife Insurance Brokers",
    "Prime Risk Solutions",
    "Global Insurance Partners",
    "Reliance Insurance Brokers",
    "Pioneer Risk Advisors",
    "Capital Insurance Services",
    "Heritage Insurance Brokers",
    "Summit Risk Management"
  ];

  // NEW: Agent names for source origin
  const agentNameOptions = [
    "Rahul Sharma",
    "Priya Patel",
    "Amit Kumar",
    "Sneha Desai",
    "Vikram Singh",
    "Anjali Mehta",
    "Rajesh Gupta",
    "Pooja Reddy",
    "Sanjay Malhotra",
    "Neha Choudhary",
    "Karan Joshi",
    "Divya Iyer",
    "Arun Khanna",
    "Swati Nair",
    "Deepak Verma",
    "Maya Srinivasan",
    "Rohit Bajaj",
    "Shweta Kapoor",
    "Nitin Agarwal",
    "Tanvi Shah"
  ];

  // State for relationship suggestions
  const [relationshipSuggestions, setRelationshipSuggestions] = useState([]);
  const [showRelationshipSuggestions, setShowRelationshipSuggestions] = useState(false);
  
  // NEW: State for broker name suggestions
  const [brokerNameSuggestions, setBrokerNameSuggestions] = useState([]);
  const [showBrokerNameSuggestions, setShowBrokerNameSuggestions] = useState(false);
  
  // NEW: State for source origin (agent name) suggestions
  const [agentNameSuggestions, setAgentNameSuggestions] = useState([]);
  const [showAgentNameSuggestions, setShowAgentNameSuggestions] = useState(false);
  
  // State for pincode loading
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // NEW: States for customer autosuggest
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');
  const [prefillMessage, setPrefillMessage] = useState('');

  // NEW: States for company autosuggest
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [companyPrefillMessage, setCompanyPrefillMessage] = useState('');

  // Base API URL
  // const API_BASE_URL = "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app";

  // Format text to have first letter uppercase and other letters lowercase
  const formatName = (text) => {
    return text.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  // Fetch customers on component mount - UPDATED: Fetch all fields from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  // NEW: Detect buyer type based on first_name being "undefined"
  useEffect(() => {
    if (customers.length > 0) {
      console.log("🔍 Checking customers for undefined first_name...");
      customers.forEach(customer => {
        if (customer.first_name === "undefined" || customer.first_name === undefined) {
          console.log("🏢 Found corporate customer:", customer);
          // This customer should be treated as corporate
        }
      });
    }
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      setIsCustomersLoading(true);
      setCustomersError('');
      
      const response = await fetch(
        "https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1/customers"
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Fetch ALL fields from API as requested
        console.log("✅ Fetched customers with all fields:", data.data);
        
        // Process customers to handle undefined first_name
        const processedCustomers = data.data.map(customer => {
          // If first_name is "undefined", treat as corporate and use contactPersonName
          if (customer.first_name === "undefined" || customer.first_name === undefined) {
            return {
              ...customer,
              buyer_type: "corporate",
              displayName: customer.contactPersonName || customer.companyName || "Corporate Customer"
            };
          }
          return {
            ...customer,
            buyer_type: "individual",
            displayName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
          };
        });
        
        setCustomers(processedCustomers);
      } else {
        console.warn('Unexpected API response format:', data);
        setCustomers([]);
        setCustomersError('No customer data found');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomersError('Failed to load customers. Please type manually.');
    } finally {
      setIsCustomersLoading(false);
    }
  };

  // Fetch city from pincode using reliable public API
  const fetchCityFromPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    
    setIsPincodeLoading(true);
    setPincodeError('');
    
    try {
      console.log('🔍 Fetching city for pincode:', pincode);
      
      // Use reliable public pincode API
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response data:', data);
      
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.[0]?.District) {
        const cityName = data[0].PostOffice[0].District;
        const formattedCity = formatName(cityName);
        
        handleChange({
          target: {
            name: 'city',
            value: formattedCity
          }
        });
        setPincodeError('');
        console.log('✅ City found:', formattedCity);
      } else {
        setPincodeError('Pincode not found. Please enter city manually.');
      }
    } catch (error) {
      console.error('❌ Error fetching pincode data:', error);
      setPincodeError('Unable to fetch city data. Please enter city manually.');
    } finally {
      setIsPincodeLoading(false);
    }
  };

  // Pincode change handler with proper API triggering
  const handlePincodeChange = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and limit to 6 digits
    const numbersOnly = value.replace(/[^\d]/g, '').slice(0, 6);
    
    handleChange({
      target: {
        name: name,
        value: numbersOnly
      }
    });
    
    // Clear previous errors
    setPincodeError('');
    
    console.log('🔢 Pincode input:', numbersOnly, 'Length:', numbersOnly.length);
    
    // Fetch city when pincode is exactly 6 digits
    if (numbersOnly.length === 6) {
      console.log('🚀 Triggering API call for pincode:', numbersOnly);
      // Immediate API call without delay
      fetchCityFromPincode(numbersOnly);
    }
  };

  // Handle text input change with formatting
  const handleTextChange = (e, shouldFormat = false) => {
    const { name, value } = e.target;

    const specialFields = ["companyName", "contactPersonName", "customerName", "employeeName"];

    // If field is one of the special fields → use smart name formatting
    if (specialFields.includes(name)) {
      const formattedValue = value
        .split(" ")
        .map(word => {
          if (!word) return "";

          // Keep acronyms (LLP, LTD) fully uppercase
          if (word === word.toUpperCase()) return word;

          // Capitalize first letter only
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");

      return handleChange({
        target: {
          name,
          value: formattedValue
        }
      });
    }

    // Otherwise use your existing behavior
    if (shouldFormat) {
      const formattedValue = formatName(value);
      return handleChange({
        target: {
          name,
          value: formattedValue
        }
      });
    }

    // No formatting at all
    handleChange(e);
  };

  // Handle customer name input change for auto-suggest - UPDATED: Handle corporate detection
  const handleCustomerNameChange = (e) => {
    const { name, value } = e.target;
    
    handleChange(e);

    // Filter customers based on input - only search by name and phone
    if (value.trim()) {
      const filtered = customers.filter(customer => 
        customer.buyer_type === "individual" && (
          `${customer.first_name} ${customer.last_name}`
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          customer.phone.includes(value)
        )
      );
      setFilteredCustomers(filtered);
      setShowCustomerSuggestions(true);
    } else {
      setFilteredCustomers([]);
      setShowCustomerSuggestions(false);
    }
  };

  // Handle company name input change for auto-suggest - UPDATED: Handle corporate detection
  const handleCompanyNameChange = (e) => {
    const { name, value } = e.target;
    
    handleChange(e);

    // Filter customers based on input - search by company name, contact person, and phone
    if (value.trim()) {
      const filtered = customers.filter(customer => 
        customer.buyer_type === "corporate" && (
          customer.companyName?.toLowerCase().includes(value.toLowerCase()) ||
          customer.contactPersonName?.toLowerCase().includes(value.toLowerCase()) ||
          customer.phone.includes(value)
        )
      );
      setFilteredCompanies(filtered);
      setShowCompanySuggestions(true);
    } else {
      setFilteredCompanies([]);
      setShowCompanySuggestions(false);
    }
  };

  // UPDATED: Select customer name specifically and prefill ALL fields for INDIVIDUAL buyer type
  const selectCustomerName = (customer) => {
    console.log("🔍 Selecting customer for INDIVIDUAL buyer type:", customer);
    
    // Map ALL customer data to form fields for INDIVIDUAL buyer type as specified
    const fieldMappings = {
      // Source origin (common for both)
      sourceOrigin: customer.sourceOrigin || '',
      
      // Individual specific fields
      customerName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      mobile: customer.phone || customer.mobile || '',
      email: customer.email || '',
      residenceAddress: customer.address || customer.residenceAddress || '',
      pincode: customer.pincode || '',
      city: customer.city || '',
      alternatePhone: customer.alternate_phone || customer.alternatePhone || '',
      employeeName: customer.employee_name || customer.employeeName || '',
      gender: customer.gender || '',
      panNumber: customer.pan || customer.panNumber || '',
      aadhaarNumber: customer.aadhaar || customer.aadhaarNumber || '',
      
      // Additional fields that might be in API
      age: customer.age || '',
      lead_source: customer.lead_source || '',
      lead_status: customer.lead_status || '',
      policy_type: customer.policy_type || '',
    };

    let filledFields = 0;
    // Update all fields
    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      if (value && value !== '') {
        handleChange({
          target: {
            name: fieldName,
            value: value
          }
        });
        filledFields++;
        console.log(`✅ Prefilled ${fieldName}:`, value);
      }
    });
    
    setPrefillMessage(`✅ Prefilled ${filledFields} fields from customer data`);
    setTimeout(() => setPrefillMessage(''), 3000);
    
    setFilteredCustomers([]);
    setShowCustomerSuggestions(false);
    
    console.log("🎯 Individual customer data prefilled:", fieldMappings);
  };

  // UPDATED: Select company name specifically and prefill ALL fields for CORPORATE buyer type
  const selectCompanyName = (customer) => {
    console.log("🔍 Selecting customer for CORPORATE buyer type:", customer);
    
    // Map ALL customer data to company form fields for CORPORATE buyer type as specified
    const fieldMappings = {
      // Common contact fields
      mobile: customer.phone || customer.mobile || '',
      email: customer.email || '',
      residenceAddress: customer.address || customer.residenceAddress || '',
      pincode: customer.pincode || '',
      city: customer.city || '',
      alternatePhone: customer.alternate_phone || customer.alternatePhone || '',
      employeeName: customer.employee_name || customer.employeeName || '',
      panNumber: customer.pan || customer.panNumber || '',
      
      // Corporate specific fields
      companyName: customer.company_name || customer.companyName || customer.displayName || '',
      contactPersonName: customer.contact_person || customer.contactPersonName || customer.displayName || '',
      gstNumber: customer.gst || customer.gstNumber || '',
      
      // Source origin and other fields
      sourceOrigin: customer.sourceOrigin || '',
      lead_source: customer.lead_source || '',
      lead_status: customer.lead_status || '',
      policy_type: customer.policy_type || '',
    };

    let filledFields = 0;
    // Update all fields
    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      if (value && value !== '') {
        handleChange({
          target: {
            name: fieldName,
            value: value
          }
        });
        filledFields++;
        console.log(`✅ Prefilled ${fieldName}:`, value);
      }
    });
    
    setCompanyPrefillMessage(`✅ Prefilled ${filledFields} fields from company data`);
    setTimeout(() => setCompanyPrefillMessage(''), 3000);
    
    setFilteredCompanies([]);
    setShowCompanySuggestions(false);
    
    console.log("🏢 Corporate customer data prefilled:", fieldMappings);
  };

  // Handle phone number input (numbers only)
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers
    const numbersOnly = value.replace(/[^\d]/g, '');
    handleChange({
      target: {
        name: name,
        value: numbersOnly
      }
    });
  };

  // Handle uppercase input (for PAN, GST, etc.)
  const handleUppercaseChange = (e) => {
    const { name, value } = e.target;
    handleChange({
      target: {
        name: name,
        value: value.toUpperCase()
      }
    });
  };

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

  // NEW: Handle broker name input change for auto-suggest
  const handleBrokerNameChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value) {
      const filtered = brokerNameOptions.filter(broker =>
        broker.toLowerCase().includes(value.toLowerCase())
      );
      setBrokerNameSuggestions(filtered);
      setShowBrokerNameSuggestions(true);
    } else {
      setBrokerNameSuggestions([]);
      setShowBrokerNameSuggestions(false);
    }
  };

  // NEW: Handle source origin (agent name) input change for auto-suggest
  const handleSourceOriginChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value) {
      const filtered = agentNameOptions.filter(agent =>
        agent.toLowerCase().includes(value.toLowerCase())
      );
      setAgentNameSuggestions(filtered);
      setShowAgentNameSuggestions(true);
    } else {
      setAgentNameSuggestions([]);
      setShowAgentNameSuggestions(false);
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

  // NEW: Select broker name from suggestions
  const selectBrokerName = (brokerName) => {
    handleChange({
      target: {
        name: 'brokerName',
        value: brokerName
      }
    });
    setShowBrokerNameSuggestions(false);
    setBrokerNameSuggestions([]);
  };

  // NEW: Select source origin (agent name) from suggestions
  const selectSourceOrigin = (agentName) => {
    handleChange({
      target: {
        name: 'sourceOrigin',
        value: agentName
      }
    });
    setShowAgentNameSuggestions(false);
    setAgentNameSuggestions([]);
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

  // UPDATED: Handle credit type change with broker logic
  const handleCreditTypeChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    
    // UPDATED: Update form state to track if payout should be hidden
    // Payout should be available for auto and broker, hidden for showroom and customer
    const hidePayout = value === "showroom" || value === "customer";
    handleChange({
      target: {
        name: 'hidePayout',
        value: hidePayout
      }
    });
  };

  // UPDATED: Check if payout should be hidden
  const shouldHidePayout = form.creditType === "showroom" || form.creditType === "customer";

  // NEW: Check if broker name field should be enabled
  const shouldEnableBrokerName = form.creditType === "broker";

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
        </div>

        {/* Credit Type Dropdown - UPDATED: Added Broker option */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Policy Done By *
          </label>
          <select
            name="creditType"
            value={form.creditType || "auto"}
            onChange={handleCreditTypeChange}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.creditType ? "border-red-500" : "border-gray-300"
            }`}
          >
            {creditTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.creditType && <p className="text-red-500 text-xs mt-1">{errors.creditType}</p>}
        </div>

        {/* NEW: Broker Name Field - Only enabled when Broker is selected */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Broker Name {shouldEnableBrokerName && "*"}
          </label>
          <div className="relative">
            <input
              type="text"
              name="brokerName"
              value={form.brokerName || ""}
              onChange={handleBrokerNameChange}
              onFocus={() => {
                if (shouldEnableBrokerName) {
                  if (form.brokerName) {
                    const filtered = brokerNameOptions.filter(broker =>
                      broker.toLowerCase().includes(form.brokerName.toLowerCase())
                    );
                    setBrokerNameSuggestions(filtered);
                    setShowBrokerNameSuggestions(true);
                  } else {
                    setBrokerNameSuggestions(brokerNameOptions);
                    setShowBrokerNameSuggestions(true);
                  }
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowBrokerNameSuggestions(false), 200);
              }}
              placeholder={shouldEnableBrokerName ? "Select or type broker name" : "Select Broker first"}
              disabled={!shouldEnableBrokerName}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                !shouldEnableBrokerName 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : errors.brokerName ? "border-red-500" : "border-gray-300"
              }`}
            />
            
            {/* Broker Name Suggestions Dropdown */}
            {showBrokerNameSuggestions && shouldEnableBrokerName && brokerNameSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {brokerNameSuggestions.map((broker, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => selectBrokerName(broker)}
                  >
                    {broker}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.brokerName && <p className="text-red-500 text-xs mt-1">{errors.brokerName}</p>}
        </div>

        {/* NEW: Source Origin Field - Agent Name Auto-suggestion */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Source Origin
          </label>
          <div className="relative">
            <input
              type="text"
              name="sourceOrigin"
              value={form.sourceOrigin || ""}
              onChange={handleSourceOriginChange}
              onFocus={() => {
                if (form.sourceOrigin) {
                  const filtered = agentNameOptions.filter(agent =>
                    agent.toLowerCase().includes(form.sourceOrigin.toLowerCase())
                  );
                  setAgentNameSuggestions(filtered);
                  setShowAgentNameSuggestions(true);
                } else {
                  setAgentNameSuggestions(agentNameOptions);
                  setShowAgentNameSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowAgentNameSuggestions(false), 200);
              }}
              placeholder="Select or type agent name"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.sourceOrigin ? "border-red-500" : "border-gray-300"
              }`}
            />
            
            {/* Agent Name Suggestions Dropdown */}
            {showAgentNameSuggestions && agentNameSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {agentNameSuggestions.map((agent, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => selectSourceOrigin(agent)}
                  >
                    {agent}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.sourceOrigin && <p className="text-red-500 text-xs mt-1">{errors.sourceOrigin}</p>}
          <p className="text-gray-400 text-xs mt-1">From where we got the policy client</p>
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
                  onChange={(e) => handleTextChange(e, true)}
                  placeholder="Enter employee name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.employeeName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.employeeName && <p className="text-red-500 text-xs mt-1">{errors.employeeName}</p>}
            </div>

            {/* Customer Name with Autosuggest */}
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
                  onChange={handleCustomerNameChange}
                  onFocus={() => {
                    if (form.customerName) {
                      const filtered = customers.filter(customer => 
                        customer.buyer_type === "individual" && (
                          `${customer.first_name} ${customer.last_name}`
                            .toLowerCase()
                            .includes(form.customerName.toLowerCase()) ||
                          customer.phone.includes(form.customerName)
                        )
                      );
                      setFilteredCustomers(filtered);
                    }
                    setShowCustomerSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                  placeholder="Enter customer name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.customerName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              
              {/* Prefill Success Message */}
              {prefillMessage && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <FaCheckCircle className="mr-1" /> {prefillMessage}
                </p>
              )}
              
              {/* Loading State */}
              {isCustomersLoading && showCustomerSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 text-sm text-gray-500">Loading customers...</div>
                </div>
              )}
              
              {/* Autosuggest Dropdown */}
              {showCustomerSuggestions && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer._id}
                      className="px-3 py-2 cursor-pointer hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectCustomerName(customer)}
                    >
                      <div className="font-medium text-sm">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{customer.phone}</div>
                      <div className="text-xs text-gray-400">
                        {customer.email && `Email: ${customer.email} • `}
                        {customer.city && `City: ${customer.city}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {showCustomerSuggestions && form.customerName && !isCustomersLoading && filteredCustomers.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 text-sm text-gray-500">No customers found</div>
                </div>
              )}
              
              {/* API Error Message */}
              {customersError && (
                <p className="text-yellow-600 text-xs mt-1">{customersError}</p>
              )}
              
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
                  onChange={handlePhoneChange}
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
                  maxLength='10'
                  onChange={handlePhoneChange}
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
                onChange={handleUppercaseChange}
                placeholder="ABCDE1234F"
                maxLength={10}
                style={{ textTransform: "uppercase" }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
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
                maxLength={12}
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
                  onChange={(e) => handleTextChange(e, true)}
                  placeholder="Enter employee name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.employeeName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.employeeName && <p className="text-red-500 text-xs mt-1">{errors.employeeName}</p>}
            </div>

            {/* Company Name with Autosuggest */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Company Name *
              </label>
              <div className="flex items-center relative">
                <FaBuilding className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName || ""}
                  onChange={handleCompanyNameChange}
                  onFocus={() => {
                    if (form.companyName) {
                      const filtered = customers.filter(customer => 
                        customer.buyer_type === "corporate" && (
                          customer.companyName?.toLowerCase().includes(form.companyName.toLowerCase()) ||
                          customer.contactPersonName?.toLowerCase().includes(form.companyName.toLowerCase()) ||
                          customer.phone.includes(form.companyName)
                        )
                      );
                      setFilteredCompanies(filtered);
                    }
                    setShowCompanySuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                  placeholder="Enter company name"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    errors.companyName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              
              {/* Company Prefill Success Message */}
              {companyPrefillMessage && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <FaCheckCircle className="mr-1" /> {companyPrefillMessage}
                </p>
              )}
              
              {/* Loading State */}
              {isCustomersLoading && showCompanySuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 text-sm text-gray-500">Loading companies...</div>
                </div>
              )}
              
              {/* Company Autosuggest Dropdown */}
              {showCompanySuggestions && filteredCompanies.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCompanies.map((customer) => (
                    <div
                      key={customer._id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectCompanyName(customer)}
                    >
                      <div className="font-medium text-sm">
                        {customer.companyName || customer.contactPersonName || customer.displayName}
                      </div>
                      <div className="text-xs text-gray-500">{customer.phone}</div>
                      <div className="text-xs text-gray-400">
                        {customer.email && `Email: ${customer.email} • `}
                        {customer.city && `City: ${customer.city}`}
                        {customer.gstNumber && ` • GST: ${customer.gstNumber}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {showCompanySuggestions && form.companyName && !isCustomersLoading && filteredCompanies.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 text-sm text-gray-500">No companies found</div>
                </div>
              )}
              
              {/* API Error Message */}
              {customersError && (
                <p className="text-yellow-600 text-xs mt-1">{customersError}</p>
              )}
              
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
                onChange={(e) => handleTextChange(e, true)}
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
                  onChange={handlePhoneChange}
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
                  onChange={handlePhoneChange}
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
                onChange={handleUppercaseChange}
                placeholder="ABCDE1234F"
                maxLength={10}
                style={{ textTransform: "uppercase" }}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.companyPanNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.companyPanNumber && <p className="text-red-500 text-xs mt-1">{errors.companyPanNumber}</p>}
            </div>

            {/* GST Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber || ""}
                onChange={handleUppercaseChange}
                placeholder="Enter GST number"
                maxLength={15}
                style={{ textTransform: "uppercase" }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
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

        {/* Pincode Field with Auto-fetch */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Pincode *
          </label>
          <div className="relative">
            <input
              type="text"
              name="pincode"
              value={form.pincode || ""}
              onChange={handlePincodeChange}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.pincode ? "border-red-500" : "border-gray-300"
              }`}
            />
            {isPincodeLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FaSpinner className="animate-spin text-purple-600" />
              </div>
            )}
          </div>
          {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
          {pincodeError && <p className="text-red-500 text-xs mt-1">{pincodeError}</p>}
          {form.pincode && form.pincode.length === 6 && !isPincodeLoading && form.city && (
            <p className="text-green-600 text-xs mt-1 flex items-center">
              <FaCheckCircle className="mr-1" /> City auto-filled: {form.city}
            </p>
          )}
        </div>

        {/* City Field */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={form.city || ""}
            onChange={(e) => handleTextChange(e, true)}
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
                onChange={(e) => handleTextChange(e, true)}
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
                onChange={(e) => handleTextChange(e, true)}
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
                onChange={handlePhoneChange}
                placeholder="Reference Phone Number"
                maxLength="10"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {/* <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save & Continue"}
        </button>
      </div> */}
    </div>
  );
};

// ================== STEP 2: VehicleDetails ==================

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
  const [isLoadingRegNo, setIsLoadingRegNo] = useState(false);

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
            will be verified during policy issuance. You can start typing the registration number to auto-fill details from existing records.
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== STEP 3: Previous Policy Details ==================
const PreviousPolicyDetails = ({ form, handleChange, handleSave, isSaving, errors }) => {
  // Insurance companies options
  const insuranceCompanies = [
    "Acko General Insurance Limited",
    "Agriculture Insurance Company of India Limited",
    "Bajaj General Insurance Limited",
    "Cholamandalam MS General Insurance Company Limited",
    "ECGC Limited",
    "Generali Central Insurance Company Limited",
    "Go Digit General Insurance Limited",
    "HDFC ERGO General Insurance Company Limited",
    "ICICI Lombard General Insurance Company Limited",
    "IFFCO TOKIO General Insurance Company Limited",
    "Zurich Kotak General Insurance Company (India) Limited",
    "Kshema General Insurance Limited",
    "Liberty General Insurance Limited",
    "Magma General Insurance Limited",
    "National Insurance Company Limited",
    "Navi General Insurance Limited",
    "Raheja QBE General Insurance Co. Ltd.",
    "Reliance General Insurance Company Limited",
    "Royal Sundaram General Insurance Company Limited",
    "SBI General Insurance Company Limited",
    "Shriram General Insurance Company Limited",
    "Tata AIG General Insurance Company Limited",
    "The New India Assurance Company Limited",
    "The Oriental Insurance Company Limited",
    "United India Insurance Company Limited",
    "Universal Sompo General Insurance Company Limited",
    "Zuno General Insurance Ltd. ",
    "Bharti Axa General Insurance Co. Ltd"
  ];

  // NCB options
  const ncbOptions = [0, 20, 25, 35, 45, 50];

  // Policy type options
  const policyTypeOptions = [
    { value: "comprehensive", label: "Comprehensive" },
    { value: "standalone", label: "Stand Alone OD" },
    { value: "thirdParty", label: "Third Party" }
  ];

  // Hypothecation Bank options
  const hypothecationBanks = [
    "Not Applicable",
    "AU Small Finance Bank",
    "Aditya Birla Finance",
    "Axis Bank",
    "Bajaj Finance",
    "Bandhan Bank",
    "Bank of Baroda",
    "Bank of India",
    "Bank of Maharashtra",
    "Berar Finance",
    "Canara Bank",
    "Capri Global Capital",
    "Central Bank of India",
    "Cholamandalam Investment & Finance",
    "City Union Bank",
    "Clix Capital",
    "DCB Bank",
    "DMI Finance",
    "Dhanlaxmi Bank",
    "ESAF Small Finance Bank",
    "Electronica Finance",
    "Equitas Small Finance Bank",
    "Esskay Fincorp",
    "Federal Bank",
    "Fullerton India (SMFG India Credit)",
    "HDB Financial Services",
    "HDFC Bank",
    "Hero FinCorp",
    "Hinduja Leyland Finance",
    "ICICI Bank",
    "IDBI Bank",
    "IDFC FIRST Bank",
    "IIFL Finance",
    "InCred Financial Services",
    "Indian Bank",
    "Indian Overseas Bank",
    "IndusInd Bank",
    "JM Financial Products",
    "Jammu & Kashmir Bank",
    "Jana Small Finance Bank",
    "Karnataka Bank",
    "Karur Vysya Bank",
    "Kotak Mahindra Bank",
    "Kotak Mahindra Prime",
    "L&T Finance",
    "MAS Financial Services",
    "Mahindra & Mahindra Financial Services",
    "Manappuram Finance",
    "Muthoot Capital Services",
    "Muthoot Finance",
    "Navi Finserv",
    "Northern Arc Capital",
    "Piramal Capital & Housing Finance",
    "Poonawalla Fincorp",
    "Punjab & Sind Bank",
    "Punjab National Bank",
    "RBL Bank",
    "Shriram Finance",
    "South Indian Bank",
    "State Bank of India",
    "Sundaram Finance",
    "Suryoday Small Finance Bank",
    "TVS Credit Services",
    "Tata Capital Financial Services",
    "Tata Motors Finance",
    "Toyota Financial Services India",
    "U GRO Capital",
    "UCO Bank",
    "Ujjivan Small Finance Bank",
    "Union Bank of India",
    "Veritas Finance",
    "Vistaar Financial Services",
    "Vivriti Capital",
    "Volkswagen Finance Private Limited",
    "WheelsEMI Private Limited",
    "YES Bank",
];

  // Policy duration options based on policy type
  const getPolicyDurations = (policyType) => {
    const durations = {
      standalone: ["1 Year", "2 Years", "3 Years"],
      comprehensive: ["1yr OD + 1yr TP", "1yr OD + 3yr TP", "2yr OD + 3yr TP", "3yr OD + 3yr TP"],
      thirdParty: ["1 Year", "2 Years", "3 Years"]
    };
    return durations[policyType] || [];
  };

  const policyDurations = getPolicyDurations(form.previousPolicyType);

  // State for auto-suggest
  const [insuranceCompanySuggestions, setInsuranceCompanySuggestions] = useState([]);
  const [showInsuranceCompanySuggestions, setShowInsuranceCompanySuggestions] = useState(false);
  const [ncbSuggestions, setNcbSuggestions] = useState([]);
  const [showNcbSuggestions, setShowNcbSuggestions] = useState(false);
  const [durationSuggestions, setDurationSuggestions] = useState([]);
  const [showDurationSuggestions, setShowDurationSuggestions] = useState(false);
  const [hypothecationSuggestions, setHypothecationSuggestions] = useState([]);
  const [showHypothecationSuggestions, setShowHypothecationSuggestions] = useState(false);

  // Calculate policy end date based on policy type
  const calculatePolicyEndDate = (startDate, duration, policyType) => {
    if (!startDate || !duration) return '';
    
    let years = 1;
    
    if (policyType === "standalone" || policyType === "thirdParty") {
      years = parseInt(duration.match(/\d+/)?.[0]) || 1;
    } else if (policyType === "comprehensive") {
      const odMatch = duration.match(/(\d+)yr OD/);
      years = odMatch ? parseInt(odMatch[1]) : 1;
    }
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + years);
    end.setDate(end.getDate() - 1);
    
    return end.toISOString().split('T')[0];
  };

  // Calculate TP expiry date
  const calculateTpExpiryDate = (startDate, duration, policyType) => {
    if (!startDate || !duration) return '';
    
    let years = policyType === "comprehensive" ? 3 : 1;
    
    if (policyType === "comprehensive") {
      const tpMatch = duration.match(/(\d+)yr TP/);
      years = tpMatch ? parseInt(tpMatch[1]) : 1;
    } else if (policyType === "thirdParty") {
      years = parseInt(duration.match(/\d+/)?.[0]) || 1;
    }
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + years);
    end.setDate(end.getDate() - 1);
    
    return end.toISOString().split('T')[0];
  };

  // Handle policy type change
  const handlePolicyTypeChange = (e) => {
    const policyType = e.target.value;
    handleChange(e);
    
    // Reset all related fields when policy type changes
    const resetFields = ['previousPolicyDuration', 'previousPolicyEndDate', 'previousTpExpiryDate'];
    resetFields.forEach(field => {
      handleChange({
        target: { name: field, value: '' }
      });
    });
  };

  // Handle policy start date change
  const handlePolicyStartDateChange = (e) => {
    const startDate = e.target.value;
    
    handleChange(e);
    
    if (startDate && form.previousPolicyDuration && form.previousPolicyType) {
      recalculateAllDates(startDate, form.previousPolicyDuration);
    }
  };

  // Recalculate all dates based on start date and duration
  const recalculateAllDates = (startDate, duration) => {
    const policyType = form.previousPolicyType;
    
    if (policyType === "comprehensive") {
      const odEndDate = calculatePolicyEndDate(startDate, duration, "comprehensive");
      const tpEndDate = calculateTpExpiryDate(startDate, duration, "comprehensive");
      
      handleChange({ target: { name: 'previousPolicyEndDate', value: odEndDate } });
      handleChange({ target: { name: 'previousTpExpiryDate', value: tpEndDate } });
    } else if (policyType === "standalone") {
      const odEndDate = calculatePolicyEndDate(startDate, duration, "standalone");
      handleChange({ target: { name: 'previousPolicyEndDate', value: odEndDate } });
    } else if (policyType === "thirdParty") {
      const tpEndDate = calculateTpExpiryDate(startDate, duration, "thirdParty");
      handleChange({ target: { name: 'previousTpExpiryDate', value: tpEndDate } });
    }
  };

  // Handle duration change
  const handleDurationChange = (duration) => {
    handleChange({
      target: { name: 'previousPolicyDuration', value: duration }
    });

    if (form.previousPolicyStartDate && form.previousPolicyType) {
      recalculateAllDates(form.previousPolicyStartDate, duration);
    }
  };

  // Auto-suggest handlers
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

  const handleDurationInputChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value && form.previousPolicyType) {
      const filtered = policyDurations.filter(duration =>
        duration.toLowerCase().includes(value.toLowerCase())
      );
      setDurationSuggestions(filtered);
      setShowDurationSuggestions(true);
    } else {
      setShowDurationSuggestions(false);
    }
  };

  // NEW: Hypothecation auto-suggest handler
  const handleHypothecationChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value) {
      const filtered = hypothecationBanks.filter(bank =>
        bank.toLowerCase().includes(value.toLowerCase())
      );
      setHypothecationSuggestions(filtered);
      setShowHypothecationSuggestions(true);
    } else {
      setShowHypothecationSuggestions(false);
    }
  };

  // Select from suggestions
  const selectInsuranceCompany = (company) => {
    handleChange({ target: { name: 'previousInsuranceCompany', value: company } });
    setShowInsuranceCompanySuggestions(false);
  };

  const selectNcb = (ncb) => {
    handleChange({ target: { name: 'previousNcbDiscount', value: ncb.toString() } });
    setShowNcbSuggestions(false);
  };

  const selectDuration = (duration) => {
    handleDurationChange(duration);
    setShowDurationSuggestions(false);
  };

  // NEW: Select hypothecation from suggestions
  const selectHypothecation = (bank) => {
    handleChange({ target: { name: 'previousHypothecation', value: bank } });
    setShowHypothecationSuggestions(false);
  };

  // Get placeholder text for duration field
  const getDurationPlaceholder = () => {
    const placeholders = {
      standalone: "Type duration (e.g., 1 Year, 2 Years)",
      comprehensive: "Type duration (e.g., 1yr OD + 1yr TP, 1yr OD + 3yr TP)",
      thirdParty: "Type duration (e.g., 1 Year, 2 Years)"
    };
    return placeholders[form.previousPolicyType] || "Select policy type first";
  };

  // Get policy type info text
  const getPolicyTypeInfo = () => {
    const info = {
      standalone: "Available: 1 Year, 2 Years, 3 Years (OD coverage only)",
      comprehensive: "Available: 1yr OD + 1yr TP, 1yr OD + 3yr TP, 2yr OD + 3yr TP, 3yr OD + 3yr TP",
      thirdParty: "Available: 1 Year, 2 Years, 3 Years (TP coverage only)"
    };
    return info[form.previousPolicyType];
  };

  // Debug effect for TP expiry date
  useEffect(() => {
    console.log("🔍 PreviousPolicy Debug State:", {
      previousTpExpiryDate: form.previousTpExpiryDate,
      previousPolicyType: form.previousPolicyType,
      previousPolicyStartDate: form.previousPolicyStartDate,
      previousPolicyDuration: form.previousPolicyDuration,
      formData: {
        previousTpExpiryDate: form.previousTpExpiryDate,
        previousPolicyEndDate: form.previousPolicyEndDate
      }
    });
  }, [form.previousTpExpiryDate, form.previousPolicyType, form.previousPolicyStartDate, form.previousPolicyDuration]);

  // Render expiry date fields based on policy type
  const renderExpiryDateFields = () => {
    const policyType = form.previousPolicyType;
    
    if (policyType === "standalone") {
      return (
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            OD Expiry Date
          </label>
          <input
            type="date"
            name="previousPolicyEndDate"
            value={form.previousPolicyEndDate || ""}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.previousPolicyEndDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.previousPolicyEndDate && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyEndDate}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Auto-calculated: Start Date + Duration - 1 Day
            {form.previousPolicyStartDate && form.previousPolicyDuration && (
              <span className="text-green-600 font-medium"> ✓ Calculated - You can edit if needed</span>
            )}
          </p>
        </div>
      );
    }
    
    if (policyType === "comprehensive") {
      return (
        <>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              OD Expiry Date
            </label>
            <input
              type="date"
              name="previousPolicyEndDate"
              value={form.previousPolicyEndDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousPolicyEndDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousPolicyEndDate && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyEndDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated: Start Date + OD Duration - 1 Day
              {form.previousPolicyStartDate && form.previousPolicyDuration && (
                <span className="text-green-600 font-medium"> ✓ Calculated - You can edit if needed</span>
              )}
            </p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              TP Expiry Date
            </label>
            <input
              type="date"
              name="previousTpExpiryDate"
              value={form.previousTpExpiryDate || ""}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousTpExpiryDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousTpExpiryDate && <p className="text-red-500 text-xs mt-1">{errors.previousTpExpiryDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated: Start Date + TP Duration - 1 Day
              {form.previousPolicyStartDate && form.previousPolicyDuration && (
                <span className="text-green-600 font-medium"> ✓ Calculated - You can edit if needed</span>
              )}
            </p>
          </div>
        </>
      );
    }
    
    if (policyType === "thirdParty") {
      return (
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            TP Expiry Date
          </label>
          <input
            type="date"
            name="previousTpExpiryDate"
            value={form.previousTpExpiryDate || ""}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
              errors.previousTpExpiryDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.previousTpExpiryDate && <p className="text-red-500 text-xs mt-1">{errors.previousTpExpiryDate}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Auto-calculated: Start Date + Duration - 1 Day
            {form.previousPolicyStartDate && form.previousPolicyDuration && (
              <span className="text-green-600 font-medium"> ✓ Calculated - You can edit if needed</span>
            )}
          </p>
        </div>
      );
    }
    
    return null;
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

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Previous Policy Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Company */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Insurance Company
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
                onBlur={() => setTimeout(() => setShowInsuranceCompanySuggestions(false), 200)}
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
              Policy Number
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
              Policy Type
            </label>
            <select
              name="previousPolicyType"
              value={form.previousPolicyType || ""}
              onChange={handlePolicyTypeChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousPolicyType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select policy type</option>
              {policyTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.previousPolicyType && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyType}</p>}
          </div>

          {/* Policy Start Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Start Date
            </label>
            <input
              type="date"
              name="previousPolicyStartDate"
              value={form.previousPolicyStartDate || ""}
              onChange={handlePolicyStartDateChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.previousPolicyStartDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.previousPolicyStartDate && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyStartDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Policy coverage start date
            </p>
          </div>

          {/* Policy Duration */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Duration
            </label>
            <div className="relative">
              <input
                type="text"
                name="previousPolicyDuration"
                value={form.previousPolicyDuration || ""}
                onChange={handleDurationInputChange}
                onFocus={() => {
                  if (form.previousPolicyType) {
                    setDurationSuggestions(policyDurations);
                    setShowDurationSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowDurationSuggestions(false), 200)}
                placeholder={getDurationPlaceholder()}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.previousPolicyDuration ? "border-red-500" : "border-gray-300"
                } ${!form.previousPolicyType ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!form.previousPolicyType}
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
            {form.previousPolicyType && (
              <p className="text-xs text-purple-600 mt-1">
                {getPolicyTypeInfo()}
              </p>
            )}
          </div>

          {/* Expiry Date Fields - Dynamic based on policy type */}
          {renderExpiryDateFields()}

          {/* Claim Taken Last Year */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Claim Taken Last Year
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
              NCB Discount (%)
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
                onBlur={() => setTimeout(() => setShowNcbSuggestions(false), 200)}
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

          {/* NEW: Hypothecation Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Hypothecation
            </label>
            <div className="relative">
              <input
                type="text"
                name="previousHypothecation"
                value={form.previousHypothecation || ""}
                onChange={handleHypothecationChange}
                onFocus={() => {
                  if (form.previousHypothecation) {
                    const filtered = hypothecationBanks.filter(bank =>
                      bank.toLowerCase().includes(form.previousHypothecation.toLowerCase())
                    );
                    setHypothecationSuggestions(filtered);
                  } else {
                    setHypothecationSuggestions(hypothecationBanks);
                  }
                  setShowHypothecationSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowHypothecationSuggestions(false), 200)}
                placeholder="Type bank name or select Not Applicable"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.previousHypothecation ? "border-red-500" : "border-gray-300"
                }`}
              />
              
              {showHypothecationSuggestions && hypothecationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {hypothecationSuggestions.map((bank, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => selectHypothecation(bank)}
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.previousHypothecation && <p className="text-red-500 text-xs mt-1">{errors.previousHypothecation}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Select the bank if vehicle is financed, otherwise select "Not Applicable"
            </p>
          </div>
        </div>

        {/* NEW: Remarks Section for Previous Policy */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-700 mb-4">
            Remarks
          </h4>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Previous Policy Remarks
              </label>
              <textarea
                name="previousPolicyRemarks"
                value={form.previousPolicyRemarks || ""}
                onChange={handleChange}
                placeholder="Enter any remarks or notes for the previous policy..."
                rows={3}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.previousPolicyRemarks ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.previousPolicyRemarks && <p className="text-red-500 text-xs mt-1">{errors.previousPolicyRemarks}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Additional notes or comments about the previous policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const previousPolicyValidation = (form) => {
  const errors = {};
  const policyType = form.previousPolicyType;

  // Common validations for all policy types
  const commonValidations = {
    previousInsuranceCompany: !form.previousInsuranceCompany ? "Previous insurance company is required" : null,
    previousPolicyNumber: !form.previousPolicyNumber ? "Previous policy number is required" : null,
    previousPolicyType: !policyType ? "Previous policy type is required" : null,
    previousPolicyStartDate: !form.previousPolicyStartDate ? "Previous policy start date is required" : null,
    previousPolicyDuration: !form.previousPolicyDuration ? "Previous policy duration is required" : null,
    previousClaimTaken: !form.previousClaimTaken ? "Claim history is required" : null,
    previousNcbDiscount: !form.previousNcbDiscount ? "Previous NCB discount is required" : 
                        (parseFloat(form.previousNcbDiscount) < 0 || parseFloat(form.previousNcbDiscount) > 100) ? 
                        "NCB discount must be between 0% and 100%" : null
  };

  // Policy type specific validations
  const policySpecificValidations = {
    standalone: {
      previousPolicyEndDate: !form.previousPolicyEndDate ? "OD expiry date is required" : null
    },
    comprehensive: {
      previousPolicyEndDate: !form.previousPolicyEndDate ? "OD expiry date is required" : null,
      previousTpExpiryDate: !form.previousTpExpiryDate ? "TP expiry date is required" : null
    },
    thirdParty: {
      previousTpExpiryDate: !form.previousTpExpiryDate ? "TP expiry date is required" : null
    }
  };

  // Apply common validations
  Object.keys(commonValidations).forEach(key => {
    if (commonValidations[key]) {
      errors[key] = commonValidations[key];
    }
  });

  // Apply policy type specific validations
  if (policyType && policySpecificValidations[policyType]) {
    Object.keys(policySpecificValidations[policyType]).forEach(key => {
      if (policySpecificValidations[policyType][key]) {
        errors[key] = policySpecificValidations[policyType][key];
      }
    });
  }

  return errors;
};
// ================== STEP 4: Insurance Quotes ==================
const InsuranceQuotes = ({ form, handleChange, handleSave, isSaving, errors, onInsuranceQuotesUpdate, onQuoteAccepted, isEditMode = false }) => {

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isCoverageSuggestionsOpen, setIsCoverageSuggestionsOpen] = useState(false);
  const [quotes, setQuotes] = useState(() => {
    try {
      // Priority 1: Quotes from form (for edit mode)
      if (form.insuranceQuotes && form.insuranceQuotes.length > 0) {
        console.log("🔄 Loading quotes from form:", form.insuranceQuotes.length);
        console.log("📊 First quote details:", form.insuranceQuotes[0] ? {
          insuranceCompany: form.insuranceQuotes[0].insuranceCompany,
          ncbDiscount: form.insuranceQuotes[0].ncbDiscount,
          ncbDiscountAmount: form.insuranceQuotes[0].ncbDiscountAmount,
          policyDuration: form.insuranceQuotes[0].policyDuration,
          policyDurationLabel: form.insuranceQuotes[0].policyDurationLabel,
          odAmount: form.insuranceQuotes[0].odAmount,
          accepted: form.insuranceQuotes[0].accepted,
          // NEW: Debug IDV values
          idvBreakdown: {
            vehicleIdv: form.insuranceQuotes[0].vehicleIdv,
            cngIdv: form.insuranceQuotes[0].cngIdv,
            accessoriesIdv: form.insuranceQuotes[0].accessoriesIdv,
            totalIdv: form.insuranceQuotes[0].idv
          }
        } : 'No quotes');
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
  const [editingQuote, setEditingQuote] = useState(null);

  // NEW: State to track focused field for better UX
  const [focusedField, setFocusedField] = useState(null);

  // FIXED: Determine NCB eligibility - only claim-taken vehicles are ineligible
  const isNcbEligible = form.previousClaimTaken !== "yes";

  // NEW: Calculate step-up NCB for used cars with no claim
  const calculateStepUpNcb = () => {
    if (form.vehicleType === "new") {
      return "0"; // New vehicles start at 0%
    }
    
    if (form.previousClaimTaken === "yes") {
      return "0"; // Claim taken - NCB lost
    }
    
    // Used car with no claim - calculate step-up
    const previousNcb = parseInt(form.previousNcbDiscount) || 0;
    
    switch (previousNcb) {
      case 0: return "20";
      case 20: return "25";
      case 25: return "35";
      case 35: return "45";
      case 45: return "50";
      case 50: return "50"; // Max 50%
      default: return "20"; // Default step-up for unknown previous NCB
    }
  };

  // UPDATED: Set default NCB value based on claim status and vehicle type with step-up logic
  const getDefaultNcb = () => {
    return calculateStepUpNcb();
  };

  // UPDATED: Policy duration options based on coverage type only (vehicle type doesn't restrict)
  const getPolicyDurationOptions = (coverageType) => {
    if (coverageType === "standalone") {
      // Standalone OD - simple year options
      return [
        { value: "1", label: "1 Year" },
        { value: "2", label: "2 Years" },
        { value: "3", label: "3 Years" }
      ];
    } else if (coverageType === "thirdParty") {
      // Third Party - simple year options
      return [
        { value: "1", label: "1 Year" },
        { value: "2", label: "2 Years" },
        { value: "3", label: "3 Years" }
      ];
    } else if (coverageType === "comprehensive") {
      // UPDATED: Comprehensive - combined OD+TP options for ALL vehicles
      return [
        { value: "1yr OD + 1yr TP", label: "1yr OD + 1yr TP" },
        { value: "1yr OD + 3yr TP", label: "1yr OD + 3yr TP" },
        { value: "2yr OD + 3yr TP", label: "2yr OD + 3yr TP" },
        { value: "3yr OD + 3yr TP", label: "3yr OD + 3yr TP" },
      ];
    }
    return [];
  };

  // UPDATED: Set default policy duration based on coverage type
  const getDefaultPolicyDuration = (coverageType) => {
    if (coverageType === "standalone" || coverageType === "thirdParty") {
      return "1"; // Default to 1 Year for Standalone OD and Third Party
    }
    return "1yr OD + 3yr TP"; // Default for Comprehensive
  };

  const [manualQuote, setManualQuote] = useState({
    insuranceCompany: '',
    coverageType: 'comprehensive',
    vehicleIdv: '0', // NEW: Vehicle IDV field
    cngIdv: '0',     // NEW: CNG IDV field
    accessoriesIdv: '0', // NEW: Accessories IDV field
    idv: '0',        // Auto-calculated total IDV
    policyDuration: getDefaultPolicyDuration('comprehensive'),
    ncbDiscount: getDefaultNcb(),
    odAmount: '0',
    thirdPartyAmount: '0',
    addOnsAmount: '0',
    premium: '',
    addOns: {
      zeroDep: { selected: false, amount: '0', rate: '0' },
      consumables: { selected: false, amount: '0', rate: '0' },
      engineProtect: { selected: false, amount: '0', rate: '0' },
      roadSideAssist: { selected: false, amount: '0', rate: '0' },
      ncbProtection: { selected: false, amount: '0', rate: '0' },
      keyReplacement: { selected: false, amount: '0', rate: '0' },
      tyreProtection: { selected: false, amount: '0', rate: '0' },
      returnToInvoice: { selected: false, amount: '0', rate: '0' },
      driverCover: { selected: false, amount: '0', rate: '0' },
      passengerCover: { selected: false, amount: '0', rate: '0' },
      lossOfBelongings: { selected: false, amount: '0', rate: '0' },
      outstationCover: { selected: false, amount: '0', rate: '0' },
      batteryCover: { selected: false, amount: '0', rate: '0' } // Battery Cover addon
    }
  });

  // Updated insurance companies list without logos and background colors
  const insuranceCompanies = [
    "Acko General Insurance Limited",
    "Agriculture Insurance Company of India Limited",
    "Bajaj General Insurance Limited",
    "Cholamandalam MS General Insurance Company Limited",
    "ECGC Limited",
    "Generali Central Insurance Company Limited",
    "Go Digit General Insurance Limited",
    "HDFC ERGO General Insurance Company Limited",
    "ICICI Lombard General Insurance Company Limited",
    "IFFCO TOKIO General Insurance Company Limited",
    "Zurich Kotak General Insurance Company (India) Limited",
    "Kshema General Insurance Limited",
    "Liberty General Insurance Limited",
    "Magma General Insurance Limited",
    "National Insurance Company Limited",
    "Navi General Insurance Limited",
    "Raheja QBE General Insurance Co. Ltd.",
    "Reliance General Insurance Company Limited",
    "Royal Sundaram General Insurance Company Limited",
    "SBI General Insurance Company Limited",
    "Shriram General Insurance Company Limited",
    "Tata AIG General Insurance Company Limited",
    "The New India Assurance Company Limited",
    "The Oriental Insurance Company Limited",
    "United India Insurance Company Limited",
    "Universal Sompo General Insurance Company Limited",
    "Zuno General Insurance Ltd.",
    "Bharti Axa General Insurance Co. Ltd"
  ];

  // UPDATED: Update policy duration options when coverage type changes
  useEffect(() => {
    const newOptions = getPolicyDurationOptions(manualQuote.coverageType);
    
    // If current policy duration is not in new options, reset to default
    if (!newOptions.find(option => option.value === manualQuote.policyDuration)) {
      setManualQuote(prev => ({
        ...prev,
        policyDuration: getDefaultPolicyDuration(manualQuote.coverageType)
      }));
    }
  }, [manualQuote.coverageType]);

  // Handle coverage type changes
  useEffect(() => {
    if (manualQuote.coverageType === "standalone") {
      setManualQuote(prev => ({
        ...prev,
        thirdPartyAmount: "0",
        policyDuration: getDefaultPolicyDuration("standalone")
      }));
    }
  }, [manualQuote.coverageType]);

  // ============ NEW: IDV CALCULATION FUNCTIONS ============

  // Calculate total IDV from the 3 components
  const calculateTotalIdv = () => {
    const vehicleIdv = parseFloat(manualQuote.vehicleIdv || 0) || 0;
    const cngIdv = parseFloat(manualQuote.cngIdv || 0) || 0;
    const accessoriesIdv = parseFloat(manualQuote.accessoriesIdv || 0) || 0;
    
    return vehicleIdv + cngIdv + accessoriesIdv;
  };

  // Update total IDV whenever any of the component IDVs change
  useEffect(() => {
    const totalIdv = calculateTotalIdv();
    setManualQuote(prev => ({
      ...prev,
      idv: totalIdv.toString()
    }));
  }, [manualQuote.vehicleIdv, manualQuote.cngIdv, manualQuote.accessoriesIdv]);

  // ============ CORRECTED CALCULATION FUNCTIONS ============

  // Calculate add-ons total
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

  // Get included add-ons
  const getIncludedAddOns = () => {
    return Object.entries(manualQuote.addOns)
      .filter(([key, addOn]) => addOn.selected && parseFloat(addOn.amount || 0) === 0)
      .map(([key, addOn]) => addOnDescriptions[key]);
  };

  // Calculate base premium without GST for display
  const calculateBasePremium = () => {
    const odAmount = parseFloat(manualQuote.odAmount || 0) || 0;
    const thirdPartyAmount = parseFloat(manualQuote.thirdPartyAmount || 0) || 0;
    const addOnsTotal = calculateAddOnsTotal();
    
    return odAmount + thirdPartyAmount + addOnsTotal;
  };

  // Calculate GST amount for display - precise calculation
  const calculateGstAmount = () => {
    const basePremium = calculateBasePremium();
    const gstAmount = basePremium * 0.18;
    return Math.round(gstAmount);
  };

  // Calculate total premium with GST - precise calculation
  const calculateTotalPremium = () => {
    const basePremium = calculateBasePremium();
    const gstAmount = calculateGstAmount();
    return basePremium + gstAmount;
  };

  // Calculate current totals for display
  const currentBasePremium = calculateBasePremium();
  const currentGstAmount = calculateGstAmount();
  const currentTotalPremium = calculateTotalPremium();
  const currentAddOnsTotal = calculateAddOnsTotal();
  const currentTotalIdv = calculateTotalIdv();

  // ============ END CORRECTED CALCULATION FUNCTIONS ============

  // FIXED: Enhanced function to load quotes in edit mode with proper NCB and policy term
  const loadQuotesInEditMode = useCallback(() => {
    if (isEditMode && form.insuranceQuotes && form.insuranceQuotes.length > 0) {
      console.log("🔄 Loading quotes in edit mode:", form.insuranceQuotes.length);
      
      // Process each quote to ensure NCB and policy term are properly set
      const processedQuotes = form.insuranceQuotes.map(quote => {
        console.log("📊 Processing quote:", {
          insuranceCompany: quote.insuranceCompany,
          ncbDiscount: quote.ncbDiscount,
          ncbDiscountAmount: quote.ncbDiscountAmount,
          policyDuration: quote.policyDuration,
          policyDurationLabel: quote.policyDurationLabel,
          odAmount: quote.odAmount,
          accepted: quote.accepted, // Check if accepted flag exists
          // NEW: Debug IDV values
          idvBreakdown: {
            vehicleIdv: quote.vehicleIdv,
            cngIdv: quote.cngIdv,
            accessoriesIdv: quote.accessoriesIdv,
            totalIdv: quote.idv
          }
        });

        // Ensure policy duration label is set if missing
        let policyDurationLabel = quote.policyDurationLabel;
        if (!policyDurationLabel && quote.policyDuration) {
          // Try to find matching label from options
          const options = getPolicyDurationOptions(quote.coverageType);
          const matchedOption = options.find(opt => opt.value === quote.policyDuration);
          policyDurationLabel = matchedOption ? matchedOption.label : quote.policyDuration;
          console.log("📅 Set policy duration label:", policyDurationLabel);
        }

        return {
          ...quote,
          policyDurationLabel: policyDurationLabel || quote.policyDuration,
        };
      });

      console.log("✅ Processed quotes with NCB and policy term:", processedQuotes);

      // CRITICAL FIX: Find and set accepted quote - look for accepted flag
      const accepted = processedQuotes.find(quote => quote.accepted === true);
      console.log("🔍 Looking for accepted quote:", {
        found: !!accepted,
        acceptedQuote: accepted,
        allQuotes: processedQuotes.map(q => ({ company: q.insuranceCompany, accepted: q.accepted }))
      });
      
      if (accepted) {
        console.log("✅ Setting accepted quote in edit mode:", accepted.insuranceCompany);
        setAcceptedQuote(accepted);
        if (onQuoteAccepted) {
          onQuoteAccepted(accepted);
        }
      } else {
        console.log("❌ No accepted quote found in edit mode");
      }

      setQuotes(processedQuotes);
    }
  }, [isEditMode, form.insuranceQuotes, onQuoteAccepted]);

  // Load quotes when component mounts or form.insuranceQuotes changes
  useEffect(() => {
    console.log("🎯 InsuranceQuotes - Initial load debug:", {
      isEditMode,
      hasQuotes: form.insuranceQuotes?.length > 0,
      quotesCount: form.insuranceQuotes?.length,
      acceptedQuoteInForm: form.insuranceQuotes?.find(q => q.accepted)
    });
    
    loadQuotesInEditMode();
  }, [loadQuotesInEditMode, isEditMode, form.insuranceQuotes]);

  // NEW: Update manualQuote when claim status OR vehicle type OR previous NCB changes
  useEffect(() => {
    const newDefaultNcb = getDefaultNcb();
    console.log("🔄 NCB auto-update triggered:", {
      vehicleType: form.vehicleType,
      previousClaimTaken: form.previousClaimTaken,
      previousNcbDiscount: form.previousNcbDiscount,
      calculatedDefaultNcb: newDefaultNcb
    });
    
    setManualQuote(prev => ({
      ...prev,
      ncbDiscount: newDefaultNcb
    }));
  }, [form.previousClaimTaken, form.vehicleType, form.previousNcbDiscount]);

  // Save quotes to localStorage AND sync with parent form
  useEffect(() => {
    try {
      localStorage.setItem('insuranceQuotes', JSON.stringify(quotes));
      console.log("💾 Saved quotes to localStorage:", quotes.length);
    } catch (error) {
      console.error('Error saving quotes to localStorage:', error);
    }
  }, [quotes]);

  // FIXED: Optimized quote syncing to prevent infinite loops
  const prevQuotesRef = useRef([]);
  useEffect(() => {
    // Only sync if quotes actually changed and we have a callback
    if (onInsuranceQuotesUpdate && JSON.stringify(prevQuotesRef.current) !== JSON.stringify(quotes)) {
      console.log("🔄 Syncing quotes to parent (changed):", quotes.length);
      onInsuranceQuotesUpdate(quotes);
      prevQuotesRef.current = [...quotes];
    }
  }, [quotes, onInsuranceQuotesUpdate]);

  // Debug effect to track state
  useEffect(() => {
    console.log("🔍 InsuranceQuotes Debug State:", {
      quotesCount: quotes.length,
      acceptedQuote: acceptedQuote,
      isEditMode: isEditMode,
      formInsuranceQuotes: form.insuranceQuotes,
      formInsuranceQuotesAccepted: form.insuranceQuotes?.find(q => q.accepted),
      vehicleType: form.vehicleType,
      previousClaimTaken: form.previousClaimTaken,
      previousNcbDiscount: form.previousNcbDiscount,
      currentDefaultNcb: getDefaultNcb(),
      idvBreakdown: {
        vehicleIdv: manualQuote.vehicleIdv,
        cngIdv: manualQuote.cngIdv,
        accessoriesIdv: manualQuote.accessoriesIdv,
        totalIdv: manualQuote.idv
      }
    });
  }, [quotes, acceptedQuote, isEditMode, form.insuranceQuotes, form.vehicleType, form.previousClaimTaken, form.previousNcbDiscount, manualQuote.vehicleIdv, manualQuote.cngIdv, manualQuote.accessoriesIdv, manualQuote.idv]);

  // Updated add-on descriptions with Battery Cover
  const addOnDescriptions = {
    zeroDep: "Zero Depreciation",
    consumables: "Consumables",
    engineProtect: "Engine Protection",
    roadSideAssist: "Roadside Assistance",
    ncbProtection: "No Claim Bonus (NCB) Protection",
    keyReplacement: "Key Replacement",
    tyreProtection: "Tyre Protection",
    returnToInvoice: "Return to Invoice",
    driverCover: "Driver Cover",
    passengerCover: "Personal Accident Cover for Passengers",
    lossOfBelongings: "Loss of Personal Belongings",
    outstationCover: "Outstation Emergency Cover",
    batteryCover: "Battery Cover" // Battery Cover description
  };

  // NCB options
  const ncbOptions = [0, 20, 25, 35, 45, 50];

  // Coverage type options
  const coverageTypeOptions = [
    { value: 'comprehensive', label: 'Comprehensive' },
    { value: 'standalone', label: 'Stand Alone OD' },
    { value: 'thirdParty', label: 'Third Party' }
  ];

  // NEW: Enhanced input field handlers with better UX
  const handleManualQuoteChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent NCB changes if claim was taken
    if (name === "ncbDiscount" && form.previousClaimTaken === "yes") {
      return;
    }
    
    // Handle empty values for numeric fields - convert empty to "0" only when field loses focus
    let processedValue = value;
    
    setManualQuote(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // NEW: Enhanced focus handler for numeric fields
  const handleNumericFieldFocus = (fieldName) => {
    setFocusedField(fieldName);
    // When focusing on a field with "0" value, clear it for fresh input
    if (manualQuote[fieldName] === '0') {
      setManualQuote(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  // NEW: Enhanced blur handler for numeric fields
  const handleNumericFieldBlur = (fieldName) => {
    setFocusedField(null);
    // When blurring from a field with empty value, set it to "0"
    if (manualQuote[fieldName] === '') {
      setManualQuote(prev => ({
        ...prev,
        [fieldName]: '0'
      }));
    }
  };

  // NEW: Enhanced handler specifically for numeric fields
  const handleNumericFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and empty string for typing
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setManualQuote(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle add-on changes
  const handleAddOnChange = (addOnKey, field, value) => {
    setManualQuote(prev => {
      const updatedAddOns = { ...prev.addOns };
      
      if (field === 'selected') {
        updatedAddOns[addOnKey] = {
          ...updatedAddOns[addOnKey],
          selected: value,
          amount: updatedAddOns[addOnKey].amount || '0',
          rate: updatedAddOns[addOnKey].rate || '0'
        };
      } else {
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

  // NEW: Enhanced handler for add-on numeric fields
  const handleAddOnNumericFieldChange = (addOnKey, field, value) => {
    // Allow only numbers and empty string for typing
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleAddOnChange(addOnKey, field, value);
    }
  };

  // NEW: Enhanced focus handler for add-on numeric fields
  const handleAddOnNumericFieldFocus = (addOnKey, field) => {
    setFocusedField(`${addOnKey}-${field}`);
    // When focusing on a field with "0" value, clear it for fresh input
    if (manualQuote.addOns[addOnKey][field] === '0') {
      handleAddOnChange(addOnKey, field, '');
    }
  };

  // NEW: Enhanced blur handler for add-on numeric fields
  const handleAddOnNumericFieldBlur = (addOnKey, field) => {
    setFocusedField(null);
    // When blurring from a field with empty value, set it to "0"
    if (manualQuote.addOns[addOnKey][field] === '') {
      handleAddOnChange(addOnKey, field, '0');
    }
  };

  // Select all add-ons with 0 amount
  const selectAllAddOns = () => {
    setManualQuote(prev => {
      const updatedAddOns = { ...prev.addOns };
      Object.keys(updatedAddOns).forEach(key => {
        updatedAddOns[key] = {
          ...updatedAddOns[key],
          selected: true,
          amount: '0'
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

  // FIXED: Enhanced function to start editing a quote with proper IDV breakdown handling
  const startEditingQuote = (quote, index) => {
    console.log("✏️ Starting to edit quote:", {
      insuranceCompany: quote.insuranceCompany,
      ncbDiscount: quote.ncbDiscount,
      ncbDiscountAmount: quote.ncbDiscountAmount,
      policyDuration: quote.policyDuration,
      policyDurationLabel: quote.policyDurationLabel,
      odAmount: quote.odAmount,
      accepted: quote.accepted,
      // NEW: Debug IDV values
      idvBreakdown: {
        vehicleIdv: quote.vehicleIdv,
        cngIdv: quote.cngIdv,
        accessoriesIdv: quote.accessoriesIdv,
        totalIdv: quote.idv
      }
    });

    setEditingQuote({ ...quote, originalIndex: index });
    
    // Convert add-ons back to the manualQuote format
    const addOnsData = {};
    Object.keys(addOnDescriptions).forEach(key => {
      const addOnData = quote.selectedAddOns?.[key];
      addOnsData[key] = {
        selected: !!addOnData,
        amount: addOnData?.amount?.toString() || '0',
        rate: addOnData?.rate?.toString() || '0'
      };
    });

    // FIXED: Use the actual policy duration from the quote, not default
    const policyDuration = quote.policyDuration || getDefaultPolicyDuration(quote.coverageType);

    // FIXED: Properly handle IDV breakdown for ALL quotes - preserve individual IDV values
    // Always use the individual IDV values from the quote, never default to 0
    const vehicleIdv = quote.vehicleIdv || 0;
    const cngIdv = quote.cngIdv || 0;
    const accessoriesIdv = quote.accessoriesIdv || 0;

    console.log("🔧 IDV Breakdown for Editing:", {
      vehicleIdv,
      cngIdv,
      accessoriesIdv,
      totalIdv: quote.idv
    });

    setManualQuote({
      insuranceCompany: quote.insuranceCompany,
      coverageType: quote.coverageType || 'comprehensive',
      vehicleIdv: vehicleIdv.toString(),
      cngIdv: cngIdv.toString(),
      accessoriesIdv: accessoriesIdv.toString(),
      idv: quote.idv?.toString() || '0',
      policyDuration: policyDuration,
      ncbDiscount: quote.ncbDiscount?.toString() || getDefaultNcb(),
      odAmount: quote.odAmount?.toString() || '0',
      thirdPartyAmount: quote.thirdPartyAmount?.toString() || '0',
      addOnsAmount: quote.addOnsAmount?.toString() || '0',
      premium: quote.premium?.toString() || '',
      addOns: addOnsData
    });

    console.log("✅ Manual quote set for editing:", {
      insuranceCompany: quote.insuranceCompany,
      ncbDiscount: quote.ncbDiscount,
      policyDuration: policyDuration,
      odAmount: quote.odAmount,
      idvBreakdown: {
        vehicleIdv: vehicleIdv,
        cngIdv: cngIdv,
        accessoriesIdv: accessoriesIdv,
        totalIdv: quote.idv
      }
    });
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingQuote(null);
    resetManualQuoteForm();
  };

  // FIXED: Enhanced function to update an existing quote with proper IDV breakdown
  const updateQuote = () => {
    if (!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || parseFloat(manualQuote.idv) === 0) {
      alert("Please fill all required fields: Insurance Company, Coverage Type, and IDV (must be greater than 0)");
      return;
    }

    const addOnsPremium = calculateAddOnsTotal();
    
    const totalPremium = calculateTotalPremium();
    const basePremium = calculateBasePremium();
    const gstAmount = calculateGstAmount();

    // FIXED: Get the policy duration label from options
    const policyDurationOptions = getPolicyDurationOptions(manualQuote.coverageType);
    const policyDurationOption = policyDurationOptions.find(opt => opt.value === manualQuote.policyDuration);
    const policyDurationLabel = policyDurationOption ? policyDurationOption.label : manualQuote.policyDuration;

    // Prepare selected add-ons
    const selectedAddOns = Object.entries(manualQuote.addOns)
      .filter(([_, addOn]) => addOn.selected)
      .reduce((acc, [key, addOn]) => {
        acc[key] = {
          description: addOnDescriptions[key],
          amount: parseFloat(addOn.amount || 0) || 0,
          rate: parseFloat(addOn.rate || 0) || 0,
          included: parseFloat(addOn.amount || 0) === 0
        };
        return acc;
      }, {});

    const updatedQuote = {
      id: editingQuote.id,
      insuranceCompany: manualQuote.insuranceCompany,
      coverageType: manualQuote.coverageType,
      // FIXED: Preserve individual IDV values from the form
      vehicleIdv: parseFloat(manualQuote.vehicleIdv || 0) || 0,
      cngIdv: parseFloat(manualQuote.cngIdv || 0) || 0,
      accessoriesIdv: parseFloat(manualQuote.accessoriesIdv || 0) || 0,
      idv: parseFloat(manualQuote.idv || 0) || 0,
      policyDuration: manualQuote.policyDuration,
      policyDurationLabel: policyDurationLabel,
      ncbDiscount: parseInt(manualQuote.ncbDiscount),
      ncbDiscountAmount: 0,
      odAmount: parseFloat(manualQuote.odAmount || 0) || 0,
      thirdPartyAmount: parseFloat(manualQuote.thirdPartyAmount || 0) || 0,
      addOnsAmount: parseFloat(manualQuote.addOnsAmount || 0) || 0,
      premium: basePremium,
      gstAmount: gstAmount,
      totalPremium: totalPremium,
      addOnsPremium: addOnsPremium,
      selectedAddOns: selectedAddOns,
      includedAddOns: getIncludedAddOns(),
      createdAt: editingQuote.createdAt,
      updatedAt: new Date().toISOString(),
      accepted: editingQuote.accepted // Preserve accepted status
    };

    const updatedQuotes = [...quotes];
    updatedQuotes[editingQuote.originalIndex] = updatedQuote;
    
    console.log("✏️ Updating quote at index:", editingQuote.originalIndex);
    console.log("📊 Updated quote details with IDV breakdown:", {
      ncbDiscount: updatedQuote.ncbDiscount,
      policyDuration: updatedQuote.policyDuration,
      policyDurationLabel: updatedQuote.policyDurationLabel,
      accepted: updatedQuote.accepted,
      idvBreakdown: {
        vehicleIdv: updatedQuote.vehicleIdv,
        cngIdv: updatedQuote.cngIdv,
        accessoriesIdv: updatedQuote.accessoriesIdv,
        totalIdv: updatedQuote.idv
      }
    });
    
    setQuotes(updatedQuotes);
    
    // If the accepted quote was updated, update the acceptedQuote state
    if (acceptedQuote && acceptedQuote.id === editingQuote.id) {
      setAcceptedQuote(updatedQuote);
      if (onQuoteAccepted) {
        onQuoteAccepted(updatedQuote);
      }
    }
    
    setEditingQuote(null);
    resetManualQuoteForm();
  };

  // Reset manual quote form
  const resetManualQuoteForm = () => {
    setManualQuote({
      insuranceCompany: '',
      coverageType: 'comprehensive',
      vehicleIdv: '0',
      cngIdv: '0',
      accessoriesIdv: '0',
      idv: '0',
      policyDuration: getDefaultPolicyDuration('comprehensive'),
      ncbDiscount: getDefaultNcb(),
      odAmount: '0',
      thirdPartyAmount: '0',
      addOnsAmount: '0',
      premium: '',
      addOns: {
        zeroDep: { selected: false, amount: '0', rate: '0' },
        consumables: { selected: false, amount: '0', rate: '0' },
        engineProtect: { selected: false, amount: '0', rate: '0' },
        roadSideAssist: { selected: false, amount: '0', rate: '0' },
        ncbProtection: { selected: false, amount: '0', rate: '0' },
        keyReplacement: { selected: false, amount: '0', rate: '0' },
        tyreProtection: { selected: false, amount: '0', rate: '0' },
        returnToInvoice: { selected: false, amount: '0', rate: '0' },
        driverCover: { selected: false, amount: '0', rate: '0' },
        passengerCover: { selected: false, amount: '0', rate: '0' },
        lossOfBelongings: { selected: false, amount: '0', rate: '0' },
        outstationCover: { selected: false, amount: '0', rate: '0' },
        batteryCover: { selected: false, amount: '0', rate: '0' } // Battery Cover reset
      }
    });
  };

  // FIXED: Enhanced function to add manual quote with proper IDV breakdown
  const addManualQuote = () => {
    console.log("🔍 Add Quote Button Clicked - Current Values:", {
      insuranceCompany: manualQuote.insuranceCompany,
      coverageType: manualQuote.coverageType,
      vehicleIdv: manualQuote.vehicleIdv,
      cngIdv: manualQuote.cngIdv,
      accessoriesIdv: manualQuote.accessoriesIdv,
      totalIdv: manualQuote.idv,
      odAmount: manualQuote.odAmount,
      thirdPartyAmount: manualQuote.thirdPartyAmount,
      addOnsAmount: manualQuote.addOnsAmount,
      isInsuranceCompanyValid: !!manualQuote.insuranceCompany,
      isCoverageTypeValid: !!manualQuote.coverageType,
      isIdvValid: !!manualQuote.idv && parseFloat(manualQuote.idv) > 0,
      isButtonEnabled: !!(manualQuote.insuranceCompany && manualQuote.coverageType && manualQuote.idv && parseFloat(manualQuote.idv) > 0)
    });

    if (!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || parseFloat(manualQuote.idv) === 0) {
      alert("Please fill all required fields: Insurance Company, Coverage Type, and IDV (must be greater than 0)");
      return;
    }

    const addOnsPremium = calculateAddOnsTotal();
    const totalPremium = calculateTotalPremium();
    const basePremium = calculateBasePremium();
    const gstAmount = calculateGstAmount();

    // FIXED: Get the policy duration label from options
    const policyDurationOptions = getPolicyDurationOptions(manualQuote.coverageType);
    const policyDurationOption = policyDurationOptions.find(opt => opt.value === manualQuote.policyDuration);
    const policyDurationLabel = policyDurationOption ? policyDurationOption.label : manualQuote.policyDuration;

    // Prepare selected add-ons
    const selectedAddOns = Object.entries(manualQuote.addOns)
      .filter(([_, addOn]) => addOn.selected)
      .reduce((acc, [key, addOn]) => {
        acc[key] = {
          description: addOnDescriptions[key],
          amount: parseFloat(addOn.amount || 0) || 0,
          rate: parseFloat(addOn.rate || 0) || 0,
          included: parseFloat(addOn.amount || 0) === 0
        };
        return acc;
      }, {});

    const newQuote = {
      id: Date.now().toString(),
      insuranceCompany: manualQuote.insuranceCompany,
      coverageType: manualQuote.coverageType,
      // FIXED: Store individual IDV values for new quotes
      vehicleIdv: parseFloat(manualQuote.vehicleIdv || 0) || 0,
      cngIdv: parseFloat(manualQuote.cngIdv || 0) || 0,
      accessoriesIdv: parseFloat(manualQuote.accessoriesIdv || 0) || 0,
      idv: parseFloat(manualQuote.idv || 0) || 0,
      policyDuration: manualQuote.policyDuration,
      policyDurationLabel: policyDurationLabel,
      ncbDiscount: parseInt(manualQuote.ncbDiscount),
      ncbDiscountAmount: 0,
      odAmount: parseFloat(manualQuote.odAmount || 0) || 0,
      thirdPartyAmount: parseFloat(manualQuote.thirdPartyAmount || 0) || 0,
      addOnsAmount: parseFloat(manualQuote.addOnsAmount || 0) || 0,
      premium: basePremium,
      gstAmount: gstAmount,
      totalPremium: totalPremium,
      addOnsPremium: addOnsPremium,
      selectedAddOns: selectedAddOns,
      includedAddOns: getIncludedAddOns(),
      createdAt: new Date().toISOString(),
      accepted: false
    };

    const updatedQuotes = [...quotes, newQuote];
    console.log("➕ Adding new quote with IDV breakdown. Previous:", quotes.length, "New:", updatedQuotes.length);
    console.log("📊 Quote details with IDV breakdown:", {
      insuranceCompany: newQuote.insuranceCompany,
      totalPremium: newQuote.totalPremium,
      ncbDiscount: newQuote.ncbDiscount,
      policyDuration: newQuote.policyDuration,
      policyDurationLabel: newQuote.policyDurationLabel,
      accepted: newQuote.accepted,
      idvBreakdown: {
        vehicleIdv: newQuote.vehicleIdv,
        cngIdv: newQuote.cngIdv,
        accessoriesIdv: newQuote.accessoriesIdv,
        totalIdv: newQuote.idv
      }
    });
    setQuotes(updatedQuotes);
    resetManualQuoteForm();
  };

  // Remove quote
  const removeQuote = (index) => {
    console.log("🗑️ Removing quote at index:", index);
    const quoteToRemove = quotes[index];
    
    if (acceptedQuote && acceptedQuote.id === quoteToRemove.id) {
      unacceptQuote();
    }
    
    if (editingQuote && editingQuote.originalIndex === index) {
      cancelEditing();
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
      setEditingQuote(null);
      
      localStorage.removeItem('insuranceQuotes');
      
      if (onQuoteAccepted) {
        onQuoteAccepted(null);
      }
    }
  };

  // Function to accept a quote for policy creation
  const acceptQuote = (quote) => {
    // First, unaccept any currently accepted quote
    const updatedQuotes = quotes.map(q => ({
      ...q,
      accepted: q.id === quote.id // Only set the selected quote as accepted
    }));
    
    setQuotes(updatedQuotes);
    setAcceptedQuote(quote);
    
    console.log("✅ Quote accepted:", quote.insuranceCompany, "Premium: ₹" + quote.totalPremium);
    console.log("📊 Accepted quote details:", {
      ncbDiscount: quote.ncbDiscount,
      ncbDiscountAmount: quote.ncbDiscountAmount,
      policyDuration: quote.policyDuration,
      policyDurationLabel: quote.policyDurationLabel,
      accepted: true,
      idvBreakdown: {
        vehicleIdv: quote.vehicleIdv,
        cngIdv: quote.cngIdv,
        accessoriesIdv: quote.accessoriesIdv,
        totalIdv: quote.idv
      }
    });
    
    if (onQuoteAccepted) {
      onQuoteAccepted(quote);
    }
  };

  // Function to unaccept quote
  const unacceptQuote = () => {
    // Remove accepted status from all quotes
    const updatedQuotes = quotes.map(q => ({
      ...q,
      accepted: false
    }));
    
    setQuotes(updatedQuotes);
    setAcceptedQuote(null);
    console.log("❌ Quote unaccepted");
    
    if (onQuoteAccepted) {
      onQuoteAccepted(null);
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

  // Download all quotes as PDF
  const downloadAllQuotesPDF = () => {
    if (quotes.length === 0) {
      alert("No quotes available to download");
      return;
    }
    downloadQuotesPDF(quotes);
  };

  // Professional PDF generation function
  const downloadQuotesPDF = (quotesToDownload) => {
    try {
      setIsGenerating(true);
      
      PDFGenerationService.generateQuotesPDF(quotesToDownload, form);
      
      console.log("✅ Enhanced PDF generated and download triggered");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get display label for coverage type
  const getCoverageTypeLabel = (type) => {
    switch (type) {
      case 'comprehensive': return 'Comprehensive';
      case 'standalone': return 'Stand Alone OD';
      case 'thirdParty': return 'Third Party';
      default: return type;
    }
  };

  // Get current policy duration options based on coverage type
  const currentPolicyDurationOptions = getPolicyDurationOptions(manualQuote.coverageType);

  // NEW: Get NCB status message with step-up information
  const getNcbStatusMessage = () => {
    if (form.previousClaimTaken === "yes") {
      return {
        message: 'Not Eligible (Claim Taken)',
        description: 'Claim was taken in previous policy - NCB set to 0%',
        type: 'error'
      };
    }
    
    if (form.vehicleType === "new") {
      return {
        message: 'New Vehicle (Starts at 0%)',
        description: 'New vehicle starts at 0% NCB, but you can change it',
        type: 'info'
      };
    }
    
    // Used car with no claim - show step-up information
    const previousNcb = parseInt(form.previousNcbDiscount) || 0;
    const currentNcb = getDefaultNcb();
    
    return {
      message: `Eligible (Auto Step-up: ${previousNcb}% → ${currentNcb}%)`,
      description: `No claim in previous policy - NCB automatically stepped up from ${previousNcb}% to ${currentNcb}% (can be changed)`,
      type: 'success'
    };
  };

  const ncbStatus = getNcbStatusMessage();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Step 4: Insurance Quotes</h3>
          <p className="text-sm text-gray-500">
            Quotes: {quotes.length} | Required: At least 1 | {acceptedQuote ? `✅ ${acceptedQuote.insuranceCompany} Accepted` : '❌ No Quote Accepted'}
            {isEditMode && acceptedQuote && <span className="text-green-600 ml-2">• Loaded from saved data</span>}
            {editingQuote && <span className="text-blue-600 ml-2">• Editing Quote</span>}
          </p>
        </div>
        {/* <div className="flex gap-2">
          {quotes.length > 0 && (
            <button
              onClick={clearAllQuotes}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Quotes
            </button>
          )}
          {quotes.length > 0 && (
            <button
              onClick={downloadAllQuotesPDF}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              {isGenerating ? 'Generating...' : 'Download All PDF'}
            </button>
          )}
        </div> */}
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
      {/* {acceptedQuote && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Quote Accepted</h4>
                <p className="text-sm text-green-600">
                  {acceptedQuote.insuranceCompany} - ₹{acceptedQuote.totalPremium?.toLocaleString('en-IN')}
                  {acceptedQuote.ncbDiscount > 0 && ` (with ${acceptedQuote.ncbDiscount}% NCB)`}
                  {acceptedQuote.policyDurationLabel && ` - ${acceptedQuote.policyDurationLabel}`}
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
      )} */}

      {/* UPDATED: NCB Eligibility Status with Step-up Information */}
      {/* <div className={`mb-4 p-3 rounded-lg border ${
        ncbStatus.type === 'error' ? 'bg-red-50 border-red-200' : 
        ncbStatus.type === 'info' ? 'bg-blue-50 border-blue-200' : 
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              ncbStatus.type === 'error' ? 'text-red-700' : 
              ncbStatus.type === 'info' ? 'text-blue-700' : 
              'text-green-700'
            }`}>
              <strong>NCB Status:</strong> {ncbStatus.message}
            </p>
            <p className={`text-xs ${
              ncbStatus.type === 'error' ? 'text-red-600' : 
              ncbStatus.type === 'info' ? 'text-blue-600' : 
              'text-green-600'
            }`}>
              {ncbStatus.description}
            </p>
            {form.vehicleType === "used" && form.previousClaimTaken !== "yes" && (
              <p className="text-xs text-purple-600 mt-1 font-medium">
                Step-up Logic: 0→20% → 20→25% → 25→35% → 35→45% → 45→50%
              </p>
            )}
          </div>
          {form.previousClaimTaken === "yes" && (
            <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold">
              NCB LOST
            </div>
          )}
          {form.vehicleType === "new" && form.previousClaimTaken !== "yes" && (
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
              NEW VEHICLE
            </div>
          )}
          {form.vehicleType === "used" && form.previousClaimTaken !== "yes" && (
            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">
              NCB STEP-UP
            </div>
          )}
        </div>
      </div> */}

      {/* Add/Edit Quote Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {editingQuote ? `Edit Quote: ${editingQuote.insuranceCompany}` : 'Add New Quote'}
          </h3>
          {editingQuote && (
            <button
              onClick={cancelEditing}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
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
              
              {/* Dropdown suggestions - COMPLETELY REMOVED LOGOS */}
              {isSuggestionsOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {insuranceCompanies
                    .filter(company => 
                      company.toLowerCase().includes(manualQuote.insuranceCompany.toLowerCase())
                    )
                    .map((company, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setManualQuote(prev => ({
                            ...prev,
                            insuranceCompany: company
                          }));
                          setIsSuggestionsOpen(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <span>{company}</span>
                      </div>
                    ))
                  }
                  
                  {/* No results message */}
                  {insuranceCompanies.filter(company => 
                    company.toLowerCase().includes(manualQuote.insuranceCompany.toLowerCase())
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
                value={getCoverageTypeLabel(manualQuote.coverageType)}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  if (value.includes('comp') || value.includes('comp')) {
                    setManualQuote(prev => ({ ...prev, coverageType: 'comprehensive' }));
                  } else if (value.includes('stand') || value.includes('alone')) {
                    setManualQuote(prev => ({ ...prev, coverageType: 'standalone' }));
                  } else if (value.includes('third') || value.includes('3rd')) {
                    setManualQuote(prev => ({ ...prev, coverageType: 'thirdParty' }));
                  }
                }}
                onFocus={() => setIsCoverageSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setIsCoverageSuggestionsOpen(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type Comprehensive, Stand Alone, or Third Party"
              />
              
              {/* Dropdown suggestions */}
              {isCoverageSuggestionsOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {coverageTypeOptions.map(option => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setManualQuote(prev => ({ ...prev, coverageType: option.value }));
                        setIsCoverageSuggestionsOpen(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* NEW: Vehicle IDV Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle IDV (₹) <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <INRCurrencyInput
              type="number"
              name="vehicleIdv"
              value={manualQuote.vehicleIdv}
              onChange={handleNumericFieldChange}
              onFocus={() => handleNumericFieldFocus('vehicleIdv')}
              onBlur={() => handleNumericFieldBlur('vehicleIdv')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter Vehicle IDV (optional)"
            />
          </div>

          {/* NEW: CNG IDV Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNG IDV (₹) <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <INRCurrencyInput
              type="number"
              name="cngIdv"
              value={manualQuote.cngIdv}
              onChange={handleNumericFieldChange}
              onFocus={() => handleNumericFieldFocus('cngIdv')}
              onBlur={() => handleNumericFieldBlur('cngIdv')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter CNG IDV (optional)"
            />
          </div>

          {/* NEW: Accessories IDV Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accessories IDV (₹) <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <INRCurrencyInput
              type="number"
              name="accessoriesIdv"
              value={manualQuote.accessoriesIdv}
              onChange={handleNumericFieldChange}
              onFocus={() => handleNumericFieldFocus('accessoriesIdv')}
              onBlur={() => handleNumericFieldBlur('accessoriesIdv')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter Accessories IDV (optional)"
            />
          </div>

          {/* Auto-calculated Total IDV Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total IDV (₹) *
            </label>
            <INRCurrencyInput
              type="number"
              name="idv"
              value={manualQuote.idv}
              onChange={handleNumericFieldChange}
              onFocus={() => handleNumericFieldFocus('idv')}
              onBlur={() => handleNumericFieldBlur('idv')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              placeholder="Auto-calculated Total IDV"
              readOnly
            />
            {/* <p className="text-xs text-purple-600 mt-1">
              Auto-calculated: Vehicle + CNG + Accessories
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current: ₹{currentTotalIdv.toLocaleString('en-IN')}
            </p> */}
          </div>

          {/* UPDATED: Policy Duration - Now fully editable for all vehicle types and coverage types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Duration *
            </label>
            <select
              name="policyDuration"
              value={manualQuote.policyDuration}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {currentPolicyDurationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* UPDATED: Info text based on coverage type only */}
            {/* {manualQuote.coverageType === "standalone" && (
              <p className="text-xs text-purple-600 mt-1">
                Stand Alone OD: 1, 2, or 3 year options available
              </p>
            )}
            {manualQuote.coverageType === "thirdParty" && (
              <p className="text-xs text-orange-600 mt-1">
                Third Party: 1, 2, or 3 year options available
              </p>
            )}
            {manualQuote.coverageType === "comprehensive" && (
              <p className="text-xs text-blue-600 mt-1">
                Comprehensive: 1yr OD + 1yr TP, 1yr OD + 3yr TP, 2yr OD + 3yr TP, 3yr OD + 3yr TP options available for all vehicles
              </p>
            )} */}
          </div>

          {/* UPDATED: NCB Discount with step-up information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NCB Discount (%)
            </label>
            <select
              name="ncbDiscount"
              value={manualQuote.ncbDiscount}
              onChange={handleManualQuoteChange}
              disabled={form.previousClaimTaken === "yes"}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                form.previousClaimTaken === "yes"
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'border-gray-300'
              }`}
            >
              {ncbOptions.map(ncb => (
                <option key={ncb} value={ncb}>
                  {ncb}% {
                    form.previousClaimTaken === "yes" && ncb === 0 ? '(Auto-set - Claim Taken)' :
                    form.vehicleType === "new" && ncb === 0 ? '(New Vehicle Default)' :
                    form.vehicleType === "used" && ncb.toString() === getDefaultNcb() ? '(Auto Step-up)' :
                    ''
                  }
                </option>
              ))}
            </select>
            {/* {form.previousClaimTaken === "yes" && (
              <p className="text-xs text-red-600 mt-1">
                NCB disabled - claim was taken in previous policy
              </p>
            )}
            {form.vehicleType === "new" && form.previousClaimTaken !== "yes" && (
              <p className="text-xs text-blue-600 mt-1">
                New vehicle - you can set NCB percentage (starts at 0%)
              </p>
            )}
            {form.vehicleType === "used" && form.previousClaimTaken !== "yes" && (
              <p className="text-xs text-green-600 mt-1">
                Auto step-up applied from previous NCB. You can change if needed.
              </p>
            )} */}
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
              onChange={handleNumericFieldChange}
              onFocus={() => handleNumericFieldFocus('odAmount')}
              onBlur={() => handleNumericFieldBlur('odAmount')}
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
              onChange={handleNumericFieldChange}
              onFocus={() => handleNumericFieldFocus('thirdPartyAmount')}
              onBlur={() => handleNumericFieldBlur('thirdPartyAmount')}
              disabled={manualQuote.coverageType === "standalone"}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                manualQuote.coverageType === "standalone"
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300'
              }`}
              placeholder={
                manualQuote.coverageType === "standalone" 
                  ? "Auto-set to 0 for Stand Alone OD" 
                  : "Enter 3rd party amount (optional)"
              }
            />
            {manualQuote.coverageType === "standalone" && (
              <p className="text-xs text-blue-500 mt-1">
                Third Party amount set to 0 for Stand Alone OD coverage
              </p>
            )}
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
              onChange={handleNumericFieldChange}
              onFocus={() => handleNumericFieldFocus('addOnsAmount')}
              onBlur={() => handleNumericFieldBlur('addOnsAmount')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter add-ons amount (optional)"
            />
          </div>

          {/* Add-ons Input Fields */}
          <div className="col-span-full">
  <div className="flex justify-between items-center mb-3">
    <h4 className="text-md font-semibold text-gray-800">Additional Add-ons (Optional)</h4>
    <div className="flex gap-2">
      <button
        onClick={selectAllAddOns}
        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
      >
        Select All (₹0)
      </button>
      <button
        onClick={deselectAllAddOns}
        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
      >
        Deselect All
      </button>
    </div>
  </div>
  <p className="text-xs text-gray-600 mb-3">
    Select add-ons with ₹0 amount to include them without charges, or enter custom amounts for premium calculation.
  </p>
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
    {Object.entries(addOnDescriptions).map(([key, description]) => (
      <div key={key} className="flex items-start space-x-2 p-2 border border-gray-200 rounded-md bg-white hover:border-purple-300 transition-colors">
        <input
          type="checkbox"
          checked={manualQuote.addOns[key].selected}
          onChange={(e) => handleAddOnChange(key, 'selected', e.target.checked)}
          className="w-3 h-3 text-purple-600 rounded focus:ring-purple-500 mt-1 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-700 block mb-1 leading-tight">
            {description}
          </label>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 whitespace-nowrap">Amount:</label>
            <INRCurrencyInput
              type="number"
              value={manualQuote.addOns[key].amount}
              onChange={(e) => handleAddOnNumericFieldChange(key, 'amount', e.target.value)}
              onFocus={() => handleAddOnNumericFieldFocus(key, 'amount')}
              onBlur={() => handleAddOnNumericFieldBlur(key, 'amount')}
              className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="0"
              disabled={!manualQuote.addOns[key].selected}
            />
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

          {/* CORRECTED Premium Summary */}
          <div className="col-span-full bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Base Premium:</span>
                <div className="font-semibold text-lg">₹{currentBasePremium.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">
                  OD: ₹{(parseFloat(manualQuote.odAmount || 0) || 0).toLocaleString('en-IN')} + 
                  3P: ₹{(parseFloat(manualQuote.thirdPartyAmount || 0) || 0).toLocaleString('en-IN')} + 
                  Add-ons: ₹{currentAddOnsTotal.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Add-ons Total:</span>
                <div className="font-semibold text-lg text-purple-600">₹{currentAddOnsTotal.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">(Individual + Add-ons field)</div>
              </div>
              <div>
                <span className="text-gray-600">NCB Discount:</span>
                <div className="font-semibold text-lg text-green-600">-₹0</div>
                <div className="text-xs text-gray-500">(NCB percentage shown for reference only)</div>
              </div>
              <div>
                <span className="text-gray-600">GST (18%):</span>
                <div className="font-semibold text-lg text-blue-600">₹{currentGstAmount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">
                  On ₹{currentBasePremium.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Total Premium:</span>
                <div className="font-semibold text-lg text-green-600">₹{currentTotalPremium.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">
                  (₹{currentBasePremium.toLocaleString('en-IN')} + ₹{currentGstAmount.toLocaleString('en-IN')})
                </div>
              </div>
            </div>
            
            {/* NEW: IDV Breakdown */}
            <div className="mt-4 pt-4 border-t border-purple-200">
              <h6 className="text-sm font-semibold text-purple-700 mb-3">IDV Breakdown</h6>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Vehicle IDV:</span>
                  <div>₹{(parseFloat(manualQuote.vehicleIdv || 0) || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">CNG IDV:</span>
                  <div>₹{(parseFloat(manualQuote.cngIdv || 0) || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Accessories IDV:</span>
                  <div>₹{(parseFloat(manualQuote.accessoriesIdv || 0) || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold">Total IDV:</span>
                  <div className="font-semibold">₹{currentTotalIdv.toLocaleString('en-IN')}</div>
                </div>
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
                  <span className="text-gray-500">3rd Party Amount:</span>
                  <div>₹{(parseFloat(manualQuote.thirdPartyAmount || 0) || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Add-ons Total:</span>
                  <div>₹{currentAddOnsTotal.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Taxable Amount:</span>
                  <div>₹{((parseFloat(manualQuote.odAmount || 0) || 0) + (parseFloat(manualQuote.thirdPartyAmount || 0) || 0) + currentAddOnsTotal).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Update Quote Button */}
        {editingQuote ? (
          <button
            onClick={updateQuote}
            disabled={!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || parseFloat(manualQuote.idv) === 0}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Edit className="w-5 h-5 mr-2" />
            Update Quote
          </button>
        ) : (
          <button
            onClick={addManualQuote}
            disabled={!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || parseFloat(manualQuote.idv) === 0}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
            title={
              !manualQuote.insuranceCompany ? "Insurance Company is required" :
              !manualQuote.coverageType ? "Coverage Type is required" :
              !manualQuote.idv || parseFloat(manualQuote.idv) === 0 ? "IDV is required and must be greater than 0" :
              "Add Quote"
            }
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Quote
          </button>
        )}
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
              const isExpanded = expandedQuotes.includes(index);
              const isAccepted = acceptedQuote && acceptedQuote.id === quote.id;
              const isBeingEdited = editingQuote && editingQuote.id === quote.id;
              
              // Separate included add-ons (amount = 0) from premium add-ons (amount > 0)
              const premiumAddOns = Object.entries(quote.selectedAddOns || {})
                .filter(([_, addOn]) => addOn.amount > 0);
              const includedAddOns = Object.entries(quote.selectedAddOns || {})
                .filter(([_, addOn]) => addOn.amount === 0);
              
              return (
                <div key={index} className={`border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white ${
                  isAccepted ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                } ${isBeingEdited ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                  {/* Quote Header - COMPLETELY REMOVED LOGOS */}
                  <div 
                    className="p-4 text-white relative bg-blue-600"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedQuotes.includes(index)}
                          onChange={() => toggleQuoteSelection(index)}
                          className="w-5 h-5 text-white bg-white rounded border-white"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-lg">{quote.insuranceCompany}</h4>
                            {isAccepted && (
                              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                ACCEPTED
                              </span>
                            )}
                            {isBeingEdited && (
                              <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                                <Edit className="w-3 h-3 mr-1" />
                                EDITING
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm opacity-90">
                            <span>IDV: ₹{quote.idv?.toLocaleString('en-IN')}</span>
                            <span>•</span>
                            <span>{quote.policyDurationLabel || quote.policyDuration}</span>
                            <span>•</span>
                            <span>NCB: {quote.ncbDiscount}%</span>
                            {form.previousClaimTaken === "yes" && (
                              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                NCB LOST
                              </span>
                            )}
                            {form.vehicleType === "new" && form.previousClaimTaken !== "yes" && (
                              <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                NEW VEHICLE
                              </span>
                            )}
                            {form.vehicleType === "used" && form.previousClaimTaken !== "yes" && (
                              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                STEP-UP NCB
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
                        {!isAccepted && !isBeingEdited && (
                          <button
                            onClick={() => acceptQuote(quote)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Accept Quote
                          </button>
                        )}
                        {!isBeingEdited && (
                          <button
                            onClick={() => startEditingQuote(quote, index)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Edit
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
                            
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">3rd Party Amount</span>
                              <span className="font-semibold">₹{quote.thirdPartyAmount?.toLocaleString('en-IN')}</span>
                            </div>

                            {/* Add-ons Amount Field */}
                            {quote.addOnsAmount > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Additional Add-ons</span>
                                <span className="font-semibold text-purple-600">+₹{quote.addOnsAmount?.toLocaleString('en-IN')}</span>
                              </div>
                            )}

                            {/* Premium Add-ons (with amount > 0) */}
                            {premiumAddOns.length > 0 && (
                              <div className="pt-2 border-t">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-gray-600">Premium Add-ons</span>
                                  <span className="font-semibold text-purple-600">+₹{(quote.addOnsPremium - quote.addOnsAmount).toLocaleString('en-IN')}</span>
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
                              <span className="font-semibold">₹{(quote.odAmount + quote.thirdPartyAmount + quote.addOnsPremium).toLocaleString('en-IN')}</span>
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
                              <span className="font-semibold">{quote.policyDurationLabel || quote.policyDuration}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coverage Type</span>
                              <span className="font-semibold">{getCoverageTypeLabel(quote.coverageType)}</span>
                            </div>
                            
                            {/* NEW: IDV Breakdown in Quote Details */}
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vehicle IDV</span>
                                <span className="font-semibold">₹{quote.vehicleIdv?.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">CNG IDV</span>
                                <span className="font-semibold">₹{quote.cngIdv?.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Accessories IDV</span>
                                <span className="font-semibold">₹{quote.accessoriesIdv?.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="text-gray-600 font-semibold">Total IDV</span>
                                <span className="font-semibold text-purple-600">₹{quote.idv?.toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            {/* NCB Information in Coverage Details - Only show the percentage, not the amount */}
                            <div className="flex justify-between">
                              <span className="text-gray-600">NCB Discount</span>
                              <span className="font-semibold text-green-600">{quote.ncbDiscount}%</span>
                            </div>

                            {/* NEW: Show step-up information for used cars */}
                            {form.vehicleType === "used" && form.previousClaimTaken !== "yes" && (
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-gray-600">NCB Step-up</span>
                                <span className="font-semibold text-green-600">
                                  {form.previousNcbDiscount || 0}% → {quote.ncbDiscount}%
                                </span>
                              </div>
                            )}

                            {/* Add-ons Amount Field Display */}
                            {quote.addOnsAmount > 0 && (
                              <div className="pt-2">
                                <div className="text-purple-600 font-medium mb-2">Additional Add-ons</div>
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                                    Additional Coverage: ₹{quote.addOnsAmount.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            )}

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
                                    >
                                      {addOn.description} (₹{addOn.amount.toLocaleString('en-IN')})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Object.keys(quote.selectedAddOns || {}).length === 0 && quote.addOnsAmount === 0 && (
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
  const [insuranceCompanySuggestions, setInsuranceCompanySuggestions] = useState([]);
  const [showInsuranceCompanySuggestions, setShowInsuranceCompanySuggestions] = useState(false);
  const insuranceCompanies = [
    "Acko General Insurance Limited",
    "Agriculture Insurance Company of India Limited",
    "Bajaj General Insurance Limited",
    "Cholamandalam MS General Insurance Company Limited",
    "ECGC Limited",
    "Generali Central Insurance Company Limited",
    "Go Digit General Insurance Limited",
    "HDFC ERGO General Insurance Company Limited",
    "ICICI Lombard General Insurance Company Limited",
    "IFFCO TOKIO General Insurance Company Limited",
    "Zurich Kotak General Insurance Company (India) Limited",
    "Kshema General Insurance Limited",
    "Liberty General Insurance Limited",
    "Magma General Insurance Limited",
    "National Insurance Company Limited",
    "Navi General Insurance Limited",
    "Raheja QBE General Insurance Co. Ltd.",
    "Reliance General Insurance Company Limited",
    "Royal Sundaram General Insurance Company Limited",
    "SBI General Insurance Company Limited",
    "Shriram General Insurance Company Limited",
    "Tata AIG General Insurance Company Limited",
    "The New India Assurance Company Limited",
    "The Oriental Insurance Company Limited",
    "United India Insurance Company Limited",
    "Universal Sompo General Insurance Company Limited",
    "Zuno General Insurance Ltd. ",
    "Bharti Axa General Insurance Co. Ltd"
  ];

  // NCB options dropdown (same as InsuranceQuotes)
  const ncbOptions = [0, 20, 25, 35, 45, 50];

  // Policy type options
  const policyTypeOptions = [
    { value: "comprehensive", label: "Comprehensive" },
    { value: "standalone", label: "Stand Alone OD" },
    { value: "thirdParty", label: "Third Party" }
  ];

  // Hypothecation Bank options
 const hypothecationBanks = [
    "Not Applicable",
    "AU Small Finance Bank",
    "Aditya Birla Finance",
    "Axis Bank",
    "Bajaj Finance",
    "Bandhan Bank",
    "Bank of Baroda",
    "Bank of India",
    "Bank of Maharashtra",
    "Berar Finance",
    "Canara Bank",
    "Capri Global Capital",
    "Central Bank of India",
    "Cholamandalam Investment & Finance",
    "City Union Bank",
    "Clix Capital",
    "DCB Bank",
    "DMI Finance",
    "Dhanlaxmi Bank",
    "ESAF Small Finance Bank",
    "Electronica Finance",
    "Equitas Small Finance Bank",
    "Esskay Fincorp",
    "Federal Bank",
    "Fullerton India (SMFG India Credit)",
    "HDB Financial Services",
    "HDFC Bank",
    "Hero FinCorp",
    "Hinduja Leyland Finance",
    "ICICI Bank",
    "IDBI Bank",
    "IDFC FIRST Bank",
    "IIFL Finance",
    "InCred Financial Services",
    "Indian Bank",
    "Indian Overseas Bank",
    "IndusInd Bank",
    "JM Financial Products",
    "Jammu & Kashmir Bank",
    "Jana Small Finance Bank",
    "Karnataka Bank",
    "Karur Vysya Bank",
    "Kotak Mahindra Bank",
    "Kotak Mahindra Prime",
    "L&T Finance",
    "MAS Financial Services",
    "Mahindra & Mahindra Financial Services",
    "Manappuram Finance",
    "Muthoot Capital Services",
    "Muthoot Finance",
    "Navi Finserv",
    "Northern Arc Capital",
    "Piramal Capital & Housing Finance",
    "Poonawalla Fincorp",
    "Punjab & Sind Bank",
    "Punjab National Bank",
    "RBL Bank",
    "Shriram Finance",
    "South Indian Bank",
    "State Bank of India",
    "Sundaram Finance",
    "Suryoday Small Finance Bank",
    "TVS Credit Services",
    "Tata Capital Financial Services",
    "Tata Motors Finance",
    "Toyota Financial Services India",
    "U GRO Capital",
    "UCO Bank",
    "Ujjivan Small Finance Bank",
    "Union Bank of India",
    "Veritas Finance",
    "Vistaar Financial Services",
    "Vivriti Capital",
    "Volkswagen Finance Private Limited",
    "WheelsEMI Private Limited",
    "YES Bank",
];

  // State for auto-suggest
  const [hypothecationSuggestions, setHypothecationSuggestions] = useState([]);
  const [showHypothecationSuggestions, setShowHypothecationSuggestions] = useState(false);

  // UPDATED: Policy duration options based on vehicle type and policy type
  const getPolicyDurationOptions = (vehicleType, policyType) => {
    if (policyType === "standalone") {
      // Standalone OD - simple year options
      return [
        { value: "1", label: "1 Year", odYears: 1, tpYears: 0, isSimple: true, expiryType: "od" },
        { value: "2", label: "2 Years", odYears: 2, tpYears: 0, isSimple: true, expiryType: "od" },
        { value: "3", label: "3 Years", odYears: 3, tpYears: 0, isSimple: true, expiryType: "od" }
      ];
    } else if (policyType === "thirdParty") {
      // Third Party - simple year options
      return [
        { value: "1", label: "1 Year", odYears: 0, tpYears: 1, isSimple: true, expiryType: "tp" },
        { value: "2", label: "2 Years", odYears: 0, tpYears: 2, isSimple: true, expiryType: "tp" },
        { value: "3", label: "3 Years", odYears: 0, tpYears: 3, isSimple: true, expiryType: "tp" }
      ];
    } else if (policyType === "comprehensive") {
      // UPDATED: Comprehensive policies for BOTH new and used vehicles - combined OD+TP options
      return [
        { value: "1yr_od_1yr_tp", label: "1yr OD + 1yr TP", odYears: 1, tpYears: 1, isSimple: false, expiryType: "both" },
        { value: "1", label: "1yr OD + 3yr TP", odYears: 1, tpYears: 3, isSimple: false, expiryType: "both" },
        { value: "2", label: "2yr OD + 3yr TP", odYears: 2, tpYears: 3, isSimple: false, expiryType: "both" },
        { value: "3", label: "3yr OD + 3yr TP", odYears: 3, tpYears: 3, isSimple: false, expiryType: "both" }
      ];
    } else {
      // Fallback for any other cases
      return [
        { value: "1", label: "1 Year", odYears: 1, tpYears: 1, isSimple: true, expiryType: "both" }
      ];
    }
  };

  const policyDurationOptions = getPolicyDurationOptions(form.vehicleType, form.policyType);

  // Track the last accepted quote to detect changes
  const [lastAcceptedQuoteId, setLastAcceptedQuoteId] = useState(null);

  // Function to calculate expiry date based on policy start date and years (with -1 day)
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
    
    const odExpiry = selectedOption.odYears > 0 ? calculateExpiryDate(policyStartDate, selectedOption.odYears) : '';
    const tpExpiry = selectedOption.tpYears > 0 ? calculateExpiryDate(policyStartDate, selectedOption.tpYears) : '';
    
    return { odExpiry, tpExpiry };
  };

  // Check if current duration is simple (single expiry)
  const isSimpleDuration = () => {
    const selectedOption = policyDurationOptions.find(opt => opt.value === form.insuranceDuration);
    return selectedOption ? selectedOption.isSimple : false;
  };

  // Get expiry type for current selection
  const getExpiryType = () => {
    const selectedOption = policyDurationOptions.find(opt => opt.value === form.insuranceDuration);
    return selectedOption ? selectedOption.expiryType : 'both';
  };

  // Handle policy type change
  const handlePolicyTypeChange = (e) => {
    const policyType = e.target.value;
    handleChange(e);
    
    // Reset duration when policy type changes
    handleChange({
      target: {
        name: 'insuranceDuration',
        value: ''
      }
    });
    
    // Reset expiry dates
    handleChange({
      target: { name: 'odExpiryDate', value: '' }
    });
    handleChange({
      target: { name: 'tpExpiryDate', value: '' }
    });
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
          const expiryType = getExpiryType();
          
          if (expiryType === 'od' || expiryType === 'both') {
            handleChange({
              target: { name: 'odExpiryDate', value: odExpiry }
            });
          }
          if (expiryType === 'tp' || expiryType === 'both') {
            handleChange({
              target: { name: 'tpExpiryDate', value: tpExpiry }
            });
          }
        }
      }
    }
  };

  // UPDATED: Handle policy start date change - auto-calculate expiry dates (removed validation)
  const handlePolicyStartDateChange = (e) => {
    const startDate = e.target.value;
    
    // REMOVED: The validation that prevented start date from being before issue date
    
    handleChange(e);
    
    // Auto-calculate expiry dates if duration exists
    if (startDate && form.insuranceDuration) {
      const { odExpiry, tpExpiry } = calculateSeparateExpiryDates(startDate, form.insuranceDuration);
      const expiryType = getExpiryType();
      
      // Set OD expiry for OD-only or both policies
      if (expiryType === 'od' || expiryType === 'both') {
        handleChange({
          target: { name: 'odExpiryDate', value: odExpiry }
        });
      }
      
      // Set TP expiry for TP-only or both policies
      if (expiryType === 'tp' || expiryType === 'both') {
        handleChange({
          target: { name: 'tpExpiryDate', value: tpExpiry }
        });
      }
    }
  };

  // Handle insurance duration change - auto-calculate expiry dates
  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    handleChange(e);
    
    // Auto-calculate expiry dates if policy start date exists
    if (form.policyStartDate && newDuration) {
      const { odExpiry, tpExpiry } = calculateSeparateExpiryDates(form.policyStartDate, newDuration);
      const expiryType = getExpiryType();
      
      // Set OD expiry for OD-only or both policies
      if (expiryType === 'od' || expiryType === 'both') {
        handleChange({
          target: { name: 'odExpiryDate', value: odExpiry }
        });
      } else {
        // Clear OD expiry for TP-only policies
        handleChange({
          target: { name: 'odExpiryDate', value: '' }
        });
      }
      
      // Set TP expiry for TP-only or both policies
      if (expiryType === 'tp' || expiryType === 'both') {
        handleChange({
          target: { name: 'tpExpiryDate', value: tpExpiry }
        });
      } else {
        // Clear TP expiry for OD-only policies
        handleChange({
          target: { name: 'tpExpiryDate', value: '' }
        });
      }
    }
  };

  // FIXED: Enhanced function to get duration value from accepted quote with proper mapping
  const getDurationValueFromQuote = (quote, vehicleType, policyType) => {
    console.log("🔄 Mapping duration from quote:", {
      quotePolicyDuration: quote.policyDuration,
      quotePolicyDurationType: typeof quote.policyDuration,
      vehicleType: vehicleType,
      policyType: policyType,
      coverageType: quote.coverageType
    });

    if (!quote || !quote.policyDuration) {
      console.log("❌ No quote or policy duration found");
      return "";
    }

    // Get the current duration options based on policy type
    const currentOptions = getPolicyDurationOptions(vehicleType, policyType);
    console.log("📋 Available duration options:", currentOptions);

    // FIX: Convert to string to prevent .includes() error
    const quoteDuration = String(quote.policyDuration);
    console.log("🔤 Converted quoteDuration to string:", quoteDuration);

    // First, try exact match with value
    const exactMatch = currentOptions.find(opt => opt.value === quoteDuration);
    if (exactMatch) {
      console.log("✅ Exact match found:", exactMatch.value);
      return exactMatch.value;
    }

    // For comprehensive policies, handle both simple numbers and combined formats
    if (policyType === "comprehensive") {
      // If quote has simple number, map to comprehensive options
      if (["1", "2", "3"].includes(quoteDuration)) {
        const comprehensiveMap = {
          "1": "1", // 1yr OD + 3yr TP
          "2": "2", // 2yr OD + 3yr TP  
          "3": "3"  // 3yr OD + 3yr TP
        };
        const mappedValue = comprehensiveMap[quoteDuration];
        if (mappedValue && currentOptions.find(opt => opt.value === mappedValue)) {
          console.log("🔄 Mapped simple duration to comprehensive:", quoteDuration, "→", mappedValue);
          return mappedValue;
        }
      }
      
      // FIX: Check if string before using .includes()
      if (quoteDuration.includes("yr OD") || quoteDuration.includes("year OD")) {
        const matchedOption = currentOptions.find(opt => 
          opt.label.toLowerCase().includes(quoteDuration.toLowerCase()) ||
          quoteDuration.toLowerCase().includes(opt.label.toLowerCase())
        );
        if (matchedOption) {
          console.log("✅ Matched comprehensive duration by label:", quoteDuration, "→", matchedOption.value);
          return matchedOption.value;
        }
      }

      // Handle "1yr OD + 1yr TP" specifically
      if (quoteDuration.includes("1yr OD + 1yr TP") || quoteDuration.includes("1 year OD + 1 year TP")) {
        const oneYearOption = currentOptions.find(opt => opt.value === "1yr_od_1yr_tp");
        if (oneYearOption) {
          console.log("✅ Matched 1yr OD + 1yr TP specifically");
          return oneYearOption.value;
        }
      }
    }

    // For standalone policies
    if (policyType === "standalone") {
      const standaloneMap = {
        "1": "1",
        "2": "2", 
        "3": "3",
        "1 Year": "1",
        "2 Years": "2",
        "3 Years": "3",
        "1yr OD + 3yr TP": "1", // ADDED: Map comprehensive to standalone
        "2yr OD + 3yr TP": "2", // ADDED: Map comprehensive to standalone  
        "3yr OD + 3yr TP": "3",  // ADDED: Map comprehensive to standalone
        "1yr OD + 1yr TP": "1"   // ADDED: Map 1+1 comprehensive to standalone
      };
      const mappedValue = standaloneMap[quoteDuration];
      if (mappedValue && currentOptions.find(opt => opt.value === mappedValue)) {
        console.log("🔄 Mapped standalone duration:", quoteDuration, "→", mappedValue);
        return mappedValue;
      }
    }

    // For third party policies
    if (policyType === "thirdParty") {
      const thirdPartyMap = {
        "1": "1",
        "2": "2", 
        "3": "3",
        "1 Year": "1",
        "2 Years": "2", 
        "3 Years": "3",
        "1yr OD + 3yr TP": "1", // ADDED: Map comprehensive to third party
        "2yr OD + 3yr TP": "1", // ADDED: Map comprehensive to third party
        "3yr OD + 3yr TP": "1",  // ADDED: Map comprehensive to third party
        "1yr OD + 1yr TP": "1"   // ADDED: Map 1+1 comprehensive to third party
      };
      const mappedValue = thirdPartyMap[quoteDuration];
      if (mappedValue && currentOptions.find(opt => opt.value === mappedValue)) {
        console.log("🔄 Mapped third party duration:", quoteDuration, "→", mappedValue);
        return mappedValue;
      }
    }

    // Try to find by label match
    const labelMatch = currentOptions.find(opt => 
      opt.label.toLowerCase().includes(quoteDuration.toLowerCase()) ||
      quoteDuration.toLowerCase().includes(opt.label.toLowerCase())
    );
    if (labelMatch) {
      console.log("✅ Matched by label:", quoteDuration, "→", labelMatch.value);
      return labelMatch.value;
    }

    // Fallback: Use the first available option
    const fallbackValue = currentOptions.length > 0 ? currentOptions[0].value : "";
    console.log("⚡ Using fallback duration:", fallbackValue);
    return fallbackValue;
  };

  // ⭐ ADD THESE HANDLER FUNCTIONS ⭐
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

  const selectInsuranceCompany = (company) => {
    handleChange({ target: { name: 'insuranceCompany', value: company } });
    setShowInsuranceCompanySuggestions(false);
  };

  // NEW: Hypothecation auto-suggest handler
  const handleHypothecationChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    
    if (value) {
      const filtered = hypothecationBanks.filter(bank =>
        bank.toLowerCase().includes(value.toLowerCase())
      );
      setHypothecationSuggestions(filtered);
      setShowHypothecationSuggestions(true);
    } else {
      setShowHypothecationSuggestions(false);
    }
  };

  // NEW: Select hypothecation from suggestions
  const selectHypothecation = (bank) => {
    handleChange({ target: { name: 'hypothecation', value: bank } });
    setShowHypothecationSuggestions(false);
  };

  // ENHANCED: Auto-fill effect with better quote handling
  useEffect(() => {
    if (acceptedQuote) {
      // Check if this is a different quote than the last one we processed
      const isDifferentQuote = acceptedQuote.id !== lastAcceptedQuoteId;
      
      if (isDifferentQuote) {
        console.log("🔄 Auto-filling policy details from accepted quote...", {
          quoteId: acceptedQuote.id,
          insuranceCompany: acceptedQuote.insuranceCompany,
          policyDuration: acceptedQuote.policyDuration,
          policyDurationLabel: acceptedQuote.policyDurationLabel,
          coverageType: acceptedQuote.coverageType,
          vehicleType: form.vehicleType
        });
        
        // Auto-fill basic policy details from accepted quote
        handleChange({
          target: { name: 'insuranceCompany', value: acceptedQuote.insuranceCompany }
        });
        handleChange({
          target: { name: 'idvAmount', value: acceptedQuote.idv?.toString() || '' }
        });
        handleChange({
          target: { name: 'totalPremium', value: acceptedQuote.totalPremium?.toString() || '' }
        });
        handleChange({
          target: { name: 'ncbDiscount', value: acceptedQuote.ncbDiscount?.toString() || '' }
        });
        
        // Auto-fill policy type from accepted quote coverage type
        if (acceptedQuote.coverageType) {
          console.log("🎯 Setting policy type from quote coverage:", acceptedQuote.coverageType);
          handleChange({
            target: { name: 'policyType', value: acceptedQuote.coverageType }
          });
          
          // Wait for policy type to update, then set duration
          setTimeout(() => {
            // Get the mapped duration value from the accepted quote
            const durationValue = getDurationValueFromQuote(
              acceptedQuote, 
              form.vehicleType, 
              acceptedQuote.coverageType // Use the quote's coverage type
            );
            
            console.log("🎯 Setting insurance duration to:", durationValue, {
              fromQuote: acceptedQuote.policyDuration,
              vehicleType: form.vehicleType,
              policyType: acceptedQuote.coverageType
            });
            
            if (durationValue) {
              handleChange({
                target: { name: 'insuranceDuration', value: durationValue }
              });
            }

            // Update the last processed quote ID
            setLastAcceptedQuoteId(acceptedQuote.id);
            
            console.log("✅ Policy details auto-filled successfully");
          }, 100);
        }
      }
    } else {
      // Reset the tracker if no quote is accepted
      setLastAcceptedQuoteId(null);
    }
  }, [acceptedQuote, lastAcceptedQuoteId, handleChange, form.vehicleType]);

  // Debug effect to track quote changes and mapping
  useEffect(() => {
    console.log("🔍 NewPolicyDetails Debug:", {
      acceptedQuote: acceptedQuote ? {
        id: acceptedQuote.id,
        insuranceCompany: acceptedQuote.insuranceCompany,
        policyDuration: acceptedQuote.policyDuration,
        policyDurationLabel: acceptedQuote.policyDurationLabel,
        coverageType: acceptedQuote.coverageType
      } : null,
      formPolicyType: form.policyType,
      formInsuranceDuration: form.insuranceDuration,
      formOdExpiryDate: form.odExpiryDate,
      formTpExpiryDate: form.tpExpiryDate,
      lastAcceptedQuoteId,
      vehicleType: form.vehicleType
    });
  }, [acceptedQuote, form.policyType, form.insuranceDuration, form.odExpiryDate, form.tpExpiryDate, lastAcceptedQuoteId, form.vehicleType]);

  // Reset form when accepted quote is removed
  useEffect(() => {
    if (!acceptedQuote && lastAcceptedQuoteId) {
      setLastAcceptedQuoteId(null);
    }
  }, [acceptedQuote, lastAcceptedQuoteId]);

  // Update duration options when policy type changes
  useEffect(() => {
    // Reset duration when policy type changes
    if (form.insuranceDuration) {
      const currentOptions = getPolicyDurationOptions(form.vehicleType, form.policyType);
      const currentOptionExists = currentOptions.find(opt => opt.value === form.insuranceDuration);
      
      if (!currentOptionExists) {
        handleChange({
          target: { name: 'insuranceDuration', value: '' }
        });
      }
    }
  }, [form.policyType, form.vehicleType]);

  // Get selected duration option details
  const selectedDurationOption = policyDurationOptions.find(opt => opt.value === form.insuranceDuration);
  const isSimpleDurationType = isSimpleDuration();
  const expiryType = getExpiryType();

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
                <FaCheckCircle className="w-4 h-4" />
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

      <div className="border rounded-xl p-5 mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Policy Information {acceptedQuote && (
            <span className="text-green-600 text-sm">
              (Auto-filled from {lastAcceptedQuoteId === acceptedQuote.id ? "current" : "new"} accepted quote)
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* Insurance Company - Auto-suggestion */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Insurance Company *
            </label>
            <div className="relative">
              <input
                type="text"
                name="insuranceCompany"
                value={form.insuranceCompany || ""}
                onChange={handleInsuranceCompanyChange}
                onFocus={() => {
                  if (form.insuranceCompany) {
                    const filtered = insuranceCompanies.filter(company =>
                      company.toLowerCase().includes(form.insuranceCompany.toLowerCase())
                    );
                    setInsuranceCompanySuggestions(filtered);
                  } else {
                    setInsuranceCompanySuggestions(insuranceCompanies);
                  }
                  setShowInsuranceCompanySuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowInsuranceCompanySuggestions(false), 200)}
                placeholder="Type insurance company"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.insuranceCompany ? "border-red-500" : "border-gray-300"
                }`}
              />
              
              {showInsuranceCompanySuggestions && insuranceCompanySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {insuranceCompanySuggestions.map((company, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                      onClick={() => selectInsuranceCompany(company)}
                    >
                      {company}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {acceptedQuote && form.insuranceCompany === acceptedQuote.insuranceCompany && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
                From accepted quote
              </p>
            )}
            {errors.insuranceCompany && <p className="text-red-500 text-xs mt-1">{errors.insuranceCompany}</p>}
          </div>

          {/* Policy Type */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Type *
            </label>
            <select
              name="policyType"
              value={form.policyType || ""}
              onChange={handlePolicyTypeChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.policyType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Policy Type</option>
              {policyTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {acceptedQuote && form.policyType === acceptedQuote.coverageType && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
                From accepted quote
              </p>
            )}
            {errors.policyType && <p className="text-red-500 text-xs mt-1">{errors.policyType}</p>}
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

          {/* UPDATED: Policy Start Date - Removed validation and min attribute */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Policy Start Date *
            </label>
            <input
              type="date"
              name="policyStartDate"
              value={form.policyStartDate || ""}
              onChange={handlePolicyStartDateChange}
              // REMOVED: min={form.issueDate || ''} - Allow dates before issue date
              className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                errors.policyStartDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.policyStartDate && <p className="text-red-500 text-xs mt-1">{errors.policyStartDate}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Policy coverage start date (can be before or after issue date)
            </p>
          </div>

          {/* UPDATED: Insurance Duration - Dropdown with proper comprehensive options for ALL vehicles */}
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
              }`}
            >
              <option value="">Select Duration</option>
              {policyDurationOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Auto-fill status */}
            {acceptedQuote && form.insuranceDuration && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
                Auto-filled from accepted quote
                {acceptedQuote.policyDuration && form.insuranceDuration !== acceptedQuote.policyDuration && (
                  <span className="text-blue-600 ml-1">
                    (mapped from "{acceptedQuote.policyDuration}" to "{form.insuranceDuration}")
                  </span>
                )}
                {acceptedQuote.policyDuration && form.insuranceDuration === acceptedQuote.policyDuration && (
                  <span className="text-blue-600 ml-1">
                    (direct mapping)
                  </span>
                )}
              </p>
            )}
            
            {errors.insuranceDuration && <p className="text-red-500 text-xs mt-1">{errors.insuranceDuration}</p>}
          </div>

          {/* OD Expiry Date - Show for Standalone and Comprehensive */}
          {(form.policyType === "standalone" || form.policyType === "comprehensive") && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                {form.policyType === "standalone" ? "Policy Expiry Date *" : "OD Expiry Date *"}
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
                {form.policyType === "standalone" 
                  ? "Auto-calculated: Start Date + Duration - 1 Day"
                  : "Auto-calculated: Start Date + OD Duration - 1 Day"
                }
                {form.policyStartDate && form.insuranceDuration && (
                  <span className="text-green-600 font-medium">
                    {" "}✓ Calculated
                  </span>
                )}
              </p>
            </div>
          )}

          {/* TP Expiry Date - Show for Third Party and Comprehensive */}
          {(form.policyType === "thirdParty" || form.policyType === "comprehensive") && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                {form.policyType === "thirdParty" ? "Policy Expiry Date *" : "TP Expiry Date *"}
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
                {form.policyType === "thirdParty" 
                  ? "Auto-calculated: Start Date + Duration - 1 Day"
                  : "Auto-calculated: Start Date + TP Duration - 1 Day"
                }
                {form.policyStartDate && form.insuranceDuration && (
                  <span className="text-green-600 font-medium">
                    {" "}✓ Calculated
                  </span>
                )}
              </p>
            </div>
          )}

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
            {acceptedQuote && form.ncbDiscount === acceptedQuote.ncbDiscount?.toString() && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
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
            {acceptedQuote && form.idvAmount === acceptedQuote.idv?.toString() && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
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
            {acceptedQuote && form.totalPremium === acceptedQuote.totalPremium?.toString() && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
                From accepted quote: ₹{acceptedQuote.totalPremium?.toLocaleString('en-IN')}
              </p>
            )}
            {errors.totalPremium && <p className="text-red-500 text-xs mt-1">{errors.totalPremium}</p>}
          </div>

          {/* NEW: Hypothecation Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Hypothecation
            </label>
            <div className="relative">
              <input
                type="text"
                name="hypothecation"
                value={form.hypothecation || ""}
                onChange={handleHypothecationChange}
                onFocus={() => {
                  if (form.hypothecation) {
                    const filtered = hypothecationBanks.filter(bank =>
                      bank.toLowerCase().includes(form.hypothecation.toLowerCase())
                    );
                    setHypothecationSuggestions(filtered);
                  } else {
                    setHypothecationSuggestions(hypothecationBanks);
                  }
                  setShowHypothecationSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowHypothecationSuggestions(false), 200)}
                placeholder="Type bank name or select Not Applicable"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.hypothecation ? "border-red-500" : "border-gray-300"
                }`}
              />
              
              {showHypothecationSuggestions && hypothecationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {hypothecationSuggestions.map((bank, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => selectHypothecation(bank)}
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.hypothecation && <p className="text-red-500 text-xs mt-1">{errors.hypothecation}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Select the bank if vehicle is financed, otherwise select "Not Applicable"
            </p>
          </div>
        </div>

        {/* NEW: Remarks Section for New Policy */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-700 mb-4">
            Remarks
          </h4>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                New Policy Remarks
              </label>
              <textarea
                name="newPolicyRemarks"
                value={form.newPolicyRemarks || ""}
                onChange={handleChange}
                placeholder="Enter any remarks or notes for the new policy..."
                rows={3}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.newPolicyRemarks ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.newPolicyRemarks && <p className="text-red-500 text-xs mt-1">{errors.newPolicyRemarks}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Additional notes or comments about the new policy
              </p>
            </div>
          </div>
        </div>
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
        mandatory: ["RC", "Form 29", "Form 30 page 1", "Form 30 page 2", "Pan Number", "GST/Adhaar Card","Previous Year Policy","New Year Policy"],
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

  // const uploadSingleFile = async (fileObj, detectedExtension) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('file', fileObj);

  //     // Add comprehensive file metadata
  //     formData.append('fileName', fileObj.name);
  //     formData.append('fileType', fileObj.type);
  //     formData.append('originalExtension', detectedExtension);
  //     formData.append('preserveExtension', 'true');
  //     formData.append('timestamp', Date.now().toString());

  //     let config = {
  //       method: 'post',
  //       maxBodyLength: Infinity,
  //       url: 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/files',
  //       headers: { 
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       data: formData,
  //       timeout: 60000 // 60 seconds timeout
  //     };

  //     const response = await axios.request(config);
  //     console.log(`📡 Upload response for ${fileObj.name}:`, response.data);
      
  //     if (!response.data.path) {
  //       throw new Error('No file path returned from server');
  //     }
      
  //     return response.data.path;
  //   } catch (error) {
  //     console.error(`Error uploading file ${fileObj.name}:`, error);
  //     throw new Error(`Upload failed: ${error.message}`);
  //   }
  // }

  
 
 
 
  const uploadSingleFile = async (fileObj, detectedExtension) => {
  try {
    const formData = new FormData();

    // Ensure file name includes correct extension
    let fileName = fileObj.name || `document_${Date.now()}`;
    const hasExtension = fileName.includes('.');
    const extension = detectedExtension || getFileExtensionFromFile(fileObj);

    if (!hasExtension && extension) {
      fileName = `${fileName}.${extension}`;
    }

    // Append actual file
    formData.append('file', fileObj);

    // Add comprehensive file metadata
    formData.append('fileName', fileName); // ✅ full name with extension
    formData.append('fileType', fileObj.type);
    formData.append('originalExtension', extension);
    formData.append('preserveExtension', 'true');
    formData.append('timestamp', Date.now().toString());

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/files',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
      timeout: 60000, // 60s
    };

    const response = await axios.request(config);
    console.log(`📡 Upload response for ${fileName}:`, response.data);

    if (!response.data.path) {
      throw new Error('No file path returned from server');
    }

    return response.data.path;
  } catch (error) {
    console.error(`❌ Error uploading file ${fileObj.name}:`, error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
 
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
  
  <div className="flex flex-row gap-6">
    <div className="flex-1">
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
      <div className="flex-1">
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
  "Bank of Baroda",
  "Bank of India",
  "Bank of Maharashtra",
  "Canara Bank",
  "Central Bank of India",
  "Indian Bank",
  "Indian Overseas Bank",
  "Punjab & Sind Bank",
  "Punjab National Bank",
  "State Bank of India",
  "UCO Bank",
  "Union Bank of India",
  "Axis Bank Ltd.",
  "Bandhan Bank Ltd.",
  "CSB Bank Ltd.",
  "City Union Bank Ltd.",
  "DCB Bank Ltd.",
  "Dhanlaxmi Bank Ltd.",
  "Federal Bank Ltd.",
  "HDFC Bank Ltd.",
  "ICICI Bank Ltd.",
  "IndusInd Bank Ltd.",
  "IDFC FIRST Bank Ltd.",
  "Jammu & Kashmir Bank Ltd.",
  "Karnataka Bank Ltd.",
  "Karur Vysya Bank Ltd.",
  "Kotak Mahindra Bank Ltd.",
  "Nainital Bank Ltd.",
  "RBL Bank Ltd.",
  "South Indian Bank Ltd.",
  "Tamilnad Mercantile Bank Ltd.",
  "YES Bank Ltd.",
  "IDBI Bank Ltd.",
  "Coastal Local Area Bank Ltd.",
  "Krishna Bhima Samruddhi Local Area Bank Ltd.",
  "AU Small Finance Bank Ltd.",
  "Capital Small Finance Bank Ltd.",
  "Equitas Small Finance Bank Ltd.",
  "ESAF Small Finance Bank Ltd.",
  "Suryoday Small Finance Bank Ltd.",
  "Ujjivan Small Finance Bank Ltd.",
  "Utkarsh Small Finance Bank Ltd.",
  "slice Small Finance Bank Ltd.",
  "Jana Small Finance Bank Ltd.",
  "Shivalik Small Finance Bank Ltd.",
  "Unity Small Finance Bank Ltd.",
  "Airtel Payments Bank Ltd.",
  "India Post Payments Bank Ltd.",
  "Fino Payments Bank Ltd.",
  "Paytm Payments Bank Ltd.",
  "Jio Payments Bank Ltd.",
  "NSDL Payments Bank Ltd.",
  "Assam Gramin Vikash Bank",
  "Andhra Pradesh Grameena Vikas Bank",
  "Andhra Pragathi Grameena Bank",
  "Arunachal Pradesh Rural Bank",
  "Aryavart Bank",
  "Bangiya Gramin Vikash Bank",
  "Baroda Gujarat Gramin Bank",
  "Baroda Rajasthan Kshetriya Gramin Bank",
  "Baroda UP Bank",
  "Chaitanya Godavari Grameena Bank",
  "Chhattisgarh Rajya Gramin Bank",
  "Dakshin Bihar Gramin Bank",
  "Ellaquai Dehati Bank",
  "Himachal Pradesh Gramin Bank",
  "J&K Grameen Bank",
  "Jharkhand Rajya Gramin Bank",
  "Karnataka Gramin Bank",
  "Karnataka Vikas Grameena Bank",
  "Kerala Gramin Bank",
  "Madhya Pradesh Gramin Bank",
  "Madhyanchal Gramin Bank",
  "Maharashtra Gramin Bank",
  "Manipur Rural Bank",
  "Meghalaya Rural Bank",
  "Mizoram Rural Bank",
  "Nagaland Rural Bank",
  "Odisha Gramya Bank",
  "Paschim Banga Gramin Bank",
  "Prathama U.P. Gramin Bank",
  "Puduvai Bharathiar Grama Bank",
  "Punjab Gramin Bank",
  "Rajasthan Marudhara Gramin Bank",
  "Saptagiri Grameena Bank",
  "Sarva Haryana Gramin Bank",
  "Saurashtra Gramin Bank",
  "Tamil Nadu Grama Bank",
  "Telangana Grameena Bank",
  "Tripura Gramin Bank",
  "Uttar Bihar Gramin Bank",
  "Utkal Grameen Bank",
  "Uttarbanga Kshetriya Gramin Bank",
  "Vidharbha Konkan Gramin Bank",
  "Uttarakhand Gramin Bank",
  "AB Bank Ltd.",
  "American Express Banking Corporation",
  "Australia and New Zealand Banking Group Ltd.",
  "Barclays Bank PLC",
  "Bank of America",
  "Bank of Bahrain and Kuwait B.S.C.",
  "Bank of Ceylon",
  "Bank of China Ltd.",
  "Bank of Nova Scotia",
  "BNP Paribas",
  "Citibank N.A.",
  "Coöperatieve Rabobank U.A.",
  "Credit Agricole CIB",
  "CTBC Bank Co., Ltd.",
  "DBS Bank India Ltd.",
  "Deutsche Bank AG",
  "Doha Bank Q.P.S.C",
  "Emirates NBD Bank P.J.S.C",
  "First Abu Dhabi Bank PJSC",
  "FirstRand Bank Ltd.",
  "HSBC",
  "Industrial and Commercial Bank of China",
  "Industrial Bank of Korea",
  "J.P. Morgan Chase Bank N.A.",
  "JSC VTB Bank",
  "KEB Hana Bank",
  "Kookmin Bank",
  "Mashreqbank P.S.C.",
  "Mizuho Bank Ltd.",
  "MUFG Bank, Ltd.",
  "NongHyup Bank",
  "NatWest Markets Plc",
  "PT Bank Maybank Indonesia Tbk",
  "Qatar National Bank (Q.P.S.C.)",
  "Sberbank",
  "Bajaj Finance Ltd.",
  "Shriram Finance Ltd.",
  "Mahindra & Mahindra Financial Services Ltd.",
  "LIC Housing Finance Ltd.",
  "PNB Housing Finance Ltd.",
  "Sundaram Finance Ltd.",
  "L&T Finance Ltd."
];


  // State for bank suggestions - now separate for each field
  const [bankSuggestions, setBankSuggestions] = useState({
    customer: [],
    inHouse: [],
    autoCredit: []
  });
  const [showSuggestions, setShowSuggestions] = useState({
    customer: false,
    inHouse: false,
    autoCredit: false
  });

  // State for editing payment - FIXED: Combined state to prevent unnecessary re-renders
  const [editingState, setEditingState] = useState({
    isEditing: false,
    paymentId: null,
    formData: {},
    amountInput: ''
  });

  // State for subvention/discount
  const [showSubventionForm, setShowSubventionForm] = useState(false);
  const [subventionAmount, setSubventionAmount] = useState('');
  const [subventionReason, setSubventionReason] = useState('');
  const [subventionEntries, setSubventionEntries] = useState([]);

  // Use the final premium amount directly from acceptedQuote
  const finalPremiumAmount = acceptedQuote?.totalPremium || 0;

  // State for payment ledger - use prop if provided, otherwise local state
  const [paymentLedger, setPaymentLedger] = useState(propPaymentLedger || paymentHistory || []);
  
  // State for auto credit amount - equals final premium minus subvention refunds
  const [autoCreditAmount, setAutoCreditAmount] = useState(finalPremiumAmount || "");

  // FIXED: Use ref for debouncing to prevent re-renders
  const debounceTimeouts = useRef({});

  // FIXED: Sync payment ledger with parent component - optimized to prevent loops
  useEffect(() => {
    if (propPaymentLedger && JSON.stringify(propPaymentLedger) !== JSON.stringify(paymentLedger)) {
      setPaymentLedger(propPaymentLedger);
    }
  }, [propPaymentLedger]);

  // FIXED: Recalculate totals when ledger changes - memoized to prevent unnecessary re-renders
  const totalCustomerPayments = useMemo(() => {
    return paymentLedger
      .filter(payment => payment.paymentMadeBy === "Customer" && payment.type !== "subvention_refund")
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [paymentLedger]);

  const totalSubventionRefund = useMemo(() => {
    return paymentLedger
      .filter(payment => payment.type === "subvention_refund")
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [paymentLedger]);

  const netPremium = useMemo(() => Math.max(finalPremiumAmount - totalSubventionRefund, 0), [finalPremiumAmount, totalSubventionRefund]);
  const customerRemainingAmount = useMemo(() => Math.max(netPremium - totalCustomerPayments, 0), [netPremium, totalCustomerPayments]);
  const paymentProgress = useMemo(() => netPremium > 0 ? Math.min((totalCustomerPayments / netPremium) * 100, 100) : 100, [netPremium, totalCustomerPayments]);
  const overallPaymentStatus = useMemo(() => totalCustomerPayments >= netPremium ? 'Fully Paid' : 'Payment Pending', [totalCustomerPayments, netPremium]);

  // FIXED: Update payment status when totals change
  useEffect(() => {
    handleChange({
      target: {
        name: 'paymentStatus',
        value: overallPaymentStatus
      }
    });

    handleChange({
      target: {
        name: 'totalPaidAmount',
        value: totalCustomerPayments
      }
    });
  }, [overallPaymentStatus, totalCustomerPayments]);

  // Calculate individual payment status - Customer payments show Pending if remaining amount > 0
  const calculatePaymentStatus = (payment) => {
    if (payment.type === "auto_credit") {
      return 'Completed'; // Auto credit always completed
    }
    
    if (payment.type === "subvention_refund") {
      return 'Completed'; // Subvention refunds always completed
    }
    
    // For customer payments, check if total paid covers the payment
    if (payment.paymentMadeBy === "Customer") {
      return totalCustomerPayments >= netPremium ? 'Completed' : 'Pending';
    }
    
    return payment.status || 'Completed';
  };
  
  // Payment modes for Customer (includes subvention)
  const customerPaymentModeOptions = [
    "Online Transfer/UPI",
    "Cash",
    "Cheque",
    "Credit/Debit Card"
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

  // NEW: Handle adding individual subvention amounts one by one
  const handleAddSubventionEntry = () => {
    if (!subventionAmount || subventionAmount <= 0) {
      alert("Please enter a valid subvention amount");
      return;
    }

    const amount = parseFloat(subventionAmount);
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
      
      // FIXED: Update state immediately
      setPaymentLedger(updatedLedgerWithAutoCreditStatus);
      
      // FIXED: Notify parent component immediately
      if (onPaymentLedgerUpdate) {
        onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
      }
      
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
          paymentStatus: overallPaymentStatus,
          totalPaidAmount: totalCustomerPayments,
          totalSubventionRefund: totalSubventionAmount + totalSubventionRefund
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

  // FIXED: Calculate auto credit status - Should always show Completed when created
  const calculateAutoCreditStatus = () => {
    const autoCreditEntry = getAutoCreditEntry();
    
    if (!autoCreditEntry) return 'Not Created';
    
    // Auto credit to insurance company should always show as Completed
    // because it represents the commitment to pay the insurance company
    return 'Completed';
  };

  // UPDATED: Handle bank name input change with auto-suggest - now field-specific with same pattern as VehicleDetails
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
    
    // Show suggestions for this specific field if input is not empty
    if (value.length > 0) {
      const filteredBanks = indianBanks.filter(bank =>
        bank.toLowerCase().includes(value.toLowerCase())
      );
      
      setBankSuggestions(prev => ({
        ...prev,
        [bankType]: filteredBanks
      }));
      setShowSuggestions(prev => ({
        ...prev,
        [bankType]: true
      }));
    } else {
      setShowSuggestions(prev => ({
        ...prev,
        [bankType]: false
      }));
      setBankSuggestions(prev => ({
        ...prev,
        [bankType]: []
      }));
    }
  };

  // UPDATED: Handle bank focus - show suggestions when field is focused (same as VehicleDetails)
  const handleBankFocus = (bankType = 'customer') => {
    const currentValue = 
      bankType === 'customer' ? form.customerBankName || '' :
      bankType === 'inHouse' ? form.inHouseBankName || '' :
      form.autoCreditBankName || '';
    
    if (currentValue) {
      const filteredBanks = indianBanks.filter(bank =>
        bank.toLowerCase().includes(currentValue.toLowerCase())
      );
      setBankSuggestions(prev => ({
        ...prev,
        [bankType]: filteredBanks
      }));
    } else {
      setBankSuggestions(prev => ({
        ...prev,
        [bankType]: indianBanks
      }));
    }
    
    setShowSuggestions(prev => ({
      ...prev,
      [bankType]: true
    }));
  };

  // UPDATED: Handle bank suggestion selection (same as VehicleDetails)
  const handleBankSelect = (bankName, bankType = 'customer') => {
    console.log("Selected bank:", bankName, "for type:", bankType);
    
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
    
    setShowSuggestions(prev => ({
      ...prev,
      [bankType]: false
    }));
  };

  // UPDATED: Close suggestions when clicking outside - field specific with proper z-index handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If any modal is open, don't close bank suggestions on outside click
      if (editingState.isEditing || showSubventionForm) return;
      
      const bankInputs = document.querySelectorAll('.bank-suggestions-container input[type="text"]');
      const suggestionLists = document.querySelectorAll('.bank-suggestions-list');
      
      let isBankInput = false;
      let isSuggestionList = false;
      
      bankInputs.forEach(input => {
        if (input.contains(event.target)) {
          isBankInput = true;
        }
      });
      
      suggestionLists.forEach(list => {
        if (list.contains(event.target)) {
          isSuggestionList = true;
        }
      });
      
      if (!isBankInput && !isSuggestionList) {
        setShowSuggestions({
          customer: false,
          inHouse: false,
          autoCredit: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingState.isEditing, showSubventionForm]);

  // Handle radio button change
  const handleRadioChange = (fieldName, value) => {
    handleChange({ 
      target: { 
        name: fieldName, 
        value: value 
      } 
    });
  };

  // Handle auto credit amount change - FIXED: Always use final premium amount
  const handleAutoCreditChange = (e) => {
    // Prevent any changes to auto credit amount - always use final premium
    setAutoCreditAmount(finalPremiumAmount);
    handleChange({
      target: {
        name: 'autoCreditAmount',
        value: finalPremiumAmount
      }
    });
  };

  // FIXED: EDIT PAYMENT FUNCTIONS - Completely rewritten without debouncing
  const handleEditPayment = (payment) => {
    console.log("Editing payment:", payment);
    setEditingState({
      isEditing: true,
      paymentId: payment.id,
      formData: {
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
      },
      amountInput: payment.amount.toString()
    });
  };

  // FIXED: Edit payment function with proper state management
  const handleSaveEdit = async () => {
    const { paymentId, formData, amountInput } = editingState;
    
    console.log("Saving edited payment:", formData);
    
    if (!amountInput || !formData.date || !formData.mode) {
      alert("Please fill all required fields (Amount, Date, and Payment Mode)");
      return;
    }

    const amountToSave = parseFloat(amountInput);
    if (isNaN(amountToSave) || amountToSave <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const updatedLedger = paymentLedger.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              ...formData,
              amount: amountToSave
            }
          : payment
      );

      console.log("Updated ledger after edit:", updatedLedger);

      // Update auto credit status if needed
      const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
      
      // FIXED: Update local state immediately
      setPaymentLedger(updatedLedgerWithAutoCreditStatus);
      
      // FIXED: Notify parent component about ledger update immediately
      if (onPaymentLedgerUpdate) {
        onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
      }
      
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
          paymentStatus: overallPaymentStatus,
          totalPaidAmount: totalCustomerPayments
        },
        payment_ledger: updatedLedgerWithAutoCreditStatus
      };

      console.log("Saving payment data after edit:", paymentData);

      // Save to backend
      await handleSave(paymentData);
      
      // FIXED: Close edit form only after successful save
      setEditingState({
        isEditing: false,
        paymentId: null,
        formData: {},
        amountInput: ''
      });
      
      alert("Payment updated successfully!");
      
    } catch (error) {
      console.error('Error saving edited payment:', error);
      alert('Error saving edited payment. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingState({
      isEditing: false,
        paymentId: null,
        formData: {},
        amountInput: ''
      });
    };

  // FIXED: Handle edit form input changes WITHOUT debouncing - immediate updates
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    setEditingState(prev => {
      // For amount field, update both the input and formData immediately
      if (name === 'amount') {
        return {
          ...prev,
          amountInput: value,
          formData: {
            ...prev.formData,
            [name]: value
          }
        };
      }
      
      // For other fields, update formData immediately
      return {
        ...prev,
        formData: {
          ...prev.formData,
          [name]: value
        }
      };
    });
  };

  // Add payment to ledger function for Customer
  const addCustomerPaymentToLedger = async () => {
    if (!form.customerPaymentAmount || !form.customerPaymentDate || !form.customerPaymentMode) {
      alert("Please fill all required payment fields for Customer payment");
      return;
    }

    const paymentAmount = parseFloat(form.customerPaymentAmount);

    // Check if payment amount exceeds remaining amount
    if (paymentAmount > customerRemainingAmount) {
      alert(`Payment amount cannot exceed remaining amount of ₹${formatIndianNumber(customerRemainingAmount)}`);
      return;
    }

    // FIXED: Calculate status based on remaining amount
    const paymentStatus = (totalCustomerPayments + paymentAmount) >= netPremium ? 'Completed' : 'Pending';

    const newPayment = {
      id: Date.now().toString() + '_customer',
      date: form.customerPaymentDate,
      description: `Customer Payment - ${form.customerPaymentMode}`,
      amount: paymentAmount,
      mode: form.customerPaymentMode,
      status: paymentStatus, // FIXED: Dynamic status based on remaining amount
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
    
    // FIXED: Update state immediately
    setPaymentLedger(updatedLedgerWithAutoCreditStatus);
    
    // FIXED: Notify parent component immediately
    if (onPaymentLedgerUpdate) {
      onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
    }
    
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
        paymentStatus: overallPaymentStatus,
        totalPaidAmount: totalCustomerPayments + paymentAmount
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

  // UPDATED: Add payment to ledger function for In House - Now allows either auto credit OR customer payment independently
  const addInHousePaymentToLedger = async () => {
    // Check if at least one section (Auto Credit OR Customer Payment) is filled
    const isAutoCreditFilled = form.autoCreditPaymentMode && form.autoCreditPaymentDate;
    const isCustomerPaymentFilled = form.inHousePaymentAmount && form.inHousePaymentDate && form.inHousePaymentMode;
    
    if (!isAutoCreditFilled && !isCustomerPaymentFilled) {
      alert("Please fill either Auto Credit section OR Customer Payment section");
      return;
    }

    let updatedLedger = [...paymentLedger];

    // Add auto credit entry if auto credit section is filled
    if (isAutoCreditFilled) {
      // Check if auto credit entry already exists for this premium
      const existingAutoCredit = getAutoCreditEntry();

      // Add auto credit entry only if it doesn't exist
      if (!existingAutoCredit) {
        const autoCreditPayment = {
          id: Date.now().toString() + '_auto_credit',
          date: form.autoCreditPaymentDate,
          description: `Auto Credit to Insurance Company - ${form.autoCreditPaymentMode}`,
          amount: finalPremiumAmount, // Use final premium amount here instead of netPremium
          mode: form.autoCreditPaymentMode,
          status: 'Completed', // FIXED: Always show as Completed
          transactionId: form.autoCreditTransactionId || 'N/A',
          bankName: form.autoCreditBankName || 'N/A',
          paymentMadeBy: "In House",
          receiptDate: form.autoCreditPaymentDate,
          payoutBy: "Auto Credit to Insurance Company",
          type: "auto_credit"
        };
        updatedLedger.push(autoCreditPayment);
      }
    }

    // Add customer payment entry if customer payment section is filled
    if (isCustomerPaymentFilled) {
      const paymentAmount = parseFloat(form.inHousePaymentAmount);

      // Check if payment amount exceeds remaining amount
      if (paymentAmount > customerRemainingAmount) {
        alert(`Payment amount cannot exceed remaining amount of ₹${formatIndianNumber(customerRemainingAmount)}`);
        return;
      }

      // FIXED: Calculate status based on remaining amount
      const paymentStatus = (totalCustomerPayments + paymentAmount) >= netPremium ? 'Completed' : 'Pending';

      const customerPaymentEntry = {
        id: Date.now().toString() + '_inhouse_customer',
        date: form.inHousePaymentDate,
        description: `Customer Payment via In House - ${form.inHousePaymentMode}`,
        amount: paymentAmount,
        mode: form.inHousePaymentMode,
        status: paymentStatus, // FIXED: Dynamic status based on remaining amount
        transactionId: form.inHouseTransactionId || 'N/A',
        bankName: form.inHouseBankName || 'N/A',
        paymentMadeBy: "Customer",
        receiptDate: form.inHouseReceiptDate || form.inHousePaymentDate,
        payoutBy: "In House",
        type: "customer_payment_via_inhouse"
      };

      updatedLedger.push(customerPaymentEntry);
    }
    
    // Update auto credit status based on total customer payments
    const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
    
    // FIXED: Update state immediately
    setPaymentLedger(updatedLedgerWithAutoCreditStatus);
    
    // FIXED: Notify parent component immediately
    if (onPaymentLedgerUpdate) {
      onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
    }
    
    const paymentData = {
      payment_info: {
        paymentMadeBy: "In House",
        autoCreditAmount: finalPremiumAmount, // Use final premium here
        autoCreditPaymentMode: form.autoCreditPaymentMode,
        autoCreditPaymentDate: form.autoCreditPaymentDate,
        autoCreditTransactionId: form.autoCreditTransactionId || '',
        autoCreditBankName: form.autoCreditBankName || '',
        paymentMode: form.inHousePaymentMode || '',
        paymentAmount: form.inHousePaymentAmount ? parseFloat(form.inHousePaymentAmount) : 0,
        paymentDate: form.inHousePaymentDate || '',
        transactionId: form.inHouseTransactionId || '',
        receiptDate: form.inHouseReceiptDate || form.inHousePaymentDate || '',
        bankName: form.inHouseBankName || '',
        subvention_payment: "No Subvention", // In House payments don't have subvention
        paymentStatus: overallPaymentStatus,
        totalPaidAmount: totalCustomerPayments + (form.inHousePaymentAmount ? parseFloat(form.inHousePaymentAmount) : 0)
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
      
      // Clear auto credit form if it was filled
      if (isAutoCreditFilled) {
        handleChange({ target: { name: 'autoCreditPaymentMode', value: '' } });
        handleChange({ target: { name: 'autoCreditPaymentDate', value: '' } });
        handleChange({ target: { name: 'autoCreditTransactionId', value: '' } });
        handleChange({ target: { name: 'autoCreditBankName', value: '' } });
      }
      
      alert("In House payment added to ledger successfully!");
      
    } catch (error) {
      console.error('Error saving in house payment:', error);
      alert('Error saving in house payment. Please try again.');
    }
  };

  // FIXED: Update auto credit status - Always show as Completed
  const updateAutoCreditStatus = (ledger) => {
    const autoCreditEntry = ledger.find(payment => payment.type === "auto_credit");
    
    if (autoCreditEntry) {
      // Auto credit entries should always show as Completed
      return ledger.map(payment => 
        payment.type === "auto_credit" 
          ? { ...payment, status: 'Completed' }
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

    let updatedLedger = paymentLedger.filter(payment => payment.id !== paymentId);
    
    // Update auto credit status after deletion
    updatedLedger = updateAutoCreditStatus(updatedLedger);
    
    // FIXED: Update state immediately
    setPaymentLedger(updatedLedger);
    
    // FIXED: Notify parent component immediately
    if (onPaymentLedgerUpdate) {
      onPaymentLedgerUpdate(updatedLedger);
    }
    
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
        paymentStatus: overallPaymentStatus,
        totalPaidAmount: totalCustomerPayments
      },
      payment_ledger: updatedLedger
    };

    console.log("🗑️ Updated payment data after deletion:", paymentData);

    try {
      // Save updated data to backend
      await handleSave(paymentData);

    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment. Please try again.');
    }
  };

  // Handle next step - UPDATED: Allow proceeding even if customer hasn't paid fully
  const handleNextStep = async () => {
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
        paymentStatus: overallPaymentStatus,
        totalPaidAmount: totalCustomerPayments
      },
      payment_ledger: paymentLedger
    };

    console.log("💰 Final payment data before next step:", finalPaymentData);

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

  // UPDATED: Check if at least one section is filled for In House payment
  const isInHousePaymentValid = () => {
    const isAutoCreditFilled = form.autoCreditPaymentMode && form.autoCreditPaymentDate;
    const isCustomerPaymentFilled = form.inHousePaymentAmount && form.inHousePaymentDate && form.inHousePaymentMode;
    return isAutoCreditFilled || isCustomerPaymentFilled;
  };

  // UPDATED: Check if payout should be disabled - Now always enabled if there are payments
  const isPayoutDisabled = paymentLedger.length === 0;

  // Ensure form fields are properly initialized - FIXED: Use final premium for auto credit
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
      autoCreditAmount: form.autoCreditAmount || finalPremiumAmount, // Use final premium here
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
    
    // Always set to final premium amount
    setAutoCreditAmount(finalPremiumAmount);
  }, [finalPremiumAmount]);

  const paymentStatusColor = overallPaymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  
  const totalSubvention = calculateTotalSubvention();
  const customerReceived = calculateCustomerReceivedAmount();
  const inHouseReceived = calculateInHouseReceivedAmount();
  const autoCreditTotal = calculateAutoCreditAmountTotal();

  // UPDATED: Bank Suggestions Component - FIXED: Now properly clickable and selectable
  const BankSuggestions = ({ bankType = 'customer' }) => {
    if (!showSuggestions[bankType] || bankSuggestions[bankType].length === 0) return null;

    return (
      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto bank-suggestions-list">
        {bankSuggestions[bankType].map((bank, index) => (
          <div
            key={index}
            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm transition-colors duration-150"
            onClick={() => {
              console.log("Bank clicked:", bank);
              handleBankSelect(bank, bankType);
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // This is the key fix - prevents blur event
            }}
          >
            {bank}
          </div>
        ))}
      </div>
    );
  };

  // FIXED: Edit Payment Form Component with proper input handling
  const EditPaymentForm = () => {
    const payment = paymentLedger.find(p => p.id === editingState.paymentId);
    
    if (!payment) {
      setEditingState({
        isEditing: false,
        paymentId: null,
        formData: {},
        amountInput: ''
      });
      return null;
    }

    // FIXED: Use a single state for amount input
    const [localFormData, setLocalFormData] = useState({
      date: editingState.formData.date || '',
      description: editingState.formData.description || '',
      amount: editingState.amountInput || editingState.formData.amount?.toString() || '',
      mode: editingState.formData.mode || '',
      status: editingState.formData.status || 'Completed',
      transactionId: editingState.formData.transactionId || '',
      bankName: editingState.formData.bankName || '',
      paymentMadeBy: editingState.formData.paymentMadeBy || 'Customer',
      receiptDate: editingState.formData.receiptDate || '',
      payoutBy: editingState.formData.payoutBy || 'Customer'
    });

    const getPaymentModeOptions = () => {
      return localFormData.paymentMadeBy === "Customer" 
        ? customerPaymentModeOptions 
        : inHousePaymentModeOptions;
    };

    // FIXED: Handle all input changes in one function
    const handleLocalFormChange = (e) => {
      const { name, value } = e.target;
      setLocalFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    // FIXED: Save function using local state
    const handleSaveEdit = async () => {
      console.log("Saving edited payment:", localFormData);
      
      if (!localFormData.amount || !localFormData.date || !localFormData.mode) {
        alert("Please fill all required fields (Amount, Date, and Payment Mode)");
        return;
      }

      const amountToSave = parseFloat(localFormData.amount);
      if (isNaN(amountToSave) || amountToSave <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      try {
        const updatedLedger = paymentLedger.map(payment => 
          payment.id === editingState.paymentId 
            ? { 
                ...payment, 
                date: localFormData.date,
                description: localFormData.description,
                amount: amountToSave,
                mode: localFormData.mode,
                status: localFormData.status,
                transactionId: localFormData.transactionId,
                bankName: localFormData.bankName,
                paymentMadeBy: localFormData.paymentMadeBy,
                receiptDate: localFormData.receiptDate,
                payoutBy: localFormData.payoutBy
              }
            : payment
        );

        console.log("Updated ledger after edit:", updatedLedger);

        // Update auto credit status if needed
        const updatedLedgerWithAutoCreditStatus = updateAutoCreditStatus(updatedLedger);
        
        // Update local state immediately
        setPaymentLedger(updatedLedgerWithAutoCreditStatus);
        
        // Notify parent component about ledger update immediately
        if (onPaymentLedgerUpdate) {
          onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
        }
        
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
            paymentStatus: overallPaymentStatus,
            totalPaidAmount: totalCustomerPayments
          },
          payment_ledger: updatedLedgerWithAutoCreditStatus
        };

        console.log("Saving payment data after edit:", paymentData);

        // Save to backend
        await handleSave(paymentData);
        
        // Close edit form only after successful save
        setEditingState({
          isEditing: false,
          paymentId: null,
          formData: {},
          amountInput: ''
        });
        
        alert("Payment updated successfully!");
        
      } catch (error) {
        console.error('Error saving edited payment:', error);
        alert('Error saving edited payment. Please try again.');
      }
    };

    const handleCancelEdit = () => {
      setEditingState({
        isEditing: false,
        paymentId: null,
        formData: {},
        amountInput: ''
      });
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Edit Payment</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={localFormData.date}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₹) *</label>
                <INRCurrencyInput
                  type="text"
                  name="amount"
                  value={localFormData.amount}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original: ₹{formatIndianNumber(payment.amount)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Mode *</label>
                <select
                  name="mode"
                  value={localFormData.mode}
                  onChange={handleLocalFormChange}
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
                  value={localFormData.status}
                  onChange={handleLocalFormChange}
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
                  value={localFormData.transactionId}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter transaction ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={localFormData.bankName}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter bank name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={localFormData.description}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Receipt Date</label>
                <input
                  type="date"
                  name="receiptDate"
                  value={localFormData.receiptDate}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Made By</label>
                <select
                  name="paymentMadeBy"
                  value={localFormData.paymentMadeBy}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled
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
                  value={localFormData.payoutBy}
                  onChange={handleLocalFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Customer">Customer</option>
                  <option value="In House">In House</option>
                  <option value="Auto Credit to Insurance Company">Auto Credit to Insurance Company</option>
                </select>
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Original Values:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">Amount:</span> ₹{formatIndianNumber(payment.amount)}</div>
                <div><span className="text-gray-600">Date:</span> {payment.date}</div>
                <div><span className="text-gray-600">Mode:</span> {payment.mode}</div>
                <div><span className="text-gray-600">Status:</span> {payment.status}</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // FIXED: Subvention Form Component
  const SubventionForm = () => {
    const [localSubventionEntries, setLocalSubventionEntries] = useState([]);
    const [localSubventionAmount, setLocalSubventionAmount] = useState('');
    const [localSubventionReason, setLocalSubventionReason] = useState('');

    const totalSubventionAmount = localSubventionEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const remainingCapacity = finalPremiumAmount - totalSubventionRefund - totalSubventionAmount;

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
        
        // FIXED: Update state immediately
        setPaymentLedger(updatedLedgerWithAutoCreditStatus);
        
        // FIXED: Notify parent component immediately
        if (onPaymentLedgerUpdate) {
          onPaymentLedgerUpdate(updatedLedgerWithAutoCreditStatus);
        }
        
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
            paymentStatus: overallPaymentStatus,
            totalPaidAmount: totalCustomerPayments,
            totalSubventionRefund: totalSubventionAmount + totalSubventionRefund
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
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaGift className="text-green-600" />
              Add Subvention Refund (One by One)
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Current Subvention Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Existing Subvention:</p>
                  <p className="font-semibold">₹{formatIndianNumber(totalSubventionRefund)}</p>
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
                  <INRCurrencyInput
                    type="text"
                    value={localSubventionAmount}
                    onChange={handleAmountChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Enter amount"
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
          
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
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
              <INRCurrencyInput
                type="text"
                name="customerPaymentAmount"
                value={form.customerPaymentAmount || ""}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.customerPaymentAmount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
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

            {/* UPDATED: Bank Name Input with Auto-suggest (FIXED: Now properly clickable) */}
            <div className="bank-suggestions-container relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bank Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="customerBankName"
                  value={form.customerBankName || ""}
                  onChange={(e) => handleBankNameChange(e, 'customer')}
                  onFocus={() => handleBankFocus('customer')}
                  onBlur={() => {
                    // Use setTimeout to allow click event to complete before hiding
                    setTimeout(() => {
                      setShowSuggestions(prev => ({
                        ...prev,
                        customer: false
                      }));
                    }, 150);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Type bank name"
                  autoComplete="off"
                />
                <BankSuggestions bankType="customer" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Required for bank transfers</p>
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

          {/* Auto Credit to Insurance Company - FIXED: Always show final premium amount */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-800 mb-3">Auto Credit to Insurance Company</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Amount (₹) *
                </label>
                <INRCurrencyInput
                  type="text"
                  name="autoCreditAmount"
                  value={finalPremiumAmount} // Always use final premium amount
                  onChange={handleAutoCreditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter auto credit amount"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto credit amount: ₹{formatIndianNumber(finalPremiumAmount)} (Final Premium)
                  {totalSubventionRefund > 0 && (
                    <span className="text-green-600">
                      {" "} - After subvention: ₹{formatIndianNumber(netPremium)}
                    </span>
                  )}
                </p>
                {autoCreditExists && (
                  <p className={`text-xs mt-1 ${
                    autoCreditStatus === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {autoCreditStatus === 'Completed' 
                      ? '✓ Auto credit completed' 
                      : `Auto credit status: ${autoCreditStatus}`}
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

              {/* UPDATED: Bank Name Input with Auto-suggest for Auto Credit (FIXED: Now properly clickable) */}
              <div className="bank-suggestions-container relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Bank Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="autoCreditBankName"
                    value={form.autoCreditBankName || ""}
                    onChange={(e) => handleBankNameChange(e, 'autoCredit')}
                    onFocus={() => handleBankFocus('autoCredit')}
                    onBlur={() => {
                      // Use setTimeout to allow click event to complete before hiding
                      setTimeout(() => {
                        setShowSuggestions(prev => ({
                          ...prev,
                          autoCredit: false
                        }));
                      }, 150);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Type bank name"
                    autoComplete="off"
                  />
                  <BankSuggestions bankType="autoCredit" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for bank transfers</p>
              </div>
            </div>
          </div>

          {/* Payment Made by Customer - OPTIONAL SECTION */}
          <div className="p-4 border border-gray-200 rounded-lg mb-4">
            <h5 className="text-sm font-semibold text-gray-800 mb-3">
              Payment Made by Customer (Optional)
              <span className="ml-2 text-xs font-normal text-gray-500">- Fill only if customer has made payment</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Mode
                </label>
                <select
                  name="inHousePaymentMode"
                  value={form.inHousePaymentMode || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="">Select payment mode</option>
                  {customerPaymentModeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Amount (₹)
                </label>
                <INRCurrencyInput
                  type="text"
                  name="inHousePaymentAmount"
                  value={form.inHousePaymentAmount || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ₹{formatIndianNumber(customerRemainingAmount)} (Customer can pay up to ₹{formatIndianNumber(netPremium)} total)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="inHousePaymentDate"
                  value={form.inHousePaymentDate || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
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

              {/* UPDATED: Bank Name Input with Auto-suggest for In House (FIXED: Now properly clickable) */}
              <div className="bank-suggestions-container relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Bank Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="inHouseBankName"
                    value={form.inHouseBankName || ""}
                    onChange={(e) => handleBankNameChange(e, 'inHouse')}
                    onFocus={() => handleBankFocus('inHouse')}
                    onBlur={() => {
                      // Use setTimeout to allow click event to complete before hiding
                      setTimeout(() => {
                        setShowSuggestions(prev => ({
                          ...prev,
                          inHouse: false
                        }));
                      }, 150);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Type bank name"
                    autoComplete="off"
                  />
                  <BankSuggestions bankType="inHouse" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for bank transfers</p>
              </div>
            </div>
          </div>

          {/* Add Payment Button - UPDATED: Enabled if either auto credit OR customer payment is filled */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={addInHousePaymentToLedger}
              disabled={!isInHousePaymentValid()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPlus /> Add In House Payment to Ledger
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
                {paymentLedger.map((payment) => {
                  // FIXED: Calculate dynamic status for each payment
                  const paymentStatus = calculatePaymentStatus(payment);
                  return (
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
                          paymentStatus === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : paymentStatus === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {paymentStatus}
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
                  );
                })}
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
        <SubventionForm />
      )}

      {/* Edit Payment Modal */}
      {editingState.isEditing && (
        <EditPaymentForm />
      )}

      {/* Next Step Button - UPDATED: Always enabled if there are payments */}
      {/* <div className="mt-6 flex justify-between items-center">
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
          disabled={paymentLedger.length === 0 || isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Proceed to Payout"} 
          <FaArrowRight />
        </button>
      </div> */}
    </div>
  );
};
// ================== STEP 8: Payout Details ==================
const PayoutDetails = ({ form, handleChange, handleSave, isSaving, errors, acceptedQuote, totalPremium, paymentLedger = [] }) => {
  const [showLossWarning, setShowLossWarning] = useState(false);
  const [calculatedNetAmount, setCalculatedNetAmount] = useState(null);
  const [percentageValue, setPercentageValue] = useState(form.odAddonPercentage || "");
  const [percentageTimeout, setPercentageTimeout] = useState(null);

  // Calculate subvention from payment ledger - FIXED: More accurate calculation
  const calculateSubventionFromLedger = useCallback((ledger) => {
    if (!ledger || !Array.isArray(ledger)) return 0;
    
    // FIXED: Use the same logic as Payment component for consistency
    const subventionRefunds = ledger.filter(payment => 
      payment.type === "subvention_refund"
    );
    
    const totalSubvention = subventionRefunds.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);
    
    console.log("💰 Subvention calculation from ledger:", {
      totalPayments: ledger.length,
      subventionRefunds: subventionRefunds.length,
      totalSubvention,
      subventionEntries: subventionRefunds.map(p => ({ amount: p.amount, description: p.description }))
    });
    
    return totalSubvention;
  }, []);

  const subventionFromLedger = calculateSubventionFromLedger(paymentLedger);
  const currentSubvention = parseFloat(form.subVention || 0);

  // CRITICAL FIX: Improved subvention synchronization
  useEffect(() => {
    console.log("🔄 PayoutDetails - Payment ledger changed:", {
      ledgerLength: paymentLedger.length,
      subventionFromLedger,
      currentSubvention,
      shouldUpdate: Math.abs(subventionFromLedger - currentSubvention) > 0.01
    });

    // Always sync subvention with ledger when they differ significantly
    if (Math.abs(subventionFromLedger - currentSubvention) > 0.01) {
      console.log("💰 Syncing subvention from ledger:", subventionFromLedger);
      handleChange({
        target: { 
          name: 'subVention', 
          value: subventionFromLedger.toString() 
        }
      });
    }
  }, [paymentLedger, subventionFromLedger, currentSubvention, handleChange]);

  // CRITICAL FIX: React to acceptedQuote changes in real-time
  useEffect(() => {
    console.log("🔄 PayoutDetails - Accepted quote changed:", acceptedQuote);
    
    if (acceptedQuote) {
      console.log("💰 Auto-updating payout from NEW accepted quote:", {
        insuranceCompany: acceptedQuote.insuranceCompany,
        totalPremium: acceptedQuote.totalPremium,
        odAmount: acceptedQuote.odAmount,
        addOnsPremium: acceptedQuote.addOnsPremium,
        odAddonTotal: calculateOdAddonTotal()
      });
      
      // Update net premium from new accepted quote (only if different)
      if (acceptedQuote.totalPremium && parseFloat(form.netPremium || 0) !== parseFloat(acceptedQuote.totalPremium)) {
        const premiumValue = parseFloat(acceptedQuote.totalPremium);
        console.log("💰 Setting net premium from NEW quote:", premiumValue);
        handleChange({
          target: {
            name: 'netPremium',
            value: premiumValue
          }
        });
      }
      
      // Update OD + Addon amount from new accepted quote (only if different)
      const odAddonTotal = calculateOdAddonTotal();
      if (odAddonTotal > 0 && parseFloat(form.odAddonAmount || 0) !== odAddonTotal) {
        console.log("💰 Setting OD + Addon amount from NEW quote:", odAddonTotal);
        handleChange({
          target: {
            name: 'odAddonAmount',
            value: odAddonTotal
          }
        });
      }
      
      // Update insurer from new accepted quote (only if different)
      if (acceptedQuote.insuranceCompany && form.insuranceCompany !== acceptedQuote.insuranceCompany) {
        console.log("🏢 Setting insurer from NEW quote:", acceptedQuote.insuranceCompany);
        handleChange({
          target: {
            name: 'insuranceCompany',
            value: acceptedQuote.insuranceCompany
          }
        });
      }
    }
  }, [acceptedQuote]); // This dependency ensures it runs when acceptedQuote changes

  // Sync local percentage state with form state
  useEffect(() => {
    setPercentageValue(form.odAddonPercentage || "");
  }, [form.odAddonPercentage]);

  // Debug: Log the accepted quote to see what data we're receiving
  useEffect(() => {
    console.log("🔍 PayoutDetails - Accepted Quote (REACTIVE):", acceptedQuote);
    console.log("🔍 PayoutDetails - OD Amount from quote:", acceptedQuote?.odAmount);
    console.log("🔍 PayoutDetails - Addons from quote:", acceptedQuote?.addOnsPremium);
    console.log("🔍 PayoutDetails - Insurer from quote:", acceptedQuote?.insuranceCompany);
    console.log("🔍 PayoutDetails - Subvention from ledger:", subventionFromLedger);
    console.log("🔍 PayoutDetails - Current OD+Addon in form:", form.odAddonAmount);
    console.log("🔍 PayoutDetails - Current Net Premium in form:", form.netPremium);
  }, [acceptedQuote, form.odAddonAmount, form.netPremium, subventionFromLedger]);

  // Calculate OD + Addon total from accepted quote - REACTIVE VERSION
  const calculateOdAddonTotal = () => {
    if (!acceptedQuote) return 0;
    
    const odAmount = acceptedQuote.odAmount || 0;
    const addOnsPremium = acceptedQuote.addOnsPremium || 0;
    const odAddonTotal = odAmount + addOnsPremium;
    
    console.log("💰 OD + Addon Calculation (REACTIVE):", { odAmount, addOnsPremium, odAddonTotal });
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

  // Also populate from total premium if available
  useEffect(() => {
    if (acceptedQuote && acceptedQuote.totalPremium && totalPremium > 0 && !form.netPremium) {
      console.log("💰 Setting net premium from totalPremium:", acceptedQuote.totalPremium);
      handleChange({
        target: {
          name: 'netPremium',
          value: parseFloat(acceptedQuote.totalPremium)
        }
      });
    }
  }, [totalPremium, acceptedQuote]);

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

  // Handle percentage input with debouncing
  const handlePercentageChange = (e) => {
    const value = e.target.value;
    
    // Update local state immediately for responsive UI
    setPercentageValue(value);
    
    // Clear existing timeout
    if (percentageTimeout) {
      clearTimeout(percentageTimeout);
    }
    
    // Set new timeout for debouncing (500ms delay)
    const timeout = setTimeout(() => {
      console.log("🎯 Debounced percentage update:", value);
      handleChange({
        target: {
          name: 'odAddonPercentage',
          value: value
        }
      });
    }, 500);
    
    setPercentageTimeout(timeout);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (percentageTimeout) {
        clearTimeout(percentageTimeout);
      }
    };
  }, [percentageTimeout]);

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

      {/* Real-time Debug Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
          <FaInfoCircle className="mr-2" />
          Real-time Quote Data
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-blue-600">Accepted Quote:</span>
            <div className="font-semibold">{acceptedQuote ? acceptedQuote.insuranceCompany : 'None'}</div>
          </div>
          <div>
            <span className="text-blue-600">Total Premium:</span>
            <div className="font-semibold">₹{acceptedQuote?.totalPremium?.toLocaleString('en-IN') || '0'}</div>
          </div>
          <div>
            <span className="text-blue-600">OD Amount:</span>
            <div>₹{acceptedQuote?.odAmount?.toLocaleString('en-IN') || '0'}</div>
          </div>
          <div>
            <span className="text-blue-600">Add-ons:</span>
            <div>₹{acceptedQuote?.addOnsPremium?.toLocaleString('en-IN') || '0'}</div>
          </div>
          <div className="md:col-span-2">
            <span className="text-blue-600">Calculated OD+Addon:</span>
            <div className="font-semibold">₹{calculateOdAddonTotal().toLocaleString('en-IN')}</div>
          </div>
          <div className="md:col-span-2">
            <span className="text-blue-600">Current Form OD+Addon:</span>
            <div className="font-semibold">₹{parseFloat(form.odAddonAmount || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>
        {acceptedQuote && (
          <div className="mt-2 text-xs text-blue-600">
            ✅ Auto-updating from: <strong>{acceptedQuote.insuranceCompany}</strong>
          </div>
        )}
      </div>

      {/* Loss Warning Modal */}
      {showLossWarning && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
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
                From accepted quote: ₹{parseFloat(acceptedQuote.totalPremium).toLocaleString('en-IN')}
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
                From accepted quote: ₹{odAddonTotalFromQuote.toLocaleString('en-IN')} 
                (OD: ₹{parseFloat(acceptedQuote.odAmount|| 0).toLocaleString('en-IN')} + 
                Add-ons: ₹{parseFloat(acceptedQuote.addOnsPremium || 0).toLocaleString('en-IN')})
              </p>
            )}
          </div>

          {/* Percentage of OD + Addons - WITH DEBOUNCING */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Payout (%) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                name="odAddonPercentage"
                value={percentageValue}
                onChange={handlePercentageChange}
                placeholder="10"
                max="100"
                className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  errors.odAddonPercentage ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="text-gray-500 font-medium whitespace-nowrap">%</span>
            </div>
            {errors.odAddonPercentage && <p className="text-red-500 text-xs mt-1">{errors.odAddonPercentage}</p>}
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <FaInfoCircle className="w-3 h-3 mr-1 text-blue-500" />
              Enter the percentage to apply on OD + Addon amount (e.g., 80%, 90%, 100%)
              <span className="ml-1 text-blue-600 font-medium">• Debounced (500ms)</span>
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
                <span className="text-gray-600">Payout (%):</span>
                <div className="font-semibold">{breakdown.percentage}%</div>
              </div>
              <div>
                <span className="text-gray-600">Payout Amount:</span>
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
  const hasInitializedRenewal = useRef(false); // NEW: Track renewal initialization
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    buyer_type: "individual",
    vehicleType: "used",
    insurance_category: "motor",
    status: "draft",
    ts: Date.now(),
    created_by: "ADMIN123",
    insuranceQuotes: [],
    previousClaimTaken: "no",
    // FIXED: Don't hardcode default, let API data determine it
    creditType: "", // Changed from "auto" to empty string
    hidePayout: false,
    // NEW: Added brokerName field
    brokerName: "",
    // NEW: Added sourceOrigin field
    sourceOrigin: "",
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
    // NEW: Added cubicCapacity field
    cubicCapacity: "",
    engineNo: "",
    chassisNo: "",
    // NEW: Added vehicleTypeCategory field
    vehicleTypeCategory: "4 wheeler",
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
    previousTpExpiryDate: "",
    previousDueDate: "",
    previousNcbDiscount: "",
    // NEW: Previous Policy Hypothecation
    previousHypothecation: "",
    // NEW: Previous Policy Remarks
    previousPolicyRemarks: "",
    // Insurance Quote fields - UPDATED: Added new IDV fields
    insurer: "",
    coverageType: "",
    premium: "",
    idv: "",
    ncb: "",
    duration: "",
    vehicleIdv: "", // NEW: Vehicle IDV field
    cngIdv: "",     // NEW: CNG IDV field
    accessoriesIdv: "", // NEW: Accessories IDV field
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
    policyType: "",
    odExpiryDate: "",
    tpExpiryDate: "",
    // NEW: New Policy Hypothecation
    hypothecation: "",
    // NEW: New Policy Remarks
    newPolicyRemarks: "",
    // Documents
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
    odAddonPercentage: 10,
    odAddonAmount: "",
    netAmount: "",
    odAmount: "",
    ncbAmount: "",
    subVention: "",
    // Additional fields
    policyPrefilled: false,
    // Renewal fields
    renewal_id: "",
    isRenewal: false
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

  // FIXED: Add debounce utility and update prevention
  const [isUpdating, setIsUpdating] = useState(false);
  const lastUpdateRef = useRef(0);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Get individual parameters
  const isRenewal = queryParams.get('renewal') === 'true';
  const renewalPolicyId = queryParams.get('renewal_id');

  // ============ COMPREHENSIVE POLICY DURATION UTILITIES ============
  
  // Unified duration mappings for ALL components
  const policyDurationMappings = {
    // Comprehensive policies - simple numbers to comprehensive labels
    "1": { 
      value: "1", 
      label: "1yr OD + 3yr TP",
      odYears: 1,
      tpYears: 3,
      type: "comprehensive"
    },
    "2": { 
      value: "2", 
      label: "2yr OD + 3yr TP",
      odYears: 2,
      tpYears: 3,
      type: "comprehensive"
    },
    "3": { 
      value: "3", 
      label: "3yr OD + 3yr TP",
      odYears: 3,
      tpYears: 3,
      type: "comprehensive"
    },
    
    // Specific comprehensive formats
    "1yr_od_1yr_tp": { 
      value: "1yr_od_1yr_tp", 
      label: "1yr OD + 1yr TP",
      odYears: 1,
      tpYears: 1,
      type: "comprehensive"
    },
    
    // Standalone OD policies
    "1_od": { 
      value: "1_od", 
      label: "1 Year",
      odYears: 1,
      tpYears: 0,
      type: "standalone"
    },
    "2_od": { 
      value: "2_od", 
      label: "2 Years",
      odYears: 2,
      tpYears: 0,
      type: "standalone"
    },
    "3_od": { 
      value: "3_od", 
      label: "3 Years",
      odYears: 3,
      tpYears: 0,
      type: "standalone"
    },
    
    // Third Party policies
    "1_tp": { 
      value: "1_tp", 
      label: "1 Year",
      odYears: 0,
      tpYears: 1,
      type: "thirdParty"
    },
    "2_tp": { 
      value: "2_tp", 
      label: "2 Years",
      odYears: 0,
      tpYears: 2,
      type: "thirdParty"
    },
    "3_tp": { 
      value: "3_tp", 
      label: "3 Years",
      odYears: 0,
      tpYears: 3,
      type: "thirdParty"
    },
    
    // Simple year formats (backward compatibility)
    "1 Year": { 
      value: "1 Year", 
      label: "1 Year",
      odYears: 1,
      tpYears: 1,
      type: "simple"
    },
    "2 Years": { 
      value: "2 Years", 
      label: "2 Years",
      odYears: 2,
      tpYears: 2,
      type: "simple"
    },
    "3 Years": { 
      value: "3 Years", 
      label: "3 Years",
      odYears: 3,
      tpYears: 3,
      type: "simple"
    }
  };

  // Format policy duration for display (used everywhere)
  const formatPolicyDuration = (duration) => {
    if (!duration) return '';
    
    // If it's already a properly formatted label, return as is
    if (typeof duration === 'string' && (duration.includes('OD') || duration.includes('Year') || duration.includes('Years'))) {
      return duration;
    }

    // Convert to string for consistent comparison
    const durationStr = String(duration).trim();
    
    // Look up in mappings
    const mapping = policyDurationMappings[durationStr];
    if (mapping) {
      return mapping.label;
    }
    
    // Fallback: return as is
    return durationStr;
  };

  // Get duration options based on policy type (used in PreviousPolicy and NewPolicy)
  const getPolicyDurationOptions = (policyType) => {
    const options = [];
    
    switch (policyType) {
      case "comprehensive":
        options.push(
          { value: "1yr_od_1yr_tp", label: "1yr OD + 1yr TP" },
          { value: "1", label: "1yr OD + 3yr TP" },
          { value: "2", label: "2yr OD + 3yr TP" },
          { value: "3", label: "3yr OD + 3yr TP" }
        );
        break;
        
      case "standalone":
        options.push(
          { value: "1_od", label: "1 Year" },
          { value: "2_od", label: "2 Years" },
          { value: "3_od", label: "3 Years" }
        );
        break;
        
      case "thirdParty":
        options.push(
          { value: "1_tp", label: "1 Year" },
          { value: "2_tp", label: "2 Years" },
          { value: "3_tp", label: "3 Years" }
        );
        break;
        
      default:
        // Default comprehensive options
        options.push(
          { value: "1yr_od_1yr_tp", label: "1yr OD + 1yr TP" },
          { value: "1", label: "1yr OD + 3yr TP" },
          { value: "2", label: "2yr OD + 3yr TP" },
          { value: "3", label: "3yr OD + 3yr TP" }
        );
    }
    
    return options;
  };

  // Map quote duration to form duration (used in NewPolicyDetails)
  const mapQuoteDurationToForm = (quoteDuration, policyType) => {
    if (!quoteDuration) return '';
    
    const durationStr = String(quoteDuration).trim();
    
    // First, try exact match
    const exactMatch = Object.values(policyDurationMappings).find(
      mapping => mapping.value === durationStr || mapping.label === durationStr
    );
    
    if (exactMatch) {
      return exactMatch.value;
    }
    
    // For comprehensive policies, handle simple numbers
    if (policyType === "comprehensive" && ["1", "2", "3"].includes(durationStr)) {
      return durationStr; // Use simple numbers for comprehensive
    }
    
    // Try partial matching for labels
    const partialMatch = Object.values(policyDurationMappings).find(mapping => 
      durationStr.includes(mapping.value) || mapping.label.includes(durationStr)
    );
    
    if (partialMatch) {
      return partialMatch.value;
    }
    
    // Fallback: return the first option for the policy type
    const options = getPolicyDurationOptions(policyType);
    return options.length > 0 ? options[0].value : '';
  };

  // Calculate expiry dates based on duration (used in PreviousPolicy and NewPolicy)
  const calculateExpiryDates = (startDate, durationValue, policyType) => {
    if (!startDate || !durationValue) return { odExpiry: '', tpExpiry: '' };
    
    const mapping = policyDurationMappings[durationValue];
    if (!mapping) return { odExpiry: '', tpExpiry: '' };
    
    const start = new Date(startDate);
    
    const calculateDate = (years) => {
      if (years === 0) return '';
      const date = new Date(start);
      date.setFullYear(date.getFullYear() + years);
      date.setDate(date.getDate() - 1); // Subtract 1 day
      return date.toISOString().split('T')[0];
    };
    
    return {
      odExpiry: calculateDate(mapping.odYears),
      tpExpiry: calculateDate(mapping.tpYears)
    };
  };

  // UPDATED: Check if payout should be hidden based on credit type
  const shouldHidePayout = () => {
    return form.creditType === "showroom" || form.creditType === "customer";
  };

  // Debounce utility function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

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

  // Function to get actual steps based on vehicle type AND credit type
  const getSteps = () => {
    let filteredSteps = [...steps];
    
    // Remove Previous Policy for new vehicles
    if (form.vehicleType === "new") {
      filteredSteps = filteredSteps.filter(step => step !== "Previous Policy");
    }
    
    // Remove Payout for showroom/customer credit types
    if (shouldHidePayout()) {
      filteredSteps = filteredSteps.filter(step => step !== "Payout");
    }
    
    return filteredSteps;
  };

  // Function to get actual step number for navigation
  const getActualStep = (displayStep) => {
    let actualStep = displayStep;
    
    // Adjust for skipped steps
    if (form.vehicleType === "new" && displayStep >= 3) {
      actualStep += 1; // Skip Previous Policy
    }
    
    if (shouldHidePayout() && displayStep >= steps.indexOf("Payout") + 1) {
      // If payout is hidden and we're beyond payout step, adjust
      const payoutIndex = steps.indexOf("Payout");
      if (displayStep > payoutIndex) {
        actualStep -= 1;
      }
    }
    
    return actualStep;
  };

  // Function to get display step number
  const getDisplayStep = (actualStep) => {
    let displayStep = actualStep;
    
    // Adjust for skipped steps
    if (form.vehicleType === "new" && actualStep >= 3) {
      displayStep -= 1; // Skip Previous Policy
    }
    
    if (shouldHidePayout() && actualStep > steps.indexOf("Payout")) {
      displayStep -= 1; // Skip Payout
    }
    
    return displayStep;
  };

  // FIXED: Function to handle step click - ALLOW ALL STEPS IN RENEWAL
  const handleStepClick = (clickedStep) => {
    if (isSaving || isCompleted) return;
    
    const actualStep = getActualStep(clickedStep);
    
    // FIXED: Always allow navigation to any step, even in renewal cases
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
    if (acceptedQuote && acceptedQuote.totalPremium) {
      console.log("✅ Using totalPremium from accepted quote:", acceptedQuote.totalPremium);
      return parseFloat(acceptedQuote.totalPremium);
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
      if (acceptedQuoteFromArray && acceptedQuoteFromArray.totalPremium) {
        console.log("✅ Using premium from accepted quote in insuranceQuotes array:", acceptedQuoteFromArray.totalPremium);
        return parseFloat(acceptedQuoteFromArray.totalPremium);
      }
    }
    
    console.log("❌ No premium found, defaulting to 0");
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
    console.log("   - Credit Type:", form.creditType);
    console.log("   - Hide Payout:", shouldHidePayout());
  }, [acceptedQuote, form.premium, form.totalPremium, form.insuranceQuotes, totalPremium, form.vehicleType, form.creditType]);

  // Debug effect for payment ledger
  useEffect(() => {
    console.log("💰 Payment Ledger Updated:", {
      ledger: paymentLedger,
      length: paymentLedger.length,
      total: paymentLedger.reduce((sum, p) => sum + p.amount, 0)
    });
  }, [paymentLedger]);

  // DEBUG: Track credit type changes
  useEffect(() => {
    console.log("💳 Credit Type Debug:", {
      currentCreditType: form.creditType,
      brokerName: form.brokerName,
      sourceOrigin: form.sourceOrigin,
      hidePayout: form.hidePayout,
      step: step,
      policyId: policyId
    });
  }, [form.creditType, form.brokerName, form.sourceOrigin, form.hidePayout, step, policyId]);

  // DEBUG: Track credit type loading
  useEffect(() => {
    console.log("🔍 Credit Type Loading Debug:", {
      policyId: id,
      isEditMode: isEditMode,
      currentCreditType: form.creditType,
      brokerName: form.brokerName,
      sourceOrigin: form.sourceOrigin,
      loadingPolicy: loadingPolicy,
      step: step
    });
  }, [id, isEditMode, form.creditType, form.brokerName, form.sourceOrigin, loadingPolicy, step]);

  // FIXED: Optimized quote acceptance handler with renewal reset logic
  const handleQuoteAccepted = useCallback((quote) => {
    console.log("✅ Quote accepted in parent:", quote);
    
    // If this is a renewal case and we're accepting a new quote, clear all subsequent steps
    if (form.isRenewal) {
      console.log("🔄 Renewal case - clearing subsequent steps data");
      
      // Reset all fields from Insurance Quotes onward
      setForm(prev => ({
        ...prev,
        // Reset insurance quote legacy fields
        insurer: "",
        coverageType: "",
        premium: "",
        idv: "",
        ncb: "",
        duration: "",
        // Reset new IDV fields
        vehicleIdv: "",
        cngIdv: "",
        accessoriesIdv: "",
        // Reset new policy fields
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
        policyType: "",
        odExpiryDate: "",
        tpExpiryDate: "",
        // Reset new policy hypothecation
        hypothecation: "",
        // Reset new policy remarks
        newPolicyRemarks: "",
        // Reset payment fields
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
        // Reset payout fields
        netPremium: "",
        odAddonAmount: "",
        netAmount: "",
        odAmount: "",
        ncbAmount: "",
        subVention: ""
      }));
      
      // Clear payment ledger
      setPaymentLedger([]);
      
      setSaveMessage("🔄 Renewal case: New quote accepted. Subsequent steps have been reset for new policy data.");
    }
    
    setAcceptedQuote(quote);
  }, [form.isRenewal]);

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
        vehicleIdv: "",
        cngIdv: "",
        accessoriesIdv: "",
        insuranceQuotes: [],
        previousClaimTaken: "no",
        vehicleType: ""
      }));
      
      setAcceptedQuote(null);
      setPaymentLedger([]);
      hasClearedStorage.current = true;
    }
  }, [isEditMode, id]);

  // Debug when component mounts
  useEffect(() => {
    console.log("Component mounted - Edit Mode:", isEditMode, "Policy ID:", id);
  }, [isEditMode, id]);

  // FIXED: Initialize renewal state on component mount with proper handling
  useEffect(() => {
    if (isRenewal) {
      console.log("🔄 Initializing renewal case:", {
        isRenewal,
        renewalPolicyId,
        currentPolicyId: id,
        location: window.location.href
      });
      
      // Set renewal flags and convert vehicle type to used for renewals
      setForm(prev => ({
        ...prev,
        isRenewal: true,
        renewal_id: renewalPolicyId || "",
        vehicleType: "used" // Renewals are always for used vehicles
      }));

      // If we have a renewal policy ID and NO current ID, fetch its data for NEW renewal
      if (renewalPolicyId && !id) {
        console.log("📋 Fetching renewal source policy data for NEW renewal:", renewalPolicyId);
        fetchRenewalPolicyData(renewalPolicyId);
      }
      // If we have both renewalPolicyId and id, we're editing an existing renewal
      else if (renewalPolicyId && id) {
        console.log("📝 Editing existing renewal policy:", id);
        // The main useEffect below will handle this case
      }
    }
  }, [isRenewal, renewalPolicyId, id]);

  // FIXED: Handle both regular edit and renewal cases
  useEffect(() => {
    if (id) {
      if (isRenewal) {
        console.log("🔄 Renewal edit mode - fetching renewal policy data for ID:", id);
        fetchRenewalPolicyData(id);
      } else {
        console.log("📝 Regular edit mode - fetching policy data for ID:", id);
        fetchPolicyData(id);
      }
    }
  }, [id, isRenewal]);

  // DEBUG: Track renewal state changes
  useEffect(() => {
    console.log("🔍 Renewal State Debug:", {
      isRenewal,
      renewalPolicyId,
      id,
      step,
      formIsRenewal: form.isRenewal,
      formRenewalId: form.renewal_id,
      loadingPolicy
    });
  }, [isRenewal, renewalPolicyId, id, step, form.isRenewal, form.renewal_id, loadingPolicy]);

  // FIXED: Effect to handle initial step setting for renewal cases - ALLOW ACCESS TO ALL STEPS
  useEffect(() => {
    // Only run initial navigation once when component mounts and it's a renewal case
    if (form.isRenewal && !loadingPolicy && step === 1 && !hasInitializedRenewal.current) {
      console.log("🔄 Initial renewal setup - navigating to Previous Policy step");
      hasInitializedRenewal.current = true;
      setStep(3);
      
      // Clear any accepted quote for renewal cases
      if (acceptedQuote) {
        console.log("🔄 Clearing accepted quote for renewal case");
        setAcceptedQuote(null);
      }
    }
  }, [form.isRenewal, loadingPolicy, step, acceptedQuote]);

  // ENHANCED: Function to fetch renewal policy data for both new renewals and editing existing renewals
  const fetchRenewalPolicyData = async (policyId) => {
    setLoadingPolicy(true);
    try {
      console.log("🔍 Fetching renewal policy data for ID:", policyId);
      const response = await axios.get(`${API_BASE_URL}/policies/${policyId}`);
      const policyData = response.data;
      
      console.log("📦 Full Renewal API Response:", policyData);
      
      if (!policyData || !policyData.data) {
        console.error("❌ No renewal policy data received from API");
        setSaveMessage("❌ No renewal policy data found for this ID");
        return;
      }

      const renewalData = policyData.data;
      console.log("📊 Renewal Policy Data:", renewalData);
      
      // CRITICAL FIX: Properly load credit type from renewal data
      const creditTypeFromRenewal = renewalData.creditType || 
                                   renewalData.customer_details?.creditType || 
                                   "auto";
      
      console.log("💳 Renewal Credit Type Loading Debug:", {
        rootCreditType: renewalData.creditType,
        customerDetailsCreditType: renewalData.customer_details?.creditType,
        finalCreditType: creditTypeFromRenewal
      });
      
      // Check if this is a new renewal (creating from existing policy) 
      // or editing an existing renewal policy
      const isNewRenewal = !renewalData.isRenewal; // If the source policy is not already a renewal
      
      if (isNewRenewal) {
        console.log("🔄 Creating NEW renewal from existing policy");
        // Map renewal policy data to current form for NEW renewal case
        // Only populate Case Details, Vehicle Details, and Previous Policy
        const renewalFormData = {
          // Basic info
          buyer_type: renewalData.buyer_type || "individual",
          vehicleType: "used", // Renewals are always used vehicles
          insurance_category: renewalData.insurance_category || "motor",
          status: "draft",
          // FIXED: Properly preserve credit type from source policy
          creditType: creditTypeFromRenewal,
          hidePayout: creditTypeFromRenewal === "showroom" || creditTypeFromRenewal === "customer",
          // NEW: Preserve broker name if exists
          brokerName: renewalData.brokerName || renewalData.customer_details?.brokerName || "",
          // NEW: Preserve source origin if exists
          sourceOrigin: renewalData.sourceOrigin || renewalData.customer_details?.sourceOrigin || "",
          
          // Customer details
          customerName: renewalData.customer_details?.name || "",
          mobile: renewalData.customer_details?.mobile || "",
          email: renewalData.customer_details?.email || "",
          employeeName: renewalData.customer_details?.employeeName || "",
          age: renewalData.customer_details?.age || "",
          gender: renewalData.customer_details?.gender || "",
          panNumber: renewalData.customer_details?.panNumber || "",
          aadhaarNumber: renewalData.customer_details?.aadhaarNumber || "",
          residenceAddress: renewalData.customer_details?.residenceAddress || "",
          pincode: renewalData.customer_details?.pincode || "",
          city: renewalData.customer_details?.city || "",
          alternatePhone: renewalData.customer_details?.alternatePhone || "",
          
          // Corporate fields
          companyName: renewalData.customer_details?.companyName || "",
          contactPersonName: renewalData.customer_details?.contactPersonName || "",
          companyPanNumber: renewalData.customer_details?.companyPanNumber || "",
          gstNumber: renewalData.customer_details?.gstNumber || "",
          
          // Nominee
          nomineeName: renewalData.nominee?.name || "",
          relation: renewalData.nominee?.relation || "",
          nomineeAge: renewalData.nominee?.age || "",
          
          // Reference
          referenceName: renewalData.reference?.name || renewalData.refrence?.name || "",
          referencePhone: renewalData.reference?.phone || renewalData.refrence?.phone || "",
          
          // Vehicle details
          regNo: renewalData.vehicle_details?.regNo || "",
          make: renewalData.vehicle_details?.make || "",
          model: renewalData.vehicle_details?.model || "",
          variant: renewalData.vehicle_details?.variant || "",
          cubicCapacity: renewalData.vehicle_details?.cubicCapacity || "",
          vehicleTypeCategory: renewalData.vehicle_details?.vehicleTypeCategory || "4 wheeler",
          engineNo: renewalData.vehicle_details?.engineNo || "",
          chassisNo: renewalData.vehicle_details?.chassisNo || "",
          makeMonth: renewalData.vehicle_details?.makeMonth || "",
          makeYear: renewalData.vehicle_details?.makeYear || "",
          
          // Map new policy data from renewal to previous policy for the renewal case
          // FIXED: Auto-populate previous policy hypothecation from new policy hypothecation
          previousInsuranceCompany: renewalData.policy_info?.insuranceCompany || "",
          previousPolicyNumber: renewalData.policy_info?.policyNumber || "",
          previousPolicyType: renewalData.policy_info?.policyType || "",
          previousIssueDate: renewalData.policy_info?.issueDate || "",
          previousPolicyStartDate: renewalData.policy_info?.policyStartDate || "",
          previousPolicyDuration: renewalData.policy_info?.insuranceDuration || "",
          previousPolicyEndDate: renewalData.policy_info?.odExpiryDate || renewalData.policy_info?.tpExpiryDate || "",
          previousTpExpiryDate: renewalData.policy_info?.tpExpiryDate || "",
          previousDueDate: renewalData.policy_info?.dueDate || "",
          previousClaimTaken: renewalData.previous_policy?.claimTakenLastYear || "no",
          previousNcbDiscount: renewalData.policy_info?.ncbDiscount || renewalData.previous_policy?.ncbDiscount || "",
          // FIXED: Auto-populate previous policy hypothecation from new policy hypothecation
          previousHypothecation: renewalData.policy_info?.hypothecation || renewalData.previous_policy?.hypothecation || "",
          // FIXED: Auto-populate previous policy remarks from new policy remarks
          previousPolicyRemarks: renewalData.policy_info?.remarks || renewalData.previous_policy?.remarks || "",
          
          // Renewal fields
          renewal_id: policyId,
          isRenewal: true,
          
          // CRITICAL: Reset all subsequent steps for new renewal including new IDV fields
          insuranceQuotes: [],
          insurer: "",
          coverageType: "",
          premium: "",
          idv: "",
          ncb: "",
          duration: "",
          vehicleIdv: "",
          cngIdv: "",
          accessoriesIdv: "",
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
          policyType: "",
          odExpiryDate: "",
          tpExpiryDate: "",
          // NEW: Reset new policy hypothecation
          hypothecation: "",
          // NEW: Reset new policy remarks
          newPolicyRemarks: "",
          documents: {},
          documentTags: {},
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
          netPremium: "",
          odAddonPercentage: 10,
          odAddonAmount: "",
          netAmount: "",
          odAmount: "",
          ncbAmount: "",
          subVention: "",
          policyPrefilled: true
        };
        
        console.log("✅ NEW Renewal Form Data Prepared with credit type:", {
          creditType: renewalFormData.creditType,
          brokerName: renewalFormData.brokerName,
          sourceOrigin: renewalFormData.sourceOrigin,
          hidePayout: renewalFormData.hidePayout,
          previousHypothecation: renewalFormData.previousHypothecation,
          previousPolicyRemarks: renewalFormData.previousPolicyRemarks
        });
        setForm(renewalFormData);
        
        // CRITICAL: Clear accepted quote for new renewal
        setAcceptedQuote(null);
        setPaymentLedger([]);
        
        setSaveMessage("✅ Renewal case initialized! Previous policy data has been populated. Please proceed with new insurance quotes.");
        
      } else {
        console.log("📝 Editing EXISTING renewal policy");
        // This is editing an existing renewal policy - use the regular fetchPolicyData logic
        // but ensure renewal flags are preserved and accepted quote is cleared
        await fetchPolicyData(policyId);
        
        // Ensure renewal flags are set and clear accepted quote
        setForm(prev => ({
          ...prev,
          isRenewal: true,
          renewal_id: renewalData.renewal_id || policyId
        }));
        
        // Clear accepted quote for renewal edit
        setAcceptedQuote(null);
        console.log("🔄 Cleared accepted quote for renewal edit case");
      }
      
    } catch (error) {
      console.error("❌ Error fetching renewal policy data:", error);
      setSaveMessage(`❌ Error loading renewal data: ${error.message}`);
    } finally {
      setLoadingPolicy(false);
    }
  };

  // ENHANCED: Function to fetch policy data with consistent duration handling and new IDV fields
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
      
      // CRITICAL FIX: Properly load credit type from API data
      // First check if creditType exists at root level, then check customer_details
      const creditTypeFromAPI = actualData.creditType || 
                               actualData.customer_details?.creditType || 
                               "auto";
      
      console.log("💳 Credit Type Loading Debug:", {
        rootCreditType: actualData.creditType,
        customerDetailsCreditType: actualData.customer_details?.creditType,
        finalCreditType: creditTypeFromAPI
      });

      // FIXED: Process insurance quotes with consistent duration handling and new IDV fields
      let processedInsuranceQuotes = [];
      if (actualData.insurance_quotes && Array.isArray(actualData.insurance_quotes)) {
        processedInsuranceQuotes = actualData.insurance_quotes.map(quote => {
          // Ensure NCB discount amount is calculated if missing
          let ncbDiscountAmount = quote.ncbDiscountAmount;
          if (!ncbDiscountAmount && quote.odAmount && quote.ncbDiscount) {
            ncbDiscountAmount = Math.round(quote.odAmount * (quote.ncbDiscount / 100));
          }

          // ENHANCED: Use consistent policy duration formatting
          let policyDurationLabel = quote.policyDurationLabel;
          if (!policyDurationLabel && quote.policyDuration) {
            policyDurationLabel = formatPolicyDuration(quote.policyDuration.toString());
          }

          return {
            ...quote,
            ncbDiscountAmount: ncbDiscountAmount || 0,
            policyDurationLabel: policyDurationLabel || quote.policyDuration,
            odAmountAfterNcb: quote.odAmountAfterNcb || (quote.odAmount - (ncbDiscountAmount || 0)),
            // Ensure new IDV fields are included
            vehicleIdv: quote.vehicleIdv || 0,
            cngIdv: quote.cngIdv || 0,
            accessoriesIdv: quote.accessoriesIdv || 0
          };
        });
        
        console.log("✅ Processed insurance quotes with consistent duration and new IDV fields:", processedInsuranceQuotes);
      }

      // CRITICAL FIX: Properly map previous policy data including TP expiry date, hypothecation and remarks
      const previousPolicyData = actualData.previous_policy || {};
      
      console.log("🔍 Previous Policy Data from API:", previousPolicyData);

      // CRITICAL FIX: Properly map new policy data including expiry dates, hypothecation and remarks
      const policyInfoData = actualData.policy_info || {};
      
      console.log("🔍 New Policy Data from API:", policyInfoData);

      // Transform documents array to object with tagging
      const documentsObject = {};
      const documentTagsObject = {};
      if (actualData.documents && Array.isArray(actualData.documents)) {
        actualData.documents.forEach((doc, index) => {
          const docId = `doc_${index}`;
          documentsObject[docId] = doc;
          documentTagsObject[docId] = doc.tag || "";
        });
      }

      // Find accepted quote from processed insurance quotes
      let acceptedQuoteData = null;
      if (processedInsuranceQuotes.length > 0) {
        acceptedQuoteData = processedInsuranceQuotes.find(quote => quote.accepted === true);
        if (!acceptedQuoteData && processedInsuranceQuotes.length > 0) {
          acceptedQuoteData = processedInsuranceQuotes[0];
        }
      }

      // NEW: Clear accepted quote if this is a renewal case
      if (actualData.isRenewal) {
        console.log("🔄 Renewal case detected - clearing accepted quote");
        acceptedQuoteData = null;
      }

      // Create a clean transformed data object with ALL fields properly mapped including credit type, broker name, and source origin
      const transformedData = {
        // Basic info
        buyer_type: actualData.buyer_type || "individual",
        vehicleType: actualData.vehicleType || "used",
        insurance_category: actualData.insurance_category || "motor",
        status: actualData.status || "draft",
        // CRITICAL FIX: Properly load credit type from API
        creditType: creditTypeFromAPI,
        hidePayout: actualData.hidePayout || (creditTypeFromAPI === "showroom" || creditTypeFromAPI === "customer"),
        // NEW: Load broker name
        brokerName: actualData.brokerName || actualData.customer_details?.brokerName || "",
        // NEW: Load source origin
        sourceOrigin: actualData.sourceOrigin || actualData.customer_details?.sourceOrigin || "",
        
        // Customer details - handle both individual and corporate
        customerName: actualData.customer_details?.name || "",
        mobile: actualData.customer_details?.mobile || "",
        email: actualData.customer_details?.email || "",
        employeeName: actualData.customer_details?.employeeName || "",
        age: actualData.customer_details?.age || "",
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
        
        // Reference - FIXED: Corrected spelling
        referenceName: actualData.reference?.name || actualData.refrence?.name || "",
        referencePhone: actualData.reference?.phone || actualData.refrence?.phone || "",
        
        // Vehicle details
        regNo: actualData.vehicle_details?.regNo || "",
        make: actualData.vehicle_details?.make || "",
        model: actualData.vehicle_details?.model || "",
        variant: actualData.vehicle_details?.variant || "",
        cubicCapacity: actualData.vehicle_details?.cubicCapacity || "",
        vehicleTypeCategory: actualData.vehicle_details?.vehicleTypeCategory || "4 wheeler",
        engineNo: actualData.vehicle_details?.engineNo || "",
        chassisNo: actualData.vehicle_details?.chassisNo || "",
        makeMonth: actualData.vehicle_details?.makeMonth || "",
        makeYear: actualData.vehicle_details?.makeYear || "",
        
        // Previous policy - CRITICAL FIX: Include all expiry dates, hypothecation and remarks
        previousInsuranceCompany: previousPolicyData.insuranceCompany || "",
        previousPolicyNumber: previousPolicyData.policyNumber || "",
        previousPolicyType: previousPolicyData.policyType || "",
        previousIssueDate: previousPolicyData.issueDate || "",
        previousDueDate: previousPolicyData.dueDate || "",
        previousPolicyStartDate: previousPolicyData.policyStartDate || "", 
        previousPolicyDuration: previousPolicyData.policyDuration || "",
        previousPolicyEndDate: previousPolicyData.policyEndDate || "",
        previousTpExpiryDate: previousPolicyData.tpExpiryDate || "",
        previousClaimTaken: previousPolicyData.claimTakenLastYear || "no",
        previousNcbDiscount: previousPolicyData.ncbDiscount || "",
        // NEW: Previous policy hypothecation
        previousHypothecation: previousPolicyData.hypothecation || "",
        // NEW: Previous policy remarks
        previousPolicyRemarks: previousPolicyData.remarks || "",
        
        // Insurance quotes - use processed quotes with new IDV fields
        insuranceQuotes: processedInsuranceQuotes,
        
        // Insurance quote (legacy) - UPDATED: Include new IDV fields
        insurer: actualData.insurance_quote?.insurer || "",
        coverageType: actualData.insurance_quote?.coverageType || "",
        premium: actualData.insurance_quote?.premium || "",
        idv: actualData.insurance_quote?.idv || "",
        ncb: actualData.insurance_quote?.ncb || "",
        duration: actualData.insurance_quote?.duration || "",
        vehicleIdv: actualData.insurance_quote?.vehicleIdv || "",
        cngIdv: actualData.insurance_quote?.cngIdv || "",
        accessoriesIdv: actualData.insurance_quote?.accessoriesIdv || "",
        
        // Policy info - CRITICAL FIX: Include all expiry dates, policy type, hypothecation and remarks
        policyIssued: policyInfoData.policyIssued || "",
        insuranceCompany: policyInfoData.insuranceCompany || "",
        policyNumber: policyInfoData.policyNumber || "",
        covernoteNumber: policyInfoData.covernoteNumber || "",
        issueDate: policyInfoData.issueDate || "",
        policyStartDate: policyInfoData.policyStartDate || "",
        dueDate: policyInfoData.dueDate || "",
        ncbDiscount: policyInfoData.ncbDiscount || "",
        insuranceDuration: policyInfoData.insuranceDuration || "",
        idvAmount: policyInfoData.idvAmount || "",
        totalPremium: policyInfoData.totalPremium || "",
        policyType: policyInfoData.policyType || "",
        odExpiryDate: policyInfoData.odExpiryDate || "",
        tpExpiryDate: policyInfoData.tpExpiryDate || "",
        // NEW: New policy hypothecation
        hypothecation: policyInfoData.hypothecation || "",
        // NEW: New policy remarks
        newPolicyRemarks: policyInfoData.remarks || "",
        
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
        odAddonPercentage: actualData.payout?.odAddonPercentage || 10,
        odAddonAmount: actualData.payout?.odAddonAmount || "",
        netAmount: actualData.payout?.netAmount || "",
        
        // Documents as object
        documents: documentsObject,
        documentTags: documentTagsObject,
        
        // Renewal fields
        renewal_id: actualData.renewal_id || "",
        isRenewal: actualData.isRenewal || false,
        
        // System fields
        ts: actualData.ts || Date.now(),
        created_by: actualData.created_by || "ADMIN123",
        policyPrefilled: true
      };
      
      console.log("✅ Transformed Form Data with proper credit type loading:", {
        creditType: transformedData.creditType,
        brokerName: transformedData.brokerName,
        sourceOrigin: transformedData.sourceOrigin,
        hidePayout: transformedData.hidePayout,
        previousHypothecation: transformedData.previousHypothecation,
        previousPolicyRemarks: transformedData.previousPolicyRemarks
      });
      
      setForm(transformedData);
      
      // Set accepted quote from processed quotes (only if not renewal)
      if (acceptedQuoteData && !actualData.isRenewal) {
        console.log("✅ Setting accepted quote from processed data:", acceptedQuoteData.insuranceCompany);
        setAcceptedQuote(acceptedQuoteData);
      } else if (actualData.isRenewal) {
        console.log("🔄 Renewal case - not setting accepted quote");
        setAcceptedQuote(null);
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

  // Enhanced handleChange to properly handle all field types including new IDV fields, credit type, broker name, and source origin
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
    
    // UPDATED: Handle credit type change with payout visibility logic and broker name reset
    if (name === "creditType") {
      const hidePayout = value === "showroom" || value === "customer";
      // Clear broker name if credit type is changed from broker to something else
      const brokerName = value === "broker" ? form.brokerName : "";
      
      setForm((f) => ({ 
        ...f, 
        [name]: value,
        hidePayout: hidePayout,
        brokerName: brokerName
      }));
      return;
    }
    
    // Handle broker name change
    if (name === "brokerName") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // NEW: Handle source origin change
    if (name === "sourceOrigin") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // Handle new IDV fields
    if (name === "vehicleIdv" || name === "cngIdv" || name === "accessoriesIdv") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // Handle hypothecation fields - FIXED: Auto-populate previous policy hypothecation when new policy hypothecation changes
    if (name === "hypothecation") {
      setForm((f) => ({ 
        ...f, 
        [name]: value,
        // Auto-populate previous policy hypothecation when new policy hypothecation is set
        previousHypothecation: f.previousHypothecation || value
      }));
      return;
    }
    
    if (name === "previousHypothecation") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // Handle remarks fields - FIXED: Auto-populate previous policy remarks when new policy remarks change
    if (name === "newPolicyRemarks") {
      setForm((f) => ({ 
        ...f, 
        [name]: value,
        // Auto-populate previous policy remarks when new policy remarks are set
        previousPolicyRemarks: f.previousPolicyRemarks || value
      }));
      return;
    }
    
    if (name === "previousPolicyRemarks") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // NEW: Handle cubic capacity field
    if (name === "cubicCapacity") {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }
    
    // NEW: Handle vehicle type category field
    if (name === "vehicleTypeCategory") {
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

  // ============ ENHANCED INSURANCE QUOTES UPDATE ============
  const handleInsuranceQuotesUpdate = useCallback((quotesArray) => {
    // Prevent infinite loop by checking if quotes actually changed
    const currentQuotes = form.insuranceQuotes || [];
    const newQuotes = quotesArray || [];
    
    // Process quotes to ensure all required fields are present including new IDV fields
    const processedQuotes = newQuotes.map(quote => {
      // Ensure NCB discount amount is calculated if missing
      let ncbDiscountAmount = quote.ncbDiscountAmount;
      if (!ncbDiscountAmount && quote.odAmount && quote.ncbDiscount) {
        ncbDiscountAmount = Math.round(quote.odAmount * (quote.ncbDiscount / 100));
      }

      // ENHANCED: Use consistent policy duration formatting
      let policyDurationLabel = quote.policyDurationLabel;
      if (!policyDurationLabel && quote.policyDuration) {
        policyDurationLabel = formatPolicyDuration(quote.policyDuration.toString());
      }

      return {
        ...quote,
        ncbDiscountAmount: ncbDiscountAmount || 0,
        policyDurationLabel: policyDurationLabel || quote.policyDuration,
        odAmountAfterNcb: quote.odAmountAfterNcb || (quote.odAmount - (ncbDiscountAmount || 0)),
        // Ensure new IDV fields are included
        vehicleIdv: quote.vehicleIdv || 0,
        cngIdv: quote.cngIdv || 0,
        accessoriesIdv: quote.accessoriesIdv || 0
      };
    });

    // Only update if quotes actually changed
    if (JSON.stringify(currentQuotes) !== JSON.stringify(processedQuotes)) {
      console.log("💰 Insurance quotes updated with consistent duration formatting and new IDV fields:", processedQuotes.length, "quotes");
      
      setForm((f) => ({ 
        ...f, 
        insuranceQuotes: processedQuotes 
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

  // Validation functions - UPDATED to handle vehicle type and credit type
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
        // Only validate payout if it's not hidden
        if (!shouldHidePayout()) {
          stepErrors = payoutValidation(form, acceptedQuote);
        }
        break;
      default:
        stepErrors = {};
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // ============ ENHANCED DATA SANITIZATION FUNCTIONS ============
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

    // FIXED: Clean up insurance quotes with consistent duration handling and new IDV fields
    if (sanitized.insurance_quotes && Array.isArray(sanitized.insurance_quotes)) {
      sanitized.insurance_quotes = sanitized.insurance_quotes.map(quote => {
        // Calculate NCB discount amount if missing
        let ncbDiscountAmount = quote.ncbDiscountAmount;
        if (!ncbDiscountAmount && quote.odAmount && quote.ncbDiscount) {
          ncbDiscountAmount = Math.round(quote.odAmount * (quote.ncbDiscount / 100));
        }

        // ENHANCED: Use consistent policy duration formatting
        let policyDurationLabel = quote.policyDurationLabel;
        if (!policyDurationLabel && quote.policyDuration) {
          policyDurationLabel = formatPolicyDuration(quote.policyDuration.toString());
        }

        return {
          id: quote.id || `quote_${Date.now()}`,
          insuranceCompany: quote.insuranceCompany || '',
          coverageType: quote.coverageType || 'comprehensive',
          idv: parseFloat(quote.idv) || 0,
          policyDuration: quote.policyDuration || "1",
          policyDurationLabel: policyDurationLabel || formatPolicyDuration(quote.policyDuration || "1"),
          ncbDiscount: parseInt(quote.ncbDiscount) || 0,
          ncbDiscountAmount: ncbDiscountAmount || 0,
          odAmount: parseFloat(quote.odAmount) || 0,
          odAmountAfterNcb: parseFloat(quote.odAmountAfterNcb) || (parseFloat(quote.odAmount) - ncbDiscountAmount),
          thirdPartyAmount: parseFloat(quote.thirdPartyAmount) || 0,
          addOnsAmount: parseFloat(quote.addOnsAmount) || 0,
          premium: parseFloat(quote.premium) || 0,
          gstAmount: parseFloat(quote.gstAmount) || 0,
          totalPremium: parseFloat(quote.totalPremium) || 0,
          addOnsPremium: parseFloat(quote.addOnsPremium) || 0,
          selectedAddOns: quote.selectedAddOns || {},
          includedAddOns: quote.includedAddOns || [],
          // NEW: Include the new IDV fields
          vehicleIdv: parseFloat(quote.vehicleIdv) || 0,
          cngIdv: parseFloat(quote.cngIdv) || 0,
          accessoriesIdv: parseFloat(quote.accessoriesIdv) || 0,
          accepted: Boolean(quote.accepted),
          createdAt: quote.createdAt || new Date().toISOString(),
          updatedAt: quote.updatedAt || new Date().toISOString(),
        };
      });
    }

    // Clean up previous policy data with consistent duration handling, hypothecation and remarks
    if (sanitized.previous_policy && sanitized.previous_policy.policyDuration) {
      sanitized.previous_policy.policyDurationLabel = formatPolicyDuration(sanitized.previous_policy.policyDuration);
      sanitized.previous_policy.renewal_id = renewalPolicyId;
    }

    // Clean up new policy data with consistent duration handling, hypothecation and remarks
    if (sanitized.policy_info && sanitized.policy_info.insuranceDuration) {
      sanitized.policy_info.insuranceDurationLabel = formatPolicyDuration(sanitized.policy_info.insuranceDuration);
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
      
      // Prepare customer details based on buyer type - INCLUDING CREDIT TYPE, BROKER NAME, AND SOURCE ORIGIN
      const customerDetails = {
        name: form.customerName || "",
        mobile: form.mobile || "",
        email: form.email || "",
        residenceAddress: form.residenceAddress || "",
        pincode: form.pincode || "",
        city: form.city || "",
        alternatePhone: form.alternatePhone || "",
        employeeName: form.employeeName || "",
        age: form.age || "",
        gender: form.gender || "",
        panNumber: form.panNumber || "",
        aadhaarNumber: form.aadhaarNumber || "",
        companyName: form.companyName || "",
        contactPersonName: form.contactPersonName || "",
        companyPanNumber: form.companyPanNumber || "",
        gstNumber: form.gstNumber || "",
        // CRITICAL: Include creditType in customer_details
        creditType: form.creditType || "auto",
        // NEW: Include broker name in customer_details
        brokerName: form.brokerName || "",
        // NEW: Include source origin in customer_details
        sourceOrigin: form.sourceOrigin || ""
      };

      const policyData = {
        buyer_type: form.buyer_type || "individual",
        vehicleType: form.vehicleType || "used",
        customer_details: customerDetails,
        nominee: {
          name: form.nomineeName || "",
          relation: form.relation || "",
          age: form.nomineeAge || ""
        },
        reference: {
          name: form.referenceName || "",
          phone: form.referencePhone || ""
        },
        insurance_category: form.insurance_category || "motor",
        status: form.status || "pending",
        // FIXED: Include credit type in policy data - CRITICAL FOR DB STORAGE
        creditType: form.creditType || "auto",
        // NEW: Include broker name in policy data
        brokerName: form.brokerName || "",
        // NEW: Include source origin in policy data
        sourceOrigin: form.sourceOrigin || "",
        hidePayout: form.hidePayout || false,
        insurance_quotes: form.insuranceQuotes || [],
        ts: Date.now(),
        created_by: form.created_by || "ADMIN123",
        policyPrefilled: form.policyPrefilled || false,
        // Add renewal fields if this is a renewal
        renewal_id: form.renewal_id || "",
        isRenewal: form.isRenewal || false
      };

      // Sanitize data before sending
      const sanitizedData = sanitizeDataForAPI(policyData);
      
      console.log("📝 Creating policy with sanitized data:", sanitizedData);
      console.log("💳 CREDIT TYPE IN CREATE:", {
        formCreditType: form.creditType,
        sanitizedCreditType: sanitizedData.creditType,
        customerDetailsCreditType: customerDetails.creditType,
        brokerName: form.brokerName,
        sourceOrigin: form.sourceOrigin
      });

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

  // FIXED: Enhanced updatePolicy function with network error prevention and renewal support
  const updatePolicy = async (overrideData = null, retryCount = 0) => {
    // Prevent multiple simultaneous updates
    if (isUpdating) {
      console.log("⏳ Update already in progress, skipping...");
      return;
    }

    // Prevent too frequent updates (min 1 second between updates)
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) {
      console.log("⏰ Too frequent update, throttling...");
      return;
    }

    const MAX_RETRIES = 3;
    
    try {
      setIsUpdating(true);
      lastUpdateRef.current = now;
      
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
        // Standard step-based update data
        switch (step) {
          case 1:
            const customerDetails = {
              name: form.customerName || "",
              mobile: form.mobile || "",
              email: form.email || "",
              residenceAddress: form.residenceAddress || "",
              pincode: form.pincode || "",
              city: form.city || "",
              alternatePhone: form.alternatePhone || "",
              employeeName: form.employeeName || "",
              age: form.age || "",
              gender: form.gender || "",
              panNumber: form.panNumber || "",
              aadhaarNumber: form.aadhaarNumber || "",
              companyName: form.companyName || "",
              contactPersonName: form.contactPersonName || "",
              companyPanNumber: form.companyPanNumber || "",
              gstNumber: form.gstNumber || "",
              // CRITICAL: Include creditType in customer_details
              creditType: form.creditType || "auto",
              // NEW: Include broker name in customer_details
              brokerName: form.brokerName || "",
              // NEW: Include source origin in customer_details
              sourceOrigin: form.sourceOrigin || ""
            };

            updateData = {
              buyer_type: form.buyer_type,
              vehicleType: form.vehicleType,
              customer_details: customerDetails,
              nominee: {
                name: form.nomineeName || "",
                relation: form.relation || "",
                age: form.nomineeAge || ""
              },
              reference: {
                name: form.referenceName || "",
                phone: form.referencePhone || ""
              },
              // FIXED: Include credit type in step 1 update
              creditType: form.creditType || "auto",
              // NEW: Include broker name in step 1 update
              brokerName: form.brokerName || "",
              // NEW: Include source origin in step 1 update
              sourceOrigin: form.sourceOrigin || "",
              hidePayout: form.hidePayout || false,
              policyPrefilled: form.policyPrefilled || false,
              // Include renewal fields
              renewal_id: form.renewal_id || "",
              isRenewal: form.isRenewal || false
            };
            break;
          case 2:
            updateData = {
              vehicle_details: {
                regNo: form.regNo || "",
                make: form.make || "",
                model: form.model || "",
                variant: form.variant || "",
                cubicCapacity: form.cubicCapacity || "",
                vehicleTypeCategory: form.vehicleTypeCategory || "4 wheeler",
                engineNo: form.engineNo || "",
                chassisNo: form.chassisNo || "",
                makeMonth: form.makeMonth || "",
                makeYear: form.makeYear || ""
              },
              vehicleType: form.vehicleType,
              // FIXED: Include credit type in all updates
              creditType: form.creditType || "auto",
              // NEW: Include broker name in all updates
              brokerName: form.brokerName || "",
              // NEW: Include source origin in all updates
              sourceOrigin: form.sourceOrigin || "",
              hidePayout: form.hidePayout || false,
              // Include renewal fields
              renewal_id: form.renewal_id || "",
              isRenewal: form.isRenewal || false
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
                  tpExpiryDate: form.previousTpExpiryDate || "",
                  dueDate: form.previousDueDate || "",
                  claimTakenLastYear: form.previousClaimTaken || "no",
                  ncbDiscount: parseFloat(form.previousNcbDiscount) || 0,
                  // NEW: Include previous policy hypothecation
                  hypothecation: form.previousHypothecation || "",
                  // NEW: Include previous policy remarks
                  remarks: form.previousPolicyRemarks || ""
                },
                // FIXED: Include credit type
                creditType: form.creditType || "auto",
                // NEW: Include broker name
                brokerName: form.brokerName || "",
                // NEW: Include source origin
                sourceOrigin: form.sourceOrigin || "",
                hidePayout: form.hidePayout || false,
                // Include renewal fields
                renewal_id: form.renewal_id || "",
                isRenewal: form.isRenewal || false
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
                duration: form.duration || "",
                // FIXED: Include the new IDV fields
                vehicleIdv: parseFloat(form.vehicleIdv) || 0,
                cngIdv: parseFloat(form.cngIdv) || 0,
                accessoriesIdv: parseFloat(form.accessoriesIdv) || 0
              },
              // FIXED: Include credit type
              creditType: form.creditType || "auto",
              // NEW: Include broker name
              brokerName: form.brokerName || "",
              // NEW: Include source origin
              sourceOrigin: form.sourceOrigin || "",
              hidePayout: form.hidePayout || false,
              // Include renewal fields
              renewal_id: form.renewal_id || "",
              isRenewal: form.isRenewal || false
            };
            break;
          case 5:
            // FIXED: Include all new policy fields including expiry dates, hypothecation and remarks
            updateData = {
              policy_info: {
                policyIssued: form.policyIssued || "",
                insuranceCompany: form.insuranceCompany || "",
                policyNumber: form.policyNumber || "",
                covernoteNumber: form.covernoteNumber || "",
                issueDate: form.issueDate || "",
                policyStartDate: form.policyStartDate || "",
                dueDate: form.dueDate || "",
                ncbDiscount: parseFloat(form.ncbDiscount) || 0,
                insuranceDuration: form.insuranceDuration || "",
                idvAmount: parseFloat(form.idvAmount) || 0,
                totalPremium: parseFloat(form.totalPremium) || 0,
                policyType: form.policyType || "", // FIXED: Added policyType
                odExpiryDate: form.odExpiryDate || "", // FIXED: Added odExpiryDate
                tpExpiryDate: form.tpExpiryDate || "", // FIXED: Added tpExpiryDate
                // NEW: Include new policy hypothecation
                hypothecation: form.hypothecation || "",
                // NEW: Include new policy remarks
                remarks: form.newPolicyRemarks || ""
              },
              // FIXED: Include credit type
              creditType: form.creditType || "auto",
              // NEW: Include broker name
              brokerName: form.brokerName || "",
              // NEW: Include source origin
              sourceOrigin: form.sourceOrigin || "",
              hidePayout: form.hidePayout || false,
              // Include renewal fields
              renewal_id: form.renewal_id || "",
              isRenewal: form.isRenewal || false
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
              documents: documentsArray,
              // FIXED: Include credit type
              creditType: form.creditType || "auto",
              // NEW: Include broker name
              brokerName: form.brokerName || "",
              // NEW: Include source origin
              sourceOrigin: form.sourceOrigin || "",
              hidePayout: form.hidePayout || false,
              // Include renewal fields
              renewal_id: form.renewal_id || "",
              isRenewal: form.isRenewal || false
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
              payment_ledger: paymentLedger,
              // FIXED: Include credit type
              creditType: form.creditType || "auto",
              // NEW: Include broker name
              brokerName: form.brokerName || "",
              // NEW: Include source origin
              sourceOrigin: form.sourceOrigin || "",
              hidePayout: form.hidePayout || false,
              // Include renewal fields
              renewal_id: form.renewal_id || "",
              isRenewal: form.isRenewal || false
            };
            break;
          case 8:
            // Only include payout data if payout is not hidden
            if (!shouldHidePayout()) {
              updateData = {
                payout: {
                  netPremium: parseFloat(form.netPremium) || 0,
                  odAmount: parseFloat(form.odAmount) || 0,
                  ncbAmount: parseFloat(form.ncbAmount) || 0,
                  subVention: parseFloat(form.subVention) || 0,
                  odAddonPercentage: parseFloat(form.odAddonPercentage) || 10,
                  odAddonAmount: parseFloat(form.odAddonAmount) || 0,
                  netAmount: parseFloat(form.netAmount) || 0
                },
                payment_ledger: paymentLedger,
                // FIXED: Include credit type
                creditType: form.creditType || "auto",
                // NEW: Include broker name
                brokerName: form.brokerName || "",
                // NEW: Include source origin
                sourceOrigin: form.sourceOrigin || "",
                hidePayout: form.hidePayout || false,
                // Include renewal fields
                renewal_id: form.renewal_id || "",
                isRenewal: form.isRenewal || false
              };
            } else {
              updateData = {
                // FIXED: Include credit type even when payout is hidden
                creditType: form.creditType || "auto",
                // NEW: Include broker name even when payout is hidden
                brokerName: form.brokerName || "",
                // NEW: Include source origin even when payout is hidden
                sourceOrigin: form.sourceOrigin || "",
                hidePayout: form.hidePayout || false,
                // Include renewal fields
                renewal_id: form.renewal_id || "",
                isRenewal: form.isRenewal || false
              };
            }
            break;
          default:
            updateData = {
              // FIXED: Include credit type in all updates
              creditType: form.creditType || "auto",
              // NEW: Include broker name in all updates
              brokerName: form.brokerName || "",
              // NEW: Include source origin in all updates
              sourceOrigin: form.sourceOrigin || "",
              hidePayout: form.hidePayout || false,
              // Include renewal fields in all updates
              renewal_id: form.renewal_id || "",
              isRenewal: form.isRenewal || false
            };
        }
      }

      // FIXED: Always include insurance quotes in updates with consistent duration handling and new IDV fields
      if (form.insuranceQuotes && form.insuranceQuotes.length > 0) {
        updateData.insurance_quotes = form.insuranceQuotes.map(quote => ({
          ...quote,
          // ENHANCED: Use consistent policy duration formatting
          ncbDiscountAmount: quote.ncbDiscountAmount || Math.round(quote.odAmount * (quote.ncbDiscount / 100)),
          policyDurationLabel: quote.policyDurationLabel || formatPolicyDuration(quote.policyDuration.toString()),
          odAmountAfterNcb: quote.odAmountAfterNcb || (quote.odAmount - (quote.ncbDiscountAmount || 0)),
          // FIXED: Include the new IDV fields
          vehicleIdv: parseFloat(quote.vehicleIdv) || 0,
          cngIdv: parseFloat(quote.cngIdv) || 0,
          accessoriesIdv: parseFloat(quote.accessoriesIdv) || 0
        }));
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
        vehicleType: form.vehicleType,
        creditType: form.creditType,
        brokerName: form.brokerName,
        sourceOrigin: form.sourceOrigin,
        sanitizedCreditType: sanitizedUpdateData.creditType,
        hidePayout: form.hidePayout,
        isRenewal: form.isRenewal,
        renewal_id: form.renewal_id
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
      
      // Retry logic for network errors
      if (error.code === 'ERR_NETWORK' && retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying API call (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return updatePolicy(overrideData, retryCount + 1);
      }
      
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
      setIsUpdating(false);
    }
  };

  // FIXED: Debounced update policy for auto-saves
  const debouncedUpdatePolicy = useRef(
    debounce((overrideData = null) => {
      updatePolicy(overrideData);
    }, 2000)
  ).current;

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

  // FIXED: Enhanced handleSaveAndExit to properly save current form state
  const handleSaveAndExit = async () => {
    try {
      setIsSaving(true);
      
      // Validate current step before saving
      if (!validateCurrentStep()) {
        setSaveMessage("❌ Please fix the validation errors before saving");
        setIsSaving(false);
        return;
      }

      console.log("💾 Save & Exit - Current form state:", {
        creditType: form.creditType,
        brokerName: form.brokerName,
        sourceOrigin: form.sourceOrigin,
        hidePayout: form.hidePayout,
        step: step
      });

      // Save current progress first
      if (policyId) {
        // For existing policies, update with current form data
        await updatePolicy();
      } else {
        // For new policies, create first
        await createPolicy();
      }
      
      setSaveMessage("✅ Progress saved successfully! Redirecting...");
      
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
      
      // Prepare customer details based on buyer type - INCLUDING CREDIT TYPE, BROKER NAME, AND SOURCE ORIGIN
      const customerDetails = {
        name: form.customerName,
        mobile: form.mobile,
        email: form.email,
        residenceAddress: form.residenceAddress,
        pincode: form.pincode,
        city: form.city,
        alternatePhone: form.alternatePhone || "",
        employeeName: form.employeeName || "",
        age: form.age || "",
        gender: form.gender,
        panNumber: form.panNumber,
        aadhaarNumber: form.aadhaarNumber,
        companyName: form.companyName || "",
        contactPersonName: form.contactPersonName || "",
        companyPanNumber: form.companyPanNumber || "",
        gstNumber: form.gstNumber || "",
        // CRITICAL: Include creditType in customer_details for final save
        creditType: form.creditType || "auto",
        // NEW: Include broker name in customer_details for final save
        brokerName: form.brokerName || "",
        // NEW: Include source origin in customer_details for final save
        sourceOrigin: form.sourceOrigin || ""
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
        vehicleType: form.vehicleType,
        customer_details: customerDetails,
        nominee: {
          name: form.nomineeName,
          relation: form.relation,
          age: form.nomineeAge
        },
        reference: {
          name: form.referenceName,
          phone: form.referencePhone
        },
        vehicle_details: {
          regNo: form.regNo,
          make: form.make,
          model: form.model,
          variant: form.variant,
          cubicCapacity: form.cubicCapacity,
          vehicleTypeCategory: form.vehicleTypeCategory,
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
          tpExpiryDate: form.previousTpExpiryDate || "",
          dueDate: form.previousDueDate || "",
          claimTakenLastYear: form.previousClaimTaken || "no",
          ncbDiscount: parseFloat(form.previousNcbDiscount) || 0,
          // NEW: Include previous policy hypothecation in final save
          hypothecation: form.previousHypothecation || "",
          // NEW: Include previous policy remarks in final save
          remarks: form.previousPolicyRemarks || ""
        } : {},
        insurance_quote: {
          insurer: form.insurer,
          coverageType: form.coverageType,
          premium: parseFloat(form.premium) || 0,
          idv: parseFloat(form.idv) || 0,
          ncb: form.ncb,
          duration: form.duration,
          // FIXED: Include the new IDV fields in final save
          vehicleIdv: parseFloat(form.vehicleIdv) || 0,
          cngIdv: parseFloat(form.cngIdv) || 0,
          accessoriesIdv: parseFloat(form.accessoriesIdv) || 0
        },
        // ENHANCED: Include processed insurance quotes with consistent policy duration and new IDV fields
        insurance_quotes: form.insuranceQuotes.map(quote => ({
          ...quote,
          ncbDiscountAmount: quote.ncbDiscountAmount || Math.round(quote.odAmount * (quote.ncbDiscount / 100)),
          policyDurationLabel: quote.policyDurationLabel || formatPolicyDuration(quote.policyDuration.toString()),
          odAmountAfterNcb: quote.odAmountAfterNcb || (quote.odAmount - (quote.ncbDiscountAmount || 0)),
          // FIXED: Include the new IDV fields
          vehicleIdv: parseFloat(quote.vehicleIdv) || 0,
          cngIdv: parseFloat(quote.cngIdv) || 0,
          accessoriesIdv: parseFloat(quote.accessoriesIdv) || 0
        })),
        policy_info: {
          policyIssued: form.policyIssued,
          insuranceCompany: form.insuranceCompany,
          policyNumber: form.policyNumber,
          covernoteNumber: form.covernoteNumber,
          issueDate: form.issueDate,
          policyStartDate: form.policyStartDate,          
          dueDate: form.dueDate,
          ncbDiscount: parseFloat(form.ncbDiscount) || 0,
          insuranceDuration: form.insuranceDuration,
          idvAmount: parseFloat(form.idvAmount) || 0,
          totalPremium: parseFloat(form.totalPremium) || 0,
          policyType: form.policyType || "", // FIXED: Added policyType
          odExpiryDate: form.policyType=="thirdParty"?null:form.odExpiryDate || "", // FIXED: Added odExpiryDate
          tpExpiryDate: form.policyType=="standalone"?null:form.tpExpiryDate || "", // FIXED: Added tpExpiryDate
          // NEW: Include new policy hypothecation in final save
          hypothecation: form.hypothecation || "",
          // NEW: Include new policy remarks in final save
          remarks: form.newPolicyRemarks || ""
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
        // FIXED: Only include payout if not hidden
        payout: !shouldHidePayout() ? {
          netPremium: parseFloat(form.netPremium) || 0,
          odAmount: parseFloat(form.odAmount) || 0,
          ncbAmount: parseFloat(form.ncbAmount) || 0,
          subVention: parseFloat(form.subVention) || 0,
          odAddonPercentage: parseFloat(form.odAddonPercentage) || 10,
          odAddonAmount: parseFloat(form.odAddonAmount) || 0,
          netAmount: parseFloat(form.netAmount) || 0
        } : {},
        status: "completed",
        completed_at: Date.now(),
        ts: form.ts,
        created_by: form.created_by,
        policyPrefilled: form.policyPrefilled || false,
        // FIXED: CRITICAL - Include credit type in final save to store in database
        creditType: form.creditType || "auto",
        // NEW: CRITICAL - Include broker name in final save to store in database
        brokerName: form.brokerName || "",
        // NEW: CRITICAL - Include source origin in final save to store in database
        sourceOrigin: form.sourceOrigin || "",
        hidePayout: form.hidePayout || false,
        // Include renewal fields in final save
        renewal_id: form.renewal_id || "",
        isRenewal: form.isRenewal || false
      };

      // Sanitize final data
      const sanitizedFinalData = sanitizeDataForAPI(finalData);

      console.log(`✅ Finalizing policy with vehicle type:`, form.vehicleType);
      console.log(`✅ Finalizing policy with credit type:`, form.creditType);
      console.log(`✅ Finalizing policy with broker name:`, form.brokerName);
      console.log(`✅ Finalizing policy with source origin:`, form.sourceOrigin);
      console.log(`🔍 FINAL SAVE - CREDIT TYPE CHECK:`, {
        formCreditType: form.creditType,
        finalDataCreditType: finalData.creditType,
        sanitizedCreditType: sanitizedFinalData.creditType,
        customerDetailsCreditType: customerDetails.creditType,
        brokerName: form.brokerName,
        sourceOrigin: form.sourceOrigin
      });
      console.log(`✅ Finalizing policy ${policyId} with complete data including new IDV fields:`, sanitizedFinalData);

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
    // FIXED: Skip step 3 for new cars
    if (form.vehicleType === "new" && step === 2) {
      // Skip directly to step 4 (Insurance Quotes) from step 2
      setStep(4);
      setErrors({});
      setSaveMessage("");
      return;
    }

    // FIXED: Skip payout step if credit type is showroom or customer
    if (shouldHidePayout() && step === steps.length - 1) {
      // If payout is hidden and we're at the step before payout, finish
      await handleFinish();
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
      // FIXED: Skip step 3 for new cars
      let nextStepValue = form.vehicleType === "new" && step === 2 ? 4 : step + 1;
      
      // FIXED: Skip payout step if credit type is showroom or customer
      if (shouldHidePayout() && nextStepValue === steps.indexOf("Payout") + 1) {
        nextStepValue += 1;
      }
      
      setStep(nextStepValue);
      setErrors({});
      setSaveMessage("");
    } catch (error) {
      console.log("Save failed, staying on current step");
    }
  };

  const prevStep = () => {
    // FIXED: Handle going back from step 4 for new cars
    if (form.vehicleType === "new" && step === 4) {
      setStep(2); // Go back to Vehicle Details
    } 
    // FIXED: Handle going back when payout is hidden
    else if (shouldHidePayout() && step === steps.indexOf("Payout") + 1) {
      setStep(step - 2); // Skip payout step
    }
    else {
      setStep((s) => Math.max(s - 1, 1));
    }
    setErrors({});
    setSaveMessage("");
  };

  // FIXED: Updated progress calculation to account for skipped steps
  const progressPercent = Math.round(((getDisplayStep(step) - 1) / (getSteps().length - 1)) * 100);

  // FIXED: Updated next label to show correct step name
  const getNextLabel = () => {
    if (step < steps.length) {
      if (form.vehicleType === "new" && step === 2) {
        return "Next: Insurance Quotes"; // Skip Previous Policy
      }
      if (shouldHidePayout() && step === steps.length - 1) {
        return "Finish"; // Skip Payout and finish directly
      }
      return `Next: ${steps[step]}`;
    }
    return "Finish";
  };

  const nextLabel = getNextLabel();

  // ENHANCED: Step props with consistent duration utilities and credit type info
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
    isEditMode: !!id,
    // Add duration utilities to ALL components
    formatPolicyDuration,
    getPolicyDurationOptions,
    mapQuoteDurationToForm,
    calculateExpiryDates,
    policyDurationMappings,
    // FIXED: Add credit type utilities
    shouldHidePayout: shouldHidePayout()
  };

  if (loadingPolicy) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">
                {form.isRenewal ? 'Renew Insurance Case' : 'Edit Insurance Case'} #{id}
              </h1>
              <p className="text-sm text-gray-500">Loading policy data...</p>
            </div>
            <Link
              to="/policies"
              className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-600 hover:shadow"
            >
              <FaChevronLeft /> Back
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
              {form.isRenewal ? 'Renew Insurance Case' : isEditMode ? 'Edit Insurance Case' : 'New Insurance Case'} 
              {policyId && ` #${policyId}`}
              {form.isRenewal && form.renewal_id && ` (Renewal of #${form.renewal_id})`}
            </h1>
            <p className="text-sm text-gray-500">
              {form.isRenewal ? 'Renew existing insurance policy' : isEditMode ? 'Edit existing insurance case' : 'Create a new insurance case'}
              {isEditMode && " - All fields are pre-filled with existing data"}
              {form.vehicleType && ` - Vehicle Type: ${form.vehicleType === 'new' ? 'New Car' : 'Used Car'}`}
              {form.creditType && ` - Credit Type: ${form.creditType === 'auto' ? 'Autocredits India LLP' : form.creditType === 'broker' ? 'Broker' + (form.brokerName ? ` - ${form.brokerName}` : '') : form.creditType === 'showroom' ? 'Showroom' : 'Customer'}`}
              {form.sourceOrigin && ` - Source Origin: ${form.sourceOrigin}`}
              {form.isRenewal && " - This is a renewal case"}
            </p>
          </div>
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm text-gray-600 hover:shadow"
          >
            <FaChevronLeft /> Back to Cases
          </Link>
        </div>

        {/* Renewal Info Banner */}
        {form.isRenewal && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <FaHistory />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Renewal Case</h3>
                  <p className="text-sm text-blue-600">
                    This is a renewal of policy #{form.renewal_id}. Customer details, vehicle information, and previous policy data have been pre-filled.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Renewal
              </span>
            </div>
          </div>
        )}

        {/* Credit Type Info Banner */}
        {form.creditType && (
          <div className={`border rounded-xl p-4 mb-6 ${
            form.creditType === "auto" 
              ? "bg-blue-50 border-blue-200" 
              : form.creditType === "broker"
              ? "bg-purple-50 border-purple-200"
              : form.creditType === "showroom"
              ? "bg-orange-50 border-orange-200"
              : "bg-green-50 border-green-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  form.creditType === "auto" 
                    ? "bg-blue-100 text-blue-600" 
                    : form.creditType === "broker"
                    ? "bg-purple-100 text-purple-600"
                    : form.creditType === "showroom"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {form.creditType === "auto" ? <FaCreditCard /> : 
                   form.creditType === "broker" ? <FaUserTie /> :
                   form.creditType === "showroom" ? <FaTags /> : 
                   <FaUser />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {form.creditType === "auto" ? "Autocredits India LLP" : 
                     form.creditType === "broker" ? "Broker" + (form.brokerName ? ` - ${form.brokerName}` : "") :
                     form.creditType === "showroom" ? "Showroom" : 
                     "Customer"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {form.creditType === "auto" || form.creditType === "broker"
                      ? "Payout section will be available in Step 8" 
                      : "Payout section will be hidden"}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                form.creditType === "auto" 
                  ? "bg-blue-100 text-blue-800" 
                  : form.creditType === "broker"
                  ? "bg-purple-100 text-purple-800"
                  : form.creditType === "showroom"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {form.creditType === "auto" ? "Autocredits India LLP" : 
                 form.creditType === "broker" ? "BROKER" :
                 form.creditType === "showroom" ? "SHOWROOM" : 
                 "CUSTOMER"}
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {/* FIXED: Updated step display to account for skipped steps */}
              Step {getDisplayStep(step)} of {getSteps().length}
            </div>
            <div className="text-sm text-gray-500">
              {progressPercent}% Complete
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="h-2 bg-purple-500 rounded-full transition-all duration-300"
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
                  {/* FIXED: Show vehicle type indicator on step 2 */}
                  {title === "Vehicle Details" && form.vehicleType && (
                    <div className={`mt-1 px-2 py-0.5 rounded-full text-xs ${
                      form.vehicleType === "new" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {form.vehicleType === "new" ? "NEW" : "USED"}
                    </div>
                  )}
                  {/* FIXED: Show renewal indicator */}
                  {form.isRenewal && title === "Previous Policy" && (
                    <div className="mt-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                      PRE-FILLED
                    </div>
                  )}
                  {/* FIXED: Show payout hidden indicator */}
                  {shouldHidePayout() && title === "Payout" && (
                    <div className="mt-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                      HIDDEN
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
        {/* FIXED: Only show Previous Policy for used cars */}
        {step === 3 && form.vehicleType === "used" && <PreviousPolicyDetails {...stepProps} />}
        {step === 4 && <InsuranceQuotes {...stepProps} />}
        {step === 5 && <NewPolicyDetails {...stepProps} acceptedQuote={acceptedQuote} />}
        {step === 6 && <Documents {...stepProps} />}
        {step === 7 && <Payment {...stepProps} totalPremium={totalPremium} />}
        {/* FIXED: Only show Payout if not hidden */}
        {step === 8 && !shouldHidePayout() && <PayoutDetails {...stepProps} />}

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
                  {/* FIXED: Updated step display */}
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
function formatPolicyDuration(duration) {
    if (duration.includes('yr') || duration.includes('year')) {
        return duration;
    }
    const years = parseInt(duration);
    return `${years} Year${years !== 1 ? 's' : ''}`;
}
export default NewPolicyPage;