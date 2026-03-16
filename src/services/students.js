import api from './api';

export const getStudents = async (params = {}) => {
    const response = await api.get('/api/students/', { params });
    // Return full response for pagination handling in components
    return response.data;
};

export const createStudent = async (studentData) => {
    const response = await api.post('/api/students/create-full/', studentData);
    return response.data;
};

export const updateStudent = async ({ id, ...studentData }) => {
    const response = await api.patch(`/api/students/${id}/`, studentData);
    return response.data;
};

export const deleteStudent = async (id) => {
    return await api.delete(`/api/students/${id}/`);
};

export const getStudentHistory = async (id) => {
    const response = await api.get(`/api/students/${id}/complete-history/`);
    return response.data.data || response.data;
};

export const createClassReview = async (reviewData) => {
    const response = await api.post('/api/class-reviews/', reviewData);
    return response.data;
};