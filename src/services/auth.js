import api from './api';

export const getMyProfile = async () => {
    const response = await api.get('/api/my-profile/');
    return response.data;
};
export const updateMyProfile = async (data) => {
    const response = await api.patch('/api/my-profile/', data);
    return response.data;
};

export const changePassword = async (data) => {
    const response = await api.post('/api/my-profile/change-password/', data);
    return response.data;
};
