import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaUser, FaPhone, FaChevronUp, FaEnvelope, FaMapMarkerAlt, FaFileInvoiceDollar,
  FaCalendarAlt, FaEdit, FaTimes, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaMoneyBillWave, FaCreditCard, FaIdCard, FaBuilding, FaTag,
  FaFileAlt, FaShieldAlt, FaPercentage, FaHistory, FaDownload, FaEye,
  FaFilePdf, FaFileImage, FaFile, FaSpinner, FaUserTie, FaStore, FaHome,
  FaChevronRight, FaChevronDown, FaHourglassHalf, FaCheck, FaFileUpload,
  FaReceipt, FaCarSide, FaQuoteRight, FaRupeeSign, FaDatabase,
  FaCalendarCheck, FaHourglassStart, FaHourglassEnd, FaRegClock,
  FaInfoCircle, FaStopwatch, FaPlus
} from 'react-icons/fa';
import logo from "../../assets/logo.png";

const PolicyModal = ({ policy, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [downloadingDocs, setDownloadingDocs] = useState({});
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineSummary, setTimelineSummary] = useState('');
  const [showTimelineDetails, setShowTimelineDetails] = useState(false);
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [selectedQuoteForPopup, setSelectedQuoteForPopup] = useState(null);

  // Function to format Indian Standard Time (IST)
  const formatIndianTime = useCallback((timestamp) => {
    if (!timestamp) return null;
    
    try {
      // Handle both direct timestamps and object with timestamp property
      const actualTimestamp = typeof timestamp === 'object' ? timestamp.timestamp || timestamp.isoString : timestamp;
      
      const date = new Date(actualTimestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return null;
      }
      
      const options = { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      
      const formatter = new Intl.DateTimeFormat('en-IN', options);
      const parts = formatter.formatToParts(date);
      
      const dateParts = {};
      parts.forEach(part => {
        dateParts[part.type] = part.value;
      });
      
      return {
        date: `${dateParts.day}/${dateParts.month}/${dateParts.year}`,
        time: `${dateParts.hour}:${dateParts.minute}:${dateParts.second}`,
        display: `${dateParts.day}/${dateParts.month}/${dateParts.year}, ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`,
        timestamp: actualTimestamp,
        shortDate: `${dateParts.day}/${dateParts.month}/${dateParts.year}`,
        shortTime: `${dateParts.hour}:${dateParts.minute}`
      };
    } catch (error) {
      console.error('Error formatting Indian time:', error, timestamp);
      return null;
    }
  }, []);

  // Function to calculate time difference in a readable format
  const calculateTimeDifference = useCallback((startTimestamp, endTimestamp) => {
    if (!startTimestamp || !endTimestamp) return 'N/A';
    
    try {
      const start = new Date(startTimestamp);
      const end = new Date(endTimestamp);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Invalid date';
      }
      
      const diffMs = Math.abs(end - start);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      if (diffDays > 0) {
        return `${diffDays}d ${diffHours}h`;
      } else if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m ${diffSeconds}s`;
      } else {
        return `${diffSeconds}s`;
      }
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return 'Error';
    }
  }, []);

  // Function to process and organize timeline data with NEW field names
  const processTimelineData = useCallback(() => {
    if (!policy) return { events: [], summary: '', stats: {} };
    
    const timelineData = policy.timeline || {};
    const events = [];
    
    // Define all possible timeline events with their display info - UPDATED FIELD NAMES
    const timelineEventConfig = {
      caseStarted: {
        label: 'Case Started',
        icon: FaHourglassStart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Policy case was created',
        order: 1
      },
      quotesGenerated: {
        label: 'Quotes Generated',
        icon: FaQuoteRight,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Insurance quotes were created/shared',
        order: 2
      },
      progressSaved: {
        label: 'Progress Saved',
        icon: FaRegClock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description: 'Policy progress was last saved',
        order: 3
      },
      caseCompleted: {
        label: 'Case Completed',
        icon: FaHourglassEnd,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Policy case was marked as completed',
        order: 4
      },
      
      // Legacy field names for backward compatibility
      created: {
        label: 'Case Started',
        icon: FaHourglassStart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Policy case was created',
        order: 1
      },
      quotesShared: {
        label: 'Quotes Generated',
        icon: FaQuoteRight,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Insurance quotes were created/shared',
        order: 2
      },
      lastSaved: {
        label: 'Progress Saved',
        icon: FaRegClock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description: 'Policy progress was last saved',
        order: 3
      },
      completed: {
        label: 'Case Completed',
        icon: FaHourglassEnd,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Policy case was marked as completed',
        order: 4
      }
    };
    
    // Process each timeline event - prioritize NEW field names first
    const processedEvents = new Set(); // Track processed events to avoid duplicates
    
    // Process new field names first
    Object.entries(timelineEventConfig).forEach(([eventKey, config]) => {
      const eventData = timelineData[eventKey];
      if (eventData && !processedEvents.has(eventKey)) {
        const formattedTime = formatIndianTime(eventData);
        if (formattedTime) {
          // Get additional data if available
          const additionalData = typeof eventData === 'object' && eventData.data ? eventData.data : null;
          
          events.push({
            key: eventKey,
            label: config.label,
            description: config.description,
            timestamp: formattedTime.timestamp,
            displayTime: formattedTime.display,
            shortDate: formattedTime.shortDate,
            shortTime: formattedTime.shortTime,
            icon: config.icon,
            color: config.color,
            bgColor: config.bgColor,
            borderColor: config.borderColor,
            order: config.order,
            completed: true,
            hasData: !!additionalData,
            data: additionalData
          });
          processedEvents.add(eventKey);
        }
      }
    });
    
    // If caseStarted doesn't exist, use the policy's creation timestamp
    if (!events.find(e => e.key === 'caseStarted' || e.key === 'created')) {
      const createdTimestamp = policy.created_at || policy.ts;
      if (createdTimestamp) {
        const formattedTime = formatIndianTime(createdTimestamp);
        if (formattedTime) {
          events.push({
            key: 'caseStarted',
            label: 'Case Started',
            description: 'Policy case was created',
            timestamp: formattedTime.timestamp,
            displayTime: formattedTime.display,
            shortDate: formattedTime.shortDate,
            shortTime: formattedTime.shortTime,
            icon: FaHourglassStart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            order: 1,
            completed: true,
            hasData: false,
            data: null
          });
        }
      }
    }
    
    // Sort events by timestamp or order
    events.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
      return a.order - b.order;
    });
    
    // Calculate statistics
    const stats = {};
    const createdEvent = events.find(e => e.key === 'caseStarted' || e.key === 'created');
    const completedEvent = events.find(e => e.key === 'caseCompleted' || e.key === 'completed');
    
    if (createdEvent && completedEvent) {
      stats.totalTime = calculateTimeDifference(createdEvent.timestamp, completedEvent.timestamp);
      
      // Calculate time to quotes if available
      const quotesEvent = events.find(e => e.key === 'quotesGenerated' || e.key === 'quotesShared');
      if (quotesEvent) {
        stats.timeToQuotes = calculateTimeDifference(createdEvent.timestamp, quotesEvent.timestamp);
      }
      
      // Calculate time to completion
      stats.timeToCompletion = calculateTimeDifference(createdEvent.timestamp, completedEvent.timestamp);
      
      // Calculate quotes to completion time
      if (quotesEvent) {
        stats.quotesToCompletion = calculateTimeDifference(quotesEvent.timestamp, completedEvent.timestamp);
      }
    }
    
    // Create summary
    let summary = '';
    if (stats.totalTime) {
      summary = `Total Processing Time: ${stats.totalTime}`;
      if (stats.timeToQuotes) {
        summary += ` (Quotes in ${stats.timeToQuotes})`;
      }
    } else {
      summary = events.length > 0 ? 'Timeline data available' : 'No timeline data';
    }
    
    return { events, summary, stats };
  }, [policy, formatIndianTime, calculateTimeDifference]);

  // Initialize timeline on component mount or when policy changes
  useEffect(() => {
    if (isOpen && policy) {
      const { events, summary } = processTimelineData();
      setTimelineEvents(events);
      setTimelineSummary(summary);
    }
  }, [isOpen, policy, processTimelineData]);

  // Function to handle edit click
  const handleEditClick = () => {
    const policyId = policy._id || policy.id;
    navigate(`/new-policy/${policyId}`);
    onClose();
  };

  // Function to format status display
  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: { 
        text: 'Active', 
        class: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        icon: FaCheckCircle
      },
      completed: { 
        text: 'Completed', 
        class: 'bg-blue-50 text-blue-700 border border-blue-200',
        icon: FaCheckCircle
      },
      draft: { 
        text: 'Draft', 
        class: 'bg-amber-50 text-amber-700 border border-amber-200',
        icon: FaClock
      },
      pending: { 
        text: 'Pending', 
        class: 'bg-purple-50 text-purple-700 border border-purple-200',
        icon: FaClock
      },
      expired: { 
        text: 'Expired', 
        class: 'bg-rose-50 text-rose-700 border border-rose-200',
        icon: FaExclamationTriangle
      },
      'payment completed': {
        text: 'Payment Completed',
        class: 'bg-green-50 text-green-700 border border-green-200',
        icon: FaCheckCircle
      }
    };

    return statusConfig[status] || { 
      text: status, 
      class: 'bg-gray-50 text-gray-700 border border-gray-200',
      icon: FaTag
    };
  };

  // Function to format payment status display
  const getPaymentStatusDisplay = (policy) => {
    const totalPaid = policy.payment_info?.totalPaidAmount || 0;
    const totalPremium = getPremiumInfo(policy);
    
    const calculateTotalSubventionRefund = () => {
      const paymentLedger = policy.payment_ledger || [];
      return paymentLedger
        .filter(payment => payment.type === "subvention_refund")
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    };
    
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const netPremium = Math.max(totalPremium - totalSubventionRefund, 0);
    
    let paymentStatus = 'pending';
    if (totalPaid >= netPremium && netPremium > 0) {
      paymentStatus = 'fully paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partially paid';
    }

    const paymentConfig = {
      'fully paid': {
        text: 'Fully Paid',
        class: 'bg-green-100 text-green-800 border border-green-200',
        icon: FaCheckCircle
      },
      'partially paid': {
        text: 'Partially Paid',
        class: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: FaMoneyBillWave
      },
      'pending': {
        text: 'Payment Pending',
        class: 'bg-red-100 text-red-800 border border-red-200',
        icon: FaClock
      }
    };

    return paymentConfig[paymentStatus] || paymentConfig.pending;
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  // Function to get premium info
  const getPremiumInfo = (policy) => {
    if (policy.policy_info?.totalPremium) {
      return parseInt(policy.policy_info.totalPremium);
    }
    if (policy.insurance_quote?.premium) {
      return parseInt(policy.insurance_quote.premium);
    }
    return 0;
  };

  // Function to get paid amount
  const getPaidAmount = (policy) => {
    const totalPaid = policy.payment_info?.totalPaidAmount || 0;
    const totalPremium = getPremiumInfo(policy);
    
    const calculateTotalSubventionRefund = () => {
      const paymentLedger = policy.payment_ledger || [];
      return paymentLedger
        .filter(payment => payment.type === "subvention_refund")
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    };
    
    const totalSubventionRefund = calculateTotalSubventionRefund();
    const netPremium = Math.max(totalPremium - totalSubventionRefund, 0);
    
    return {
      paid: totalPaid,
      total: totalPremium,
      netPremium: netPremium,
      subventionRefund: totalSubventionRefund,
      percentage: netPremium > 0 ? Math.min((totalPaid / netPremium) * 100, 100) : 100
    };
  };

  // Enhanced function to get insurance quotes
  const getInsuranceQuotes = () => {
    const possibleQuoteFields = [
      'insurance_quotes',
      'insuranceQuotes', 
      'quotes',
      'insurance_quote'
    ];

    for (const field of possibleQuoteFields) {
      if (policy[field]) {
        if (Array.isArray(policy[field])) {
          return policy[field];
        } else if (typeof policy[field] === 'object') {
          return [policy[field]];
        }
      }
    }

    if (policy.policy_info?.quotes && Array.isArray(policy.policy_info.quotes)) {
      return policy.policy_info.quotes;
    }

    return [];
  };

  // Function to extract insurer name from quote
  const getInsurerName = (quote) => {
    const possibleInsurerFields = [
      'insuranceCompany',
      'insurer',
      'company',
      'provider'
    ];

    for (const field of possibleInsurerFields) {
      if (quote[field]) {
        return quote[field];
      }
    }
    return 'Unknown Insurer';
  };

  // Function to extract quote details
  const getQuoteDetails = (quote) => {
    return {
      insurer: getInsurerName(quote),
      idv: parseInt(quote.idv) || 0,
      premium: parseInt(quote.premium) || 0,
      totalPremium: parseInt(quote.totalPremium) || parseInt(quote.premium) || 0,
      coverageType: quote.coverageType || 'comprehensive',
      policyDuration: quote.policyDuration || 1,
      ncbDiscount: quote.ncbDiscount || 0,
      odAmount: parseInt(quote.odAmount) || 0,
      thirdPartyAmount: parseInt(quote.thirdPartyAmount) || 0,
      addOnsPremium: parseInt(quote.addOnsPremium) || 0
    };
  };

  // Get accepted quote
  const getAcceptedQuote = () => {
    const quotes = getInsuranceQuotes();
    return quotes.find(quote => quote.accepted === true) || quotes[0];
  };

  // Get customer details
  const getCustomerDetails = () => {
    const customer = policy.customer_details || {};
    const isCorporate = policy.buyer_type === 'corporate';
    
    // Get credit type information
    const creditType = policy.creditType || customer.creditType || 'auto';
    const brokerName = policy.brokerName || customer.brokerName || '';
    const sourceOrigin = policy.sourceOrigin || customer.sourceOrigin || '';
    
    return {
      name: isCorporate ? customer.companyName : customer.name,
      contactPerson: isCorporate ? customer.contactPersonName : customer.name,
      mobile: customer.mobile || 'N/A',
      email: customer.email || 'N/A',
      city: customer.city || 'N/A',
      pincode: customer.pincode || 'N/A',
      address: customer.residenceAddress || 'N/A',
      buyerType: policy.buyer_type || 'individual',
      age: customer.age || 'N/A',
      gender: customer.gender || 'N/A',
      panNumber: isCorporate ? customer.companyPanNumber : customer.panNumber,
      aadhaarNumber: customer.aadhaarNumber || 'N/A',
      gstNumber: customer.gstNumber || 'N/A',
      employeeName: customer.employeeName || 'N/A',
      isCorporate: isCorporate,
      creditType: creditType,
      brokerName: brokerName,
      sourceOrigin: sourceOrigin
    };
  };

  // Get vehicle details
  const getVehicleDetails = () => {
    const vehicle = policy.vehicle_details || {};
    const vehicleType = policy.vehicleType || 'used';
    const vehicleTypeCategory = vehicle.vehicleTypeCategory || '4 wheeler';
    
    return {
      make: vehicle.make || 'N/A',
      model: vehicle.model || 'N/A',
      variant: vehicle.variant || 'N/A',
      regNo: vehicle.regNo || 'N/A',
      engineNo: vehicle.engineNo || 'N/A',
      chassisNo: vehicle.chassisNo || 'N/A',
      makeYear: vehicle.makeYear || 'N/A',
      makeMonth: vehicle.makeMonth || 'N/A',
      vehicleType: vehicleType === 'new' ? 'New' : 'Used',
      vehicleTypeCategory: vehicleTypeCategory,
      cubicCapacity: vehicle.cubicCapacity || 'N/A'
    };
  };

  // Get previous policy details
  const getPreviousPolicy = () => {
    const prev = policy.previous_policy || {};
    return {
      insuranceCompany: prev.insuranceCompany || 'N/A',
      policyNumber: prev.policyNumber || 'N/A',
      policyType: prev.policyType || 'N/A',
      issueDate: prev.issueDate || 'N/A',
      dueDate: prev.dueDate || 'N/A',
      claimTakenLastYear: prev.claimTakenLastYear || 'no',
      ncbDiscount: prev.ncbDiscount || 0,
      hypothecation: prev.hypothecation || 'N/A',
      remarks: prev.remarks || 'N/A'
    };
  };

  // Get payout details
  const getPayoutDetails = () => {
    const payout = policy.payout || {};
    
    const acceptedQuote = getAcceptedQuote();
    const odAmountFromQuote = acceptedQuote?.odAmount || 0;
    const addonsFromQuote = acceptedQuote?.addOnsPremium || 0;
    const odAddonTotalFromQuote = odAmountFromQuote + addonsFromQuote;
    
    const odAddonAmount = odAddonTotalFromQuote > 0 ? odAddonTotalFromQuote : (payout.odAddonAmount || payout.odAmount || 0);
    
    return {
      netPremium: payout.netPremium || 0,
      odAddonAmount: odAddonAmount,
      ncbAmount: payout.ncbAmount || 0,
      subVention: payout.subVention || 0,
      netAmount: payout.netAmount || 0,
      odAddonPercentage: payout.odAddonPercentage || 0
    };
  };

  // Get payment details
  const getPaymentDetails = () => {
    const paymentInfo = policy.payment_info || {};
    const paymentLedger = policy.payment_ledger || [];
    
    const subventionPayments = paymentLedger.filter(payment => 
      payment.type === 'subvention_refund' || 
      payment.mode?.toLowerCase().includes('subvention')
    );
    
    const totalSubvention = subventionPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const paymentMode = paymentInfo.paymentMode && paymentInfo.paymentMode !== 'N/A' ? paymentInfo.paymentMode : null;
    const transactionId = paymentInfo.transactionId && paymentInfo.transactionId !== 'N/A' ? paymentInfo.transactionId : null;
    const bankName = paymentInfo.bankName && paymentInfo.bankName !== 'N/A' ? paymentInfo.bankName : null;
    
    return {
      paymentMadeBy: paymentInfo.paymentMadeBy || 'Customer',
      paymentMode: paymentMode,
      paymentAmount: paymentInfo.paymentAmount || 0,
      paymentDate: paymentInfo.paymentDate || 'N/A',
      transactionId: transactionId,
      bankName: bankName,
      subventionPayment: paymentInfo.subvention_payment || 'No Subvention',
      paymentStatus: paymentInfo.paymentStatus || 'Payment Pending',
      totalPaidAmount: paymentInfo.totalPaidAmount || 0,
      totalSubvention: totalSubvention,
      paymentLedger: paymentLedger
    };
  };

  // Function to get file icon based on file type
  const getFileIcon = (document) => {
    const extension = getFileExtension(document);
    
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="w-4 h-4 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FaFileImage className="w-4 h-4 text-green-500" />;
      default:
        return <FaFile className="w-4 h-4 text-blue-500" />;
    }
  };

  // Function to get file name from URL
  const getFileName = (document) => {
    if (document.name && document.name.trim() !== '') {
      return document.name;
    }
    
    if (document.originalName && document.originalName.trim() !== '') {
      return document.originalName;
    }
    
    const url = document.url || '';
    if (url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileNameFromUrl = pathname.split('/').pop();
        
        if (fileNameFromUrl && fileNameFromUrl.includes('.')) {
          return fileNameFromUrl;
        }
      } catch (e) {
        const simpleFileName = url.split('/').pop();
        if (simpleFileName && simpleFileName.includes('.')) {
          return simpleFileName;
        }
      }
    }
    
    const docType = document.tag || 'document';
    const timestamp = Date.now();
    return `${docType}_${timestamp}`;
  };

  const getFileExtension = (document) => {
    if (!document) return 'pdf';
    
    if (document.extension && document.extension.trim() !== '') {
      return document.extension.toLowerCase();
    }
    
    if (document.type) {
      const type = document.fileType.toLowerCase();
      if (type.includes('pdf')) return 'pdf';
      if (type.includes('image')) return 'jpg';
      if (type.includes('jpeg')) return 'jpg';
      if (type.includes('png')) return 'png';
    }
    
    const fileName = getFileName(document);
    if (fileName && fileName.includes('.')) {
      const parts = fileName.split('.');
      if (parts.length > 1) {
        let ext = parts.pop().toLowerCase();
        ext = ext.split('?')[0].split('#')[0];
        if (ext && ext.length <= 5) {
          return ext;
        }
      }
    }
    
    const url = document.url || '';
    if (url) {
      const urlParts = url.split('.');
      if (urlParts.length > 1) {
        let ext = urlParts.pop().toLowerCase();
        ext = ext.split('?')[0].split('#')[0];
        ext = ext.split('/')[0];
        if (ext && ext.length <= 5) {
          return ext;
        }
      }
    }
    
    return 'pdf';
  };

  // Get documents with tagging information
  const getDocuments = () => {
    let documents = [];
    
    if (Array.isArray(policy.documents)) {
      documents = policy.documents;
    } else if (typeof policy.documents === 'object' && policy.documents !== null) {
      documents = Object.entries(policy.documents).map(([docId, doc]) => ({
        id: docId,
        ...doc,
        tag: policy.documentTags?.[docId] || ''
      }));
    }
    
    return documents;
  };

  // Function to get display name for document
  const getDocumentDisplayName = (document) => {
    if (document.tag && document.tag.trim() !== '') {
      return document.tag;
    }
    
    const extension = getFileExtension(document);
    return extension.toUpperCase() + ' File';
  };

  // Robust download function
  const handleDownload = async (document) => {
    const url = document.url;
    if (!url) {
      alert('No document URL available');
      return;
    }
      
    const docId = document.id || document._id || url;
    setDownloadingDocs(prev => ({ ...prev, [docId]: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      if (typeof window === 'undefined' || !window.document) {
        window.open(url, '_blank');
        return;
      }

      const fileName = getFileName(document);
      const fileExtension = getFileExtension(document);
      
      let downloadFileName = fileName;
      
      if (!downloadFileName.includes('.')) {
        downloadFileName = `${downloadFileName}.${fileExtension}`;
      }

      const link = window.document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      link.target = '_blank';
      link.style.display = 'none';

      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

    } catch (error) {
      console.error('❌ Error in download process:', error);
      
      try {
        if (typeof window !== 'undefined') {
          const newWindow = window.open(url, '_blank');
          if (!newWindow) {
            alert('Popup blocked. Please right-click on the document link and choose "Save link as" to download.');
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        alert(`Unable to download automatically. Please manually visit this URL: ${url}`);
      }
    } finally {
      setTimeout(() => {
        setDownloadingDocs(prev => ({ ...prev, [docId]: false }));
      }, 500);
    }
  };

  // Function to handle document view
  const handleView = (document) => {
    const url = document.url;
    if (url && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      alert('No document URL available for viewing');
    }
  };

  // Function to download all documents
  const handleDownloadAll = async () => {
    const documents = getDocuments();
    if (documents.length === 0) {
      alert('No documents available to download');
      return;
    }

    if (documents.length > 5) {
      const confirmDownload = window.confirm(
        `You are about to download ${documents.length} documents. This may take a while. Continue?`
      );
      if (!confirmDownload) return;
    }

    for (const document of documents) {
      await handleDownload(document);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Function to get credit type display
  const getCreditTypeDisplay = (creditType, brokerName) => {
    const config = {
      auto: {
        text: 'Autocredits India LLP',
        class: 'bg-blue-100 text-blue-800',
        icon: FaCreditCard
      },
      broker: {
        text: `Broker${brokerName ? ` - ${brokerName}` : ''}`,
        class: 'bg-purple-100 text-purple-800',
        icon: FaUserTie
      },
      showroom: {
        text: 'Showroom',
        class: 'bg-orange-100 text-orange-800',
        icon: FaStore
      },
      customer: {
        text: 'Customer',
        class: 'bg-green-100 text-green-800',
        icon: FaHome
      }
    };

    return config[creditType] || config.auto;
  };

  // Function to get vehicle type category display
  const getVehicleTypeCategoryDisplay = (category) => {
    const config = {
      '2 wheeler': {
        text: '2 Wheeler',
        class: 'bg-indigo-100 text-indigo-800'
      },
      '4 wheeler': {
        text: '4 Wheeler',
        class: 'bg-teal-100 text-teal-800'
      },
      'commercial': {
        text: 'Commercial Vehicle',
        class: 'bg-amber-100 text-amber-800'
      }
    };

    return config[category] || config['4 wheeler'];
  };

  // Helper function to get coverage type label
  const getCoverageTypeLabel = (type) => {
    switch (type) {
      case 'comprehensive': return 'Comprehensive';
      case 'standalone': return 'Stand Alone OD';
      case 'thirdParty': return 'Third Party';
      default: return type;
    }
  };

  // Function to show detailed quote popup
  const showQuoteDetailsPopup = (quote) => {
    setSelectedQuoteForPopup(quote);
    setShowQuotePopup(true);
  };

  // Function to close quote popup
  const closeQuotePopup = () => {
    setShowQuotePopup(false);
    setSelectedQuoteForPopup(null);
  };

  // Function to render detailed quote popup
  const renderQuotePopup = () => {
    if (!showQuotePopup || !selectedQuoteForPopup) return null;

    const quote = selectedQuoteForPopup;
    const quoteDetails = getQuoteDetails(quote);
    const previousPolicy = getPreviousPolicy();
    
    // Separate included add-ons (amount = 0) from premium add-ons (amount > 0)
    const premiumAddOns = Object.entries(quote.selectedAddOns || {})
      .filter(([_, addOn]) => addOn && addOn.amount > 0);
    const includedAddOns = Object.entries(quote.selectedAddOns || {})
      .filter(([_, addOn]) => addOn && addOn.amount === 0);

    return (
      <div className="fixed inset-0 background-drop-md bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Popup Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaShieldAlt className="w-6 h-6" />
                  Insurance Quote Details
                </h3>
                <p className="text-blue-100 text-sm">{quoteDetails.insurer}</p>
              </div>
              <div className="flex items-center gap-2">
                {quote.accepted === true && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <FaCheckCircle className="w-4 h-4 mr-1" />
                    ACCEPTED
                  </span>
                )}
                <button
                  onClick={closeQuotePopup}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Popup Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Premium Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 text-lg border-b pb-2">Premium Breakup</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Own Damage</span>
                    <span className="font-semibold">₹{(quote.odAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">3rd Party Amount</span>
                    <span className="font-semibold">₹{(quote.thirdPartyAmount || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Add-ons Amount Field */}
                  {quote.addOnsAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Additional Add-ons</span>
                      <span className="font-semibold text-purple-600">+₹{(quote.addOnsAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Premium Add-ons (with amount > 0) */}
                  {premiumAddOns.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Premium Add-ons</span>
                        <span className="font-semibold text-purple-600">
                          +₹{((quote.addOnsPremium || 0) - (quote.addOnsAmount || 0)).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {premiumAddOns.map(([key, addOn]) => (
                          <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{addOn.description}</span>
                            <span className="font-semibold text-green-600">
                              +₹{(addOn.amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Taxable Amount</span>
                    <span className="font-semibold">
                      ₹{((quote.odAmount || 0) + (quote.thirdPartyAmount || 0) + (quote.addOnsPremium || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-semibold text-blue-600">
                      +₹{(quote.gstAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-lg">Total Premium</span>
                      <span className="font-bold text-green-600 text-xl">
                        ₹{(quote.totalPremium || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 text-lg border-b pb-2">Coverage Details</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Policy Term</span>
                    <span className="font-semibold">{quote.policyDurationLabel || quote.policyDuration}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage Type</span>
                    <span className="font-semibold">{getCoverageTypeLabel(quote.coverageType)}</span>
                  </div>
                  
                  {/* IDV Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle IDV</span>
                      <span className="font-semibold">₹{(quote.vehicleIdv || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CNG IDV</span>
                      <span className="font-semibold">₹{(quote.cngIdv || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accessories IDV</span>
                      <span className="font-semibold">₹{(quote.accessoriesIdv || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600 font-semibold">Total IDV</span>
                      <span className="font-semibold text-purple-600">
                        ₹{(quote.idv || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* NCB Information */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">NCB Discount</span>
                    <span className="font-semibold text-green-600">{quote.ncbDiscount || 0}%</span>
                  </div>

                  {/* Show step-up information if available */}
                  {previousPolicy && previousPolicy.ncbDiscount && previousPolicy.ncbDiscount !== 'N/A' && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">NCB Step-up</span>
                      <span className="font-semibold text-green-600">
                        {previousPolicy.ncbDiscount}% → {quote.ncbDiscount || 0}%
                      </span>
                    </div>
                  )}

                  {/* Add-ons Amount Field Display */}
                  {quote.addOnsAmount > 0 && (
                    <div className="pt-2">
                      <div className="text-purple-600 font-medium mb-2">Additional Add-ons</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                          Additional Coverage: ₹{(quote.addOnsAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Included Add-ons Section */}
                  {includedAddOns.length > 0 && (
                    <div className="pt-2">
                      <div className="text-green-600 font-medium mb-2 flex items-center">
                        <FaCheckCircle className="w-3 h-3 mr-1" />
                        Included Add-ons (₹0)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {includedAddOns.map(([key, addOn]) => (
                          <span 
                            key={key} 
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
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
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                          >
                            {addOn.description} (₹{(addOn.amount || 0).toLocaleString('en-IN')})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Summary Bar */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="p-3 text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg">{quoteDetails.insurer}</h4>
                    <div className="flex items-center space-x-2 text-sm opacity-90 mt-1">
                      <span>IDV: ₹{(quote.idv || 0).toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>{quote.policyDurationLabel || quote.policyDuration}</span>
                      <span>•</span>
                      <span>NCB: {quote.ncbDiscount || 0}%</span>
                      {previousPolicy && previousPolicy.claimTakenLastYear === 'yes' && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          NCB LOST
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">₹{(quote.totalPremium || 0).toLocaleString('en-IN')}</div>
                    <div className="text-sm opacity-90">Total Premium</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popup Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Quote generated on {formatDate(quote.createdAt || quote.ts)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeQuotePopup}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Timeline Component
  const TimelineSection = () => {
    if (!policy || timelineEvents.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-700">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaHistory className="w-4 h-4 text-white" />
              </div>
              Timeline
            </h2>
          </div>
          <div className="p-6 text-center">
            <FaInfoCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No timeline data available for this policy</p>
          </div>
        </div>
      );
    }
    
    const policyId = policy._id || policy.id || 'CINV-XXXXX';
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaStopwatch className="w-4 h-4 text-white" />
              </div>
              Timeline — {policyId}
            </h2>
            <button
              onClick={() => setShowTimelineDetails(!showTimelineDetails)}
              className="text-white hover:text-gray-200 text-xs flex items-center gap-1"
            >
              {showTimelineDetails ? 'Hide Details' : 'Show Details'}
              {showTimelineDetails ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Timeline Stats Summary */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-blue-800">
                Processing Summary
              </div>
              <div className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded">
                IST Timezone
              </div>
            </div>
            <div className="text-sm text-blue-700">
              {timelineSummary}
            </div>
            {showTimelineDetails && timelineEvents.length > 1 && (
              <div className="mt-2 pt-2 border-t border-blue-100">
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                  <div>Started: {timelineEvents[0]?.shortDate} {timelineEvents[0]?.shortTime}</div>
                  <div>Completed: {timelineEvents[timelineEvents.length - 1]?.shortDate} {timelineEvents[timelineEvents.length - 1]?.shortTime}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Timeline Events */}
          <div className="space-y-4">
            {timelineEvents.map((event, index) => {
              const IconComponent = event.icon || FaClock;
              const isFirst = index === 0;
              const isLast = index === timelineEvents.length - 1;
              const hasNext = index < timelineEvents.length - 1;
              
              return (
                <div key={index} className={`relative ${showTimelineDetails ? 'mb-6' : 'mb-4'}`}>
                  {/* Timeline line */}
                  {hasNext && (
                    <div className={`absolute left-4 top-10 bottom-0 w-0.5 ${
                      isLast ? 'bg-gradient-to-b from-gray-300 to-transparent' : 'bg-gray-300'
                    }`}></div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Event icon/indicator */}
                    <div className={`relative flex-shrink-0 w-8 h-8 rounded-full ${event.bgColor} border-2 ${event.borderColor} flex items-center justify-center z-10`}>
                      <IconComponent className={`w-4 h-4 ${event.color}`} />
                      {isFirst && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                      {isLast && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className={`p-3 rounded-lg ${event.bgColor} border ${event.borderColor}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              {event.label}
                            </span>
                            {event.completed && (
                              <span className="inline-flex items-center gap-1 bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700">
                                <FaCheck className="w-2 h-2" />
                                Completed
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded">
                            {event.shortTime}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          {event.description}
                        </div>
                        
                        <div className="text-xs text-gray-700 font-medium">
                          {event.displayTime}
                        </div>
                        
                        {/* Additional event data */}
                        {showTimelineDetails && event.hasData && event.data && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-gray-600">
                              {(event.key === 'quotesGenerated' || event.key === 'quotesShared') && event.data.count && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Quotes Generated:</span>
                                  <span className="bg-white px-2 py-0.5 rounded">{event.data.count}</span>
                                </div>
                              )}
                              {event.data.insurers && Array.isArray(event.data.insurers) && (
                                <div className="mt-1">
                                  <span className="font-medium">Insurers:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {event.data.insurers.slice(0, 3).map((insurer, idx) => (
                                      <span key={idx} className="bg-white px-2 py-0.5 rounded text-xs">
                                        {insurer}
                                      </span>
                                    ))}
                                    {event.data.insurers.length > 3 && (
                                      <span className="bg-white px-2 py-0.5 rounded text-xs">
                                        +{event.data.insurers.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Time difference between events */}
                      {showTimelineDetails && hasNext && timelineEvents[index + 1] && (
                        <div className="mt-2 mb-2 ml-3">
                          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                            <FaRegClock className="w-3 h-3" />
                            {calculateTimeDifference(event.timestamp, timelineEvents[index + 1].timestamp)} later
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Timeline Legend */}
          {showTimelineDetails && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2 font-medium">Timeline Legend</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                    <FaHourglassStart className="w-2 h-2 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600">Case Started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center">
                    <FaQuoteRight className="w-2 h-2 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-600">Quotes Generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center">
                    <FaRegClock className="w-2 h-2 text-amber-600" />
                  </div>
                  <span className="text-xs text-gray-600">Progress Saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
                    <FaHourglassEnd className="w-2 h-2 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600">Case Completed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Early return MUST be after all hooks
  if (!isOpen || !policy) return null;

  // Data extraction (after early return check)
  const customer = getCustomerDetails();
  const vehicle = getVehicleDetails();
  const previousPolicy = getPreviousPolicy();
  const payout = getPayoutDetails();
  const paymentDetails = getPaymentDetails();
  const documents = getDocuments();
  const insuranceQuotes = getInsuranceQuotes();
  const acceptedQuote = getAcceptedQuote();
  const quoteDetails = acceptedQuote ? getQuoteDetails(acceptedQuote) : null;
  const premiumInfo = getPremiumInfo(policy);
  const paidInfo = getPaidAmount(policy);
  const statusDisplay = getStatusDisplay(policy.status);
  const paymentDisplay = getPaymentStatusDisplay(policy);
  const PaymentIcon = paymentDisplay.icon;
  
  const creditTypeDisplay = getCreditTypeDisplay(customer.creditType, customer.brokerName);
  const vehicleTypeCategoryDisplay = getVehicleTypeCategoryDisplay(vehicle.vehicleTypeCategory);

  return (
    <>
      {/* Quote Details Popup */}
      {renderQuotePopup()}

      {/* Main Policy Modal */}
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-28 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <img src={logo} alt="Company Logo" className="h-28" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Policy Details</h1>
                    <p className="text-gray-300 text-sm">Complete insurance case information</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Policy ID:</span>
                    <span className="font-mono bg-opacity-10 px-2 py-1 rounded text-sm">
                      {policy._id || policy.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Customer:</span>
                    <span className="font-semibold">{customer.name}</span>
                    {customer.isCorporate && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Company</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Vehicle:</span>
                    <span className="font-semibold">{vehicle.make} {vehicle.model}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      vehicle.vehicleType === 'New' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {vehicle.vehicleType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Policy Issued By:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${creditTypeDisplay.class}`}>
                      <creditTypeDisplay.icon className="w-3 h-3" />
                      {creditTypeDisplay.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Vehicle Type:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${vehicleTypeCategoryDisplay.class}`}>
                      {vehicleTypeCategoryDisplay.text}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Case
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white hover:text-gray-950 hover:bg-opacity-10 rounded-xl transition-all"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column - Customer & Vehicle */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4 border-b border-blue-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-white" />
                      </div>
                      {customer.isCorporate ? 'Company Information' : 'Customer Information'}
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">
                          {customer.isCorporate ? 'Company Name' : 'Name'}
                        </label>
                        <div className="font-semibold text-gray-900 mt-1">{customer.name}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Type</label>
                        <div className="flex items-center gap-2 mt-1">
                          <FaBuilding className={`w-4 h-4 ${customer.isCorporate ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span className="font-medium text-gray-900 capitalize">
                            {customer.isCorporate ? 'Corporate' : 'Individual'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {customer.isCorporate && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Contact Person</label>
                        <div className="font-semibold text-gray-900 mt-1">{customer.contactPerson}</div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaPhone className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Mobile</div>
                          <div className="font-medium text-gray-900">{customer.mobile}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Email</div>
                          <div className="font-medium text-gray-900 text-sm break-all">{customer.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Location</div>
                          <div className="font-medium text-gray-900">{customer.city} - {customer.pincode}</div>
                        </div>
                      </div>
                    </div>

                    {/* Credit Type Information */}
                    <div className="pt-3 border-t border-gray-100">
                      <label className="text-xs text-gray-500 uppercase font-semibold">Policy Information</label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${creditTypeDisplay.class}`}>
                          <creditTypeDisplay.icon className="w-3 h-3" />
                          {creditTypeDisplay.text}
                        </span>
                        {customer.sourceOrigin && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            Source: {customer.sourceOrigin}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Employee Name */}
                    {customer.employeeName !== 'N/A' && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Employee Name</label>
                        <div className="font-medium text-gray-900">{customer.employeeName}</div>
                      </div>
                    )}

                    {(customer.age !== 'N/A' || customer.gender !== 'N/A') && (
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                        {customer.age !== 'N/A' && (
                          <div>
                            <label className="text-xs text-gray-500 uppercase font-semibold">Age</label>
                            <div className="font-medium text-gray-900">{customer.age} years</div>
                          </div>
                        )}
                        {customer.gender !== 'N/A' && (
                          <div>
                            <label className="text-xs text-gray-500 uppercase font-semibold">Gender</label>
                            <div className="font-medium text-gray-900 capitalize">{customer.gender}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document Numbers */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {customer.panNumber !== 'N/A' && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-semibold">
                            {customer.isCorporate ? 'Company PAN' : 'PAN Number'}
                          </span>
                          <span className="font-mono text-sm text-gray-900">{customer.panNumber}</span>
                        </div>
                      )}
                      {customer.aadhaarNumber !== 'N/A' && !customer.isCorporate && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-semibold">Aadhaar Number</span>
                          <span className="font-mono text-sm text-gray-900">{customer.aadhaarNumber}</span>
                        </div>
                      )}
                      {customer.gstNumber !== 'N/A' && customer.isCorporate && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-semibold">GST Number</span>
                          <span className="font-mono text-sm text-gray-900">{customer.gstNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-4 border-b border-green-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <FaCar className="w-5 h-5 text-white" />
                      </div>
                      Vehicle Information
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Make</label>
                        <div className="font-semibold text-gray-900 mt-1">{vehicle.make}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Model</label>
                        <div className="font-semibold text-gray-900 mt-1">{vehicle.model}</div>
                      </div>
                    </div>
                    
                    {vehicle.variant !== 'N/A' && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Variant</label>
                        <div className="font-medium text-gray-900 mt-1">{vehicle.variant}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Registration</label>
                        <div className="font-mono text-sm text-gray-900 mt-1 bg-gray-100 px-2 py-1 rounded">
                          {vehicle.regNo}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Type</label>
                        <div className="font-medium text-gray-900 mt-1">{vehicle.vehicleType}</div>
                      </div>
                    </div>

                    {/* Vehicle Type Category and Cubic Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Vehicle Category</label>
                        <div className="font-medium text-gray-900 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${vehicleTypeCategoryDisplay.class}`}>
                            {vehicleTypeCategoryDisplay.text}
                          </span>
                        </div>
                      </div>
                      {vehicle.cubicCapacity !== 'N/A' && (
                        <div>
                          <label className="text-xs text-gray-500 uppercase font-semibold">Cubic Capacity</label>
                          <div className="font-medium text-gray-900 mt-1">{vehicle.cubicCapacity} CC</div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Year</label>
                        <div className="font-medium text-gray-900 mt-1">{vehicle.makeYear}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Month</label>
                        <div className="font-medium text-gray-900 mt-1">{vehicle.makeMonth}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-semibold">Engine No</span>
                        <span className="font-mono text-sm text-gray-900">{vehicle.engineNo}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-semibold">Chassis No</span>
                        <span className="font-mono text-sm text-gray-900">{vehicle.chassisNo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Policy & Payment */}
              <div className="space-y-6">
                {/* Policy Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-4 border-b border-purple-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <FaFileAlt className="w-5 h-5 text-white" />
                      </div>
                      Policy Information
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.class}`}>
                            <statusDisplay.icon className="w-3 h-3" />
                            {statusDisplay.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {quoteDetails && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Insurer</span>
                          <span className="font-semibold text-gray-900">{quoteDetails.insurer}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">IDV Amount</span>
                          <span className="font-semibold text-gray-900">₹{quoteDetails.idv.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Policy Duration</span>
                          <span className="font-semibold text-gray-900">{quoteDetails.policyDuration} Year(s)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">NCB Discount</span>
                          <span className="font-semibold text-green-600">{quoteDetails.ncbDiscount}%</span>
                        </div>
                      </div>
                    )}

                    {/* Hypothecation Information */}
                    {policy.policy_info?.hypothecation && policy.policy_info.hypothecation !== 'N/A' && (
                      <div className="pt-3 border-t border-gray-100">
                        <label className="text-xs text-gray-500 uppercase font-semibold">Hypothecation</label>
                        <div className="font-medium text-gray-900 mt-1">{policy.policy_info.hypothecation}</div>
                      </div>
                    )}

                    {/* Policy Dates */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {policy.policy_info?.issueDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                            Issue Date
                          </span>
                          <span className="font-medium text-gray-900">{formatDate(policy.policy_info.issueDate)}</span>
                        </div>
                      )}
                      {policy.policy_info?.dueDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                            Expiry Date
                          </span>
                          <span className={`font-medium ${new Date(policy.policy_info.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatDate(policy.policy_info.dueDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-4 border-b border-amber-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                        <FaCreditCard className="w-5 h-5 text-white" />
                      </div>
                      Payment Information
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PaymentIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-700">Payment Status</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentDisplay.class}`}>
                        {paymentDisplay.text}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Premium</span>
                        <span className="font-semibold text-gray-900">₹{premiumInfo.toLocaleString('en-IN')}</span>
                      </div>
                      {paidInfo.subventionRefund > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Subvention Discount</span>
                          <span className="font-semibold text-green-600">-₹{paidInfo.subventionRefund.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Net Premium</span>
                        <span className="font-semibold text-purple-600">₹{paidInfo.netPremium.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Payment Made By</span>
                        <span className="text-sm font-medium text-gray-900">{paymentDetails.paymentMadeBy}</span>
                      </div>
                      {paymentDetails.paymentMode && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Payment Mode</span>
                          <span className="text-sm font-medium text-gray-900">{paymentDetails.paymentMode}</span>
                        </div>
                      )}
                      {paymentDetails.transactionId && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Transaction ID</span>
                          <span className="font-mono text-sm text-gray-900">{paymentDetails.transactionId}</span>
                        </div>
                      )}
                      {paymentDetails.bankName && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Bank Name</span>
                          <span className="text-sm font-medium text-gray-900">{paymentDetails.bankName}</span>
                        </div>
                      )}
                      {/* Subvention Information */}
                      {paidInfo.subventionRefund > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500 font-semibold">Subvention Applied</span>
                          <span className="text-sm font-semibold text-green-600">
                            ₹{paidInfo.subventionRefund.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Payment Progress */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Payment Progress {paidInfo.subventionRefund > 0 ? '(After Subvention)' : ''}</span>
                        <span>{paidInfo.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            paidInfo.percentage === 100 ? 'bg-green-500' : 
                            paidInfo.percentage > 0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(paidInfo.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous Policy */}
                {previousPolicy.insuranceCompany !== 'N/A' && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                          <FaHistory className="w-5 h-5 text-white" />
                        </div>
                        Previous Policy
                      </h2>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Insurance Company</span>
                        <span className="font-semibold text-gray-900">{previousPolicy.insuranceCompany}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Policy Number</span>
                        <span className="font-mono text-sm text-gray-900">{previousPolicy.policyNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">NCB Discount</span>
                        <span className="font-semibold text-green-600">{previousPolicy.ncbDiscount}%</span>
                      </div>
                      {/* Previous Policy Hypothecation */}
                      {previousPolicy.hypothecation !== 'N/A' && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Hypothecation</span>
                          <span className="font-medium text-gray-900">{previousPolicy.hypothecation}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Claim History</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          previousPolicy.claimTakenLastYear === 'yes' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {previousPolicy.claimTakenLastYear === 'yes' ? 'Claim Taken' : 'No Claim'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Timeline, Documents & Payout */}
              <div className="space-y-6">
                {/* Timeline Section - Enhanced */}
                <TimelineSection />

                {/* Insurance Quotes - UPDATED WITH ADD QUOTE BUTTON */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-5 py-4 border-b border-cyan-200">
                    <div className="flex justify-between items-center">
                      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                          <FaShieldAlt className="w-5 h-5 text-white" />
                        </div>
                        Insurance Quotes
                        <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                          {insuranceQuotes.length} Available
                        </span>
                      </h2>
                      {/* {insuranceQuotes.length > 0 && (
                        <button
                          onClick={() => {
                            const firstQuote = insuranceQuotes[0];
                            showQuoteDetailsPopup(firstQuote);
                          }}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <FaPlus className="w-3 h-3" />
                          View Quote Details
                        </button>
                      )} */}
                    </div>
                  </div>
                  <div className="p-5">
                    {insuranceQuotes.length > 0 ? (
                      <div className="space-y-3">
                        {insuranceQuotes.slice(0, 3).map((quote, index) => {
                          const details = getQuoteDetails(quote);
                          const isAccepted = quote.accepted === true;
                          
                          return (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg border ${
                                isAccepted 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold text-gray-900">{details.insurer}</div>
                                {isAccepted && (
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <FaCheckCircle className="w-3 h-3" />
                                    Accepted
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-gray-600">Premium:</div>
                                <div className="font-semibold text-gray-900">₹{details.totalPremium.toLocaleString('en-IN')}</div>
                                
                                <div className="text-gray-600">IDV:</div>
                                <div className="font-semibold text-gray-900">₹{details.idv.toLocaleString('en-IN')}</div>
                                
                                <div className="text-gray-600">NCB:</div>
                                <div className="font-semibold text-green-600">{details.ncbDiscount}%</div>
                                
                                <div className="text-gray-600">Type:</div>
                                <div className="font-semibold text-gray-900 capitalize">{details.coverageType}</div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <button
                                  onClick={() => showQuoteDetailsPopup(quote)}
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  View Full Details →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {insuranceQuotes.length > 3 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            +{insuranceQuotes.length - 3} more quotes available
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <FaShieldAlt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No insurance quotes available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                {documents.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-5 py-4 border-b border-indigo-200">
                      <div className="flex justify-between items-center">
                        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <FaFileAlt className="w-5 h-5 text-white" />
                          </div>
                          Documents
                          <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                            {documents.length} Files
                          </span>
                        </h2>
                        <button
                          onClick={handleDownloadAll}
                          disabled={Object.values(downloadingDocs).some(status => status)}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
                        >
                          {Object.values(downloadingDocs).some(status => status) ? (
                            <>
                              <FaSpinner className="w-3 h-3 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <FaDownload className="w-3 h-3" />
                              Download All
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="space-y-3">
                        {documents.map((document, index) => {
                          const displayName = getDocumentDisplayName(document);
                          const fileExtension = getFileExtension(document);
                          const isDownloading = downloadingDocs[document.id || document._id || document.url];
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(document)}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm">
                                    {displayName}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                                      {fileExtension.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      Click to download
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleView(document)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                  title="View document"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownload(document)}
                                  disabled={isDownloading}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50 transition-colors"
                                  title={`Download ${displayName}`}
                                >
                                  {isDownloading ? (
                                    <FaSpinner className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <FaDownload className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payout Details */}
                {(payout.netPremium > 0 || payout.odAddonAmount > 0) && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-5 py-4 border-b border-emerald-200">
                      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <FaMoneyBillWave className="w-5 h-5 text-white" />
                        </div>
                        Payout Details
                      </h2>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Net Premium</span>
                        <span className="font-semibold text-gray-900">₹{payout.netPremium.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">OD + Addons Amount</span>
                        <span className="font-semibold text-gray-900">₹{payout.odAddonAmount.toLocaleString('en-IN')}</span>
                      </div>
                      {payout.ncbAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">NCB Amount</span>
                          <span className="font-semibold text-green-600">₹{payout.ncbAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {payout.subVention > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Subvention</span>
                          <span className="font-semibold text-blue-600">₹{payout.subVention.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {payout.odAddonPercentage > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payout %</span>
                          <span className="font-semibold text-purple-600">{payout.odAddonPercentage}%</span>
                        </div>
                      )}
                      {payout.netAmount !== 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-sm font-semibold text-gray-700">Net Amount</span>
                          <span className="font-semibold text-gray-900">₹{payout.netAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* System Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                        <FaTag className="w-5 h-5 text-white" />
                      </div>
                      System Information
                    </h2>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Created Date</span>
                      <span className="font-medium text-gray-900">{formatDate(policy.created_at || policy.ts)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="font-medium text-gray-900">{formatDate(policy.updated_at) || 'N/A'}</span>
                    </div>
                    {policy.created_by && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Created By</span>
                        <span className="font-medium text-gray-900">{policy.created_by}</span>
                      </div>
                    )}
                    {/* Timeline Summary */}
                    {timelineSummary && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <FaStopwatch className="w-3 h-3 text-gray-400" />
                          Processing Time
                        </span>
                        <span className="font-medium text-gray-900">{timelineSummary.replace('Total Processing Time: ', '')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Case created on {formatDate(policy.created_at || policy.ts)}
                {policy.updated_at && ` • Last updated: ${formatDate(policy.updated_at)}`}
                {timelineSummary && ` • ${timelineSummary}`}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Case
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <FaTimes className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolicyModal;