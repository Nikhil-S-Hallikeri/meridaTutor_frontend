import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getTutorHistory } from '../services/tutors';
import {
    BookOpen,
    Award,
    Users
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {subtitle && <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{subtitle}</span>}
        </div>
        <div>
            <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-2xl font-medium text-gray-800 tracking-tight">{value}</p>
        </div>
    </div>
);

const TutorDashboard = () => {
    const { user } = useContext(AuthContext);

    const { data: history, isLoading } = useQuery({
        queryKey: ['tutor-history', user?.tutor_id],
        queryFn: () => getTutorHistory(user?.tutor_id),
        enabled: !!user?.tutor_id
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2"></div>
            <p className="text-gray-400 font-medium uppercase tracking-widest animate-pulse">Initializing Trainer Analytics...</p>
        </div>
    );

    const recentReviews = history?.recent_reviews || [];
    const currentBatches = history?.current_batches || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-medium text-gray-800 tracking-tighter">Welcome back, <span className="text-primary">{user?.name || 'Trainer'}</span>!</h1>
                    <p className="text-gray-500 font-medium mt-1">Here's a summary of your classes and performance for this month.</p>
                </div>
                <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-widest">Live Status: Active</span>
                </div>
            </div>

            {/* Top Stats Grid - Focus on Performance & Scale */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Average Rating"
                    value={`${history?.average_rating || 0} / 5`}
                    icon={Award}
                    color="bg-primary"
                    subtitle="Student Satisfaction"
                />
                <StatCard
                    title="Active Students"
                    value={currentBatches.reduce((acc, b) => acc + (b.student_count || 0), 0) || 0}
                    icon={Users}
                    color="bg-indigo-500"
                    subtitle="Current Reach"
                />
                <StatCard
                    title="Total Sessions"
                    value={history?.total_classes_conducted || 0}
                    icon={BookOpen}
                    color="bg-green-500"
                    subtitle="Lifetime Engagement"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Batches Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" /> Active Batches & Activities
                            </h2>
                        </div>
                        {currentBatches.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Batch Name</th>
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">Sessions</th>
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">Student Count</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {currentBatches.map((batch, i) => (
                                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">{batch.batch_name}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{batch.subject}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="text-sm font-semibold text-gray-800">{batch.classes_conducted}</span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="text-sm font-medium text-gray-600">{batch.student_count}/{batch.max_capacity}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center grayscale opacity-60">
                                <BookOpen className="w-12 h-12 text-gray-200 mb-2" />
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">No Active Batches Assigned</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Summary (Right Sidebar) */}
                <div className="lg:col-span-1">
                    <div className="bg-primary/5 rounded-[3rem] p-8 border border-primary/10 h-full">
                        <h2 className="text-xl font-medium tracking-tight flex items-center gap-2 mb-6 text-primary">
                            <Award className="w-5 h-5 text-primary" /> Performance Overview
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/5 flex items-center gap-6">
                                <div className="text-4xl font-bold text-primary">{history?.average_rating || 0}</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Average Rating</p>
                                    <div className="flex gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Award key={star} className={`w-3 h-3 ${star <= (history?.average_rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest px-2">Student Feedback Snippets</p>
                                {recentReviews.slice(0, 4).map((review, i) => (
                                    <div key={i} className="bg-white/50 p-4 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-gray-800">{review.student_name}</span>
                                            <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{review.rating} ★</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{review.review_text}"</p>
                                    </div>
                                ))}
                                {recentReviews.length === 0 && (
                                    <p className="text-xs text-gray-400 italic px-2 text-center py-4">No reviews recorded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;
