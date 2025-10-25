// src/pages/PoliciesPage/PDFGenerationService.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PDFGenerationService = {
  generateQuotesPDF: (quotesToDownload, formData) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // ✅ Use DejaVuSans — built into jsPDF and supports ₹ symbol
      doc.setFont('DejaVuSans');

      const currentDateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      doc.setProperties({
        title: `Insurance Quotes - ${formData.customerName || 'Customer'} - ${currentDateTime}`,
        subject: 'Real-Time Insurance Quote Comparison',
        author: 'AutoCredits Insurance',
        creator: 'AutoCredits Insurance System'
      });

      generateProfessionalPDF(doc, quotesToDownload, formData);

      const customerName = (formData.customerName || 'customer').replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      doc.save(`AutoCredits_Quotes_${customerName}_${timestamp}.pdf`);

    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      alert('Error generating PDF. Please try again.');
    }
  },

  getCoverageTypeLabel(type) {
    const map = {
      comprehensive: 'Comprehensive',
      standalone: 'Stand Alone OD',
      thirdParty: 'Third Party'
    };
    return map[type] || type;
  },

  getTopBenefits(quote) {
    const addOns = Object.values(quote.selectedAddOns || {});
    if (!addOns.length) return 'Standard Coverage';
    const included = addOns.filter(a => a.amount === 0 || a.included);
    if (!included.length) return 'Premium Add-ons Available';
    const top = included.slice(0, 3).map(a => a.description.split(' ').slice(0, 2).join(' '));
    return top.join(', ') + (included.length > 3 ? ' + more' : '');
  },

  getDetailedAddOns(quote) {
    const addOns = quote.selectedAddOns || {};
    const premium = Object.values(addOns).filter(a => a.amount > 0);
    const included = Object.values(addOns).filter(a => a.amount === 0 || a.included);
    return {
      premium: premium.map(a => ({ description: a.description, amount: a.amount })),
      included: included.map(a => a.description)
    };
  }
};

