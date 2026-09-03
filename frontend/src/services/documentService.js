import api from './api';

const documentService = {
  /**
   * Upload a document for processing.
   * @param {FormData} formData - Must include: file, document_type.
   *                              Optional: date_format, pdf_password.
   */
  uploadDocument: (formData) =>
    api.post('/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * List all documents for the current user.
   * @param {Object} params - Optional query params (page, status, etc.)
   */
  getDocuments: (params) => api.get('/documents/', { params }),

  /**
   * Get full details for a single document.
   * @param {string} id - Document UUID
   */
  getDocument: (id) => api.get(`/documents/${id}/`),

  /**
   * Delete a document.
   * @param {string} id - Document UUID
   */
  deleteDocument: (id) => api.delete(`/documents/${id}/`),

  /**
   * Get document statistics for the current user.
   */
  getDocumentStats: () => api.get('/documents/stats/'),

  /**
   * List transactions for the current user.
   * @param {Object} params - Optional filters: type, category, date_from, date_to, search
   */
  getTransactions: (params) => api.get('/transactions/', { params }),

  /**
   * Get full details for a single transaction.
   * @param {string} id - Transaction UUID
   */
  getTransaction: (id) => api.get(`/transactions/${id}/`),

  /**
   * Get transaction statistics for the current user.
   */
  getTransactionStats: () => api.get('/transactions/stats/'),
};

export default documentService;
