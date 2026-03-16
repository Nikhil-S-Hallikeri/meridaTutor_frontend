import api from './api';

export const getLogsheets = async () => {
    const response = await api.get('/api/logsheets/');
    return response.data.results || response.data || [];
};

export const getLogsheetsByBatch = async (batchId) => {
    const response = await api.get(`/api/logsheets/?batch_id=${batchId}`);
    return response.data.results || response.data || [];
};

export const submitLogsheet = async (logData) => {
    return await api.post('/api/logsheets/', logData);
};

export const updateLogsheet = async (id, logData) => {
    return await api.patch(`/api/logsheets/${id}/`, logData);
};

export const deleteLogsheet = async (id) => {
    return await api.delete(`/api/logsheets/${id}/`);
};

export const getLogsheetByBatchAndDate = async (batchId, date) => {
    const response = await api.get(`/api/logsheets/?batch_id=${batchId}&start_date=${date}&end_date=${date}`);
    return response.data.results?.[0] || response.data?.[0] || null;
};