import api from './api';

export const getBatches = async () => {
    const response = await api.get('/api/batches/');
    return response.data.results || response.data;
};

export const createBatch = async (batchData) => {
    const response = await api.post('/api/batches/', batchData);
    return response.data;
};

export const updateBatch = async ({ id, ...batchData }) => {
    const response = await api.patch(`/api/batches/${id}/`, batchData);
    return response.data;
};

export const deleteBatch = async (id) => {
    return await api.delete(`/api/batches/${id}/`);
};

export const getBatchTutorHistory = async (batchId) => {
    const response = await api.get(`/api/batch-tutor-histories/?batch_id=${batchId}`);
    return response.data.results || response.data;
};

export const getBatchAttendanceSummary = async (batchId, month) => {
    const response = await api.get(`/api/batches/${batchId}/attendance-summary/?month=${month}`);
    return response.data;
};