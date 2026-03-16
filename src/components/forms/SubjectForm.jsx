import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSubject, updateSubject } from '../../services/subjects';
import { toast } from 'react-toastify';

const SubjectForm = ({ onClose, initialData = null }) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: initialData?.name || ''
        }
    });

    const mutation = useMutation({
        mutationFn: (data) => initialData ? updateSubject(initialData.id, data) : createSubject(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['subjects']);
            toast.success(`Subject ${initialData ? 'updated' : 'created'} successfully!`);
            onClose();
        },
        onError: (err) => {
            const msg = err?.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : `Failed to ${initialData ? 'update' : 'create'} subject.`;
            toast.error(msg);
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Subject Name</label>
                <input
                    {...register("name", { required: "Subject name is required" })}
                    placeholder="e.g. Mathematics, Biology, etc."
                    className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                {errors.name && <p className="text-red-500 text-[10px] font-medium uppercase tracking-tight mt-1 ml-1">{errors.name.message}</p>}
            </div>

            <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
                {mutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {initialData ? 'Updating...' : 'Creating...'}
                    </span>
                ) : (
                    initialData ? 'Update Subject' : 'Create Subject'
                )}
            </button>
        </form>
    );
};

export default SubjectForm;
