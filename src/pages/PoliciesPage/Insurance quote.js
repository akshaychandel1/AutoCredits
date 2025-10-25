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
  const [editingQuote, setEditingQuote] = useState(null); // Track which quote is being edited
  
  // FIXED: Determine NCB eligibility - only claim-taken vehicles are ineligible
  const isNcbEligible = form.previousClaimTaken !== "yes";
  // Note: New vehicles can have NCB but start at 0%

  // FIXED: Set default NCB value based on claim status and vehicle type
  const getDefaultNcb = () => {
    if (form.previousClaimTaken === "yes") {
      return "0"; // 0% if claim was taken (locked)
    }
    if (form.vehicleType === "new") {
      return "0"; // 0% default for new vehicles (but can be changed)
    }
    return "25"; // 25% default for used vehicles with no claim
  };

  // Policy duration options based on vehicle type AND coverage type - UPDATED
  const getPolicyDurationOptions = (vehicleType, coverageType) => {
    // For Stand Alone OD coverage, show simple year options
    if (coverageType === "standalone") {
      return [
        { value: "1", label: "1 Year" },
        { value: "2", label: "2 Years" },
        { value: "3", label: "3 Years" }
      ];
    }
    
    // For other coverage types with new vehicles
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

  // Set default policy duration based on vehicle type and coverage type - UPDATED
  const getDefaultPolicyDuration = (coverageType) => {
    if (coverageType === "standalone") {
      return "1"; // Default to 1 Year for Stand Alone OD
    }
    return form.vehicleType === "new" ? "1yr OD + 3yr TP" : "1";
  };

  const [manualQuote, setManualQuote] = useState({
    insuranceCompany: '',
    coverageType: 'comprehensive',
    idv: '',
    policyDuration: getDefaultPolicyDuration('comprehensive'),
    ncbDiscount: getDefaultNcb(),
    odAmount: '0', // Default to 0
    thirdPartyAmount: '0', // Default to 0
    addOnsAmount: '0', // Default to 0
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
      outstationCover: { selected: false, amount: '0', rate: '0' }
    }
  });

  // Update policy duration options when vehicle type OR coverage type changes - UPDATED
  useEffect(() => {
    const newOptions = getPolicyDurationOptions(form.vehicleType, manualQuote.coverageType);
    
    // If current policy duration is not available for the new vehicle type/coverage, reset to default
    if (!newOptions.find(option => option.value === manualQuote.policyDuration)) {
      setManualQuote(prev => ({
        ...prev,
        policyDuration: getDefaultPolicyDuration(manualQuote.coverageType)
      }));
    }
  }, [form.vehicleType, manualQuote.coverageType]);

  // ============ NEW EFFECT: Handle coverage type changes ============
  useEffect(() => {
    // When coverage type changes to "standalone", set third party amount to 0 and update policy duration
    if (manualQuote.coverageType === "standalone") {
      setManualQuote(prev => ({
        ...prev,
        thirdPartyAmount: "0", // Set third party to 0 for standalone OD
        policyDuration: getDefaultPolicyDuration("standalone") // Set to 1 Year default
      }));
    }
  }, [manualQuote.coverageType]);

  // ============ FIXED CALCULATION FUNCTIONS ============

  // FIXED: Calculate NCB discount amount (on OD amount only)
  const calculateNcbDiscount = () => {
    const odAmount = parseFloat(manualQuote.odAmount || 0) || 0;
    const ncbDiscount = parseFloat(manualQuote.ncbDiscount || 0) || 0;
    
    // Ensure we have valid numbers and calculate properly
    if (odAmount > 0 && ncbDiscount > 0) {
      return Math.round(odAmount * (ncbDiscount / 100));
    }
    return 0;
  };

  // FIXED: Calculate OD amount after NCB discount
  const calculateOdAfterNcb = () => {
    const odAmount = parseFloat(manualQuote.odAmount || 0) || 0;
    const ncbDiscountAmount = calculateNcbDiscount();
    return Math.max(0, odAmount - ncbDiscountAmount);
  };

  // Calculate add-ons total - Includes both individual add-ons AND the single add-ons amount field
  const calculateAddOnsTotal = () => {
    // Calculate individual add-ons total (only selected ones with amount > 0)
    const individualAddOnsTotal = Object.entries(manualQuote.addOns).reduce((total, [key, addOn]) => {
      if (addOn.selected && parseFloat(addOn.amount || 0) > 0) {
        const amount = parseFloat(addOn.amount || 0) || 0;
        return total + amount;
      }
      return total;
    }, 0);
    
    // Add the single add-ons amount field
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
    return Math.round(taxableAmount * 0.18);
  };

  // Calculate current totals for display
  const currentBasePremium = calculateBasePremium();
  const currentGstAmount = calculateGstAmount();
  const currentTotalPremium = calculateTotalPremium();
  const currentAddOnsTotal = calculateAddOnsTotal();
  const currentNcbDiscountAmount = calculateNcbDiscount();
  const currentOdAfterNcb = calculateOdAfterNcb();

  // ============ END FIXED CALCULATION FUNCTIONS ============

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

  // Update manualQuote when claim status OR vehicle type changes
  useEffect(() => {
    setManualQuote(prev => ({
      ...prev,
      ncbDiscount: getDefaultNcb()
    }));
  }, [form.previousClaimTaken, form.vehicleType]);

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

  // Updated add-on descriptions with all requested add-ons
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
    outstationCover: "Outstation Emergency Cover"
  };

  // NCB options
  const ncbOptions = [0, 20, 25, 35, 45, 50];

  // Coverage type options
  const coverageTypeOptions = [
    { value: 'comprehensive', label: 'Comprehensive' },
    { value: 'standalone', label: 'Stand Alone OD' },
    { value: 'thirdParty', label: 'Third Party' }
  ];

  // Handle manual quote input changes - PROPERLY HANDLES EMPTY VALUES
  const handleManualQuoteChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent NCB changes if claim was taken
    if (name === "ncbDiscount" && form.previousClaimTaken === "yes") {
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

  // Function to start editing a quote
  const startEditingQuote = (quote, index) => {
    setEditingQuote({ ...quote, originalIndex: index });
    
    // Populate the manual quote form with the quote data
    const company = insuranceCompanies.find(c => c.name === quote.insuranceCompany);
    
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

    setManualQuote({
      insuranceCompany: quote.insuranceCompany,
      coverageType: quote.coverageType,
      idv: quote.idv?.toString() || '',
      policyDuration: quote.policyDuration,
      ncbDiscount: quote.ncbDiscount?.toString() || getDefaultNcb(),
      odAmount: quote.odAmount?.toString() || '0',
      thirdPartyAmount: quote.thirdPartyAmount?.toString() || '0',
      addOnsAmount: quote.addOnsAmount?.toString() || '0',
      premium: quote.premium?.toString() || '',
      addOns: addOnsData
    });
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingQuote(null);
    resetManualQuoteForm();
  };

  // Function to update an existing quote
  const updateQuote = () => {
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

    // Get the policy duration label
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

    const updatedQuote = {
      id: editingQuote.id, // Keep the same ID
      insuranceCompany: manualQuote.insuranceCompany,
      companyLogo: company?.logo || '',
      companyFallbackLogo: company?.fallbackLogo || '🏢',
      companyColor: company?.color || '#000',
      companyBgColor: company?.bgColor || '#fff',
      coverageType: manualQuote.coverageType,
      idv: parseFloat(manualQuote.idv || 0) || 0,
      policyDuration: manualQuote.policyDuration,
      policyDurationLabel: policyDurationLabel,
      ncbDiscount: parseInt(manualQuote.ncbDiscount),
      ncbDiscountAmount: ncbDiscountAmount,
      odAmount: parseFloat(manualQuote.odAmount || 0) || 0,
      odAmountAfterNcb: odAmountAfterNcb,
      thirdPartyAmount: parseFloat(manualQuote.thirdPartyAmount || 0) || 0,
      addOnsAmount: parseFloat(manualQuote.addOnsAmount || 0) || 0, // Include the add-ons amount field
      premium: basePremium,
      gstAmount: gstAmount,
      totalPremium: totalPremium,
      addOnsPremium: addOnsPremium, // This includes both individual add-ons AND the single add-ons amount field
      selectedAddOns: selectedAddOns,
      includedAddOns: getIncludedAddOns(),
      createdAt: editingQuote.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString(), // Add update timestamp
      accepted: editingQuote.accepted // Keep acceptance status
    };

    const updatedQuotes = [...quotes];
    updatedQuotes[editingQuote.originalIndex] = updatedQuote;
    
    console.log("✏️ Updating quote at index:", editingQuote.originalIndex);
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
      idv: '',
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
        outstationCover: { selected: false, amount: '0', rate: '0' }
      }
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
      addOnsAmount: manualQuote.addOnsAmount, // Debug add-ons amount
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

    // Get the policy duration label - FIXED: Use the actual value as label
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
      addOnsAmount: parseFloat(manualQuote.addOnsAmount || 0) || 0, // Include the add-ons amount field
      premium: basePremium,
      gstAmount: gstAmount,
      totalPremium: totalPremium,
      addOnsPremium: addOnsPremium, // This includes both individual add-ons AND the single add-ons amount field
      selectedAddOns: selectedAddOns,
      includedAddOns: getIncludedAddOns(), // Store included add-ons separately
      createdAt: new Date().toISOString(),
      accepted: false // Initialize as not accepted
    };

    const updatedQuotes = [...quotes, newQuote];
    console.log("➕ Adding new quote. Previous:", quotes.length, "New:", updatedQuotes.length);
    console.log("📊 Quote details:", {
      insuranceCompany: newQuote.insuranceCompany,
      totalPremium: newQuote.totalPremium,
      addOnsPremium: newQuote.addOnsPremium,
      addOnsAmount: newQuote.addOnsAmount,
      selectedAddOnsCount: Object.keys(newQuote.selectedAddOns).length
    });
    setQuotes(updatedQuotes);
    resetManualQuoteForm();
  };

  // Remove quote
  const removeQuote = (index) => {
    console.log("🗑️ Removing quote at index:", index);
    const quoteToRemove = quotes[index];
    
    // If removing the accepted quote, unaccept it first
    if (acceptedQuote && acceptedQuote.id === quoteToRemove.id) {
      unacceptQuote();
    }
    
    // If removing the quote being edited, cancel editing
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

  // Enhanced PDF generation with professional layout - FIXED DOWNLOAD FUNCTIONALITY
  const downloadSelectedQuotesPDF = () => {
    if (selectedQuotes.length === 0) {
      alert("Please select at least one quote to download");
      return;
    }

    const selectedQuoteData = selectedQuotes.map(index => quotes[index]);
    downloadQuotesPDF(selectedQuoteData);
  };

  // Download all quotes as PDF - FIXED DOWNLOAD FUNCTIONALITY
  const downloadAllQuotesPDF = () => {
    if (quotes.length === 0) {
      alert("No quotes available to download");
      return;
    }
    downloadQuotesPDF(quotes);
  };

  // Professional PDF generation function - ENHANCED VERSION WITH BETTER DESIGN, NO OVERLAPS, EASY COMPARISON, AND AUTOCREDITS LOGO
  const downloadQuotesPDF = (quotesToDownload) => {
    try {
      setIsGenerating(true);
      
      // Initialize PDF with proper settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);

      // Enhanced color scheme for professional look
      const primaryColor = [0, 51, 102];  // Deep blue for trust
      const secondaryColor = [0, 102, 204];  // Lighter blue
      const accentColor = [34, 139, 34];  // Forest green for positives
      const warningColor = [255, 140, 0];  // Orange for highlights
      const textColor = [33, 37, 41];  // Dark gray for readability
      const lightBg = [248, 249, 250];  // Very light gray
      const borderColor = [206, 212, 218];  // Soft gray borders

      // Add AutoCredits Logo at the top (using styled text since no image import)
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('AutoCredits', margin, 25);

      // Subtle tagline below logo
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Your Trusted Insurance Partner', margin, 32);

      // Modern Header with gradient effect below logo
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 40, pageWidth, 30, 'F');
      
      // Add subtle gradient overlay (simulated with lines)
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.1);
      for (let i = 0; i < pageWidth; i += 5) {
        pdf.line(i, 40, i + 2, 70);
      }

      // Title in header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Insurance Quote Comparison Report', pageWidth / 2, 58, { align: 'center' });

      let yPosition = 80;

      // Customer Information Section - Card style with shadow effect (simulated border)
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin - 1, yPosition - 1, contentWidth + 2, 50 + 2, 5, 5, 'FD'); // Shadow layer
      pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      pdf.roundedRect(margin, yPosition, contentWidth, 50, 5, 5, 'F');
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.roundedRect(margin, yPosition, contentWidth, 50, 5, 5, 'S');

      pdf.setFontSize(14);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Information', margin + 10, yPosition + 15);

      // Customer details in grid for better readability
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont('helvetica', 'normal');
      const customerDetails = [
        { label: 'Name', value: form.customerName || 'Not Specified' },
        { label: 'Vehicle', value: `${form.make || ''} ${form.model || ''} ${form.variant || ''}`.trim() || 'Not Specified' },
        { label: 'Report Date', value: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { label: 'Quotes Analyzed', value: quotesToDownload.length.toString() }
      ];

      let detailY = yPosition + 25;
      customerDetails.forEach((detail) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${detail.label}:`, margin + 10, detailY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(detail.value, margin + 50, detailY);
        detailY += 7;
      });

      yPosition += 65;

      // Executive Summary - Dashboard cards for quick overview
      if (quotesToDownload.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Executive Summary', margin, yPosition + 10);

        yPosition += 20;

        const lowestPremium = Math.min(...quotesToDownload.map(q => q.totalPremium));
        const highestPremium = Math.max(...quotesToDownload.map(q => q.totalPremium));
        const avgPremium = quotesToDownload.reduce((sum, q) => sum + q.totalPremium, 0) / quotesToDownload.length;
        const savingsPotential = highestPremium - lowestPremium;
        const bestQuote = [...quotesToDownload].sort((a, b) => a.totalPremium - b.totalPremium)[0];

        // Dashboard metrics as individual cards
        const cardWidth = (contentWidth - 15) / 4; // 4 cards with gaps
        const cardHeight = 40;
        const metrics = [
          { 
            label: 'Best Premium', 
            value: `₹${lowestPremium.toLocaleString('en-IN')}`, 
            subtext: bestQuote.insuranceCompany,
            color: accentColor
          },
          { 
            label: 'Average Premium', 
            value: `₹${Math.round(avgPremium).toLocaleString('en-IN')}`, 
            subtext: 'Across Providers',
            color: secondaryColor
          },
          { 
            label: 'Max Savings', 
            value: `₹${savingsPotential.toLocaleString('en-IN')}`, 
            subtext: 'vs Highest',
            color: warningColor
          },
          { 
            label: 'Providers', 
            value: quotesToDownload.length.toString(), 
            subtext: 'Compared',
            color: primaryColor
          }
        ];

        metrics.forEach((metric, index) => {
          const cardX = margin + index * (cardWidth + 5);
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(cardX - 1, yPosition - 1, cardWidth + 2, cardHeight + 2, 3, 3, 'FD'); // Shadow
          pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'F');
          pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'S');
          
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.setFont('helvetica', 'bold');
          pdf.text(metric.label, cardX + 5, yPosition + 12, { maxWidth: cardWidth - 10 });
          
          pdf.setFontSize(12);
          pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
          pdf.text(metric.value, cardX + 5, yPosition + 25, { maxWidth: cardWidth - 10 });
          
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.setFont('helvetica', 'normal');
          pdf.text(metric.subtext, cardX + 5, yPosition + 35, { maxWidth: cardWidth - 10 });
        });

        yPosition += cardHeight + 20;
      }

      // Detailed Quotes Comparison Table - Enhanced for easy comparison with vertical lines, no overlaps
      pdf.setFontSize(14);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Comparison', margin, yPosition + 10);

      yPosition += 20;

      yPosition = createProfessionalComparisonTable(pdf, quotesToDownload, margin, yPosition, pageWidth, pageHeight, contentWidth);

      // Detailed Analysis & Recommendations Section
      if (quotesToDownload.length > 1) {
        yPosition += 20;
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analysis & Recommendations', margin, yPosition + 10);

        yPosition += 20;

        pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        pdf.roundedRect(margin, yPosition, contentWidth, 80, 5, 5, 'F');
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.roundedRect(margin, yPosition, contentWidth, 80, 5, 5, 'S');

        const bestQuote = [...quotesToDownload].sort((a, b) => a.totalPremium - b.totalPremium)[0];
        const addOnsCount = Object.keys(bestQuote.selectedAddOns || {}).length;

        pdf.setFontSize(10);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFont('helvetica', 'normal');

        const analysisLines = [
          `• Recommended Provider: ${bestQuote.insuranceCompany} at ₹${bestQuote.totalPremium.toLocaleString('en-IN')} (Best Value)`,
          `• Coverage Details: ${getCoverageTypeLabel(bestQuote.coverageType)} with ${bestQuote.ncbDiscount}% NCB and ₹${bestQuote.idv.toLocaleString('en-IN')} IDV`,
          `• Add-ons: ${addOnsCount} selected, including premium and included covers`,
          `• Savings: Up to ₹${(Math.max(...quotesToDownload.map(q => q.totalPremium)) - bestQuote.totalPremium).toLocaleString('en-IN')} compared to highest quote`,
          `• Policy Term: ${bestQuote.policyDurationLabel}`
        ];

        let analysisY = yPosition + 10;
        analysisLines.forEach((line) => {
          pdf.text(line, margin + 10, analysisY, { maxWidth: contentWidth - 20 });
          analysisY += 12;
        });

        yPosition += 100;
      }

      // Footer on every page
      const addFooter = (pageNum, totalPages) => {
        const footerY = pageHeight - 25;
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Generated by AutoCredits Insurance System • Confidential • For Internal Use Only', margin, footerY);
        pdf.text(`Page ${pageNum} of ${totalPages} • ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, footerY, { align: 'right' });
      };

      // Since we may have multiple pages, add footer to current page (assume single page for now, enhance if needed)
      addFooter(1, 1); // Update if adding pages dynamically

      // FIXED: Ensure PDF is properly saved with a filename
      const fileName = `autocredits-insurance-comparison-${form.customerName?.replace(/\s+/g, '-') || 'client'}-${new Date().getTime()}.pdf`;
      
      // Save the PDF - this should trigger download automatically
      pdf.save(fileName);
      
      console.log("✅ Enhanced PDF generated and download triggered:", fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Professional comparison table creation - ENHANCED WITH VERTICAL LINES, BETTER SPACING, NO OVERLAPS
  const createProfessionalComparisonTable = (pdf, quotes, startX, startY, pageWidth, pageHeight, contentWidth) => {
    let yPosition = startY;

    // Color definitions
    const primaryColor = [0, 51, 102];
    const accentColor = [34, 139, 34];
    const textColor = [33, 37, 41];
    const borderColor = [206, 212, 218];
    const lightBg = [248, 249, 250];

    // Table columns with adjusted widths for better readability (sum to 1)
    const columns = [
      { header: 'Provider', width: 0.20 },
      { header: 'Total Premium', width: 0.12 },
      { header: 'Coverage Type', width: 0.12 },
      { header: 'IDV', width: 0.12 },
      { header: 'NCB %', width: 0.08 },
      { header: 'Add-ons', width: 0.14 },
      { header: 'Duration', width: 0.10 },
      { header: 'Key Benefits', width: 0.12 }
    ];

    // Calculate cumulative positions for vertical lines
    const colPositions = [startX];
    columns.forEach(col => {
      colPositions.push(colPositions[colPositions.length - 1] + contentWidth * col.width);
    });

    // Table Header - Enhanced with bolder style
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(startX, yPosition, contentWidth, 12, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);

    columns.forEach((col, index) => {
      pdf.text(col.header, colPositions[index] + 4, yPosition + 8, { maxWidth: contentWidth * col.width - 8 });
    });

    // Draw vertical lines for header
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    colPositions.forEach(pos => {
      pdf.line(pos, yPosition, pos, yPosition + 12);
    });

    yPosition += 12;

    // Sort quotes by premium (lowest first) for easy comparison
    const sortedQuotes = [...quotes].sort((a, b) => a.totalPremium - b.totalPremium);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    sortedQuotes.forEach((quote, index) => {
      // Check for page break - increased buffer to prevent overlaps
      if (yPosition + 40 > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
        
        // Redraw header on new page
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(startX, yPosition, contentWidth, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        
        columns.forEach((col, idx) => {
          pdf.text(col.header, colPositions[idx] + 4, yPosition + 8, { maxWidth: contentWidth * col.width - 8 });
        });

        // Redraw vertical lines for header
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.5);
        colPositions.forEach(pos => {
          pdf.line(pos, yPosition, pos, yPosition + 12);
        });
        
        yPosition += 12;
        pdf.setFontSize(9);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      }

      // Row background - alternate with highlight for best (lowest) quote
      const isBest = index === 0;
      pdf.setFillColor(isBest ? [224, 255, 224] : (index % 2 === 0 ? [255, 255, 255] : lightBg)); // Green tint for best
      pdf.rect(startX, yPosition, contentWidth, 30, 'F'); // Reduced height for compactness
      
      // Draw vertical lines for row
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setLineWidth(0.2);
      colPositions.forEach(pos => {
        pdf.line(pos, yPosition, pos, yPosition + 30);
      });

      // Draw bottom border
      pdf.line(startX, yPosition + 30, startX + contentWidth, yPosition + 30);

      // Populate cells with wrapping to prevent overflows
      let cellIndex = 0;

      // Provider
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(isBest ? accentColor[0] : textColor[0], isBest ? accentColor[1] : textColor[1], isBest ? accentColor[2] : textColor[2]);
      pdf.text(isBest ? '★ ' + quote.insuranceCompany : quote.insuranceCompany, colPositions[cellIndex] + 4, yPosition + 8, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(quote.companyFallbackLogo || '🏢', colPositions[cellIndex] + 4, yPosition + 18); // Fallback logo as text
      cellIndex++;

      // Total Premium
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.text(`₹${quote.totalPremium.toLocaleString('en-IN')}`, colPositions[cellIndex] + 4, yPosition + 8, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`GST: ₹${(quote.gstAmount || 0).toLocaleString('en-IN')}`, colPositions[cellIndex] + 4, yPosition + 18, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      cellIndex++;

      // Coverage Type
      pdf.setFontSize(9);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      const coverageText = quote.coverageType === 'comprehensive' ? 'Comprehensive' : quote.coverageType === 'standalone' ? 'OD Only' : 'Third Party';
      pdf.text(coverageText, colPositions[cellIndex] + 4, yPosition + 15, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      cellIndex++;

      // IDV
      pdf.text(`₹${quote.idv.toLocaleString('en-IN')}`, colPositions[cellIndex] + 4, yPosition + 15, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      cellIndex++;

      // NCB
      pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.text(`${quote.ncbDiscount}%`, colPositions[cellIndex] + 4, yPosition + 8, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Save: ₹${(quote.ncbDiscountAmount || 0).toLocaleString('en-IN')}`, colPositions[cellIndex] + 4, yPosition + 18, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      cellIndex++;

      // Add-ons
      pdf.setFontSize(9);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      const totalAddOns = Object.keys(quote.selectedAddOns || {}).length;
      pdf.text(`${totalAddOns} Covers`, colPositions[cellIndex] + 4, yPosition + 8, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`₹${(quote.addOnsPremium || 0).toLocaleString('en-IN')}`, colPositions[cellIndex] + 4, yPosition + 18, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      cellIndex++;

      // Duration
      pdf.setFontSize(9);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.text(quote.policyDurationLabel || quote.policyDuration, colPositions[cellIndex] + 4, yPosition + 15, { maxWidth: contentWidth * columns[cellIndex].width - 8 });
      cellIndex++;

      // Key Benefits (wrapped list)
      pdf.setFontSize(8);
      const benefits = [];
      if (quote.selectedAddOns && typeof quote.selectedAddOns === 'object') {
        Object.values(quote.selectedAddOns).slice(0, 3).forEach(function(addOn) {
          if (addOn.description) {
            benefits.push(addOn.description.split(' ')[0]);
          }
        });
      }
      const benefitsText = benefits.length > 0 ? benefits.join(', ') : 'Standard Coverage';
      pdf.text(benefitsText, colPositions[cellIndex] + 4, yPosition + 15, { maxWidth: contentWidth * columns[cellIndex].width - 8 });

      yPosition += 30; // Fixed row height to prevent overlaps
    });

    // Draw final bottom border if needed
    pdf.line(startX, yPosition, startX + contentWidth, yPosition);

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
  const currentPolicyDurationOptions = getPolicyDurationOptions(form.vehicleType, manualQuote.coverageType);

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
        <div className="flex gap-2">
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
        </div>
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

      {/* FIXED: NCB Eligibility Status */}
      <div className={`mb-4 p-3 rounded-lg border ${
        form.previousClaimTaken === "yes" 
          ? 'bg-red-50 border-red-200' 
          : form.vehicleType === "new"
          ? 'bg-blue-50 border-blue-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              form.previousClaimTaken === "yes" 
                ? 'text-red-700' 
                : form.vehicleType === "new"
                ? 'text-blue-700'
                : 'text-green-700'
            }`}>
              <strong>NCB Status:</strong> {
                form.previousClaimTaken === "yes" 
                  ? 'Not Eligible (Claim Taken)' 
                  : form.vehicleType === "new"
                  ? 'New Vehicle (Starts at 0%)'
                  : 'Eligible (Default 25%)'
              }
            </p>
            <p className={`text-xs ${
              form.previousClaimTaken === "yes" 
                ? 'text-red-600' 
                : form.vehicleType === "new"
                ? 'text-blue-600'
                : 'text-green-600'
            }`}>
              {form.previousClaimTaken === "yes" 
                ? 'Claim was taken in previous policy - NCB set to 0%' 
                : form.vehicleType === "new"
                ? 'New vehicle starts at 0% NCB, but you can change it'
                : 'No claim in previous policy - Default NCB is 25% (can be changed)'
              }
            </p>
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
        </div>
      </div>

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

          {/* Coverage Type - UPDATED WITH 3 OPTIONS */}
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

          {/* Policy Duration - UPDATED: Now depends on coverage type */}
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
              {currentPolicyDurationOptions.map(option => (
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
            {manualQuote.coverageType === "standalone" && (
              <p className="text-xs text-blue-500 mt-1">
                Stand Alone OD policies available for 1, 2, or 3 years
              </p>
            )}
          </div>

          {/* FIXED: NCB Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NCB Discount (%)
            </label>
            <select
              name="ncbDiscount"
              value={manualQuote.ncbDiscount}
              onChange={handleManualQuoteChange}
              disabled={form.previousClaimTaken === "yes"} // Only disable if claim was taken
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
                    ''
                  }
                </option>
              ))}
            </select>
            {form.previousClaimTaken === "yes" && (
              <p className="text-xs text-red-600 mt-1">
                NCB disabled - claim was taken in previous policy
              </p>
            )}
            {form.vehicleType === "new" && form.previousClaimTaken !== "yes" && (
              <p className="text-xs text-blue-600 mt-1">
                New vehicle - you can set NCB percentage (starts at 0%)
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

          {/* Third Party Amount - UPDATED: Auto-set to 0 for Stand Alone OD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3rd Party Amount (₹) <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <INRCurrencyInput
              type="number"
              name="thirdPartyAmount"
              value={manualQuote.thirdPartyAmount}
              onChange={handleManualQuoteChange}
              disabled={manualQuote.coverageType === "standalone"} // Disable for Stand Alone OD
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
                <div className="text-xs text-gray-500">(Individual + Add-ons field)</div>
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

        {/* Add/Update Quote Button */}
        {editingQuote ? (
          <button
            onClick={updateQuote}
            disabled={!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Edit className="w-5 h-5 mr-2" />
            Update Quote
          </button>
        ) : (
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
              const company = insuranceCompanies.find(c => c.name === quote.insuranceCompany);
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
                            {/* FIXED: Use policyDurationLabel directly */}
                            <span>{quote.policyDurationLabel}</span>
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
                              <span className="font-semibold">{getCoverageTypeLabel(quote.coverageType)}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">IDV</span>
                              <span className="font-semibold">₹{quote.idv?.toLocaleString('en-IN')}</span>
                            </div>

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
                                      style={{ backgroundColor: company?.bgColor, color: company?.color }}
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