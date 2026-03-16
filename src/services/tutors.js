import api from './api';

export const getTutors = async (params = {}) => {
    const response = await api.get('/api/tutors/', { params });
    // Handle pagination (same logic as students)
    return response.data.results || response.data;
};

export const updateTutor = async ({ id, ...tutorData }) => {
    const response = await api.patch(`/api/tutors/${id}/`, tutorData);
    return response.data;
};

export const createTutor = async (tutorData) => {
    const response = await api.post('/api/tutors/create-full/', tutorData);
    return response.data;
};

export const deleteTutor = async (id) => {
    return await api.delete(`/api/tutors/${id}/`);
};

export const getTutorHistory = async (id) => {
    const response = await api.get(`/api/tutors/${id}/complete-history/`);
    return response.data.data || response.data;
};

export const getTutorsWithPendingPayments = async () => {
    const response = await api.get('/api/tutor-earning-summaries/pending_payments/');
    return response.data.tutors || response.data;
};

export const recordTutorPayment = async (paymentData) => {
    const response = await api.post('/api/tutor-payments/', paymentData);
    return response.data;
};