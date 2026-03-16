import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import EventForm from '../../components/forms/EventForm';
import { ChevronLeft, Calendar, Loader2 } from 'lucide-react';

const CreateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { data: eventData, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/api/events/${id}/`);
            return response.data;
        },
        enabled: isEditMode
    });

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex-none flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/events')}
                        className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {isEditMode ? 'Modify Institutional Event' : 'Launch New Event'}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic">
                            {isEditMode ? 'Update details, schedule or media for this event' : 'Setup a new event for students and faculty'}
                        </p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest leading-none">
                        {isEditMode ? 'Edit Mode' : 'Drafting Phase'}
                    </span>
                </div>
            </div>

            {/* Form Container */}
            <div className="flex-1 bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
                {isEditMode && isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Retrieving Event Data...</p>
                    </div>
                ) : (
                    <div className="p-8 md:p-10 flex-1 overflow-auto custom-scrollbar">
                         <EventForm initialData={eventData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateEvent;
