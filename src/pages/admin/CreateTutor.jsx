import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTutor } from '../../services/tutors';
import { getSubjects } from '../../services/subjects';
import { convertLead } from '../../services/leads';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, UserCircle, Save, Briefcase, GraduationCap } from 'lucide-react';

const tutorSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    contact: z.string().min(10, "Valid phone number required"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
    charges_per_hour: z.string().min(1, "Hourly charge is required"),
    experience: z.string().min(1, "Experience details required"),
    assigned_subjects: z.array(z.string()).min(1, "Select at least one subject"),
    is_active: z.boolean().default(true),
});

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">{label}</label>}
        {children}
        {error && <p className="text-red-500 text-[10px] font-medium mt-0.5 px-1 uppercase tracking-tight">{error}</p>}
    </div>
);

const inputClass = (hasError) =>
    `w-full bg-gray-50 border-2 rounded-2xl px-4 py-3 outline-none transition-all text-sm font-medium ${hasError ? 'border-red-400' : 'border-gray-100 focus:border-primary/30'}`;

const CreateTutor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Check for lead conversion data
    const leadData = location.state?.leadData || null;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(tutorSchema),
        defaultValues: {
            name: leadData?.name || '',
            email: leadData?.email || '',
            contact: leadData?.contact || '',
            is_active: true,
            assigned_subjects: [],
        }
    });

    const { data: subjects } = useQuery({
        queryKey: ['subjects'],
        queryFn: getSubjects,
    });

    const createMutation = useMutation({
        mutationFn: createTutor,
        onSuccess: async () => {
            if (leadData) {
                try {
                    await convertLead({ source: leadData.source, realId: leadData.realId });
                } catch (err) {
                    console.error("Failed to update lead status:", err);
                }
            }
            queryClient.invalidateQueries(['tutors']);
            queryClient.invalidateQueries(['leads']);
            toast.success("Trainer profile created successfully!");
            navigate('/admin/trainers');
        },
        onError: (err) => {
            const errorData = err.response?.data;
            const msg = typeof errorData === 'object'
                ? Object.values(errorData).flat().join(', ')
                : "Failed to create trainer.";
            toast.error(msg);
        }
    });

    const onSubmit = (data) => {
        const payload = {
            ...data,
            charges_per_hour: parseFloat(data.charges_per_hour),
            assigned_subjects: data.assigned_subjects.map(id => parseInt(id))
        };
        createMutation.mutate(payload);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/admin/trainers')} className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-medium text-gray-800 tracking-tight">Onboard New Trainer</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {leadData ? `Converting lead: ${leadData.name}` : 'Setup a new professional instructional profile.'}
                    </p>
                </div>
            </div>

            {/* Default Password Info Banner */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-3xl text-sm flex items-start gap-3">
                <span className="text-lg">🔑</span>
                <div>
                    <p className="font-semibold">Default Login Credentials</p>
                    <p>The trainer's <strong>email address</strong> will be set as their default password if you leave the field blank. They can change it from Settings after logging in.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal & Account Section */}
                <div className="bg-white rounded-4xl shadow-sm p-10 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />
                    <h3 className="text-lg font-medium text-gray-800 mb-8 flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-primary" /> Profile & Access Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Full Name" error={errors.name?.message}>
                            <input {...register("name")} placeholder="e.g. Dr. Robert Fox" className={inputClass(errors.name)} />
                        </Field>
                        <Field label="Email Address" error={errors.email?.message}>
                            <input {...register("email")} type="email" placeholder="trainer@domain.com" className={inputClass(errors.email)} />
                        </Field>
                        <Field label="Contact Number" error={errors.contact?.message}>
                            <input {...register("contact")} placeholder="+91 XXXXX XXXXX" className={inputClass(errors.contact)} />
                        </Field>
                        <Field label="Password (Optional)" error={errors.password?.message}>
                            <input {...register("password")} type="password" placeholder="Leave blank to use email as password" className={inputClass(errors.password)} />
                        </Field>
                    </div>
                </div>

                {/* Professional Info Section */}
                <div className="bg-white rounded-4xl shadow-sm p-10 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-8 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" /> Professional Credentials
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Experience / Expertise" error={errors.experience?.message}>
                            <input {...register("experience")} placeholder="e.g. 8+ Years UI/UX Design" className={inputClass(errors.experience)} defaultValue={leadData?.experience_name || ''} />
                        </Field>
                        <Field label="Hourly Charges (₹)" error={errors.charges_per_hour?.message}>
                            <input {...register("charges_per_hour")} type="number" placeholder="500" className={inputClass(errors.charges_per_hour)} />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Assigned Subjects" error={errors.assigned_subjects?.message}>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                                    {subjects?.map(subject => (
                                        <label key={subject.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-transparent hover:border-primary/20 cursor-pointer transition-all has-checked:bg-white has-checked:border-primary/30 has-checked:shadow-sm">
                                            <input
                                                type="checkbox"
                                                value={subject.id}
                                                {...register("assigned_subjects")}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-[11px] font-medium text-gray-600 uppercase tracking-tight">{subject.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </Field>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <input {...register("is_active")} type="checkbox" id="is_active" className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary" />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Mark as Active</label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full md:w-64 bg-primary text-white py-5 rounded-4xl font-medium text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {createMutation.isPending ? 'Processing...' : 'Onboard Trainer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTutor;
