import api from './api';

export const getReviews = async (params = {}) => {
    const response = await api.get('/api/class-reviews/', { params });
    return response.data.results || response.data;
};

export const getBatchAverageRating = async (batchId) => {
    const response = await api.get(`/api/class-reviews/batch-average/${batchId}/`);
    return response.data;
};