const generateProfessionalPDF = (doc, quotesToDownload, formData) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  const colors = {
    primary: [0, 82, 164],
    accent: [0, 120, 0],
    lightBg: [245, 245, 245],
    border: [200, 200, 200],
    text: [30, 30, 30],
    lightText: [100, 100, 100],
    successBg: [240, 255, 240]
  };

  let y = margin;

  // === HEADER ===
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('AUTOCREDITS INSURANCE', margin, 20);
  doc.setFontSize(10);
  doc.text('Your Trusted Insurance Partner', margin, 26);
  const currentDateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`QUOTE COMPARISON REPORT - ${currentDateTime}`, pageWidth - margin, 22, { align: 'right' });
  y = 35;

  // === CUSTOMER INFO ===
  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.text('CUSTOMER INFORMATION', margin, y);
  y += 10;
  doc.setDrawColor(...colors.border);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  const details = [
    ['Customer Name', formData.customerName || 'Not specified'],
    ['Phone', formData.phone || 'Not specified'],
    ['Vehicle', `${formData.make || ''} ${formData.model || ''}`.trim() || 'Not specified'],
    ['Variant', formData.variant || 'Not specified'],
    ['Registration Year', formData.registrationYear || 'Not specified'],
    ['Vehicle Type', formData.vehicleType ? formData.vehicleType.charAt(0).toUpperCase() + formData.vehicleType.slice(1) : 'Not specified'],
    ['Previous Claim', formData.previousClaimTaken === 'yes' ? 'Yes' : 'No']
  ];

  doc.setFontSize(10);
  const colWidth = contentWidth / 3;
  details.forEach((detail, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * colWidth;
    const lineY = y + row * 7;
    doc.setTextColor(...colors.lightText);
    doc.setFont('DejaVuSans', 'bold');
    doc.text(`${detail[0]}:`, x, lineY);
    doc.setTextColor(...colors.text);
    doc.setFont('DejaVuSans', 'normal');
    doc.text(detail[1], x + 40, lineY);
  });
  y += Math.ceil(details.length / 3) * 7 + 15;

  // === EXECUTIVE SUMMARY ===
  if (quotesToDownload.length > 0) {
    y = addExecutiveSummary(doc, quotesToDownload, colors, margin, y, contentWidth);
  }

  // === SIDE-BY-SIDE OR TABLE ===
  if (quotesToDownload.length >= 1 && quotesToDownload.length <= 3) {
    y = addSideBySideComparison(doc, quotesToDownload, colors, margin, y, contentWidth, pageHeight);
  } else {
    y = addComparisonTable(doc, quotesToDownload, colors, margin, y, contentWidth, pageHeight);
  }

  // === QUOTE DETAILS ===
  y = addQuoteDetails(doc, quotesToDownload, colors, margin, y, contentWidth, pageHeight);

  // === RECOMMENDATION ===
  if (quotesToDownload.length > 1) {
    y = addRecommendation(doc, quotesToDownload, colors, margin, y, contentWidth, pageHeight);
  }

  // === FOOTER ===
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.height - 10;
    doc.setFontSize(8);
    doc.setTextColor(...colors.lightText);
    doc.text(
      `AutoCredits Insurance • Confidential • Page ${i} of ${pageCount} • ${currentDateTime}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }
};

const addExecutiveSummary = (doc, quotes, colors, margin, startY, contentWidth) => {
  let y = startY;

  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.text('EXECUTIVE SUMMARY', margin, y);
  y += 10;
  doc.setDrawColor(...colors.border);
  doc.line(margin, y, margin + contentWidth, y);
  y += 15;

  const premiums = quotes.map(q => q.totalPremium);
  const minPremium = Math.min(...premiums);
  const maxPremium = Math.max(...premiums);
  const avgPremium = Math.round(premiums.reduce((a, b) => a + b, 0) / premiums.length);
  const bestQuote = quotes.find(q => q.accepted) || quotes.reduce((a, b) => (a.totalPremium < b.totalPremium ? a : b));
  const savings = maxPremium - minPremium;
  const avgIdv = Math.round(quotes.reduce((a, b) => a + b.idv, 0) / quotes.length);
  const maxNcb = Math.max(...quotes.map(q => q.ncbDiscount));

  const metrics = [
    { label: 'Best Premium', value: `₹${minPremium.toLocaleString('en-IN')}`, subtext: bestQuote.insuranceCompany, color: colors.accent },
    { label: 'Average Premium', value: `₹${avgPremium.toLocaleString('en-IN')}`, subtext: 'Across Providers', color: colors.lightText },
    { label: 'Maximum Savings', value: `₹${savings.toLocaleString('en-IN')}`, subtext: 'Best vs Worst', color: colors.accent },
    { label: 'Providers Compared', value: quotes.length.toString(), subtext: 'Total Quotes', color: colors.primary },
    { label: 'Average IDV', value: `₹${avgIdv.toLocaleString('en-IN')}`, subtext: 'Across Quotes', color: colors.lightText },
    { label: 'Max NCB', value: `${maxNcb}%`, subtext: 'Highest Discount', color: colors.accent }
  ];

  const cardWidth = (contentWidth - 20) / 3;
  const cardHeight = 40;
  const rows = Math.ceil(metrics.length / 3);

  metrics.forEach((metric, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = margin + (col * (cardWidth + 7));
    const cardY = y + (row * (cardHeight + 10));
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');
    
    const centerX = x + (cardWidth / 2);
    doc.setTextColor(...metric.color);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(12);
    doc.text(metric.value, centerX, cardY + 15, { align: 'center' });
    doc.setTextColor(...colors.text);
    doc.setFontSize(9);
    doc.text(metric.label, centerX, cardY + 24, { align: 'center' });
    doc.setFontSize(8);
    doc.text(metric.subtext, centerX, cardY + 31, { align: 'center' });
  });

  return y + (rows * (cardHeight + 10)) + 20;
};

const addSideBySideComparison = (doc, quotes, colors, margin, startY, contentWidth, pageHeight) => {
  let y = startY;

  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.text('QUOTE COMPARISON', margin, y);
  y += 12;

  const sortedQuotes = [...quotes].sort((a, b) => (a.accepted ? -1 : b.accepted ? 1 : a.totalPremium - b.totalPremium));
  const colCount = sortedQuotes.length;
  const colWidth = contentWidth / colCount;

  sortedQuotes.forEach((quote, i) => {
    const x = margin + i * colWidth;
    if (quote.accepted) {
      doc.setFillColor(...colors.successBg);
      doc.rect(x, y, colWidth, 10, 'F');
    }
    const color = quote.accepted ? colors.accent : colors.primary;
    doc.setTextColor(...color);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(11);
    doc.text(quote.insuranceCompany, x + colWidth / 2, y + 7, { align: 'center' });
  });
  y += 12;

  doc.setDrawColor(...colors.border);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  const rows = [
    { label: 'Coverage Type', getValue: q => PDFGenerationService.getCoverageTypeLabel(q.coverageType) },
    { label: 'Policy Term', getValue: q => q.policyDurationLabel || q.policyDuration },
    { label: 'IDV', getValue: q => `₹${q.idv?.toLocaleString('en-IN') || '0'}` },
    { label: 'NCB Discount', getValue: q => `${q.ncbDiscount}%` },
    { label: 'Own Damage', getValue: q => `₹${q.odAmount?.toLocaleString('en-IN') || '0'}` },
    { label: 'NCB Amount', getValue: q => `-₹${(q.ncbDiscountAmount || 0).toLocaleString('en-IN')}` },
    { label: 'OD After NCB', getValue: q => `₹${(q.odAmountAfterNcb || 0).toLocaleString('en-IN')}` },
    { label: '3rd Party', getValue: q => `₹${q.thirdPartyAmount?.toLocaleString('en-IN') || '0'}` },
    { label: 'Add-ons Premium', getValue: q => `₹${q.addOnsPremium?.toLocaleString('en-IN') || '0'}` },
    { label: 'GST (18%)', getValue: q => `₹${q.gstAmount?.toLocaleString('en-IN') || '0'}` },
    { label: 'Total Premium', getValue: q => `₹${q.totalPremium?.toLocaleString('en-IN') || '0'}`, bold: true, accent: true }
  ];

  rows.forEach(row => {
    doc.setTextColor(...colors.text);
    doc.setFont('DejaVuSans', row.bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.text(row.label, margin - 5, y);

    sortedQuotes.forEach((quote, i) => {
      const x = margin + i * colWidth + 5;
      const value = row.getValue(quote);
      const textColor = row.accent ? colors.accent : colors.text;
      doc.setTextColor(...textColor);
      doc.setFont('DejaVuSans', row.bold ? 'bold' : 'normal');
      doc.text(value, x, y);
    });
    y += 7;
  });

  y += 10;

  if (sortedQuotes.some(q => Object.keys(q.selectedAddOns || {}).length > 0)) {
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.text('Add-ons Summary', margin, y);
    y += 8;

    sortedQuotes.forEach((quote, i) => {
      const x = margin + i * colWidth + 2;
      const addOns = PDFGenerationService.getDetailedAddOns(quote);
      let textY = y;

      if (addOns.included.length > 0) {
        doc.setTextColor(0, 100, 0);
        doc.setFontSize(9);
        doc.setFont('DejaVuSans', 'normal');
        doc.text('✓ Included (₹0):', x, textY);
        textY += 4;
        addOns.included.slice(0, 3).forEach(desc => {
          doc.text(`  • ${desc}`, x, textY);
          textY += 4;
        });
      }

      if (addOns.premium.length > 0) {
        if (addOns.included.length > 0) textY += 2;
        doc.setTextColor(...colors.primary);
        doc.text('+ Premium Add-ons:', x, textY);
        textY += 4;
        addOns.premium.slice(0, 2).forEach(item => {
          doc.text(`  • ${item.description}: ₹${item.amount.toLocaleString('en-IN')}`, x, textY);
          textY += 4;
        });
      }
    });
    y += 25;
  }

  return y;
};

const addComparisonTable = (doc, quotes, colors, margin, startY, contentWidth, pageHeight) => {
  let y = startY + 10;

  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.text('DETAILED QUOTE COMPARISON', margin, y);
  y += 12;

  const acceptedQuote = quotes.find(q => q.accepted);
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.accepted) return -1;
    if (b.accepted) return 1;
    return a.totalPremium - b.totalPremium;
  });

  const tableData = sortedQuotes.map((quote) => {
    const isBest = quote.accepted || quote.totalPremium === Math.min(...quotes.map(q => q.totalPremium));
    const addOns = PDFGenerationService.getDetailedAddOns(quote);
    const addOnsSummary = `${addOns.premium.length} premium, ${addOns.included.length} included`;

    return [
      isBest ? '⭐ ' + quote.insuranceCompany : quote.insuranceCompany,
      `₹${quote.odAmount?.toLocaleString('en-IN') || '0'}`,
      `₹${quote.thirdPartyAmount?.toLocaleString('en-IN') || '0'}`,
      `₹${quote.addOnsPremium?.toLocaleString('en-IN') || '0'}`,
      `₹${quote.gstAmount?.toLocaleString('en-IN') || '0'}`,
      `₹${quote.totalPremium?.toLocaleString('en-IN') || '0'}`,
      PDFGenerationService.getCoverageTypeLabel(quote.coverageType),
      `₹${quote.idv?.toLocaleString('en-IN') || '0'}`,
      `${quote.ncbDiscount}%`,
      addOnsSummary,
      quote.policyDurationLabel || quote.policyDuration || '1 Year',
      PDFGenerationService.getTopBenefits(quote)
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Provider', 'OD Amount', 'TP Amount', 'Add-ons', 'GST', 'Total Premium', 'Coverage', 'IDV', 'NCB %', 'Add-ons Summary', 'Duration', 'Key Benefits']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, textColor: colors.text, lineColor: colors.border, lineWidth: 0.1, overflow: 'linebreak' },
    headStyles: { fillColor: colors.primary, textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 4, halign: 'center' },
    bodyStyles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
    alternateRowStyles: { fillColor: colors.lightBg },
    didParseCell: function(data) {
      const isBestQuote = data.row.index === 0 && data.section === 'body';
      if (isBestQuote) {
        data.cell.styles.fillColor = colors.successBg;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = colors.accent;
      }
      if ([1,2,3,4,5,7].includes(data.column.index)) data.cell.styles.halign = 'right';
      if ([6,8,9,10].includes(data.column.index)) data.cell.styles.halign = 'center';
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'left' },
      1: { cellWidth: 18, halign: 'right' },
      2: { cellWidth: 18, halign: 'right' },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 20, halign: 'right' },
      8: { cellWidth: 12, halign: 'center' },
      9: { cellWidth: 25, halign: 'center' },
      10: { cellWidth: 18, halign: 'center' },
      11: { cellWidth: 30, halign: 'left' }
    },
    margin: { left: margin, right: margin }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addQuoteDetails = (doc, quotes, colors, margin, startY, contentWidth, pageHeight) => {
  let y = startY;

  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.text('QUOTE DETAILS', margin, y);
  y += 12;
  doc.setDrawColor(...colors.border);
  doc.line(margin, y, margin + contentWidth, y);
  y += 15;

  quotes.forEach((quote, index) => {
    if (y > pageHeight - 150) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(...colors.lightBg);
    doc.rect(margin, y, contentWidth, 12, 'F');
    doc.setTextColor(...colors.primary);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(14);
    doc.text(`${quote.insuranceCompany}${quote.accepted ? ' (Accepted)' : ''}`, margin + 5, y + 8);
    y += 20;

    const halfWidth = contentWidth / 2 - 5;

    const premiumBody = [
      ['Own Damage', `₹${quote.odAmount.toLocaleString('en-IN')}`],
      [`NCB Discount ${quote.ncbDiscount}% (on OD)`, `-₹${quote.ncbDiscountAmount.toLocaleString('en-IN')}`],
      ['OD After NCB', `₹${quote.odAmountAfterNcb.toLocaleString('en-IN')}`],
      ['3rd Party Amount', `₹${quote.thirdPartyAmount.toLocaleString('en-IN')}`],
    ];

    if (quote.addOnsAmount > 0) {
      premiumBody.push(['Additional Add-ons', `+₹${quote.addOnsAmount.toLocaleString('en-IN')}`]);
    }

    const addOns = PDFGenerationService.getDetailedAddOns(quote);
    addOns.premium.forEach(prem => {
      premiumBody.push([prem.description, `+₹${prem.amount.toLocaleString('en-IN')}`]);
    });

    const taxable = quote.odAmountAfterNcb + quote.thirdPartyAmount + quote.addOnsPremium;
    premiumBody.push(['Taxable Amount', `₹${taxable.toLocaleString('en-IN')}`]);
    premiumBody.push(['GST (18%)', `+₹${quote.gstAmount.toLocaleString('en-IN')}`]);
    premiumBody.push(['Total Premium', `₹${quote.totalPremium.toLocaleString('en-IN')}`]);

    autoTable(doc, {
      startY: y,
      head: [['Premium Breakup', '']],
      body: premiumBody,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2, textColor: colors.text, lineWidth: 0 },
      headStyles: { fillColor: colors.lightBg, textColor: colors.text, fontStyle: 'bold', fontSize: 12, halign: 'left', cellPadding: { top: 3, bottom: 3, left: 2 } },
      columnStyles: { 0: { cellWidth: halfWidth * 0.7, halign: 'left' }, 1: { cellWidth: halfWidth * 0.3, halign: 'right' } },
      margin: { left: margin, right: margin + halfWidth + 10 },
      didParseCell: function(data) {
        if (data.section === 'body') {
          if (data.row.index === premiumBody.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = colors.accent;
          }
          if (data.column.index === 1) {
            if (data.cell.text[0].startsWith('-')) data.cell.styles.textColor = colors.accent;
            else if (data.cell.text[0].startsWith('+')) data.cell.styles.textColor = colors.primary;
          }
        }
      }
    });

    let leftTableHeight = doc.lastAutoTable.finalY - y;

    const coverageBody = [
      ['Policy Term', quote.policyDurationLabel || quote.policyDuration || '1 Year'],
      ['Coverage Type', PDFGenerationService.getCoverageTypeLabel(quote.coverageType)],
      ['IDV', `₹${quote.idv.toLocaleString('en-IN')}`],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Coverage Details', '']],
      body: coverageBody,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2, textColor: colors.text, lineWidth: 0 },
      headStyles: { fillColor: colors.lightBg, textColor: colors.text, fontStyle: 'bold', fontSize: 12, halign: 'left', cellPadding: { top: 3, bottom: 3, left: 2 } },
      columnStyles: { 0: { cellWidth: halfWidth * 0.5, halign: 'left' }, 1: { cellWidth: halfWidth * 0.5, halign: 'right' } },
      margin: { left: margin + halfWidth + 10 },
    });

    y = Math.max(doc.lastAutoTable.finalY, y + leftTableHeight) + 10;

    if (addOns.premium.length > 0 || quote.addOnsAmount > 0) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(10);
      doc.setFont('DejaVuSans', 'bold');
      doc.text('Additional Add-ons:', margin + 5, y);
      y += 6;
      if (quote.addOnsAmount > 0) {
        doc.setTextColor(...colors.text);
        doc.setFont('DejaVuSans', 'normal');
        doc.text(`Additional Coverage: ₹${quote.addOnsAmount.toLocaleString('en-IN')}`, margin + 10, y);
        y += 6;
      }
      addOns.premium.forEach(prem => {
        doc.setTextColor(...colors.text);
        doc.setFont('DejaVuSans', 'normal');
        doc.text(`• ${prem.description}: ₹${prem.amount.toLocaleString('en-IN')}`, margin + 10, y);
        y += 6;
      });
      y += 5;
    }

    if (addOns.included.length > 0) {
      doc.setTextColor(...colors.accent);
      doc.setFontSize(10);
      doc.setFont('DejaVuSans', 'bold');
      doc.text('Included Add-ons (₹0):', margin + 5, y);
      y += 6;
      const columns = 3;
      const colWidthRight = contentWidth / columns;
      addOns.included.forEach((inc, idx) => {
        const col = idx % columns;
        const row = Math.floor(idx / columns);
        const x = margin + (col * colWidthRight);
        const lineY = y + (row * 6);
        doc.setTextColor(...colors.accent);
        doc.setFont('DejaVuSans', 'normal');
        doc.text(`✓ ${inc}`, x, lineY);
      });
      y += (Math.ceil(addOns.included.length / columns) * 6) + 10;
    }

    if (index < quotes.length - 1) {
      doc.setDrawColor(...colors.border);
      doc.line(margin, y, margin + contentWidth, y);
      y += 15;
    }
  });

  return y + 20;
};

const addRecommendation = (doc, quotes, colors, margin, startY, contentWidth, pageHeight) => {
  let y = startY;
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin;
  }

  const bestQuote = quotes.find(q => q.accepted) || quotes.reduce((a, b) => (a.totalPremium < b.totalPremium ? a : b));
  const maxPremium = Math.max(...quotes.map(q => q.totalPremium));
  const savings = maxPremium - bestQuote.totalPremium;

  doc.setFillColor(...colors.successBg);
  doc.setDrawColor(...colors.accent);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 55, 3, 3, 'FD');

  doc.setTextColor(...colors.primary);
  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(14);
  doc.text('🎯 RECOMMENDED CHOICE', margin + 10, y + 12);

  doc.setFontSize(10);
  doc.setFont('DejaVuSans', 'normal');
  doc.setTextColor(...colors.text);
  
  const recommendationText = [
    `• Provider: ${bestQuote.insuranceCompany} ${bestQuote.accepted ? '(Accepted)' : ''}`,
    `• Total Premium: ₹${bestQuote.totalPremium.toLocaleString('en-IN')}`,
    `• Coverage: ${PDFGenerationService.getCoverageTypeLabel(bestQuote.coverageType)}`,
    `• IDV: ₹${bestQuote.idv.toLocaleString('en-IN')} | NCB: ${bestQuote.ncbDiscount}%`,
    `• OD After NCB: ₹${bestQuote.odAmountAfterNcb.toLocaleString('en-IN')}`,
    `• Potential Savings: ₹${savings.toLocaleString('en-IN')} (as of ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`
  ];

  recommendationText.forEach((text, index) => {
    doc.text(text, margin + 15, y + 24 + (index * 7));
  });

  return y + 65;
};

export default PDFGenerationService;