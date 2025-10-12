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

  const [manualQuote, setManualQuote] = useState({
    insuranceCompany: '',
    coverageType: 'comprehensive',
    idv: '',
    policyDuration: '1',
    ncbDiscount: getDefaultNcb(),
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

  // Calculate total premium with GST as (odAmount + thirdPartyAmount + addOnsTotal) + 18% GST
  const calculateTotalPremium = () => {
    const odAmount = parseFloat(manualQuote.odAmount) || 0;
    const thirdPartyAmount = parseFloat(manualQuote.thirdPartyAmount) || 0;
    const addOnsTotal = calculateAddOnsTotal();
    
    const baseAmount = odAmount + thirdPartyAmount + addOnsTotal;
    const gstAmount = baseAmount * 0.18;
    const totalWithGst = baseAmount + gstAmount;
    
    return Math.round(totalWithGst);
  };

  // Calculate base premium without GST for display
  const calculateBasePremium = () => {
    const odAmount = parseFloat(manualQuote.odAmount) || 0;
    const thirdPartyAmount = parseFloat(manualQuote.thirdPartyAmount) || 0;
    const addOnsTotal = calculateAddOnsTotal();
    
    return odAmount + thirdPartyAmount + addOnsTotal;
  };

  // Calculate GST amount for display
  const calculateGstAmount = () => {
    const baseAmount = calculateBasePremium();
    return baseAmount * 0.18;
  };

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
    
    // Prevent NCB changes if not eligible
    if (name === "ncbDiscount" && !isNcbEligible) {
      return;
    }
    
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

  // Add manual quote
  const addManualQuote = () => {
    if (!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv) {
      alert("Please fill all required fields: Insurance Company, Coverage Type, and IDV");
      return;
    }

    const company = insuranceCompanies.find(c => c.name === manualQuote.insuranceCompany);
    const addOnsPremium = calculateAddOnsTotal();
    const totalPremium = calculateTotalPremium();
    const basePremium = calculateBasePremium();
    const gstAmount = calculateGstAmount();

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
      premium: basePremium,
      gstAmount: gstAmount,
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
      policyDuration: '1',
      ncbDiscount: getDefaultNcb(),
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

  // Calculate current totals for display
  const currentBasePremium = calculateBasePremium();
  const currentGstAmount = calculateGstAmount();
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
      
      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaInfoCircle className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-800">Edit Mode</h4>
              <p className="text-sm text-blue-600">
                {acceptedQuote 
                  ? `Accepted quote loaded: ${acceptedQuote.insuranceCompany} - ₹${acceptedQuote.totalPremium?.toLocaleString('en-IN')}`
                  : 'Loading your previously saved quotes...'
                }
              </p>
            </div>
          </div>
        </div>
      )}

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
              <option value="4">4 Years</option>
              <option value="5">5 Years</option>
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
              OD Amount (₹) *
            </label>
            <input
              type="number"
              name="odAmount"
              value={manualQuote.odAmount}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter OD amount"
              required
            />
          </div>

          {/* Third Party Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3rd Party Amount (₹) *
            </label>
            <input
              type="number"
              name="thirdPartyAmount"
              value={manualQuote.thirdPartyAmount}
              onChange={handleManualQuoteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 3rd party amount"
              required
            />
          </div>

          {/* Premium Summary */}
          <div className="col-span-full bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Base Premium:</span>
                <div className="font-semibold text-lg">₹{currentBasePremium.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-500">(OD + 3rd Party + Add-ons)</div>
              </div>
              <div>
                <span className="text-gray-600">Add-ons Total:</span>
                <div className="font-semibold text-lg text-purple-600">₹{currentAddOnsTotal.toLocaleString('en-IN')}</div>
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
          disabled={!manualQuote.insuranceCompany || !manualQuote.coverageType || !manualQuote.idv || !manualQuote.odAmount || !manualQuote.thirdPartyAmount}
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
                            <span>{quote.policyDuration} Year{quote.policyDuration > 1 ? 's' : ''}</span>
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
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {quote.coverageType === 'comprehensive' ? 'COMPREHENSIVE' : 'THIRD PARTY'}
                        </span>
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
                            
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">3rd Party Amount</span>
                              <span className="font-semibold">₹{quote.thirdPartyAmount?.toLocaleString('en-IN')}</span>
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
                            
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-gray-600">Base Premium</span>
                              <span className="font-semibold">₹{quote.premium?.toLocaleString('en-IN')}</span>
                            </div>

                            <div className={`flex justify-between items-center ${
                              quote.ncbDiscount > 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              <span>NCB Discount {quote.ncbDiscount}%</span>
                              <span>-₹{Math.round((quote.premium || 0) * (quote.ncbDiscount / 100)).toLocaleString('en-IN')}</span>
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
                              <span className="font-semibold">{quote.policyDuration} Year{quote.policyDuration > 1 ? 's' : ''}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coverage Type</span>
                              <span className="font-semibold">{quote.coverageType === 'comprehensive' ? 'Comprehensive' : 'Third Party'}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">IDV</span>
                              <span className="font-semibold">₹{quote.idv?.toLocaleString('en-IN')}</span>
                            </div>

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