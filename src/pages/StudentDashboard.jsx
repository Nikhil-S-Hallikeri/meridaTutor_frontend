import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getStudentHistory, createClassReview } from '../services/students';
import {
    GraduationCap,
    BookOpen,
    CalendarCheck,
    Star,
    TrendingUp,
    CreditCard,
    MessageSquare,
    CheckCircle2,
    Clock,
    Printer
} from 'lucide-react';
import { toast } from 'react-toastify';

const RatingModal = ({ enrollment, isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [tags, setTags] = useState([]);

    const mutation = useMutation({
        mutationFn: createClassReview,
        onSuccess: () => {
            queryClient.invalidateQueries(['student-history']);
            toast.success("Feedback submitted! Thank you.");
            onClose();
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-[pop_0.3s_ease-out]">
                <div className="p-10 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-yellow-50 flex items-center justify-center mx-auto mb-6 rotate-12">
                        <Star className="w-10 h-10 text-yellow-500 fill-yellow-500 -rotate-12" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-800 tracking-tight mb-2">Reflect on your class</h3>
                    <p className="text-gray-400 text-sm font-medium mb-8">How was your experience with <span className="text-gray-700 font-medium">{enrollment.subject_name}</span>?</p>

                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90">
                                <Star className={`w-8 h-8 ${s <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you like the most? (Optional)"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 text-sm font-medium text-gray-700 focus:border-primary/30 outline-none transition-all resize-none mb-8 h-24"
                    />

                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl bg-gray-50 text-gray-400 font-medium hover:bg-gray-100 transition-all text-sm border border-gray-100">
                            Dismiss
                        </button>
                        <button
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({
                                enrollment: enrollment.enrollment_id,
                                rating: rating,
                                review_text: comment,
                                understanding_level: 5, // Default for now
                                pace_rating: 3
                            })}
                            className="flex-2 px-8 py-4 rounded-2xl bg-primary text-white font-medium hover:bg-primary/90 transition-all text-sm shadow-xl shadow-primary/20"
                        >
                            {mutation.isPending ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    const { data: history, isLoading } = useQuery({
        queryKey: ['student-history', user?.student_id],
        queryFn: () => getStudentHistory(user?.student_id),
        enabled: !!user?.student_id
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2"></div>
            <p className="text-gray-400 font-medium uppercase tracking-widest animate-pulse">Designing your learning path...</p>
        </div>
    );

    const activeEnrollments = history?.enrollment_history?.filter(e => e.status === 'active') || [];
    const attendanceStats = history?.attendance_summary || { presence_percentage: 0, total_sessions: 0 };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-medium text-gray-800 tracking-tighter">Hello, <span className="text-primary">{user?.name || 'Student'}</span>!</h1>
                    <p className="text-gray-500 font-medium mt-1">Ready for today's learning journey?</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <CalendarCheck className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-widest">Attendance: {attendanceStats.presence_percentage}%</span>
                    </div>
                </div>
            </div>

            {/* Courses Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {activeEnrollments.length > 0 ? activeEnrollments.map((enrollment, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-3xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-300 uppercase tracking-[0.2em]">Active Course</span>
                        </div>
                        <h3 className="text-2xl font-medium text-gray-800 mb-2 tracking-tight capitalize">{enrollment.subject_name}</h3>
                        <p className="text-gray-400 text-sm font-medium mb-8">Batch: <span className="text-gray-600 font-medium">{enrollment.batch_name || 'Individual'}</span></p>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                            <button
                                onClick={() => setSelectedEnrollment(enrollment)}
                                className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
                            >
                                <Star className="w-4 h-4" /> Rate Trainer
                            </button>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                <Clock className="w-3.5 h-3.5" /> Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                        <GraduationCap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium uppercase tracking-widest">No Active Enrollments Found</p>
                    </div>
                )}
            </div>

            {/* Invoices & Fee Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" /> Fee Invoices
                        </h2>
                    </div>
                    {history?.invoice_history?.length > 0 ? (
                        <div className="space-y-4">
                            {history.invoice_history.slice(0, 3).map((inv, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${inv.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">#{inv.invoice_number}</p>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Due: {inv.due_date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-800">₹{inv.total_amount}</p>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[9px] font-medium uppercase tracking-widest ${inv.payment_status === 'paid' ? 'text-green-500' : 'text-red-400'}`}>
                                                {inv.payment_status}
                                            </span>
                                            {inv.payment_status === 'paid' && inv.has_receipt && (
                                                <a
                                                    href={`/admin/receipts/${inv.receipt_id}`}
                                                    className="text-[9px] font-medium text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <Printer className="w-2.5 h-2.5" /> Receipt
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic py-10 text-center">No invoice history available.</p>
                    )}
                </div>

                {/* Progress / Motivation Sidebar */}
                <div className="bg-linear-to-br from-primary to-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-primary/20">
                    <TrendingUp className="w-10 h-10 mb-8 opacity-50" />
                    <h2 className="text-2xl font-medium tracking-tight mb-4">Academic Progress</h2>
                    <p className="text-white/80 text-sm font-medium leading-relaxed mb-8">You've completed <span className="font-medium text-white">{attendanceStats.total_sessions} sessions</span> this term. Keep up the great momentum!</p>
                    <div className="space-y-6">
                        <div className="bg-white/10 p-5 rounded-3xl border border-white/10">
                            <h4 className="text-[10px] font-medium uppercase tracking-widest mb-1 opacity-70">Focus Areas</h4>
                            <p className="text-sm font-medium">Standardized Learning</p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-3xl border border-white/10">
                            <h4 className="text-[10px] font-medium uppercase tracking-widest mb-1 opacity-70">Next Class</h4>
                            <p className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Check your schedule
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <RatingModal
                isOpen={!!selectedEnrollment}
                enrollment={selectedEnrollment}
                onClose={() => setSelectedEnrollment(null)}
            />
        </div>
    );
};

// Internal utility since I used FileText icon from lucide locally in the mapping
const FileText = ({ className }) => <Printer className={className} />;

export default StudentDashboard;
