import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent, updateEvent } from '../../services/events';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Link, 
    Mail, 
    Phone, 
    Info, 
    Image as ImageIcon, 
    Type, 
    Users, 
    CreditCard,
    Globe,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';

const EventForm = ({ onCancel, initialData = null }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    const eventTypeOptions = [
        { value: 'WORKSHOP', label: 'Workshop' },
        { value: 'SEMINAR', label: 'Seminar' },
        { value: 'WEBINAR', label: 'Webinar' },
        { value: 'COMPETITION', label: 'Competition' },
        { value: 'EXAM', label: 'Exam' },
        { value: 'OTHER', label: 'Other' },
    ];

    const statusOptions = [
        { value: 'UPCOMING', label: 'Upcoming' },
        { value: 'ONGOING', label: 'Ongoing' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];

    const modeOptions = [
        { value: 'ONLINE', label: 'Online' },
        { value: 'OFFLINE', label: 'Offline' },
    ];

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            event_type: initialData ? eventTypeOptions.find(opt => opt.value === initialData.event_type) : eventTypeOptions[0],
            event_date: initialData?.event_date || '',
            event_time: initialData?.event_time || '',
            duration_hours: initialData?.duration_hours || '',
            venue: initialData?.venue || '',
            mode: initialData ? modeOptions.find(opt => opt.value === initialData.mode) : modeOptions[1],
            max_participants: initialData?.max_participants || '',
            registration_deadline: initialData?.registration_deadline || '',
            registration_fee: initialData?.registration_fee || '0.00',
            status: initialData ? statusOptions.find(opt => opt.value === initialData.status) : statusOptions[0],
            contact_email: initialData?.contact_email || '',
            contact_phone: initialData?.contact_phone || '',
            additional_info: initialData?.additional_info || '',
        }
    });

    const mutation = useMutation({
        mutationFn: (formData) => initialData ? updateEvent(initialData.id, formData) : createEvent(formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['events']);
            toast.success(`Event ${initialData ? 'updated' : 'created'} successfully!`);
            navigate('/admin/events');
        },
        onError: (err) => {
            const msg = err?.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : `Failed to ${initialData ? 'update' : 'create'} event.`;
            toast.error(msg);
        }
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        
        // Append all fields
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('event_type', data.event_type.value);
        formData.append('event_date', data.event_date);
        formData.append('event_time', data.event_time);
        formData.append('duration_hours', data.duration_hours);
        formData.append('venue', data.venue);
        formData.append('mode', data.mode.value);
        if (data.max_participants) formData.append('max_participants', data.max_participants);
        if (data.registration_deadline) formData.append('registration_deadline', data.registration_deadline);
        formData.append('registration_fee', data.registration_fee);
        formData.append('status', data.status.value);
        formData.append('contact_email', data.contact_email);
        formData.append('contact_phone', data.contact_phone);
        formData.append('additional_info', data.additional_info);

        // Handle image
        if (data.image && data.image[0]) {
            formData.append('image', data.image[0]);
        }

        mutation.mutate(formData);
    };

    const sectionTitle = (icon, title) => (
        <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                {icon}
            </div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">{title}</h3>
        </div>
    );

    const inputClasses = "w-full bg-gray-50 border-gray-100 border rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none";
    const labelClasses = "text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1 mb-1 block";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[85vh] overflow-y-auto px-2 pb-6 custom-scrollbar">
            
            {/* Basic Information */}
            <section>
                {sectionTitle(<Type className="w-4 h-4" />, "Basic Information")}
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Event Title</label>
                        <input 
                            {...register("title", { required: "Title is required" })} 
                            placeholder="Enter event title" 
                            className={inputClasses} 
                        />
                        {errors.title && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.title.message}</p>}
                    </div>
                    
                    <div className="space-y-1">
                        <label className={labelClasses}>Description</label>
                        <textarea 
                            {...register("description", { required: "Description is required" })} 
                            placeholder="Describe what this event is about..." 
                            rows={3}
                            className={`${inputClasses} resize-none`} 
                        />
                        {errors.description && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Event Type</label>
                            <Controller
                                name="event_type"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        {...field} 
                                        options={eventTypeOptions} 
                                        className="text-sm"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '0.75rem',
                                                border: '1px solid #f3f4f6',
                                                backgroundColor: '#f9fafb',
                                                padding: '2px'
                                            })
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Current Status</label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        {...field} 
                                        options={statusOptions} 
                                        className="text-sm"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '0.75rem',
                                                border: '1px solid #f3f4f6',
                                                backgroundColor: '#f9fafb',
                                                padding: '2px'
                                            })
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Date & Time */}
            <section>
                {sectionTitle(<Calendar className="w-4 h-4" />, "Date & Time")}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Event Date</label>
                        <input 
                            type="date" 
                            {...register("event_date", { required: "Date is required" })} 
                            className={inputClasses} 
                        />
                        {errors.event_date && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.event_date.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Event Time</label>
                        <input 
                            type="time" 
                            {...register("event_time", { required: "Time is required" })} 
                            className={inputClasses} 
                        />
                        {errors.event_time && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.event_time.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Duration (Hours)</label>
                        <input 
                            type="number" 
                            step="0.5"
                            {...register("duration_hours", { required: "Duration is required" })} 
                            placeholder="e.g. 2.5"
                            className={inputClasses} 
                        />
                        {errors.duration_hours && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.duration_hours.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Registration Deadline</label>
                        <input 
                            type="date" 
                            {...register("registration_deadline")} 
                            className={inputClasses} 
                        />
                    </div>
                </div>
            </section>

            {/* Venue & Mode */}
            <section>
                {sectionTitle(<MapPin className="w-4 h-4" />, "Venue & Mode")}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Mode</label>
                        <Controller
                            name="mode"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    {...field} 
                                    options={modeOptions} 
                                    className="text-sm"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: '0.75rem',
                                            border: '1px solid #f3f4f6',
                                            backgroundColor: '#f9fafb',
                                            padding: '2px'
                                        })
                                    }}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Venue / Link</label>
                        <div className="relative">
                            <input 
                                {...register("venue", { required: "Venue/Link is required" })} 
                                placeholder="Enter location or meeting link" 
                                className={inputClasses} 
                            />
                        </div>
                        {errors.venue && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.venue.message}</p>}
                    </div>
                </div>
            </section>

            {/* Registration Details */}
            <section>
                {sectionTitle(<Users className="w-4 h-4" />, "Registration Details")}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Max Participants</label>
                        <input 
                            type="number" 
                            {...register("max_participants")} 
                            placeholder="Unlimited if empty"
                            className={inputClasses} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Registration Fee</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input 
                                type="number" 
                                step="0.01"
                                {...register("registration_fee")} 
                                placeholder="0.00"
                                className={`${inputClasses} pl-8`} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section>
                {sectionTitle(<Phone className="w-4 h-4" />, "Contact Information")}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Contact Email</label>
                        <input 
                            type="email" 
                            {...register("contact_email", { required: "Contact email is required" })} 
                            placeholder="admin@example.com"
                            className={inputClasses} 
                        />
                        {errors.contact_email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.contact_email.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Contact Phone</label>
                        <input 
                            {...register("contact_phone", { required: "Contact phone is required" })} 
                            placeholder="+91 1234567890"
                            className={inputClasses} 
                        />
                        {errors.contact_phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.contact_phone.message}</p>}
                    </div>
                </div>
            </section>

            {/* Media & Additional Info */}
            <section>
                {sectionTitle(<ImageIcon className="w-4 h-4" />, "Media & Additional Info")}
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Event Banner Image</label>
                        <div className="flex items-center gap-4">
                            {initialData?.image && (
                                <img 
                                    src={initialData.image} 
                                    alt="Current" 
                                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm"
                                />
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                {...register("image")} 
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/5 file:text-primary hover:file:bg-primary/10 transition-all cursor-pointer" 
                            />
                        </div>
                    </div>
                    <div className="space-y-1 pt-2">
                        <label className={labelClasses}>Additional Info</label>
                        <textarea 
                            {...register("additional_info")} 
                            placeholder="Any other details participants should know..." 
                            rows={2}
                            className={`${inputClasses} resize-none`} 
                        />
                    </div>
                </div>
            </section>

            <div className="pt-8 flex gap-4 sticky bottom-0 bg-white border-t border-gray-50">
                <button 
                    type="button" 
                    onClick={() => navigate('/admin/events')}
                    className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={mutation.isPending} 
                    className="flex-2 bg-primary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {mutation.isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {initialData ? 'Synchronizing...' : 'Broadcasting...'}
                        </>
                    ) : (
                        initialData ? 'Update Event' : 'Launch Event'
                    )}
                </button>
            </div>
        </form>
    );
};

export default EventForm;

