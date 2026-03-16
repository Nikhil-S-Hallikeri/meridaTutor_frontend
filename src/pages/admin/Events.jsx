import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, deleteEvent } from '../../services/events';
import DataTable from '../../components/DataTable';
import { useState, useMemo } from 'react';
import { Plus, Search, Filter, AlertTriangle, X, Calendar, Globe, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Events = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [deleteModal, setDeleteModal] = useState({ open: false, data: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: getEvents
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries(['events']);
            toast.success("Event deleted successfully.");
            setDeleteModal({ open: false, data: null });
        },
        onError: () => toast.error("Failed to delete event.")
    });

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        return events.filter(event => {
            const matchesSearch = 
                event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [events, searchTerm, statusFilter]);

    const columns = [
        { 
            header: 'Event Details', 
            accessor: 'title',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-800 tracking-tight">{row.title}</span>
                    <div className="flex items-center gap-2 opacity-60">
                         <span className="text-[10px] font-medium bg-gray-100 px-1.5 py-0.5 rounded uppercase">{row.event_type}</span>
                    </div>
                </div>
            )
        },
        { 
            header: 'Date & Time', 
            accessor: 'event_date',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{format(new Date(row.event_date), 'dd MMM yyyy')}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{row.event_time}</span>
                </div>
            )
        },
        { 
            header: 'Location / Mode', 
            accessor: 'venue',
            render: (row) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        {row.mode === 'ONLINE' ? <Globe className="w-3 h-3 text-blue-500" /> : <MapPin className="w-3 h-3 text-orange-500" />}
                        {row.venue}
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{row.mode}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest uppercase border ${
                    row.status === 'UPCOMING' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    row.status === 'ONGOING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    row.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Actions', accessor: 'actions' }
    ];

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-medium text-gray-800 tracking-tight">Events Management</h2>
                    <p className="text-xs font-medium text-gray-400 italic uppercase tracking-widest">Organize and manage institutional events</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64 group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative flex-1 sm:w-48">
                        <Filter className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => navigate('/admin/events/create')}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Launch Event
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-white rounded-3xl shadow-sm border border-gray-100 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest italic">Syncing Events...</p>
                    </div>
                ) : (
                    <DataTable 
                        columns={columns} 
                        data={filteredEvents} 
                        onEdit={(row) => navigate(`/admin/events/edit/${row.id}`)}
                        onDelete={(row) => setDeleteModal({ open: true, data: row })}
                    />
                )}
                {!isLoading && filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-400">No events found</p>
                        <p className="text-xs italic uppercase tracking-widest font-medium">Try adjusting your search or filters</p>
                    </div>
                ) }
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setDeleteModal({ open: false, data: null })}>
                    <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-6 border border-rose-100">
                                <AlertTriangle className="w-10 h-10 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Event?</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Are you sure you want to delete
                                <span className="font-bold text-gray-900"> "{deleteModal.data?.title}"</span>?
                                This action is permanent and cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button 
                                onClick={() => setDeleteModal({ open: false, data: null })} 
                                className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold uppercase tracking-widest hover:bg-gray-50 transition-all text-xs"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => deleteMutation.mutate(deleteModal.data.id)} 
                                disabled={deleteMutation.isPending} 
                                className="flex-1 px-6 py-4 rounded-2xl bg-rose-500 text-white font-bold uppercase tracking-widest hover:bg-rose-600 transition-all text-xs disabled:opacity-50 shadow-lg shadow-rose-200"
                            >
                                {deleteMutation.isPending ? 'Removing...' : 'Delete Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;


