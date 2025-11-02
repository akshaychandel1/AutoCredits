// src/pages/DocumentsPage/DocumentsTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  FaFileAlt,
  FaDownload,
  FaEye,
  FaTrash,
  FaUpload,
  FaSearch,
  FaFilter,
  FaTimes,
  FaTag,
  FaCalendarAlt,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCloudUploadAlt,
  FaExternalLinkAlt,
  FaUser,
  FaCar,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaSync,
  FaPlus,
  FaIdCard,
  FaShieldAlt,
  FaReceipt,
  FaSpinner,
  FaListAlt,
  FaFileInvoiceDollar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

// ================== API SERVICE FUNCTIONS ==================

const documentAPI = {
  async getAllPolicies() {
    try {
      console.log('📡 Fetching policies from API...');
      const response = await fetch('https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Policies API response:', data);
      
      if (Array.isArray(data)) {
        return data;
      } else if (data.policies && Array.isArray(data.policies)) {
        return data.policies;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('⚠️ Unexpected API response format:', data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching policies:', error);
      throw new Error(`Failed to fetch policies: ${error.message}`);
    }
  },

  async uploadDocument(policyId, formData) {
    try {
      const policyResponse = await fetch(`https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies/${policyId}`);
      if (!policyResponse.ok) throw new Error('Failed to fetch policy');
      const policy = await policyResponse.json();

      const mockDocument = {
        _id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.get('name'),
        originalName: formData.get('name'),
        tag: formData.get('tag'),
        extension: formData.get('name').split('.').pop(),
        size: 1024 * 1024,
        url: URL.createObjectURL(formData.get('document')),
        uploadedAt: new Date().toISOString(),
        type: 'uploaded'
      };

      const updatedPolicy = {
        ...policy,
        documents: [...(policy.documents || []), mockDocument]
      };

      const updateResponse = await fetch(`https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies/${policyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPolicy),
      });

      if (!updateResponse.ok) throw new Error('Failed to update policy with document');
      
      return { document: mockDocument };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async deleteDocument(policyId, documentId) {
    try {
      const policyResponse = await fetch(`https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies/${policyId}`);
      if (!policyResponse.ok) throw new Error('Failed to fetch policy');
      const policy = await policyResponse.json();

      const updatedDocuments = (policy.documents || []).filter(doc => doc._id !== documentId);
      
      const updatedPolicy = {
        ...policy,
        documents: updatedDocuments
      };

      const updateResponse = await fetch(`https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1/policies/${policyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPolicy),
      });

      if (!updateResponse.ok) throw new Error('Failed to delete document');
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};

// ================== DOCUMENT TYPE UTILITIES ==================

// Updated document types with your specific tags
const documentTypes = {
  'rc': 'RC',
  'form29': 'Form 29',
  'form30page1': 'Form 30 page 1',
  'form30page2': 'Form 30 page 2',
  'pan': 'Pan Number',
  'gst_aadhaar': 'GST/Aadhaar Card',
  'previous_policy': 'Previous Year Policy',
  'new_policy': 'New Year Policy',
  'invoice': 'Invoice',
  'other': 'Other'
};

const documentTypeIcons = {
  'rc': FaCar,
  'form29': FaFileAlt,
  'form30page1': FaFileAlt,
  'form30page2': FaFileAlt,
  'pan': FaIdCard,
  'gst_aadhaar': FaIdCard,
  'previous_policy': FaShieldAlt,
  'new_policy': FaShieldAlt,
  'invoice': FaReceipt,
  'other': FaFileAlt
};

const fileTypeIcons = {
  'pdf': FaFilePdf,
  'jpg': FaFileImage,
  'jpeg': FaFileImage,
  'png': FaFileImage,
  'gif': FaFileImage,
  'doc': FaFileWord,
  'docx': FaFileWord,
  'xls': FaFileExcel,
  'xlsx': FaFileExcel
};

// Enhanced file extension detection from your code
const getFileExtensionFromFile = (fileObj) => {
  if (!fileObj) return '';

  if (fileObj.name) {
    const nameParts = fileObj.name.split('.');
    if (nameParts.length > 1) {
      const ext = nameParts.pop().toLowerCase();
      const extensionMap = {
        'jpeg': 'jpg',
        'jpe': 'jpg',
        'jfif': 'jpg',
        'jif': 'jpg'
      };
      return extensionMap[ext] || ext;
    }
  }

  if (fileObj.type) {
    const mimeToExt = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/pjpeg': 'jpg',
      'image/jfif': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };
    return mimeToExt[fileObj.type] || '';
  }

  return '';
};

const getDocumentIcon = (documentType) => {
  return documentTypeIcons[documentType] || FaFileAlt;
};

const getFileIcon = (extension) => {
  const icon = fileTypeIcons[extension?.toLowerCase()];
  return icon || FaFileAlt;
};

const getFileTypeColor = (extension) => {
  const colors = {
    'pdf': 'text-red-600 bg-red-50',
    'jpg': 'text-green-600 bg-green-50',
    'jpeg': 'text-green-600 bg-green-50',
    'png': 'text-green-600 bg-green-50',
    'gif': 'text-green-600 bg-green-50',
    'doc': 'text-blue-600 bg-blue-50',
    'docx': 'text-blue-600 bg-blue-50',
    'xls': 'text-green-600 bg-green-50',
    'xlsx': 'text-green-600 bg-green-50'
  };
  return colors[extension?.toLowerCase()] || 'text-gray-600 bg-gray-50';
};

const getDocumentTypeColor = (documentType) => {
  const colors = {
    'rc': 'text-green-600 bg-green-50',
    'form29': 'text-blue-600 bg-blue-50',
    'form30page1': 'text-indigo-600 bg-indigo-50',
    'form30page2': 'text-purple-600 bg-purple-50',
    'pan': 'text-orange-600 bg-orange-50',
    'gst_aadhaar': 'text-teal-600 bg-teal-50',
    'previous_policy': 'text-red-600 bg-red-50',
    'new_policy': 'text-green-600 bg-green-50',
    'invoice': 'text-yellow-600 bg-yellow-50',
    'other': 'text-gray-600 bg-gray-50'
  };
  return colors[documentType] || 'text-gray-600 bg-gray-50';
};

// ================== UTILITY FUNCTIONS ==================

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeCategory = (extension) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
  const docTypes = ['doc', 'docx'];
  const excelTypes = ['xls', 'xlsx'];
  
  if (imageTypes.includes(extension?.toLowerCase())) return 'image';
  if (docTypes.includes(extension?.toLowerCase())) return 'doc';
  if (excelTypes.includes(extension?.toLowerCase())) return 'xls';
  if (extension?.toLowerCase() === 'pdf') return 'pdf';
  return 'other';
};

const getFileName = (doc) => {
  if (doc.name && doc.name.trim() !== '') {
    return doc.name;
  }
  
  if (doc.originalName && doc.originalName.trim() !== '') {
    return doc.originalName;
  }
  
  const url = doc.url || '';
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
  
  const docType = doc.tag || 'document';
  const timestamp = Date.now();
  return `${docType}_${timestamp}`;
};

// IMPROVED: Enhanced file extension detection with better PDF detection
const getFileExtension = (document) => {
  if (!document) return 'pdf';

  // First priority: Check if document explicitly specifies extension
  if (document.extension && document.extension.trim() !== '') {
    const ext = document.extension.toLowerCase().replace('.', '');
    if (ext === 'pdf') return 'pdf';
    return ext;
  }

  // Second priority: Check document type/mime type
  if (document.type) {
    const type = document.type.toLowerCase();
    if (type.includes('pdf') || type === 'application/pdf') return 'pdf';
    if (type.includes('image')) {
      if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
      if (type.includes('png')) return 'png';
      if (type.includes('gif')) return 'gif';
      return 'jpg'; // default for images
    }
  }

  // Third priority: Extract from filename
  const fileName = getFileName(document);
  if (fileName && fileName.includes('.')) {
    const parts = fileName.split('.');
    if (parts.length > 1) {
      let ext = parts.pop().toLowerCase();
      ext = ext.split('?')[0].split('#')[0];
      
      // Clean up common issues
      if (ext && ext.length <= 5) {
        // Handle common PDF misidentifications
        if (ext === 'jpeg' || ext === 'jpg' || ext === 'png') {
          // Check if filename suggests it's actually a PDF
          if (fileName.toLowerCase().includes('.pdf') || 
              fileName.toLowerCase().includes('policy') ||
              fileName.toLowerCase().includes('document')) {
            return 'pdf';
          }
        }
        return ext;
      }
    }
  }

  // Fourth priority: Check URL for extension hints
  const url = document.url || '';
  if (url) {
    // Check if URL contains PDF indicators
    if (url.toLowerCase().includes('.pdf') || 
        url.toLowerCase().includes('policy') ||
        url.toLowerCase().includes('document')) {
      return 'pdf';
    }
    
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

  // Final fallback: Assume PDF for policy-related documents
  if (document.tag === 'policy' || document.tag === 'insurance') {
    return 'pdf';
  }

  return 'pdf'; // Default to PDF
};

// NEW: Function to detect if a file is actually a PDF regardless of extension
const isActuallyPDF = (document) => {
  const fileName = getFileName(document).toLowerCase();
  const url = (document.url || '').toLowerCase();
  
  // Check for PDF indicators in filename
  if (fileName.includes('.pdf') || 
      fileName.includes('policy') ||
      fileName.includes('document') ||
      fileName.includes('insurance')) {
    return true;
  }
  
  // Check for PDF indicators in URL
  if (url.includes('.pdf') || 
      url.includes('policy') ||
      url.includes('document') ||
      url.includes('insurance')) {
    return true;
  }
  
  // Check document type
  if (document.type && document.type.toLowerCase().includes('pdf')) {
    return true;
  }
  
  return false;
};

// Get file icon component for display
const FileIconComponent = ({ document }) => {
  const fileExtension = getFileExtension(document);
  const FileIcon = getFileIcon(fileExtension);
  const fileTypeColor = getFileTypeColor(fileExtension);
  
  return (
    <div className={`w-6 h-6 rounded flex items-center justify-center ${fileTypeColor}`}>
      <FileIcon className="w-3 h-3" />
    </div>
  );
};

// ================== DOCUMENT PREVIEW MODAL ==================

const DocumentPreviewModal = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const getCorrectFileExtension = (doc) => {
    // Use our improved detection
    return getFileExtension(doc);
  };

  const fileExtension = getCorrectFileExtension(document);
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
  const isPDF = fileExtension === 'pdf' || isActuallyPDF(document);
  const FileIcon = getFileIcon(fileExtension);
  const DocumentTypeIcon = getDocumentIcon(document.tag);

  const handlePDFView = () => {
    window.open(document.url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${getFileTypeColor(fileExtension)}`}>
              <FileIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{document.originalName || document.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${getDocumentTypeColor(document.tag)}`}>
                  <DocumentTypeIcon className="w-2.5 h-2.5" />
                  {documentTypes[document.tag] || document.tag}
                </div>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{formatFileSize(document.size)}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500 uppercase">{fileExtension}</span>
                {isActuallyPDF(document) && fileExtension !== 'pdf' && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                    (Actual: PDF)
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
          {isImage ? (
            <div className="flex justify-center">
              <img 
                src={document.url} 
                alt={document.originalName || document.name}
                className="max-w-full max-h-[70vh] object-contain rounded shadow"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : isPDF ? (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="text-center">
                <FaFilePdf className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">PDF documents open in browser viewer</p>
                <button
                  onClick={handlePDFView}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <FaExternalLinkAlt className="w-3 h-3" />
                  Open PDF in New Tab
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80">
              <FileIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-3">Preview not available for this file type</p>
              <a
                href={document.url}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <FaDownload className="w-3 h-3" />
                Download File
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">
            <strong>Uploaded:</strong> {formatDate(document.uploadedAt)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(document.url, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs font-medium"
            >
              <FaExternalLinkAlt className="w-3 h-3" />
              Open in New Tab
            </button>
            {!isPDF && (
              <a
                href={document.url}
                download={getFileName(document)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
              >
                <FaDownload className="w-3 h-3" />
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== UPLOAD DOCUMENT MODAL ==================

const UploadDocumentModal = ({ isOpen, onClose, policy, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    tag: '',
    file: null
  });
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ file: 'File size must be less than 10MB' });
        return;
      }
      setFormData(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.tag) newErrors.tag = 'Document type is required';
    if (!formData.file) newErrors.file = 'File is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('document', formData.file);
      uploadFormData.append('name', formData.file.name);
      uploadFormData.append('tag', formData.tag);

      const result = await documentAPI.uploadDocument(policy.policyId, uploadFormData);
      
      if (onUploadSuccess) {
        onUploadSuccess(result.document, policy.policyId);
      }
      
      setFormData({ tag: '', file: null });
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Upload Document</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Policy Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-700 mb-1">Policy Information</h4>
              <p className="text-xs text-gray-600">{policy.customerName}</p>
              <p className="text-xs text-gray-600">Policy: {policy.policyNumber}</p>
              <p className="text-xs text-gray-600">Vehicle: {policy.vehicleRegNo}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select document type</option>
                {Object.entries(documentTypes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.tag && <p className="text-red-500 text-xs mt-0.5">{errors.tag}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                File
              </label>
              <div className="border border-dashed border-gray-300 rounded p-4 text-center transition-colors hover:border-purple-400">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FaCloudUploadAlt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {formData.file ? formData.file.name : 'Click to upload file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, DOC, XLS (Max 10MB)
                  </p>
                </label>
              </div>
              {errors.file && <p className="text-red-500 text-xs mt-0.5">{errors.file}</p>}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded mt-4 text-xs">
              {errors.submit}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 border border-transparent rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <>
                  <FaSpinner className="w-3 h-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="w-3 h-3" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================== ADVANCED SEARCH COMPONENT ==================

const AdvancedSearch = ({ 
  isOpen, 
  onClose, 
  searchFilters, 
  onFilterChange,
  onApplyFilters,
  onResetFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(searchFilters);

  useEffect(() => {
    setLocalFilters(searchFilters);
  }, [searchFilters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      customerName: '',
      policyNumber: '',
      documentType: '',
      fileType: '',
      startDate: '',
      endDate: '',
      minSize: '',
      maxSize: ''
    };
    setLocalFilters(resetFilters);
    onResetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Advanced Search</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={localFilters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                placeholder="Search by customer name"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Policy Number</label>
              <input
                type="text"
                value={localFilters.policyNumber}
                onChange={(e) => handleFilterChange('policyNumber', e.target.value)}
                placeholder="Search by policy number"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={localFilters.documentType}
                onChange={(e) => handleFilterChange('documentType', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {Object.entries(documentTypes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">File Type</label>
              <select
                value={localFilters.fileType}
                onChange={(e) => handleFilterChange('fileType', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Files</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="doc">Word Documents</option>
                <option value="xls">Excel Files</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Size (KB)</label>
              <input
                type="number"
                value={localFilters.minSize}
                onChange={(e) => handleFilterChange('minSize', e.target.value)}
                placeholder="Minimum file size"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Size (KB)</label>
              <input
                type="number"
                value={localFilters.maxSize}
                onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                placeholder="Maximum file size"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 border border-transparent rounded hover:bg-purple-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// ================== MAIN DOCUMENTS TABLE COMPONENT ==================

const DocumentsTable = () => {
  const [documents, setDocuments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [downloadingDocs, setDownloadingDocs] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedPolicyForUpload, setSelectedPolicyForUpload] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    customerName: '',
    policyNumber: '',
    documentType: '',
    fileType: '',
    startDate: '',
    endDate: '',
    minSize: '',
    maxSize: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching policies from API...');
      const policiesData = await documentAPI.getAllPolicies();
      console.log('✅ Policies fetched:', policiesData);
      
      if (!Array.isArray(policiesData) || policiesData.length === 0) {
        setPolicies([]);
        setDocuments([]);
        setError('No policies found or invalid response format');
        return;
      }

      setPolicies(policiesData);

      console.log('📄 Extracting documents from policies...');
      const allDocs = [];
      
      for (const policy of policiesData) {
        if (!policy._id) {
          console.warn('⚠️ Policy missing _id:', policy);
          continue;
        }

        const policyDocs = Array.isArray(policy.documents) ? policy.documents : [];
        console.log(`📋 Policy ${policy._id} has ${policyDocs.length} documents in policy object`);

        if (policyDocs.length > 0) {
          policyDocs.forEach(doc => {
            const customer = policy.customer_details || {};
            
            const enhancedDocument = {
              ...doc,
              _id: doc._id || doc.id || `doc_${Date.now()}_${Math.random()}`,
              policyId: policy._id,
              customerName: policy.buyer_type === 'corporate' 
                ? customer.companyName || customer.contactPersonName || 'Unknown Company'
                : customer.name || 'Unknown Customer',
              customerMobile: customer.mobile || 'N/A',
              customerEmail: customer.email || 'N/A',
              policyNumber: policy.policy_info?.policyNumber || 'N/A',
              vehicleRegNo: policy.vehicle_details?.regNo || 'N/A',
              vehicleMake: policy.vehicle_details?.make || 'N/A',
              vehicleModel: policy.vehicle_details?.model || 'N/A',
              buyerType: policy.buyer_type || 'individual',
              url: doc.url || doc.fileUrl || '',
              name: doc.name || doc.fileName || 'Unknown Document',
              originalName: doc.originalName || doc.name || doc.fileName || 'Unknown Document',
              extension: getFileExtensionFromFile(doc) || (doc.name ? doc.name.split('.').pop() : ''),
              type: doc.type || doc.fileType || '',
              size: doc.size || doc.fileSize || 0,
              uploadedAt: doc.uploadedAt || doc.createdAt || doc.uploadDate || new Date().toISOString(),
              tag: doc.tag || doc.category || 'other'
            };
            allDocs.push(enhancedDocument);
          });
        }
      }
      
      console.log('✅ Total documents found in policies:', allDocs.length);
      setDocuments(allDocs);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sortDocuments = (docs) => {
    const sortedDocs = [...docs];
    
    switch (sortBy) {
      case 'recent':
        return sortedDocs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      case 'oldest':
        return sortedDocs.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
      case 'name':
        return sortedDocs.sort((a, b) => (a.originalName || a.name).localeCompare(b.originalName || b.name));
      case 'size':
        return sortedDocs.sort((a, b) => (b.size || 0) - (a.size || 0));
      default:
        return sortedDocs;
    }
  };

  const groupedDocuments = useMemo(() => {
    const groups = {};
    
    const sortedDocuments = sortDocuments(documents);
    
    sortedDocuments.forEach(doc => {
      const key = `${doc.policyId}-${doc.customerName}`;
      if (!groups[key]) {
        groups[key] = {
          customer: {
            customerName: doc.customerName,
            customerMobile: doc.customerMobile,
            customerEmail: doc.customerEmail,
            policyNumber: doc.policyNumber,
            vehicleRegNo: doc.vehicleRegNo,
            vehicleMake: doc.vehicleMake,
            vehicleModel: doc.vehicleModel,
            buyerType: doc.buyerType,
            policyId: doc.policyId
          },
          documents: []
        };
      }
      groups[key].documents.push(doc);
    });

    return Object.values(groups);
  }, [documents, sortBy]);

  const filteredGroups = useMemo(() => {
    return groupedDocuments.filter(group => {
      const { customer, documents } = group;
      
      if (documentTypeFilter !== 'all') {
        const hasMatchingDocument = documents.some(doc => doc.tag === documentTypeFilter);
        if (!hasMatchingDocument) return false;
      }

      if (fileTypeFilter !== 'all') {
        const hasMatchingFile = documents.some(doc => 
          getFileTypeCategory(doc.extension) === fileTypeFilter
        );
        if (!hasMatchingFile) return false;
      }

      const hasAdvancedFilters = Object.values(searchFilters).some(value => value !== '');
      
      if (hasAdvancedFilters) {
        const matchesCustomerName = !searchFilters.customerName || 
          customer.customerName.toLowerCase().includes(searchFilters.customerName.toLowerCase());

        const matchesPolicyNumber = !searchFilters.policyNumber || 
          customer.policyNumber.toLowerCase().includes(searchFilters.policyNumber.toLowerCase());

        const hasMatchingDocumentType = !searchFilters.documentType || 
          documents.some(doc => doc.tag === searchFilters.documentType);

        const hasMatchingFileType = !searchFilters.fileType || 
          documents.some(doc => getFileTypeCategory(doc.extension) === searchFilters.fileType);

        const hasDateMatch = documents.some(doc => {
          const uploadedDate = new Date(doc.uploadedAt);
          const matchesStartDate = !searchFilters.startDate || uploadedDate >= new Date(searchFilters.startDate);
          const matchesEndDate = !searchFilters.endDate || uploadedDate <= new Date(searchFilters.endDate + 'T23:59:59');
          return matchesStartDate && matchesEndDate;
        });

        const hasSizeMatch = documents.some(doc => {
          const fileSizeKB = doc.size / 1024;
          const matchesMinSize = !searchFilters.minSize || fileSizeKB >= parseFloat(searchFilters.minSize);
          const matchesMaxSize = !searchFilters.maxSize || fileSizeKB <= parseFloat(searchFilters.maxSize);
          return matchesMinSize && matchesMaxSize;
        });

        if (!(matchesCustomerName && matchesPolicyNumber && hasMatchingDocumentType && 
              hasMatchingFileType && hasDateMatch && hasSizeMatch)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const customerMatches = 
          customer.customerName.toLowerCase().includes(query) ||
          customer.policyNumber.toLowerCase().includes(query) ||
          customer.customerMobile.includes(query) ||
          customer.vehicleRegNo.toLowerCase().includes(query);

        const documentMatches = documents.some(doc => 
          doc.originalName?.toLowerCase().includes(query) ||
          doc.name?.toLowerCase().includes(query) ||
          (documentTypes[doc.tag] || '').toLowerCase().includes(query)
        );

        if (!customerMatches && !documentMatches) {
          return false;
        }
      }

      return true;
    });
  }, [groupedDocuments, documentTypeFilter, fileTypeFilter, searchQuery, searchFilters]);

  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroups, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  const handleUploadClick = (policy) => {
    setSelectedPolicyForUpload(policy);
    setIsUploadOpen(true);
  };

  // FIXED: Enhanced download function using the same approach as PolicyModal
  const handleDownloadClick = async (document) => {
    const url = document.url;
    if (!url) {
      alert('No document URL available');
      return;
    }
      
    const docId = document._id || url;
    setDownloadingDocs(prev => ({ ...prev, [docId]: true }));

    try {
      const fileName = getFileName(document);
      const fileExtension = getFileExtension(document);
      
      let downloadFileName = fileName;
      if (!downloadFileName.toLowerCase().endsWith(`.${fileExtension}`)) {
        downloadFileName = downloadFileName.replace(/\.[^/.]+$/, "") + `.${fileExtension}`;
      }

      console.log(`📥 Downloading: ${downloadFileName} (extension: ${fileExtension}) from ${url}`);

      // Simple approach - create a link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      link.target = '_blank';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Download initiated: ${downloadFileName}`);
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      
      // Fallback: just open in new tab
      console.log('🔄 Trying fallback method...');
      window.open(url, '_blank');
      
    } finally {
      setTimeout(() => {
        setDownloadingDocs(prev => ({ ...prev, [docId]: false }));
      }, 500);
    }
  };

  // FIXED: Enhanced view function with better PDF detection
  const handleViewClick = (document) => {
    const fileExtension = getFileExtension(document);
    const isActuallyPDFFile = isActuallyPDF(document);
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    
    console.log('👀 Viewing document:', {
      name: document.name,
      extension: fileExtension,
      isActuallyPDF: isActuallyPDFFile,
      url: document.url
    });
    
    if (isActuallyPDFFile || fileExtension === 'pdf') {
      // For PDFs, open directly in new tab - same as PolicyModal
      console.log('📄 Opening PDF in new tab');
      window.open(document.url, '_blank');
    } else if (isImage) {
      // For images, show preview modal
      console.log('🖼️ Showing image in preview modal');
      setSelectedDocument(document);
      setIsPreviewOpen(true);
    } else {
      // For other files, try to open in new tab, if fails show preview modal
      console.log('📎 Opening other file type');
      const newWindow = window.open(document.url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // If popup blocked, show preview modal
        console.log('🚫 Popup blocked, showing preview modal');
        setSelectedDocument(document);
        setIsPreviewOpen(true);
      }
    }
  };

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    setDeleteLoading(true);
    try {
      await documentAPI.deleteDocument(documentToDelete.policyId, documentToDelete._id);
      setDocuments(prev => prev.filter(doc => doc._id !== documentToDelete._id));
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const handleUploadSuccess = (newDocument, policyId) => {
    const policy = policies.find(p => p._id === policyId);
    if (policy) {
      const customer = policy.customer_details || {};
      const enhancedDocument = {
        ...newDocument,
        policyId: policyId,
        customerName: policy.buyer_type === 'corporate' 
          ? customer.companyName || customer.contactPersonName || 'Unknown Company'
          : customer.name || 'Unknown Customer',
        customerMobile: customer.mobile || 'N/A',
        customerEmail: customer.email || 'N/A',
        policyNumber: policy.policy_info?.policyNumber || 'N/A',
        vehicleRegNo: policy.vehicle_details?.regNo || 'N/A',
        vehicleMake: policy.vehicle_details?.make || 'N/A',
        vehicleModel: policy.vehicle_details?.model || 'N/A',
        buyerType: policy.buyer_type || 'individual'
      };
      setDocuments(prev => [enhancedDocument, ...prev]);
    }
  };

  const handleApplyAdvancedFilters = (filters) => {
    setSearchFilters(filters);
  };

  const handleResetAdvancedFilters = () => {
    setSearchFilters({
      customerName: '',
      policyNumber: '',
      documentType: '',
      fileType: '',
      startDate: '',
      endDate: '',
      minSize: '',
      maxSize: ''
    });
  };

  const handleRowExpand = (policyId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(policyId)) {
      newExpanded.delete(policyId);
    } else {
      newExpanded.add(policyId);
    }
    setExpandedRows(newExpanded);
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [documentTypeFilter, fileTypeFilter, searchQuery, searchFilters, sortBy]);

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: FaSortDown },
    { value: 'oldest', label: 'Oldest First', icon: FaSortUp },
    { value: 'name', label: 'Name (A-Z)', icon: FaSort },
    { value: 'size', label: 'File Size', icon: FaSort }
  ];

  const getSortIcon = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.icon : FaSort;
  };

  const SortIcon = getSortIcon();

  if (loading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-xs">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaExclamationTriangle className="w-4 h-4 text-red-500" />
        </div>
        <p className="text-gray-700 font-medium text-xs mb-1">Error Loading Documents</p>
        <p className="text-gray-500 text-xs mb-3">{error}</p>
        <button
          onClick={fetchAllData}
          className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs font-medium mx-auto"
        >
          <FaSync className="w-3 h-3" />
          Try Again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaFileAlt className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-xs">No documents found</p>
        <p className="text-gray-500 text-xs mb-4">
          {policies.length > 0 
            ? 'No documents found in any policies. You can upload documents to get started.' 
            : 'No policies found to load documents from'}
        </p>
        {policies.length > 0 && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                // Show upload modal for first policy
                const firstPolicy = policies[0];
                const customer = firstPolicy.customer_details || {};
                handleUploadClick({
                  policyId: firstPolicy._id,
                  customerName: firstPolicy.buyer_type === 'corporate' 
                    ? customer.companyName || customer.contactPersonName || 'Unknown Company'
                    : customer.name || 'Unknown Customer',
                  policyNumber: firstPolicy.policy_info?.policyNumber || 'N/A',
                  vehicleRegNo: firstPolicy.vehicle_details?.regNo || 'N/A'
                });
              }}
              className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs font-medium"
            >
              <FaUpload className="w-3 h-3" />
              Upload Document
            </button>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs font-medium"
            >
              <FaSync className="w-3 h-3" />
              Refresh
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded border border-gray-200 p-3 mb-3">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap flex-1">
            {/* Search Bar */}
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-700 mb-1">Quick Search</label>
              <div className="relative">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, policy, document name..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full px-3 py-1.5 pr-6 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <SortIcon className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Advanced Search Button */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Advanced</label>
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[100px] justify-center"
              >
                <FaFilter className="text-xs" />
                Advanced
              </button>
            </div>

            {/* Document Type Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">Doc Type</label>
              <select
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[120px]"
              >
                <option value="all">All Types</option>
                {Object.entries(documentTypes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* File Type Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-700 mb-1">File Type</label>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent min-w-[100px]"
              >
                <option value="all">All Files</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="doc">Word</option>
                <option value="xls">Excel</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count and Active Filters */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{filteredGroups.length}</span> customers with{' '}
            <span className="font-medium">{documents.length}</span> total documents
            {filteredGroups.length !== groupedDocuments.length && (
              <span className="text-gray-400 ml-1">(filtered from {groupedDocuments.length} customers)</span>
            )}
            {searchQuery && (
              <span className="text-purple-600 ml-1">for "{searchQuery}"</span>
            )}
          </div>
          
          {/* Active Advanced Filters */}
          {Object.values(searchFilters).some(value => value !== '') && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {Object.entries(searchFilters).map(([key, value]) => 
                value && (
                  <span key={key} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    {key}: {value}
                  </span>
                )
              )}
              <button
                onClick={handleResetAdvancedFilters}
                className="text-xs text-red-600 hover:text-red-800 ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {selectedRows.size > 0 && (
            <div className="text-xs text-blue-600 font-medium">
              {selectedRows.size} selected
            </div>
          )}
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-1 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-8">
                  {/* Expand column */}
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-48">
                  Customer & Policy
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-40">
                  Document Info
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-32">
                  File Details
                </th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedGroups.map((group) => {
                const isExpanded = expandedRows.has(group.customer.policyId);
                
                return (
                  <React.Fragment key={group.customer.policyId}>
                    {/* Customer Header Row */}
                    <tr className="border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="px-1 py-2 border-r border-gray-100">
                        <button
                          onClick={() => handleRowExpand(group.customer.policyId)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                        </button>
                      </td>
                      <td className="px-2 py-2 border-r border-gray-100" colSpan="3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              group.customer.buyerType === 'corporate' ? 'bg-orange-100' : 'bg-purple-100'
                            }`}>
                              {group.customer.buyerType === 'corporate' ? (
                                <FaBuilding className="text-orange-600 text-sm" />
                              ) : (
                                <FaUser className="text-purple-600 text-sm" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {group.customer.customerName}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <FaShieldAlt className="w-3 h-3" />
                                  {group.customer.policyNumber}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaCar className="w-3 h-3" />
                                  {group.customer.vehicleRegNo}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  group.customer.buyerType === 'corporate' 
                                    ? 'bg-orange-100 text-orange-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {group.customer.buyerType === 'corporate' ? 'Corporate' : 'Individual'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {group.documents.length} Documents
                            </span>
                            <button
                              onClick={() => handleUploadClick(group.customer)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                            >
                              <FaUpload className="text-xs" />
                              Upload
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        {/* Empty cell for actions alignment */}
                      </td>
                    </tr>

                    {/* Documents Rows - Only show when expanded */}
                    {isExpanded && group.documents.map((document) => {
                      const fileName = getFileName(document);
                      const fileExtension = getFileExtension(document);
                      const isActuallyPDFFile = isActuallyPDF(document);
                      const isDownloading = downloadingDocs[document._id];
                      const DocumentTypeIcon = getDocumentIcon(document.tag);
                      
                      return (
                        <tr key={document._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-1 py-2 border-r border-gray-100"></td>
                          
                          {/* Document Info */}
                          <td className="px-2 py-2 border-r border-gray-100">
                            <div className="flex items-center gap-3">
                              <FileIconComponent document={document} />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 text-sm truncate" title={fileName}>
                                  {fileName}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${getDocumentTypeColor(document.tag)}`}>
                                    <DocumentTypeIcon className="w-2.5 h-2.5" />
                                    {documentTypes[document.tag] || document.tag}
                                  </div>
                                  {isActuallyPDFFile && fileExtension !== 'pdf' && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                      PDF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* File Details */}
                          <td className="px-2 py-2 border-r border-gray-100">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Type:</span>
                                <span className={`font-medium px-1.5 py-0.5 rounded ${getFileTypeColor(fileExtension)}`}>
                                  {fileExtension.toUpperCase()}
                                  {isActuallyPDFFile && fileExtension !== 'pdf' && ' (PDF)'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Size:</span>
                                <span className="font-medium text-gray-900">
                                  {formatFileSize(document.size)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Uploaded:</span>
                                <span className="font-medium text-gray-900">
                                  {formatDate(document.uploadedAt)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-2 py-2">
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => handleViewClick(document)}
                                className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-medium hover:bg-purple-50 px-1.5 py-1 rounded transition-colors border border-purple-200 justify-center"
                              >
                                <FaEye className="text-xs" />
                                {isActuallyPDFFile ? 'View PDF' : 'View'}
                              </button>
                              <button 
                                onClick={() => handleDownloadClick(document)}
                                disabled={isDownloading}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium hover:bg-green-50 px-1.5 py-1 rounded transition-colors border border-green-200 justify-center disabled:opacity-50"
                              >
                                {isDownloading ? (
                                  <FaSpinner className="text-xs animate-spin" />
                                ) : (
                                  <FaDownload className="text-xs" />
                                )}
                                Download
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(document)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-1.5 py-1 rounded transition-colors border border-red-200 justify-center"
                              >
                                <FaTrash className="text-xs" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs text-gray-600">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredGroups.length)}
                </span>{' '}
                of <span className="font-medium">{filteredGroups.length}</span> customers
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-purple-500 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredGroups.length === 0 && groupedDocuments.length > 0 && (
        <div className="bg-white rounded border border-gray-200 p-4 text-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <FaFileAlt className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium text-sm mb-1">No documents match your filters</p>
          <button
            onClick={() => {
              setDocumentTypeFilter('all');
              setFileTypeFilter('all');
              setSearchQuery('');
              handleResetAdvancedFilters();
            }}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-medium"
          >
            Show All Documents
          </button>
        </div>
      )}

      {/* Modals */}
      <DocumentPreviewModal
        document={selectedDocument}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        policy={selectedPolicyForUpload}
        onUploadSuccess={handleUploadSuccess}
      />

      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        searchFilters={searchFilters}
        onFilterChange={setSearchFilters}
        onApplyFilters={handleApplyAdvancedFilters}
        onResetFilters={handleResetAdvancedFilters}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-md w-full p-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>

            {documentToDelete && (
              <div className="bg-gray-50 rounded p-3 mb-4">
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="font-medium">{documentToDelete.originalName || documentToDelete.name}</div>
                  <div>Type: {documentTypes[documentToDelete.tag] || documentToDelete.tag}</div>
                  <div>Customer: {documentToDelete.customerName}</div>
                  <div>Policy: {documentToDelete.policyNumber}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Document'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentsTable;