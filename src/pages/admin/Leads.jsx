// import { useState, useMemo } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getLeads, convertLead } from '../../services/leads';
// import DataTable from '../../components/DataTable';
// import Modal from '../../components/Modal';
// import api from '../../services/api';
// import { useNavigate } from 'react-router-dom';
// import { Search, Filter, Send, Eye, User, GraduationCap, Calendar, MessageSquare, Phone, Mail, MapPin, Briefcase, UserPlus } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { format } from 'date-fns';

// const Leads = () => {
//     const navigate = useNavigate();
//     const queryClient = useQueryClient();
//     const [selectedLead, setSelectedLead] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [adminResponse, setAdminResponse] = useState('');
//     const [activeTab, setActiveTab] = useState('ALL'); // ALL, STUDENT, TEACHER
//     const [searchTerm, setSearchTerm] = useState('');

//     // React Query for fetching
//     const { data: leads, isLoading, isError } = useQuery({
//         queryKey: ['leads'],
//         queryFn: getLeads,
//     });

//     // Filtering logic
//     const filteredLeads = useMemo(() => {
//         if (!leads) return [];
//         return leads.filter(lead => {
//             const matchesTab = activeTab === 'ALL' || lead.category === activeTab;
//             const matchesSearch =
//                 lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 lead.contact?.includes(searchTerm);
//             return matchesTab && matchesSearch;
//         });
//     }, [leads, activeTab, searchTerm]);

//     // Mutation for sending response
//     const respondMutation = useMutation({
//         mutationFn: async ({ id, response, source }) => {
//             if (source === 'Event') {
//                 return await api.patch(`/api/events/enquiries/${id}/respond/`, {
//                     admin_response: response,
//                     status: 'RESPONDED'
//                 });
//             }
//             throw new Error("Direct response for general enquiries in progress.");
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries(['leads']);
//             setIsModalOpen(false);
//             setAdminResponse('');
//             toast.success("Response recorded!");
//         },
//         onError: (error) => {
//             toast.error(error.message || "Failed to save response.");
//         }
//     });

//     const handleViewDetails = (lead) => {
//         setSelectedLead(lead);
//         setAdminResponse(lead.admin_response || '');
//         setIsModalOpen(true);
//     };

//     const handleSendResponse = () => {
//         if (!adminResponse.trim()) return toast.error("Please type a response.");
//         respondMutation.mutate({
//             id: selectedLead.realId,
//             response: adminResponse,
//             source: selectedLead.source
//         });
//     };

