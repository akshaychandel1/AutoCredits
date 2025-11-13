// src/services/documentService.js
import axios from 'axios';

const API_BASE_URL = 'https://asia-south1-acillp-8c3f8.cloudfunctions.net/app/v1';

export const documentService = {
  // Upload file directly to the SAME endpoint as fetching
  async uploadFileToStorage(file) {
    try {
      console.log('🚀 Uploading file to unified endpoint...', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);
      formData.append('timestamp', Date.now().toString());

      // Use the SAME endpoint as fetching
      const response = await axios.post(`${API_BASE_URL}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      console.log('📡 Upload response from unified endpoint:', response.data);

      if (!response.data.path) {
        throw new Error('No file path returned from server');
      }

      return {
        url: response.data.path,
        name: file.name,
        originalName: file.name,
        extension: file.name.split('.').pop() || '',
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        mimeType: file.type,
        lastModified: file.lastModified
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      // Fallback to the original upload endpoint if unified fails
      return this.uploadFileToOriginalStorage(file);
    }
  },

  // Fallback to original upload endpoint
  async uploadFileToOriginalStorage(file) {
    try {
      console.log('🔄 Trying original upload endpoint...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);
      formData.append('timestamp', Date.now().toString());

      const response = await axios.post('https://asia-south1-acillp-8c3f8.cloudfunctions.net/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      console.log('📡 Upload response from original endpoint:', response.data);

      if (!response.data.path) {
        throw new Error('No file path returned from server');
      }

      return {
        url: response.data.path,
        name: file.name,
        originalName: file.name,
        extension: file.name.split('.').pop() || '',
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        mimeType: file.type,
        lastModified: file.lastModified
      };
    } catch (error) {
      console.error('❌ Error uploading to original endpoint:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  // Add document to policy in database
  async addDocumentToPolicy(policyId, documentData) {
    try {
      console.log('📝 Adding document to policy:', policyId, documentData);
      
      // First, get the current policy
      const policyResponse = await axios.get(`${API_BASE_URL}/policies/${policyId}`);
      const policy = policyResponse.data;

      // Create document object with proper structure
      const document = {
        _id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: documentData.url,
        name: documentData.name,
        originalName: documentData.originalName,
        extension: documentData.extension,
        type: documentData.type,
        size: documentData.size,
        uploadedAt: new Date().toISOString(),
        mimeType: documentData.type,
        lastModified: documentData.lastModified,
        tag: documentData.tag || 'other'
      };

      console.log('📄 Created document:', document);

      // Update policy with new document
      const currentDocuments = Array.isArray(policy.documents) ? policy.documents : [];
      const updatedDocuments = [...currentDocuments, document];

      console.log('🔄 Updating policy with documents:', updatedDocuments);

      // Update the policy in database
      const updateResponse = await axios.put(`${API_BASE_URL}/policies/${policyId}`, {
        ...policy,
        documents: updatedDocuments
      });

      console.log('✅ Document added to policy successfully');
      return document;

    } catch (error) {
      console.error('❌ Error adding document to policy:', error);
      throw new Error(`Failed to add document to policy: ${error.message}`);
    }
  },

  // Remove document from policy
  async removeDocumentFromPolicy(policyId, documentId) {
    try {
      console.log('🗑️ Removing document:', documentId, 'from policy:', policyId);
      
      const policyResponse = await axios.get(`${API_BASE_URL}/policies/${policyId}`);
      const policy = policyResponse.data;

      const updatedDocuments = (policy.documents || []).filter(doc => doc._id !== documentId);
      
      await axios.put(`${API_BASE_URL}/policies/${policyId}`, {
        ...policy,
        documents: updatedDocuments
      });

      console.log('✅ Document removed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error removing document from policy:', error);
      throw new Error(`Failed to remove document: ${error.message}`);
    }
  },

  // Get all policies
  async getAllPolicies() {
    try {
      console.log('📡 Fetching policies from API...');
      const response = await axios.get(`${API_BASE_URL}/policies`);
      
      const data = response.data;
      console.log('✅ Policies API response received');
      
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
  }
};