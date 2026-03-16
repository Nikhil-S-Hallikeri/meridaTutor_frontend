import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBatches, deleteBatch } from '../../services/batches';
import { getSubjects, deleteSubject } from '../../services/subjects';
import DataTable from '../../components/DataTable';
import { Plus, AlertTriangle, X, History, UserCheck, Calendar, BookOpen, Layers } from 'lucide-react';
import { useContext, useState } from 'react';
import Modal from '../../components/Modal';
import BatchForm from '../../components/forms/BatchForm';
import SubjectForm from '../../components/forms/SubjectForm';
import { toast } from 'react-toastify';
import { getBatchTutorHistory } from '../../services/batches';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const BatchHistoryList = ({ batchId }) => {
    const { data: history, isLoading } = useQuery({
        queryKey: ['batch-history', batchId],
        queryFn: () => getBatchTutorHistory(batchId)
    });

    if (isLoading) return <div className="p-4 text-xs font-medium text-gray-400 animate-pulse uppercase tracking-widest">Retrieving Audit Logs...</div>;

    return (
        <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 mx-4 mb-4 space-y-4">
            <h4 className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                <History className="w-3 h-3" /> Assignment Timeline
            </h4>
            {history?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            {item.is_current && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-medium px-2 py-0.5 rounded-bl-lg">CURRENT</div>
                            )}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-gray-800 text-sm">{item.tutor_name || 'Assigned Tutor'}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> Assigned: {item.assigned_date}
                                </p>
                                {item.removed_date && (
                                    <p className="text-[10px] text-red-400 font-medium flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" /> Relieved: {item.removed_date}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic font-medium">No previous assignment history recorded for this batch.</p>
            )}
        </div>
    );
};

