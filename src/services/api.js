import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR: This runs BEFORE every request leaves your app
api.interceptors.request.use(
    (config) => {
        // Look for the token in localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            // If we have a token, attach it to the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;