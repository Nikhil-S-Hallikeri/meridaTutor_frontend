import api from './api';

export const getLeads = async () => {
    try {
        // 1. Fetch Event Enquiries
        const eventRes = await api.get('/api/events/enquiries/');
        const eventLeads = (eventRes.data.results || eventRes.data).map(lead => ({
            ...lead,
            id: `event-${lead.id}`,
            realId: lead.id,
            name: lead.student_name,
            contact: lead.student_phone,
            email: lead.student_email,
            source: 'Event',
            category: 'STUDENT', // All event enquiries are students
            type: lead.event_title || 'Event Enquiry',
            date: lead.created_at
        }));

        // 2. Fetch General Enquiries
        const generalRes = await api.get('/api/enquiry/');
        const generalLeads = (generalRes.data.results || generalRes.data).map(lead => ({
            ...lead,
            id: `gen-${lead.id}`,
            realId: lead.id,
            name: lead.name,
            contact: lead.contact_number,
            email: lead.email,
            source: 'General',
            category: lead.enquiry_type, // 'STUDENT' or 'TEACHER'
            type: lead.enquiry_type === 'TEACHER' ? 'Teacher Enquiry' : 'Student Enquiry',
            date: lead.created_at
        }));

        // Combined unique list
        return [...eventLeads, ...generalLeads].sort((a, b) => new Date(b.date) - new Date(a.date));

    } catch (error) {
        console.error("Error fetching leads:", error);
        throw error;
    }
};

export const convertLead = async ({ source, realId }) => {
    try {
        const endpoint = source === 'Event' 
            ? `/api/events/enquiries/${realId}/respond/`
            : `/api/enquiry/${realId}/`;
        
        const payload = { status: 'CONVERTED' };
        
        if (source === 'Event') {
            await api.patch(endpoint, payload);
        } else {
            await api.patch(endpoint, payload);
        }
        
    } catch (error) {
        console.error("Error converting lead status:", error);
        throw error;
    }
};