//     // Define columns
//     const columns = [
//         {
//             header: 'Lead Name',
//             accessor: 'name',
//             render: (row) => (
//                 <div className="flex flex-col">
//                     <span className="font-medium text-gray-800">{row.name}</span>
//                 </div>
//             )
//         },
//         {
//             header: 'Source',
//             accessor: 'source',
//             render: (row) => (
//                 <span className="text-xs font-medium text-gray-500">{row.source}</span>
//             )
//         },
//         {
//             header: 'Category',
//             accessor: 'category',
//             render: (row) => (
//                 <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-tight ${row.category === 'TEACHER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
//                     }`}>
//                     {row.category}
//                 </span>
//             )
//         },
//         {
//             header: 'Number',
//             accessor: 'contact',
//             render: (row) => (
//                 <span className="text-gray-600 font-medium text-xs">{row.contact}</span>
//             )
//         },
//         {
//             header: 'Email',
//             accessor: 'email',
//             render: (row) => (
//                 <span className="text-gray-500 text-xs">{row.email || 'N/A'}</span>
//             )
//         },
//         {
//             header: 'Enquiry Type',
//             accessor: 'type',
//             render: (row) => (
//                 <span className="text-gray-600 text-xs">{row.type}</span>
//             )
//         },
//         {
//             header: 'Date',
//             accessor: 'date',
//             render: (row) => (
//                 <span className="text-xs font-semibold text-gray-500 italic">
//                     {format(new Date(row.date), 'dd MMM yyyy')}
//                 </span>
//             )
//         },
//         {
//             header: 'Status',
//             accessor: 'status',
//             render: (lead) => (
//                 <div className="flex flex-col gap-1">
//                     {lead.status === 'CONVERTED' ? (
//                         <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
//                             CONVERTED
//                         </span>
//                     ) : (
//                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center ${lead.status === 'RESOLVED' || lead.status === 'RESPONDED'
//                                 ? 'bg-emerald-50 text-emerald-600'
//                                 : 'bg-orange-50 text-orange-600'
//                             }`}>
//                             {lead.status || 'PENDING'}
//                         </span>
//                     )}
//                 </div>
//             )
//         },
//         {
//             header: 'Actions',
//             accessor: 'actions',
//             render: (row) => (
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={() => handleViewDetails(row)}
//                         className="p-2.5 rounded-xl bg-gray-50 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100"
//                         title="View Details"
//                     >
//                         <Eye className="w-4 h-4" />
//                     </button>
//                     {row.status !== 'CONVERTED' && (
//                         <button
//                             onClick={() => {
//                                 const path = row.category === 'TEACHER' ? '/admin/trainers/create' : '/admin/students/create';
//                                 navigate(path, { state: { leadData: row } });
//                             }}
//                             className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
//                             title={`Convert to ${row.category === 'TEACHER' ? 'Trainer' : 'Student'}`}
//                         >
//                             <UserPlus className="w-4 h-4" />
//                         </button>
//                     )}
//                 </div>
//             )
//         },
//     ];

//     return (
//         <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
//             {/* Header Area */}
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//                 <div className="space-y-1">
//                     <h2 className="text-2xl font-medium text-gray-800 tracking-tight">Leads & Enquiries</h2>
//                     <p className="text-xs font-medium text-gray-400 italic uppercase tracking-widest">Manage incoming student and teacher prospects</p>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
//                     <div className="relative flex-1 sm:w-72 group">
//                         <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
//                         <input
//                             type="text"
//                             placeholder="Find leads by name or email..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Content Container */}
//             <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
//                 {/* Tabs Bar */}
//                 <div className="flex items-center space-x-1 px-6 pt-4 border-b border-gray-50 bg-gray-50/30">
//                     {['ALL', 'STUDENT', 'TEACHER'].map((tab) => (
//                         <button
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={`py-3 px-6 text-xs font-medium uppercase tracking-widest transition-all rounded-t-xl border-t border-x ${activeTab === tab
//                                 ? 'bg-white text-primary font-semibold border-gray-100 -mb-px shadow-sm'
//                                 : 'text-gray-400 hover:text-gray-600 border-transparent'
//                                 }`}
//                         >
//                             {tab} Leads
//                         </button>
//                     ))}
//                 </div>

//                 {/* Table Area */}
//                 <div className="flex-1 overflow-auto custom-scrollbar p-0">
//                     {isLoading ? (
//                         <div className="flex flex-col justify-center items-center h-64 space-y-4">
//                             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
//                             <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] italic">Loading Enquiries...</p>
//                         </div>
//                     ) : isError ? (
//                         <div className="flex flex-col items-center justify-center h-64 space-y-2 text-rose-500">
//                             <Filter className="w-8 h-8 opacity-20" />
//                             <p className="font-medium">Sync Failed</p>
//                             <p className="text-xs italic">Unable to fetch lead data from source.</p>
//                         </div>
//                     ) : (
//                         filteredLeads.length > 0 ? (
//                             <DataTable columns={columns} data={filteredLeads} />
//                         ) : (
//                             <div className="flex flex-col items-center justify-center h-80 space-y-4 opacity-40">
//                                 <MessageSquare className="w-12 h-12 text-gray-300" />
//                                 <div className="text-center">
//                                     <p className="text-lg font-medium text-gray-400">No leads found</p>
//                                     <p className="text-xs italic uppercase tracking-widest font-medium">Try adjusting your filters or search terms</p>
//                                 </div>
//                             </div>
//                         )
//                     )}
//                 </div>
//             </div>

