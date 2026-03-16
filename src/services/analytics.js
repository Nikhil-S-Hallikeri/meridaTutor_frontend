import api from './api';

export const getRevenueData = async () => {
    const response = await api.get('/api/tutor-month-wise-graph/');
    return response.data; // Adjusted to return full object including summary
};

export const getStudentAnalytics = async () => {
    const response = await api.get('/api/student-analytics/');
    return response.data;
};

export const getMonthlyTrend = async () => {
    const response = await api.get('/api/monthly-enrollment-trend/');
    return response.data;
};