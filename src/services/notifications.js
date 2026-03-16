import api from './api';

export const getNotifications = async () => {
    const response = await api.get('/api/notifications/');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.post(`/api/notifications/${id}/mark-as-read/`);
    return response.data;
};

export const markAllRead = async () => {
    const response = await api.post('/api/notifications/mark-all-read/');
    return response.data;
};
