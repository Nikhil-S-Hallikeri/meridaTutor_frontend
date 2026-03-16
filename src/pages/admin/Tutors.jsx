import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTutors, deleteTutor, createTutor } from '../../services/tutors';
import { getSubjects } from '../../services/subjects';
import DataTable from '../../components/DataTable';
import { Plus, Search, Filter, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';

const Tutors = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, tutor: null });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { data: tutors, isLoading, isError } = useQuery({
        queryKey: ['tutors', debouncedSearchTerm],
        queryFn: () => getTutors({ search: debouncedSearchTerm }),
    });

    const { data: subjects } = useQuery({
        queryKey: ['subjects'],
        queryFn: getSubjects,
    });

    const createMutation = useMutation({
        mutationFn: createTutor,
        onSuccess: () => {
            queryClient.invalidateQueries(['tutors']);
            toast.success("Trainer profile created successfully!");
            setIsAddModalOpen(false);
            reset();
        },
        onError: (error) => {
            const errorData = error.response?.data;
            const errorMessage = typeof errorData === 'object'
                ? Object.values(errorData).flat().join(', ')
                : "Failed to create trainer.";
            toast.error(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTutor,
        onSuccess: () => {
            queryClient.invalidateQueries(['tutors']);
            toast.success("Trainer profile deleted.");
            setDeleteModal({ open: false, tutor: null });
        },
        onError: () => {
            toast.error("Failed to delete trainer.");
        }
    });

    const onAddSubmit = (data) => {
        // Prepare data for the backend
        const formattedData = {
            ...data,
            charges_per_hour: parseFloat(data.charges_per_hour) || 0,
            assigned_subjects: data.assigned_subjects ? data.assigned_subjects.map(id => parseInt(id)) : []
        };
        createMutation.mutate(formattedData);
    };

    const handleDelete = (row) => {
        setDeleteModal({ open: true, tutor: row });
    };

    const confirmDelete = () => {
        if (deleteModal.tutor) {
            deleteMutation.mutate(deleteModal.tutor.tutor_id);
        }
    };

    const handleEdit = (row) => {
        // Assuming there will be an edit route for tutors
        toast.info("Edit feature for trainers coming soon!");
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'tutor_id',
            render: (row) => <span className="font-mono font-medium text-gray-400">{row.tutor_id}</span>
        },
        {
            header: 'Trainer Name',
            accessor: 'name',
            render: (row) => <p className="font-medium text-gray-800">{row.name}</p>
        },
        {
            header: 'Email',
            accessor: 'email',
            render: (row) => (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    {row.email}
                </div>
            )
        },
        {
            header: 'Contact No',
            accessor: 'contact',
            render: (row) => (
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    {row.contact}
                </div>
            )
        },
        {
            header: 'Expertise',
            accessor: 'assigned_subject_names',
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.assigned_subject_names?.length > 0 ? (
                        row.assigned_subject_names.map((sub, idx) => (
                            <span key={idx} className="bg-blue-50 text-primary text-[10px] px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                                {sub}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 italic text-[10px]">No subjects</span>
                    )}
                </div>
            )
        },
        {
            header: 'Charges/Hr',
            accessor: 'charges_per_hour',
            render: (row) => <span className="font-medium text-gray-700">₹{row.charges_per_hour}</span>
        },
        {
            header: 'Status',
            accessor: 'is_active',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-medium ${row.is_active ? 'bg-green-100 text-success' : 'bg-red-100 text-danger'}`}>
                    {row.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions'
        }
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden animate-fade-in">
            <div className="flex-none flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-medium text-gray-800">Trainer Management</h2>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search trainers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 md:py-3 bg-white rounded-xl md:rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all text-sm md:text-base"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-white px-4 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-base">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button onClick={() => navigate('/admin/trainers/create')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 text-sm md:text-base">
                        <Plus className="w-5 h-5" /> Add Trainer
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded shadow-sm border border-gray-50 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-gray-500 font-medium">Fetching trainer list...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center text-red-500 py-10 bg-red-50 rounded-3xl border border-red-100 mx-auto max-w-md">
                        <p className="font-medium mb-2">Error loading trainers</p>
                        <p className="text-sm">Please refresh the page or check the backend.</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={tutors || []}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Custom Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setDeleteModal({ open: false, tutor: null })}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                            <button onClick={() => setDeleteModal({ open: false, tutor: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Delete Trainer Profile</h3>
                            <p className="text-gray-500 text-sm">
                                Are you sure you want to delete trainer
                                <span className="font-semibold text-gray-700"> "{deleteModal.tutor?.name}"</span>?
                                This action cannot be undone and may affect assigned batches.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDeleteModal({ open: false, tutor: null })} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm disabled:opacity-50">
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tutors;