//             {/* View Details Modal */}
//             <Modal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 title="Detailed Lead Assessment"
//             >
//                 {selectedLead && (
//                     <div className="space-y-8 p-2 animate-in slide-in-from-bottom-4 duration-300">
//                         {/* Summary Header */}
//                         <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-4xl border border-gray-100">
//                             <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-lg ${selectedLead.category === 'TEACHER' ? 'bg-purple-500 shadow-purple-100' : 'bg-blue-500 shadow-blue-100'
//                                 }`}>
//                                 {selectedLead.category === 'TEACHER' ? <Briefcase className="w-6 h-6" /> : <User className="w-6 h-6" />}
//                             </div>
//                             <div className="space-y-1">
//                                 <h3 className="text-xl font-medium text-gray-800 tracking-tight">{selectedLead.name}</h3>
//                                 <div className="flex items-center gap-3">
//                                     <span className="text-[10px] font-medium text-primary uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">{selectedLead.category}</span>
//                                     <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest italic">{selectedLead.source} Prospect</span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Info Grid */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 px-4">
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3 group">
//                                     <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
//                                         <Mail className="w-4 h-4" />
//                                     </div>
//                                     <div className="space-y-0.5">
//                                         <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Email Address</p>
//                                         <p className="text-sm font-semibold text-gray-700">{selectedLead.email || 'N/A'}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-3 group">
//                                     <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
//                                         <Phone className="w-4 h-4" />
//                                     </div>
//                                     <div className="space-y-0.5">
//                                         <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Contact Number</p>
//                                         <p className="text-sm font-semibold text-gray-700">{selectedLead.contact}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-3 group">
//                                     <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
//                                         <MapPin className="w-4 h-4" />
//                                     </div>
//                                     <div className="space-y-0.5">
//                                         <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Location</p>
//                                         <p className="text-sm font-semibold text-gray-700">{selectedLead.city || 'Not Provided'}</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3 group">
//                                     <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
//                                         <GraduationCap className="w-4 h-4" />
//                                     </div>
//                                     <div className="space-y-0.5">
//                                         <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Qualification</p>
//                                         <p className="text-sm font-medium text-gray-700">{selectedLead.highest_qualification || 'N/A'}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-center gap-3 group">
//                                     <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
//                                         <Calendar className="w-4 h-4" />
//                                     </div>
//                                     <div className="space-y-0.5">
//                                         <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Preferred Mode</p>
//                                         <p className="text-sm font-semibold text-primary">{selectedLead.preferred_mode || 'N/A'}</p>
//                                     </div>
//                                 </div>
//                                 {selectedLead.category === 'TEACHER' && (
//                                     <div className="flex items-center gap-3 group">
//                                         <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
//                                             <Briefcase className="w-4 h-4" />
//                                         </div>
//                                         <div className="space-y-0.5">
//                                             <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Experience</p>
//                                             <p className="text-sm font-semibold text-purple-600">{selectedLead.experience_name || 'N/A'}</p>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Message Box */}
//                         <div className="p-6 bg-primary/5 rounded-4xl border border-primary/10 relative overflow-hidden group">
//                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
//                                 <MessageSquare className="w-12 h-12" />
//                             </div>
//                             <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-3">Prospect Message</p>
//                             <p className="text-gray-600 italic leading-relaxed text-sm">
//                                 "{selectedLead.enquiry_message || 'The user has expressed interest but did not leave a specific message.'}"
//                             </p>
//                         </div>

