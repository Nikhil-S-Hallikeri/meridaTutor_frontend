import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStudent } from '../../services/students';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// Define validation rules
const studentSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    admission_no: z.string().min(3, "Admission No required"),
    phone: z.string().min(10, "Valid phone required"),
    status: z.enum(['active', 'inactive']),
});

const StudentForm = ({ onClose }) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(studentSchema)
    });

    const mutation = useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
            toast.success("Student created!");
            onClose();
        }
    });

    return (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <input {...register("name")} placeholder="Full Name" className="w-full p-3 border rounded-xl" />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}

            <input {...register("email")} placeholder="Email" className="w-full p-3 border rounded-xl" />
            <input {...register("admission_no")} placeholder="Admission No" className="w-full p-3 border rounded-xl" />
            <input {...register("phone")} placeholder="Phone" className="w-full p-3 border rounded-xl" />

            <select {...register("status")} className="w-full p-3 border rounded-xl">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>

            <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-medium">
                {mutation.isPending ? 'Saving...' : 'Save Student'}
            </button>
        </form>
    );
};

export default StudentForm;