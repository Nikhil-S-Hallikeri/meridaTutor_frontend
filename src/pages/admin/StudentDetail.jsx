import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentHistory } from '../../services/students';
import {
    ArrowLeft, User, Phone, MapPin, Calendar,
    BookOpen, CreditCard, Clock, CheckCircle2,
    AlertCircle, FileText, Download, UserCheck,
    Mail, ShieldAlert, GraduationCap, Briefcase,
    ChevronRight, Wallet, History, Info, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { generateReceipt } from '../../services/finance';

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all ${active
            ? 'border-primary text-primary bg-primary/5'
            : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
        <div className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">
            <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value || 'Not provided'}</p>
        </div>
    </div>
);

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isGenerating, setIsGenerating] = useState(null); // stores invoice_id being generated

    const { data: history, isLoading, error, refetch } = useQuery({
        queryKey: ['student-history', id],
        queryFn: () => getStudentHistory(id),
    });

    const handleDownloadReceipt = async (inv) => {
        if (inv.receipt_id) {
            navigate(`/admin/receipts/${inv.receipt_id}`);
            return;
        }

        // If no receipt but has payment, try to generate
        if (inv.amount_paid > 0) {
            try {
                setIsGenerating(inv.invoice_id);
                await generateReceipt({
                    invoiceId: inv.invoice_id,
                    data: { received_by: 'Admin', remarks: 'Auto-generated for download' }
                });
                toast.success("Receipt generated successfully");
                await refetch();
                // Find the updated invoice to get the new receipt_id
                // But refetch() might take a moment, so we can also check the response if we had it.
                // For simplicity, we'll try to navigate based on the assumption that the next refetch will have it.
                // Actually, the generateReceipt service returns the receipt.
            } catch (err) {
                toast.error(err.response?.data?.error || "Failed to generate receipt");
            } finally {
                setIsGenerating(null);
            }
        } else {
            toast.warn("No payment recorded for this invoice yet.");
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em]">Retrieving Profile...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white rounded-4xl border border-gray-100 p-10 mt-10">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-8 max-w-sm">We couldn't load this student's history. This might be due to a connection error or insufficient permissions.</p>
            <button onClick={() => navigate('/admin/students')} className="px-8 py-3 bg-gray-900 text-white font-medium rounded-xl active:scale-95 transition-all">Back to Students</button>
        </div>
    );

    const { profile, enrollments, financial_summary, invoices } = history || {};

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-medium text-2xl">
                            {profile?.name?.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-medium text-gray-900">{profile?.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-widest ${profile?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {profile?.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">ID: {profile?.admission_no}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/students/create', { state: { studentData: profile, isEditMode: true } })}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all active:scale-95"
                    >
                        Modify Profile
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50">
                    <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="General Biodata" />
                    <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={BookOpen} label="Enrollments" />
                    <TabButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={Wallet} label="Financials & Billing" />
                </div>

                <div className="p-8">
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Personal Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-medium text-gray-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-primary" /> Personal File
                                </h3>
                                <DetailItem icon={Mail} label="Email Address" value={profile?.email} />
                                <DetailItem icon={Phone} label="Contact Number" value={profile?.phone} />
                                <DetailItem icon={Calendar} label="Date of Birth" value={profile?.dob} />
                                <DetailItem icon={UserCheck} label="Gender" value={profile?.gender} />
                                <DetailItem icon={MapPin} label="Residential Address" value={profile?.address} />
                                <DetailItem icon={GraduationCap} label="Qualification" value={profile?.qualification} />
                            </div>

                            {/* Guardian Information */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-medium text-gray-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-primary" /> Guardian Details
                                </h3>
                                <DetailItem icon={User} label="Guardian Name" value={profile?.guardian_name} />
                                <DetailItem icon={Briefcase} label="Relation" value={profile?.guardian_relation} />
                                <DetailItem icon={Phone} label="Guardian Contact" value={profile?.guardian_contact} />
                                <DetailItem icon={Phone} label="Emergency Contact" value={profile?.emergency_contact} />
                            </div>

                            {/* System Status */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-medium text-gray-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" /> Administrative
                                </h3>
                                <DetailItem icon={Calendar} label="Join Date" value={profile?.join_date} />
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Special Notes / Observations</p>
                                    <p className="text-sm font-medium text-gray-600 italic">
                                        {profile?.special_notes || "No additional observations recorded for this student."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {enrollments?.map((enroll, idx) => (
                                <div key={idx} className="p-6 rounded-2xl border border-gray-100 hover:border-primary/30 transition-all group bg-white hover:shadow-lg hover:shadow-gray-100/50">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${enroll.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {enroll.status}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-800 mb-1">{enroll.subject_name}</h4>
                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-6">Batch: {enroll.batch_details?.batch_name || 'Generic'}</p>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Total Fee</p>
                                            <p className="font-medium text-gray-800 text-lg">₹{parseFloat(enroll.total_fee).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Tuition Type</p>
                                            <p className="font-medium text-gray-600 text-sm uppercase">{enroll.tuition_type}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {enrollments?.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-gray-400 uppercase">No enrollments detected</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2">Total Receivable</p>
                                    <p className="text-3xl font-medium text-gray-800">₹{financial_summary?.total_fee?.toLocaleString()}</p>
                                </div>
                                <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                                    <p className="text-[10px] font-medium text-green-600 uppercase tracking-widest mb-2">Total Collected</p>
                                    <p className="text-3xl font-medium text-green-700">₹{financial_summary?.total_paid?.toLocaleString()}</p>
                                </div>
                                <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                                    <p className="text-[10px] font-medium text-red-600 uppercase tracking-widest mb-2">Grand Balance</p>
                                    <p className="text-3xl font-medium text-red-700">₹{financial_summary?.pending_amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Invoices Table */}
                            <div className="bg-white rounded-3xl border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-medium text-gray-800 uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                                        <History className="w-4 h-4 text-primary" /> Invoice History
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50">
                                            <tr className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                                <th className="px-6 py-4">Reference No</th>
                                                <th className="px-6 py-4">Subject/Course</th>
                                                <th className="px-6 py-4">Due Date</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {invoices?.map((inv, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-5 text-sm font-medium text-gray-700">{inv.invoice_number}</td>
                                                    <td className="px-6 py-5 text-sm font-semibold text-gray-600">{inv.subject_name}</td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {format(new Date(inv.due_date), 'dd MMM yyyy')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-medium text-gray-800">₹{parseFloat(inv.total_amount).toLocaleString()}</p>
                                                        <p className="text-[10px] font-medium text-green-600">Paid: ₹{parseFloat(inv.amount_paid).toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-widest border ${inv.payment_status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                                            }`}>
                                                            {inv.payment_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            disabled={inv.amount_paid <= 0 || isGenerating === inv.invoice_id}
                                                            onClick={() => handleDownloadReceipt(inv)}
                                                            className={`p-2 rounded-lg transition-all active:scale-90 ${inv.amount_paid > 0
                                                                ? 'hover:bg-primary hover:text-white text-gray-400'
                                                                : 'text-gray-200 cursor-not-allowed'
                                                                }`}
                                                            title={inv.amount_paid > 0 ? "Download Receipt" : "No payment recorded"}
                                                        >
                                                            {isGenerating === inv.invoice_id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Download className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
