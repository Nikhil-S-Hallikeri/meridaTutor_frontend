import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createStudent, updateStudent } from '../../services/students';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import { convertLead } from '../../services/leads';

const studentSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number required"),
    admission_no: z.string().min(1, "Admission No is required"),
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    address: z.string().min(5, "Address is required"),
    guardian_name: z.string().min(2, "Guardian name is required"),
    guardian_contact: z.string().min(10, "Guardian contact is required"),
    guardian_relation: z.string().min(2, "Relation is required"),
    emergency_contact: z.string().min(10, "Emergency contact is required"),
    blood_group: z.string().optional(),
    qualification: z.string().optional(),
    status: z.string().default("active"),
    password: z.string().optional(),
});

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
        {children}
        {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
);

const inputClass = (hasError) =>
    `p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all w-full text-sm ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

const CreateStudent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Check for lead conversion data
    const leadData = location.state?.leadData || null;
    // Check if we're in edit mode (student data passed via router state)
    const studentData = location.state?.studentData || null;
    const isEditMode = location.state?.isEditMode || false;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: isEditMode
            ? {
                name: studentData?.name || '',
                email: studentData?.email || '',
                phone: studentData?.phone || '',
                admission_no: studentData?.admission_no || '',
                dob: studentData?.dob || '',
                gender: studentData?.gender || 'Male',
                address: studentData?.address || '',
                guardian_name: studentData?.guardian_name || '',
                guardian_contact: studentData?.guardian_contact || '',
                guardian_relation: studentData?.guardian_relation || '',
                emergency_contact: studentData?.emergency_contact || '',
                blood_group: studentData?.blood_group || '',
                qualification: studentData?.qualification || '',
                status: studentData?.status || 'active',
            }
            : leadData
                ? {
                    name: leadData.name || '',
                    email: leadData.email || '',
                    phone: leadData.contact || '',
                    address: leadData.city || '',
                    gender: 'Male',
                    status: 'active',
                    qualification: leadData.highest_qualification || '',
                }
                : { gender: 'Male', status: 'active' }
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createStudent,
        onSuccess: async () => {
            if (leadData) {
                try {
                    await convertLead({ source: leadData.source, realId: leadData.realId });
                } catch (err) {
                    console.error("Failed to update lead status:", err);
                }
            }
            queryClient.invalidateQueries(['students']);
            queryClient.invalidateQueries(['leads']);
            toast.success("Student onboarded successfully!");
            navigate('/admin/students');
        },
        onError: (err) => {
            const msg = err?.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : "Failed to create student. Please try again.";
            toast.error(msg);
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: updateStudent,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
            toast.success("Student updated successfully!");
            navigate('/admin/students');
        },
        onError: (err) => {
            const msg = err?.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : "Failed to update student. Please try again.";
            toast.error(msg);
        }
    });

    const mutation = isEditMode ? updateMutation : createMutation;

    const onSubmit = (data) => {
        if (isEditMode) {
            // Pass student_id along with the updated data
            updateMutation.mutate({ id: studentData.student_id, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/students')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-medium text-gray-800">
                        {isEditMode ? 'Edit Student' : 'Onboard New Student'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isEditMode
                            ? 'Update the student details below.'
                            : 'A login account will be created automatically using the student\'s email.'}
                    </p>
                </div>
            </div>

            {/* Default Password Info Banner */}
            {!isEditMode && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-2xl text-sm flex items-start gap-3">
                    <span className="text-lg">🔑</span>
                    <div>
                        <p className="font-semibold">Default Login Credentials</p>
                        <p>The student's <strong>email address</strong> will be set as their default password. They can change it after logging in from Settings.</p>
                    </div>
                </div>
            )}

            {/* API Error Banner */}
            {mutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                    {mutation.error?.response?.data
                        ? Object.entries(mutation.error.response.data).map(([key, val]) => (
                            <p key={key}><strong className="capitalize">{key}:</strong> {Array.isArray(val) ? val.join(', ') : val}</p>
                        ))
                        : "An unexpected error occurred. Please try again."
                    }
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Section 1: Personal Info */}
                <fieldset className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6">
                    <p className="text-base font-medium text-gray-700 mb-4">Personal Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Full Name" error={errors.name?.message}>
                            <input {...register("name")} placeholder="e.g. Anand Kumar" className={inputClass(errors.name)} />
                        </Field>
                        <Field label="Email Address" error={errors.email?.message}>
                            <input {...register("email")} type="email" placeholder="e.g. student@email.com" className={inputClass(errors.email)}
                                disabled={isEditMode}
                            />
                        </Field>
                        <Field label="Phone Number" error={errors.phone?.message}>
                            <input {...register("phone")} placeholder="e.g. 9876543210" className={inputClass(errors.phone)} />
                        </Field>
                        <Field label="Date of Birth" error={errors.dob?.message}>
                            <input {...register("dob")} type="date" className={inputClass(errors.dob)} />
                        </Field>
                        <Field label="Gender" error={errors.gender?.message}>
                            <select {...register("gender")} className={inputClass(errors.gender)}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </Field>
                        <Field label="Blood Group" error={errors.blood_group?.message}>
                            <input {...register("blood_group")} placeholder="e.g. A+, O-" className={inputClass(errors.blood_group)} />
                        </Field>
                        {!isEditMode && (
                            <Field label="Password (Optional)" error={errors.password?.message}>
                                <input {...register("password")} type="password" placeholder="Leave blank to use email as password" className={inputClass(errors.password)} />
                            </Field>
                        )}
                    </div>
                </fieldset>

                {/* Section 2: Academic Info */}
                <fieldset className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6">
                    <p className="text-base font-medium text-gray-700 mb-4">Academic Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Admission Number" error={errors.admission_no?.message}>
                            <input {...register("admission_no")} placeholder="e.g. STD2026001" className={inputClass(errors.admission_no)} />
                        </Field>
                        <Field label="Qualification" error={errors.qualification?.message}>
                            <input {...register("qualification")} placeholder="e.g. B.Sc Computer Science" className={inputClass(errors.qualification)} />
                        </Field>
                        <Field label="Status" error={errors.status?.message}>
                            <select {...register("status")} className={inputClass(errors.status)}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </Field>
                    </div>
                </fieldset>

                {/* Section 3: Guardian Info */}
                <fieldset className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6">
                    <p className="text-base font-medium text-gray-700 mb-4">Guardian & Emergency</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Guardian Name" error={errors.guardian_name?.message}>
                            <input {...register("guardian_name")} placeholder="e.g. Raj Kumar" className={inputClass(errors.guardian_name)} />
                        </Field>
                        <Field label="Guardian Contact" error={errors.guardian_contact?.message}>
                            <input {...register("guardian_contact")} placeholder="e.g. 9876543210" className={inputClass(errors.guardian_contact)} />
                        </Field>
                        <Field label="Relation to Student" error={errors.guardian_relation?.message}>
                            <input {...register("guardian_relation")} placeholder="e.g. Father, Mother" className={inputClass(errors.guardian_relation)} />
                        </Field>
                        <Field label="Emergency Contact" error={errors.emergency_contact?.message}>
                            <input {...register("emergency_contact")} placeholder="e.g. 9876543210" className={inputClass(errors.emergency_contact)} />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Residential Address" error={errors.address?.message}>
                                <textarea {...register("address")} placeholder="Full address including city, state, PIN..." className={`${inputClass(errors.address)} h-24 resize-none`} />
                            </Field>
                        </div>
                    </div>
                </fieldset>

                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-medium hover:bg-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {mutation.isPending
                        ? (isEditMode ? 'Updating Student...' : 'Creating Account & Profile...')
                        : (isEditMode ? 'Update Student' : 'Finalize Enrollment')
                    }
                </button>
            </form>
        </div>
    );
};

export default CreateStudent;