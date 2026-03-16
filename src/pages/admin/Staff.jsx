import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getStaff, deleteStaff } from '../../services/staff';
import DataTable from '../../components/DataTable';
import { Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Staff = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState({ open: false, staff: null });

    const { data: staff, isLoading } = useQuery({
        queryKey: ['staff'],
        queryFn: getStaff
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteStaff(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['staff']);
            toast.success("Staff member removed from system.");
            setDeleteModal({ open: false, staff: null });
        },
        onError: () => {
            toast.error("Failed to delete staff member.");
        }
    });

    const columns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (row, index) => index + 1
        },
        {
            header: 'Name', accessor: 'name', render: (row) => (
                <div 
                    className="flex flex-col cursor-pointer hover:opacity-70 transition-all"
                    onClick={() => navigate(`/admin/staff/${row.staff_id}`)}
                >
                    <span className="font-medium text-primary hover:underline">{row.name}</span>
                    {/* <span className="text-[10px] text-gray-400">{row.email}</span> */}
                </div>
            )
        },
        {
            header: 'Role', accessor: 'role_title', render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-700 text-xs">{row.role_title}</span>
                    {/* <span className="text-[10px] text-primary uppercase font-medium tracking-widest">{row.department}</span> */}
                </div>
            )
        },
        { header: 'Shift', accessor: 'shift_time' },
        {
            header: 'Salary', accessor: 'salary', render: (row) => (
                <span className="font-medium text-gray-800">₹{parseFloat(row.salary).toLocaleString()}</span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-3 py-1 rounded-xl text-[10px] font-medium tracking-widest border ${row.status === 'active'
                    ? 'bg-green-50 text-green-600 border-green-100'
                    : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {row.status.toUpperCase()}
                </span>
            )
        },
        { header: 'Actions', accessor: 'actions' }
    ];

    const handleDelete = (row) => {
        setDeleteModal({ open: true, staff: row });
    };

    const confirmDelete = () => {
        if (deleteModal.staff) {
            deleteMutation.mutate(deleteModal.staff.staff_id);
        }
    };

    const handleEdit = (row) => {
        navigate('/admin/staff/create', { state: { staffData: row, isEditMode: true } });
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-none flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-medium text-gray-800 tracking-tight">Staff Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage personnel, roles, and administrative access.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/staff/create')}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shadow-md shadow-primary/10"
                >
                    <Plus className="w-5 h-5" /> Add New Staff
                </button>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded shadow-sm border border-gray-100 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Loading Personnel...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={staff || []}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-medium text-gray-800 mb-2">Delete Personnel</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Are you sure you want to remove <span className="font-medium text-gray-800">"{deleteModal.staff.name}"</span>?
                                This will permanently delete their profile and biometric data from the system.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteModal({ open: false, staff: null })}
                                className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-medium hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
