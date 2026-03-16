import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBatch, updateBatch } from '../../services/batches';
import { getTutors } from '../../services/tutors';
import { getStudents } from '../../services/students';
import { getSubjects } from '../../services/subjects';
import Select from 'react-select';
import { toast } from 'react-toastify';

const BatchForm = ({ onClose, initialData = null }) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            batch_name: initialData?.batch_name || '',
            timing: initialData?.timing || '',
            max_capacity: initialData?.max_capacity || 30,
            total_sessions_planned: initialData?.total_sessions_planned || 0,
            start_date: initialData?.start_date || '',
            end_date: initialData?.end_date || '',
            subject: initialData ? { value: initialData.subject, label: initialData.subject_name } : null,
            current_tutor: initialData ? { value: initialData.current_tutor, label: initialData.current_tutor_name } : null,
            students: initialData?.enrolled_students?.map(s => ({ value: s.student_id, label: `${s.name} (${s.admission_no})` })) || []
        }
    });

    // 1. Fetch Tutors & Formatted Options
    const { data: tutors = [] } = useQuery({ queryKey: ['tutors'], queryFn: getTutors });
    const tutorOptions = tutors.map(t => ({ value: t.tutor_id, label: t.name }));

    // 2. Fetch Subjects & Formatted Options
    const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
    const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));

    // 3. Fetch Students & Formatted Options (Searchable)
    const { data: studentsData } = useQuery({ 
        queryKey: ['students-list'], 
        queryFn: () => getStudents({ page_size: 1000 }) // Load a large batch for selection
    });
    const studentOptions = (studentsData?.results || []).map(s => ({ 
        value: s.student_id, 
        label: `${s.name} (${s.admission_no})` 
    }));

    const mutation = useMutation({
        mutationFn: (data) => initialData ? updateBatch({ id: initialData.batch_id, ...data }) : createBatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['batches']);
            toast.success(`Batch ${initialData ? 'updated' : 'created'} successfully!`);
            onClose();
        },
        onError: (err) => {
            const msg = err?.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : `Failed to ${initialData ? 'update' : 'create'} batch.`;
            toast.error(msg);
        }
    });

    const onSubmit = (data) => {
        // extract values from react-select objects
        mutation.mutate({
            batch_name: data.batch_name,
            timing: data.timing,
            max_capacity: parseInt(data.max_capacity),
            total_sessions_planned: parseInt(data.total_sessions_planned),
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            subject: data.subject?.value,
            current_tutor: data.current_tutor?.value,
            students: data.students?.map(s => s.value) || []
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Batch Name</label>
                    <input {...register("batch_name", { required: "Name is required" })} placeholder="Batch Name" className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                    {errors.batch_name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.batch_name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                    <Controller
                        name="subject"
                        control={control}
                        rules={{ required: "Subject is required" }}
                        render={({ field }) => (
                            <Select {...field} options={subjectOptions} placeholder="Select Subject" className="w-full text-sm" />
                        )}
                    />
                    {errors.subject && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.subject.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Timing</label>
                    <input {...register("timing", { required: "Timing is required" })} placeholder="Mon-Fri 10AM-12PM" className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                    {errors.timing && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.timing.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Batch Trainer</label>
                    <Controller
                        name="current_tutor"
                        control={control}
                        rules={{ required: "Tutor is required" }}
                        render={({ field }) => (
                            <Select {...field} options={tutorOptions} placeholder="Select Tutor" className="w-full text-sm" />
                        )}
                    />
                    {errors.current_tutor && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.current_tutor.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Total Sessions</label>
                    <input type="number" {...register("total_sessions_planned")} placeholder="Planned Sessions (e.g. 20)" className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Max Capacity</label>
                    <input type="number" {...register("max_capacity")} placeholder="Max Students" className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input type="date" {...register("start_date")} className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" {...register("end_date")} className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Assign Students</label>
                <Controller
                    name="students"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            isMulti
                            options={studentOptions}
                            placeholder="Search & Select Students..."
                            className="w-full text-sm"
                            isSearchable
                            noOptionsMessage={() => "No students found"}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: '0.75rem',
                                    padding: '2px',
                                    border: '0',
                                    backgroundColor: '#f9fafb'
                                }),
                                menu: (base) => ({
                                    ...base,
                                    borderRadius: '0.75rem',
                                    overflow: 'hidden'
                                })
                            }}
                        />
                    )}
                />
                <p className="text-[10px] text-gray-400 italic ml-1">You can select multiple students to enroll in this batch immediately.</p>
            </div>

            <button type="submit" disabled={mutation.isPending} className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 mt-4">
                {mutation.isPending ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Batch' : 'Create Batch')}
            </button>
        </form>
    );
};

export default BatchForm;