//                         {/* Conversion Area */}
//                         {selectedLead.status === 'CONVERTED' ? (
//                             <div className="p-6 bg-emerald-50 rounded-4xl border border-emerald-200 flex items-center gap-4">
//                                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
//                                     <UserPlus className="w-6 h-6 text-emerald-500" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Already Onboarded</p>
//                                     <p className="text-xs text-emerald-600 font-medium">This lead has been successfully converted into a {selectedLead.category === 'TEACHER' ? 'Trainer' : 'Student'} profile.</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="flex flex-col md:flex-row gap-4 p-6 bg-emerald-50 rounded-4xl border border-emerald-100 shadow-sm border-dashed">
//                                 <div className="flex-1 space-y-1">
//                                     <p className="text-xs font-medium text-emerald-800 uppercase tracking-widest">Convert Prospect</p>
//                                     <p className="text-[11px] text-emerald-600 font-medium">Instantly onboard this lead by pre-filling their details into a new profile.</p>
//                                 </div>
//                                 <button
//                                     onClick={() => {
//                                         const path = selectedLead.category === 'TEACHER' ? '/admin/trainers/create' : '/admin/students/create';
//                                         navigate(path, { state: { leadData: selectedLead } });
//                                     }}
//                                     className="px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-200 rounded-2xl font-medium text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
//                                 >
//                                     <UserPlus className="w-4 h-4" />
//                                     CONVERT TO {selectedLead.category}
//                                 </button>
//                             </div>
//                         )}

//                         {/* Action Area for Event Enquiries */}
//                         {selectedLead.source === 'Event' && selectedLead.status !== 'CONVERTED' && (
//                             <div className="space-y-4">
//                                 <div className="flex items-center justify-between border-b border-gray-50 pb-2">
//                                     <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Admin Response</label>
//                                     {selectedLead.responded_at && (
//                                         <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Sent on {format(new Date(selectedLead.responded_at), 'dd MMM')}</span>
//                                     )}
//                                 </div>
//                                 <textarea
//                                     className="w-full p-6 h-36 rounded-4xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium text-gray-700 resize-none shadow-inner"
//                                     placeholder="Draft your response to the prospect..."
//                                     value={adminResponse}
//                                     onChange={(e) => setAdminResponse(e.target.value)}
//                                 />
//                                 <button
//                                     onClick={handleSendResponse}
//                                     disabled={respondMutation.isPending}
//                                     className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
//                                 >
//                                     <Send className="w-4 h-4" />
//                                     {respondMutation.isPending ? 'TRANSMITTING...' : 'SEND RESPONSE'}
//                                 </button>
//                             </div>
//                         )}

//                         {(selectedLead.source !== 'Event' && selectedLead.status !== 'CONVERTED') && (
//                             <div className="p-6 bg-orange-50/50 text-orange-700 rounded-4xl border border-orange-100/50 flex items-center gap-4">
//                                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
//                                     <Filter className="w-4 h-4" />
//                                 </div>
//                                 <p className="text-[10px] font-medium uppercase tracking-widest italic leading-relaxed">
//                                     Unified responder for general enquiries is currently in the production pipeline.
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </Modal>
//         </div>
//     );
// };

// export default Leads;












import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeads, convertLead } from '../../services/leads';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Send, Eye, User, GraduationCap, Calendar, MessageSquare, Phone, Mail, MapPin, Briefcase, UserPlus, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import LeadDetailModal from './LeadDetailModal';

