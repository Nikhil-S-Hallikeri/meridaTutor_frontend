import api from './api';

export const getInvoices = async () => {
    const response = await api.get('/api/invoices/');
    // Handle pagination (results array) or direct array response
    return response.data.results || response.data || [];
};

export const recordPayment = async ({ id, data }) => {
    // URL from your table: /api/invoices/1/record_payment/
    return await api.post(`/api/invoices/${id}/record_payment/`, data);
};

export const deleteInvoice = async (id) => {
    return await api.delete(`/api/invoices/${id}/`);
};

// --- Term Payments ---
export const getTermPayments = async (params = {}) => {
    const response = await api.get('/api/term-payments/', { params });
    return response.data.results || response.data || [];
};

// --- Receipts ---
export const getReceipts = async (params = {}) => {
    const response = await api.get('/api/receipts/', { params });
    return response.data.results || response.data || [];
};

export const getReceiptDetail = async (id) => {
    return await api.get(`/api/receipts/${id}/`);
};

export const generateReceipt = async ({ invoiceId, data = {} }) => {
    // POST /api/invoices/{invoice_id}/generate_receipt/
    return await api.post(`/api/invoices/${invoiceId}/generate_receipt/`, data);
};