import api from './api';

export const getStaff = async () => {
    const response = await api.get('/api/staff/');
    return response.data.results || response.data;
};

export const createStaffFull = async (data) => {
    const response = await api.post('/api/staff/create-full/', data);
    return response.data;
};

export const updateStaff = async (id, data) => {
    const response = await api.put(`/api/staff/${id}/`, data);
    return response.data;
};

export const deleteStaff = async (id) => {
    const response = await api.delete(`/api/staff/${id}/`);
    return response.data;
};

export const getStaffById = async (id) => {
    const response = await api.get(`/api/staff/${id}/`);
    return response.data;
};