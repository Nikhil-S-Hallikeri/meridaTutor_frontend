import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation, keepPreviousData } from '@tanstack/react-query';
import { getStudents, deleteStudent } from '../../services/students';
import DataTable from '../../components/DataTable';
import {
    Plus, AlertTriangle, X, Search, Filter,
    ChevronLeft, ChevronRight, Calendar, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Students = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState({ open: false, student: null });

    // Filter & Pagination States
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateGte, setDateGte] = useState('');
    const [dateLte, setDateLte] = useState('');
    const [debouncedFilters, setDebouncedFilters] = useState({
        search: '',
        status: '',
        join_date__gte: '',
        join_date__lte: ''
    });

    // Debounce all filters
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters({
                search,
                status: statusFilter,
                join_date__gte: dateGte,
                join_date__lte: dateLte
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter, dateGte, dateLte]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedFilters]);

    const { data: response, isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: ['students', page, debouncedFilters],
        queryFn: () => getStudents({
            page,
            ...debouncedFilters
        }),
        placeholderData: keepPreviousData,
    });

    const students = response?.results || [];
    const totalCount = response?.count || 0;
    const totalPages = Math.ceil(totalCount / 10);

    const columns = [
        {
            header: 'Sl No',
            accessor: 'serial',
            render: (_, index) => (page - 1) * 10 + index + 1
        },
        { header: 'Admission No', accessor: 'admission_no' },
        {
            header: 'Name',
            accessor: 'name',
            render: (row) => (
                <button
                    onClick={() => navigate(`/admin/students/${row.student_id}`)}
                    className="font-medium text-primary hover:underline underline-offset-4 decoration-2 transition-all"
                >
                    {row.name}
                </button>
            )
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Contact', accessor: 'phone' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${row.status === 'active' ? 'bg-green-100 text-success' : 'bg-red-100 text-danger'
                    }`}>
                    {row.status || 'N/A'}
                </span>
            )
        },
        {
            header: 'Joined Date',
            accessor: 'join_date',
            render: (row) => (
                <span className="text-gray-500 font-medium whitespace-nowrap">
                    {row.join_date ? new Date(row.join_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) : 'N/A'}
                </span>
            )
        },
        { header: 'Actions', accessor: 'actions' }
    ];

    const deleteMutation = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
            toast.success("Student deleted!");
            setDeleteModal({ open: false, student: null });
        },
        onError: () => {
            toast.error("Failed to delete student.");
            setDeleteModal({ open: false, student: null });
        }
    });

    const handleDelete = (row) => {
        setDeleteModal({ open: true, student: row });
    };

    const confirmDelete = () => {
        if (deleteModal.student) {
            deleteMutation.mutate(deleteModal.student.student_id);
        }
    };

    const handleEdit = (row) => {
        navigate('/admin/students/create', { state: { studentData: row, isEditMode: true } });
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
        setDateGte('');
        setDateLte('');
        setPage(1);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden py-2 space-y-6">
            {/* Header Section - Fixed */}
            <div className="flex-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <div>
                    <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Student Management</h2>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Mini Pagination - Quick Access at Top */}
                    <div className="hidden lg:flex items-center bg-white border border-gray-100 rounded-2xl px-3 py-1.5 shadow-sm gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-1 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-400 hover:text-primary cursor-pointer"
                            title="Previous Page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col items-center min-w-[60px]">
                            <span className="text-[10px] font-medium text-gray-900 uppercase tracking-tighter">Page {page}</span>
                            <span className="text-[8px] font-medium text-gray-400 uppercase tracking-widest -mt-1">of {totalPages || 1}</span>
                        </div>
                        <button
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage(p => p + 1)}
                            className="p-1 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-400 hover:text-primary cursor-pointer"
                            title="Next Page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button onClick={() => navigate('/admin/students/create')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-2 rounded-2xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 text-sm cursor-pointer">
                        <Plus className="w-5 h-5" /> Add New Student
                    </button>
                </div>
            </div>

            {/* Premium Filter Section - Fixed */}
            <div className="flex-none bg-white rounded-4xl shadow-sm border border-gray-100 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    {/* Search */}
                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Search Students</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Name, ID or Email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Account Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Join Date Range */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-3 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Joined From</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateGte}
                                    onChange={(e) => setDateGte(e.target.value)}
                                    className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">Joined To</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateLte}
                                    onChange={(e) => setDateLte(e.target.value)}
                                    className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-end lg:justify-start">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-3 text-gray-400 hover:text-danger hover:bg-red-50 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" /> Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area - Flex Grow & Scrollable */}
            <div className={`flex-1 flex flex-col bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                {/* Subtle fetching bar */}
                {isFetching && (
                    <div className="flex-none h-1 w-full bg-primary/10 overflow-hidden">
                        <div className="h-full bg-primary animate-pulse w-full" />
                    </div>
                )}

                {/* Scrollable Table Wrapper */}
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 px-6 pb-6">
                    {isLoading && !response ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">Searching records...</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={students}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    )}
                </div>

                {/* Fixed Pagination Footer */}
                <div className="flex-none bg-white p-6 border-t border-gray-50">
                    {/* Custom Pagination Template (Matches Image 2) */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Left: Total Statistics */}
                            <div className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                                Total : {totalCount} data
                            </div>

                            {/* Center: Controller */}
                            <div className="flex items-center gap-3">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 font-medium text-[10px] uppercase tracking-widest hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-200"
                                >
                                    prev
                                </button>

                                <div className="bg-primary px-6 py-2 rounded-lg text-white font-medium text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                    {page} out of {totalPages || 1}
                                </div>

                                <button
                                    disabled={page === totalPages || totalPages === 0}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-[10px] uppercase tracking-widest hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                                >
                                    next
                                </button>
                            </div>

                            {/* Right: Page Navigation */}
                            <div className="flex items-center gap-3 text-gray-500 font-medium text-xs uppercase tracking-wider">
                                <span>Page :</span>
                                <input
                                    type="number"
                                    value={page}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val > 0 && val <= totalPages) setPage(val);
                                    }}
                                    className="w-14 h-10 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center font-medium text-gray-900 text-center focus:border-primary outline-none transition-all"
                                    min="1"
                                    max={totalPages}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setDeleteModal({ open: false, student: null })}>
                    <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md p-8 animate-[fadeIn_0.2s_ease-out]"
                        onClick={(e) => e.stopPropagation()}>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Delete Student Account?</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
                                You are about to remove <span className="text-red-500">"{deleteModal.student?.name}"</span>.
                                This process is irreversible and all associated data will be lost.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setDeleteModal({ open: false, student: null })}
                                className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-400 font-medium hover:bg-gray-100 transition-all">
                                Go Back
                            </button>
                            <button onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50">
                                {deleteMutation.isPending ? 'Removing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
