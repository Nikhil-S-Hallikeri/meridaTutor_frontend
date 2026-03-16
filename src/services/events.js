import api from './api';

export const getEvents = async () => {
    const response = await api.get('/api/events/');
    return response.data.results || response.data || [];
};

export const createEvent = async (eventData) => {
    const response = await api.post('/api/events/create/', eventData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateEvent = async (id, eventData) => {
    // If eventData is not FormData, we still want to support both
    const headers = eventData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };
        
    const response = await api.patch(`/api/events/${id}/update/`, eventData, { headers });
    return response.data;
};

export const deleteEvent = async (id) => {
    const response = await api.delete(`/api/events/${id}/delete/`);
    return response.data;
};