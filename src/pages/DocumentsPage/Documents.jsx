import React, { useState, useEffect } from 'react';
import {
  FaFileAlt,
  FaDownload,
  FaTrash,
  FaFileUpload,
  FaCloudUploadAlt,
  FaSpinner,
  FaListAlt,
  FaTags,
  FaTag,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';

const Documents = ({ form, handleChange, handleSave, isSaving, errors }) => {
  const [uploading, setUploading] = useState(false);
  const [customTagInputs, setCustomTagInputs] = useState({});
  const [showCustomInputs, setShowCustomInputs] = useState({});
  const [loading, setLoading] = useState(false);

  // API base URL
  const API_BASE_URL = 'https://asia-south1-sge-parashstone.cloudfunctions.net/app/v1';

  // Fetch documents on component mount
  useEffect(() => {
    if (form._id) {
      fetchDocuments();
    }
  }, [form._id]);

  // Fetch documents from API
  const fetchDocuments = async () => {
    if (!form._id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/policies/${form._id}`);
      const policyData = response.data;
      
      if (policyData.documents) {
        handleChange({
          target: {
            name: 'documents',
            value: policyData.documents
          }
        });
        
        // Also load document tags if they exist
        if (policyData.documentTags) {
          handleChange({
            target: {
              name: 'documentTags',
              value: policyData.documentTags
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

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
  const handleDocumentTag = async (docId, tag) => {
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
    
    // Update local state
    handleChange({
      target: {
        name: 'documentTags',
        value: updatedTags
      }
    });

    // Update in database if policy exists
    if (form._id) {
      try {
        await axios.put(`${API_BASE_URL}/policies/${form._id}`, {
          documentTags: updatedTags
        });
      } catch (error) {
        console.error('Error updating document tags:', error);
      }
    }
  };

  // Handle custom tag input
  const handleCustomTagInput = async (docId, value) => {
    setCustomTagInputs(prev => ({
      ...prev,
      [docId]: value
    }));

    const currentTags = form.documentTags || {};
    const updatedTags = {
      ...currentTags,
      [docId]: value
    };
    
    // Update local state
    handleChange({
      target: {
        name: 'documentTags',
        value: updatedTags
      }
    });

    // Update in database if policy exists
    if (form._id) {
      try {
        await axios.put(`${API_BASE_URL}/policies/${form._id}`, {
          documentTags: updatedTags
        });
      } catch (error) {
        console.error('Error updating document tags:', error);
      }
    }
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
      const existingDocuments = form.documents || [];
      const newDocuments = [...existingDocuments];
      
      uploadedFiles.forEach((uploadedFile, index) => {
        const docId = `doc_${Date.now()}_${index}`;
        newDocuments.push({
          _id: docId,
          ...uploadedFile
        });
      });
      
      console.log("📄 Updated documents array:", newDocuments);
      
      // Update local state
      handleChange({
        target: {
          name: 'documents',
          value: newDocuments
        }
      });

      // Update in database if policy exists
      if (form._id) {
        try {
          await axios.put(`${API_BASE_URL}/policies/${form._id}`, {
            documents: newDocuments
          });
        } catch (error) {
          console.error('Error updating documents in database:', error);
        }
      }
      
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
  const removeDocument = async (docId) => {
    const currentDocuments = form.documents || [];
    const updatedDocuments = currentDocuments.filter(doc => doc._id !== docId);
    
    const currentTags = form.documentTags || {};
    const updatedTags = { ...currentTags };
    delete updatedTags[docId];

    // Update local state
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

    // Update in database if policy exists
    if (form._id) {
      try {
        await axios.put(`${API_BASE_URL}/policies/${form._id}`, {
          documents: updatedDocuments,
          documentTags: updatedTags
        });
      } catch (error) {
        console.error('Error removing document from database:', error);
      }
    }

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
  const clearAllDocuments = async () => {
    if (window.confirm("Are you sure you want to remove all documents?")) {
      // Update local state
      handleChange({
        target: {
          name: 'documents',
          value: []
        }
      });
      
      handleChange({
        target: {
          name: 'documentTags',
          value: {}
        }
      });
      
      // Update in database if policy exists
      if (form._id) {
        try {
          await axios.put(`${API_BASE_URL}/policies/${form._id}`, {
            documents: [],
            documentTags: {}
          });
        } catch (error) {
          console.error('Error clearing documents from database:', error);
        }
      }
      
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
  const currentDocuments = form.documents || [];
  const documentsCount = currentDocuments.length;
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

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="ml-3 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

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
              {currentDocuments.map((fileObj) => (
                <div
                  key={fileObj._id}
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
                      onClick={() => removeDocument(fileObj._id)}
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
              {currentDocuments.map((fileObj) => (
                <div key={fileObj._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-gray-50 gap-4">
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
                        value={getDropdownValue(fileObj._id)}
                        onChange={(e) => handleDocumentTag(fileObj._id, e.target.value)}
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
                      
                      {shouldShowCustomInput(fileObj._id) && (
                        <input
                          type="text"
                          value={customTagInputs[fileObj._id] || ""}
                          onChange={(e) => handleCustomTagInput(fileObj._id, e.target.value)}
                          placeholder="Enter custom document name"
                          className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none w-full md:w-48"
                        />
                      )}
                    </div>
                    
                    {form.documentTags?.[fileObj._id] && form.documentTags[fileObj._id] !== "" && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap flex items-center gap-1">
                        <FaTag size={10} />
                        {form.documentTags[fileObj._id]}
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

export default Documents;