// ─── Main Leads Page ─────────────────────────────────────────────────────────
const Leads = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminResponse, setAdminResponse] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: leads, isLoading, isError } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads,
    });

    const filteredLeads = useMemo(() => {
        if (!leads) return [];
        return leads.filter(lead => {
            const matchesTab = activeTab === 'ALL' || lead.category === activeTab;
            const matchesSearch =
                lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.contact?.includes(searchTerm);
            return matchesTab && matchesSearch;
        });
    }, [leads, activeTab, searchTerm]);

    const respondMutation = useMutation({
        mutationFn: async ({ id, response, source }) => {
            if (source === 'Event') {
                return await api.patch(`/api/events/enquiries/${id}/respond/`, {
                    admin_response: response,
                    status: 'RESPONDED'
                });
            }
            throw new Error("Direct response for general enquiries in progress.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
            setIsModalOpen(false);
            setAdminResponse('');
            toast.success("Response recorded!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to save response.");
        }
    });

    const handleViewDetails = (lead) => {
        setSelectedLead(lead);
        setAdminResponse(lead.admin_response || '');
        setIsModalOpen(true);
    };

    const handleSendResponse = () => {
        if (!adminResponse.trim()) return toast.error("Please type a response.");
        respondMutation.mutate({
            id: selectedLead.realId,
            response: adminResponse,
            source: selectedLead.source
        });
    };

    const columns = [
        {
            header: 'Lead Name',
            accessor: 'name',
            render: (row) => (
                <span className="font-medium text-gray-800">{row.name}</span>
            )
        },
        {
            header: 'Source',
            accessor: 'source',
            render: (row) => (
                <span className="text-xs font-medium text-gray-500">{row.source}</span>
            )
        },
        {
            header: 'Category',
            accessor: 'category',
            render: (row) => (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-tight ${row.category === 'TEACHER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {row.category}
                </span>
            )
        },
        {
            header: 'Number',
            accessor: 'contact',
            render: (row) => (
                <span className="text-gray-600 font-medium text-xs">{row.contact}</span>
            )
        },
        {
            header: 'Email',
            accessor: 'email',
            render: (row) => (
                <span className="text-gray-500 text-xs">{row.email || 'N/A'}</span>
            )
        },
        {
            header: 'Enquiry Type',
            accessor: 'type',
            render: (row) => (
                <span className="text-gray-600 text-xs">{row.type}</span>
            )
        },
        {
            header: 'Date',
            accessor: 'date',
            render: (row) => (
                <span className="text-xs font-semibold text-gray-500 italic">
                    {format(new Date(row.date), 'dd MMM yyyy')}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (lead) => (
                <div className="flex flex-col gap-1">
                    {lead.status === 'CONVERTED' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
                            CONVERTED
                        </span>
                    ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center ${lead.status === 'RESOLVED' || lead.status === 'RESPONDED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {lead.status || 'PENDING'}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleViewDetails(row)}
                        className="p-2.5 rounded-xl bg-gray-50 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {row.status !== 'CONVERTED' && (
                        <button
                            onClick={() => {
                                const path = row.category === 'TEACHER' ? '/admin/trainers/create' : '/admin/students/create';
                                navigate(path, { state: { leadData: row } });
                            }}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                            title={`Convert to ${row.category === 'TEACHER' ? 'Trainer' : 'Student'}`}
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-medium text-gray-800 tracking-tight">Leads & Enquiries</h2>
                    <p className="text-xs font-medium text-gray-400 italic uppercase tracking-widest">Manage incoming student and teacher prospects</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-72 group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find leads by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center space-x-1 px-6 pt-4 border-b border-gray-50 bg-gray-50/30">
                    {['ALL', 'STUDENT', 'TEACHER'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-6 text-xs font-medium uppercase tracking-widest transition-all rounded-t-xl border-t border-x ${activeTab === tab
                                ? 'bg-white text-primary font-semibold border-gray-100 -mb-px shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 border-transparent'
                                }`}
                        >
                            {tab} Leads
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto custom-scrollbar p-0">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-64 space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] italic">Loading Enquiries...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-2 text-rose-500">
                            <Filter className="w-8 h-8 opacity-20" />
                            <p className="font-medium">Sync Failed</p>
                            <p className="text-xs italic">Unable to fetch lead data from source.</p>
                        </div>
                    ) : filteredLeads.length > 0 ? (
                        <DataTable columns={columns} data={filteredLeads} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-80 space-y-4 opacity-40">
                            <MessageSquare className="w-12 h-12 text-gray-300" />
                            <div className="text-center">
                                <p className="text-lg font-medium text-gray-400">No leads found</p>
                                <p className="text-xs italic uppercase tracking-widest font-medium">Try adjusting your filters or search terms</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Lead Detail Modal */}
            <LeadDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedLead={selectedLead}
                adminResponse={adminResponse}
                setAdminResponse={setAdminResponse}
                handleSendResponse={handleSendResponse}
                respondMutation={respondMutation}
                navigate={navigate}
            />
        </div>
    );
};

export default Leads;