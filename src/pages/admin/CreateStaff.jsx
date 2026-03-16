import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createStaffFull, updateStaff } from '../../services/staff';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, UserCircle } from 'lucide-react';

const staffSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    contact: z.string().min(10, "Valid phone number required"),
    role_title: z.string().min(1, "Role is required"),
    department: z.string().min(1, "Department is required"),
    shift_time: z.string().min(1, "Shift time is required"),
    salary: z.string().min(1, "Salary is required"),
    employment_type: z.string().min(1, "Employment type is required"),
    emergency_contact: z.string().min(10, "Emergency contact is required"),
    joined_date: z.string().min(1, "Joined date is required"),
    status: z.string().default("active"),
    is_admin: z.boolean().default(false),
    password: z.string().optional()
});

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">{label}</label>}
        {children}
        {error && <p className="text-red-500 text-[10px] font-medium mt-0.5 px-1 uppercase tracking-tight">{error}</p>}
    </div>
);

const inputClass = (hasError) =>
    `w-full bg-gray-50 border-2 rounded-2xl px-4 py-3 outline-none transition-all text-sm ${hasError ? 'border-red-400' : 'border-gray-100 focus:border-primary/30'}`;

const CreateStaff = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const staffData = location.state?.staffData || null;
    const isEditMode = location.state?.isEditMode || false;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(staffSchema),
        defaultValues: isEditMode
            ? {
                ...staffData,
                salary: staffData?.salary?.toString() || '',
            }
            : {
                employment_type: 'fulltime',
                status: 'active',
                is_admin: false,
                joined_date: new Date().toISOString().split('T')[0]
            }
    });

    const createMutation = useMutation({
        mutationFn: createStaffFull,
        onSuccess: () => {
            queryClient.invalidateQueries(['staff']);
            toast.success("Staff profile created successfully!");
            navigate('/admin/staff');
        },
        onError: (err) => {
            const msg = err?.response?.data?.detail || "Failed to create staff member.";
            toast.error(msg);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => updateStaff(staffData.staff_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['staff']);
            toast.success("Staff profile updated!");
            navigate('/admin/staff');
        },
        onError: (err) => {
            toast.error("Failed to update staff.");
        }
    });

    const mutation = isEditMode ? updateMutation : createMutation;

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/admin/staff')} className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-medium text-gray-800 tracking-tight">
                        {isEditMode ? 'Edit Staff Profile' : 'Add New Staff'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isEditMode ? `Updating database record for ${staffData?.name}` : 'Create a new administrative or instructional staff member.'}
                    </p>
                </div>
            </div>

            {/* Default Password Info Banner */}
            {!isEditMode && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-3xl text-sm flex items-start gap-3">
                    <span className="text-lg">🔑</span>
                    <div>
                        <p className="font-semibold">Default Login Credentials</p>
                        <p>The staff member's <strong>email address</strong> will be set as their default password. They can change it from Settings after logging in.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal & Account Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />

                    <h3 className="text-lg font-medium text-gray-800 mb-8 flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-primary" /> Personal & Account Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Full Name" error={errors.name?.message}>
                            <input {...register("name")} placeholder="e.g. John Doe" className={inputClass(errors.name)} />
                        </Field>
                        <Field label="Email Address" error={errors.email?.message}>
                            <input {...register("email")} type="email" placeholder="john@example.com" className={inputClass(errors.email)} disabled={isEditMode} />
                        </Field>
                        <Field label="Contact Number" error={errors.contact?.message}>
                            <input {...register("contact")} placeholder="+91 1234567890" className={inputClass(errors.contact)} />
                        </Field>
                        {!isEditMode && (
                            <Field label="Password (Optional)" error={errors.password?.message}>
                                <input {...register("password")} type="password" placeholder="Leave blank to use email as password" className={inputClass(errors.password)} />
                            </Field>
                        )}
                    </div>
                </div>

                {/* Professional Assignment Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-8 flex items-center gap-2">
                        <Save className="w-5 h-5 text-primary" /> Employment & Roles
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Role Title" error={errors.role_title?.message}>
                            <input {...register("role_title")} placeholder="e.g. Senior Tutor" className={inputClass(errors.role_title)} />
                        </Field>
                        <Field label="Department" error={errors.department?.message}>
                            <input {...register("department")} placeholder="e.g. STEM" className={inputClass(errors.department)} />
                        </Field>
                        <Field label="Shift Time" error={errors.shift_time?.message}>
                            <input {...register("shift_time")} placeholder="e.g. 10AM - 7PM" className={inputClass(errors.shift_time)} />
                        </Field>
                        <Field label="Monthly Salary" error={errors.salary?.message}>
                            <input {...register("salary")} type="number" placeholder="e.g. 35000" className={inputClass(errors.salary)} />
                        </Field>
                        <Field label="Employment Type" error={errors.employment_type?.message}>
                            <select {...register("employment_type")} className={inputClass(errors.employment_type)}>
                                <option value="fulltime">Full Time</option>
                                <option value="parttime">Part Time</option>
                                <option value="contract">Contract</option>
                            </select>
                        </Field>
                        <Field label="Joined Date" error={errors.joined_date?.message}>
                            <input {...register("joined_date")} type="date" className={inputClass(errors.joined_date)} />
                        </Field>
                    </div>
                </div>

                {/* Status & Security */}
                <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <Field label="Emergency Contact" error={errors.emergency_contact?.message}>
                            <input {...register("emergency_contact")} placeholder="Guardian Name / Phone" className={inputClass(errors.emergency_contact)} />
                        </Field>

                        <div className="flex flex-col gap-6 md:gap-0 md:flex-row md:items-center justify-between bg-gray-50 border-2 border-gray-100 p-6 rounded-3xl">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700">Profile Status</span>
                                <select {...register("status")} className={`px-4 py-2 rounded-xl border-2 font-medium text-sm outline-none transition-all ${isEditMode ? 'bg-white' : ''}`}>
                                    <option value="active">ACTIVE</option>
                                    <option value="inactive">INACTIVE</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input {...register("is_admin")} type="checkbox" id="is_admin" className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary" />
                                <label htmlFor="is_admin" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Admin Access</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1 bg-primary text-white py-5 rounded-4xl font-medium text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Processing...' : (
                            <>{isEditMode ? 'Update Database Record' : 'Create Staff Member'}</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateStaff;
