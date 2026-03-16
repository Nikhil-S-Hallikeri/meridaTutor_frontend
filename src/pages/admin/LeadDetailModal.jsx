
import { Search, Filter, Send, Eye, User, GraduationCap, Calendar, MessageSquare, Phone, Mail, MapPin, Briefcase, UserPlus, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

// ─── Info Row ────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, accent }) => (
    <div className="flex items-center gap-4 py-3.5 border-b border-slate-100 last:border-0 group">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all duration-200 shrink-0">
            <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-0.5">{label}</p>
            <p className={`text-sm font-semibold truncate ${accent || 'text-slate-700'}`}>{value || 'Not provided'}</p>
        </div>
    </div>
);

// ─── Lead Detail Modal ───────────────────────────────────────────────
const LeadDetailModal = ({ isOpen, onClose, selectedLead, adminResponse, setAdminResponse, handleSendResponse, respondMutation, navigate }) => {
    if (!isOpen || !selectedLead) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* ── Dark Gradient Header ── */}
                <div className="relative bg-white px-8 pt-8 pb-10 shrink-0 overflow-hidden">
                    {/* Decorative orbs */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white/70 hover:text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Identity */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shrink-0 ${selectedLead.category === 'TEACHER' ? 'bg-violet-500 shadow-violet-900/50' : 'bg-indigo-500 shadow-indigo-900/50'}`}>
                            {selectedLead.category === 'TEACHER' ? <Briefcase className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-gray-800 tracking-tight leading-tight">{selectedLead.name}</h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedLead.category === 'TEACHER' ? 'bg-violet-400/20 text-violet-300 border border-violet-400/30' : 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30'}`}>
                                    {selectedLead.category}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{selectedLead.source} Enquiry</span>
                            </div>
                        </div>
                    </div>

                    {/* Status pill */}
                    <div className="mt-5 relative z-10">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${selectedLead.status === 'CONVERTED' ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30' : 'bg-amber-400/15 text-amber-400 border border-amber-400/30'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedLead.status === 'CONVERTED' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                            {selectedLead.status === 'CONVERTED' ? 'Converted' : 'Awaiting Action'}
                        </span>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">

                    {/* Contact Details */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Contact Details</p>
                        <div className="bg-slate-50 rounded-2xl px-4 border border-slate-100">
                            <InfoRow icon={Mail} label="Email Address" value={selectedLead.email} />
                            <InfoRow icon={Phone} label="Phone Number" value={selectedLead.contact} />
                            <InfoRow icon={MapPin} label="Location" value={selectedLead.city} />
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Profile Information</p>
                        <div className="bg-slate-50 rounded-2xl px-4 border border-slate-100">
                            <InfoRow icon={GraduationCap} label="Qualification" value={selectedLead.highest_qualification} />
                            <InfoRow icon={Calendar} label="Preferred Mode" value={selectedLead.preferred_mode} accent="text-indigo-600" />
                            {selectedLead.category === 'TEACHER' && (
                                <InfoRow icon={Briefcase} label="Experience" value={selectedLead.experience_name} accent="text-violet-600" />
                            )}
                        </div>
                    </div>

                    {/* Prospect Message */}
                    <div className="relative rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 overflow-hidden">
                        <div className="absolute bottom-2 right-3 opacity-[0.06] pointer-events-none">
                            <MessageSquare className="w-16 h-16 text-indigo-600" />
                        </div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-3">Prospect Message</p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                            "{selectedLead.enquiry_message || 'The user has expressed interest but did not leave a specific message.'}"
                        </p>
                    </div>

                    {/* Conversion Section */}
                    {selectedLead.status === 'CONVERTED' ? (
                        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-800">Already Onboarded</p>
                                <p className="text-xs text-emerald-600 mt-0.5">This lead has been successfully converted into a {selectedLead.category === 'TEACHER' ? 'Trainer' : 'Student'} profile.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-5">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-emerald-800">Convert this Prospect</p>
                                <p className="text-xs text-emerald-600 mt-0.5 font-medium">Pre-fill their details and onboard instantly.</p>
                            </div>
                            <button
                                onClick={() => {
                                    const path = selectedLead.category === 'TEACHER' ? '/admin/trainers/create' : '/admin/students/create';
                                    navigate(path, { state: { leadData: selectedLead } });
                                }}
                                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-emerald-200"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                Convert to {selectedLead.category === 'TEACHER' ? 'Trainer' : 'Student'}
                                <ChevronRight className="w-3 h-3 opacity-70" />
                            </button>
                        </div>
                    )}

                    {/* Admin Response — Event Enquiries */}
                    {selectedLead.source === 'Event' && selectedLead.status !== 'CONVERTED' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Admin Response</p>
                                {selectedLead.responded_at && (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                        Sent · {format(new Date(selectedLead.responded_at), 'dd MMM')}
                                    </span>
                                )}
                            </div>
                            <textarea
                                className="w-full p-4 h-28 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-sm text-slate-700 resize-none placeholder:text-slate-400 font-medium"
                                placeholder="Draft your response to the prospect..."
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                            />
                            <button
                                onClick={handleSendResponse}
                                disabled={respondMutation.isPending}
                                className="w-full bg-slate-900 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {respondMutation.isPending ? 'Transmitting...' : 'Send Response'}
                            </button>
                        </div>
                    )}

                    {/* General Enquiry Notice */}
                    {selectedLead.source !== 'Event' && selectedLead.status !== 'CONVERTED' && (
                        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                <Filter className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                                Unified responder for general enquiries is currently in the production pipeline.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LeadDetailModal;