const Batches = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
    const isTutor = user?.role === 'TUTOR';
    const isStudent = user?.role === 'STUDENT';
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('batches');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, type: null, data: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, type: null, data: null });

    // --- Queries ---
    const { data: batches, isLoading: isBatchesLoading } = useQuery({
        queryKey: ['batches'],
        queryFn: getBatches,
        enabled: activeTab === 'batches'
    });

    const { data: subjects, isLoading: isSubjectsLoading } = useQuery({
        queryKey: ['subjects'],
        queryFn: getSubjects,
        enabled: activeTab === 'subjects'
    });

    // --- Mutations ---
    const deleteBatchMutation = useMutation({
        mutationFn: deleteBatch,
        onSuccess: () => {
            queryClient.invalidateQueries(['batches']);
            toast.success("Batch deleted successfully.");
            setDeleteModal({ open: false, type: null, data: null });
        },
        onError: () => toast.error("Failed to delete batch.")
    });

    const deleteSubjectMutation = useMutation({
        mutationFn: deleteSubject,
        onSuccess: () => {
            queryClient.invalidateQueries(['subjects']);
            toast.success("Subject deleted successfully.");
            setDeleteModal({ open: false, type: null, data: null });
        },
        onError: () => toast.error("Failed to delete subject.")
    });

    const confirmDelete = () => {
        if (deleteModal.type === 'batch') deleteBatchMutation.mutate(deleteModal.data.batch_id);
        else if (deleteModal.type === 'subject') deleteSubjectMutation.mutate(deleteModal.data.id);
    };

    const batchColumns = [
        {
            header: 'Batch Details',
            accessor: 'batch_name',
            render: (row) => (
                <div className="flex flex-col">
                    <span 
                        className="font-medium text-primary hover:underline cursor-pointer tracking-tight"
                        onClick={() => navigate(`/admin/batches/${row.batch_id}`)}
                    >
                        {row.batch_name}
                    </span>
                </div>
            )
        },
        {
            header: 'Subject Name',
            accessor: 'subject_name',
            render: (row) => <span className="text-xs font-medium text-gray-500">{row.subject_name}</span>
        },
        {
            header: 'Trainer',
            accessor: 'current_tutor_name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-medium text-gray-700 text-sm">{row.current_tutor_name || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'Timing',
            accessor: 'timing',
            render: (row) => <span className="text-xs font-medium text-gray-500">{row.timing}</span>
        },
        {
            header: 'Students',
            accessor: 'student_count',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${(row.student_count / row.max_capacity) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">{row.student_count}/{row.max_capacity}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-medium tracking-widest uppercase ${row.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                    {row.status || 'N/A'}
                </span>
            )
        },
        // Earnings for tutors
        ...(isTutor ? [{
            header: 'Earned Amount',
            accessor: 'total_earned',
            render: (row) => (
                <span className="text-sm font-bold text-primary">₹{(row.total_earned || 0).toLocaleString()}</span>
            )
        }] : []),
        // Only show actions for admins
        ...(isAdmin ? [{ header: 'Actions', accessor: 'actions' }] : [])
    ];

    const subjectColumns = [
        {
            header: 'Subject Name',
            accessor: 'name',
            render: (row) => <span className="font-medium text-gray-800">{row.name}</span>
        },
        {
            header: 'Total Batches',
            accessor: 'batch_count',
            render: (row) => <span className="text-xs font-medium text-gray-500">{row.batch_count || 0} Batches</span>
        },
        { header: 'Actions', accessor: 'actions' }
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header & Tab Switcher */}
            <div className="flex-none space-y-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl md:text-2xl font-medium text-gray-800">
                            {activeTab === 'batches' ? 'Batch Management' : 'Subject Catalog'}
                        </h2>
                        {/* Tab Switcher Pill - Only for Admins */}
                        {isAdmin && (
                            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                                <button
                                    onClick={() => setActiveTab('batches')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'batches' ? 'bg-white text-primary shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Layers className="w-3 h-3" /> Batches
                                </button>
                                <button
                                    onClick={() => setActiveTab('subjects')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'subjects' ? 'bg-white text-primary shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <BookOpen className="w-3 h-3" /> Subjects
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Create Button - Only for Admins */}
                    {isAdmin && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:bg-blue-700 transition-all text-sm md:text-base cursor-pointer">
                            <Plus className="w-5 h-5" />
                            {activeTab === 'batches' ? 'Create New Batch' : 'Add New Subject'}
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-white rounded shadow-sm border border-gray-50 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                {(isBatchesLoading || isSubjectsLoading) ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Scanning Catalog...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={activeTab === 'batches' ? batchColumns : subjectColumns}
                        data={(activeTab === 'batches' ? batches : subjects) || []}
                        onEdit={isAdmin ? (row) => setEditModal({ open: true, type: activeTab === 'batches' ? 'batch' : 'subject', data: row }) : null}
                        onDelete={isAdmin ? (row) => setDeleteModal({ open: true, type: activeTab === 'batches' ? 'batch' : 'subject', data: row }) : null}
                        renderExpanded={activeTab === 'batches' && !isStudent ? (row) => <BatchHistoryList batchId={row.batch_id} /> : null}
                    />
                )}
            </div>

            {/* Create Modals */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={activeTab === 'batches' ? "Create New Batch" : "Add New Subject"}
            >
                {activeTab === 'batches'
                    ? <BatchForm onClose={() => setIsCreateModalOpen(false)} />
                    : <SubjectForm onClose={() => setIsCreateModalOpen(false)} />
                }
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, type: null, data: null })}
                title={editModal.type === 'batch' ? "Edit Batch" : "Edit Subject"}
            >
                {editModal.type === 'batch' ? (
                    <BatchForm
                        initialData={editModal.data}
                        onClose={() => setEditModal({ open: false, type: null, data: null })}
                    />
                ) : (
                    <SubjectForm
                        initialData={editModal.data}
                        onClose={() => setEditModal({ open: false, type: null, data: null })}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setDeleteModal({ open: false, type: null, data: null })}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                            <button onClick={() => setDeleteModal({ open: false, type: null, data: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Delete {deleteModal.type === 'batch' ? 'Batch' : 'Subject'}</h3>
                            <p className="text-gray-500 text-sm">
                                Are you sure you want to delete
                                <span className="font-semibold text-gray-700"> "{deleteModal.type === 'batch' ? deleteModal.data?.batch_name : deleteModal.data?.name}"</span>?
                                {deleteModal.type === 'batch' ? ' This action will unassign all students.' : ' This will remove it from the catalog.'}
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDeleteModal({ open: false, type: null, data: null })} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} disabled={deleteBatchMutation.isPending || deleteSubjectMutation.isPending} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm disabled:opacity-50">
                                {deleteBatchMutation.isPending || deleteSubjectMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Batches;
