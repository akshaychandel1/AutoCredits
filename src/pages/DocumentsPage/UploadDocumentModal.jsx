// src/pages/DocumentsPage/UploadDocumentModal.jsx
import React, { useState } from 'react';
import {
  FaCloudUploadAlt,
  FaTimes,
  FaUpload,
  FaSpinner,
  FaFileAlt,
  FaUser,
  FaCar,
  FaShieldAlt
} from 'react-icons/fa';
import { documentService } from '../../services/documentService';

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
      console.log('🚀 Starting REAL file upload process...');
      
      // Step 1: Upload file to storage service
      console.log('📤 Uploading file to storage...');
      const uploadedFile = await documentService.uploadFileToStorage(formData.file);
      console.log('✅ File uploaded to storage:', uploadedFile);
      
      // Step 2: Add document to policy in database (this will append to existing array)
      console.log('💾 Saving document to database...');
      const documentData = {
        ...uploadedFile,
        tag: formData.tag,
        name: formData.file.name,
        originalName: formData.file.name
      };

      const result = await documentService.addDocumentToPolicy(policy.policyId, documentData);
      console.log('✅ Document saved to database (appended to array):', result);
      
      if (onUploadSuccess) {
        console.log('🔄 Calling upload success callback...');
        onUploadSuccess(result, policy.policyId);
      }
      
      // Show success message
      alert('✅ Document uploaded successfully! The list will refresh automatically.');
      
      setFormData({ tag: '', file: null });
      onClose();
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setErrors({ submit: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFormData({ tag: '', file: null });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Upload Document</h3>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
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
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <FaUser className="w-3 h-3" />
                {policy.customerName}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                <FaShieldAlt className="w-3 h-3" />
                Policy: {policy.policyNumber}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <FaCar className="w-3 h-3" />
                Vehicle: {policy.vehicleRegNo}
              </p>
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
              onClick={() => {
                handleReset();
                onClose();
              }}
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

export default UploadDocumentModal;