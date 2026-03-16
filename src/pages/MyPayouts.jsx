import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getTutorHistory } from '../services/tutors';
import {
    Wallet,
    TrendingUp,
    Clock,
    DollarSign,
    BookOpen,
    ArrowUpRight,
    Search,
    Filter
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

const MyPayouts = () => {
    const { user } = useContext(AuthContext);

    const { data: history, isLoading } = useQuery({
        queryKey: ['tutor-payout-history', user?.tutor_id],
        queryFn: () => getTutorHistory(user?.tutor_id),
        enabled: !!user?.tutor_id
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2"></div>
            <p className="text-gray-400 font-medium uppercase tracking-widest animate-pulse">Calculating Revenue History...</p>
        </div>
    );

    const stats = {
        total_earned: history?.total_earnings || 0,
        total_paid: history?.total_paid || 0,
        pending_amount: history?.total_pending || 0
    };

    const recentPayments = history?.payment_history || [];
    const currentBatches = history?.current_batches || [];
    const earningBySubject = history?.earning_summary_by_subject || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-medium text-gray-800 tracking-tighter">My Payouts</h1>
                    <p className="text-gray-500 font-medium mt-1">Track your batch earnings and payment history.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Earned"
                    value={`₹${stats.total_earned.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-primary"
                    subtitle="Lifetime Revenue"
                />
                <StatCard
                    title="Net Received"
                    value={`₹${stats.total_paid.toLocaleString()}`}
                    icon={Wallet}
                    color="bg-green-500"
                    subtitle="Settled Bank Transfers"
                />
                <StatCard
                    title="Pending Payout"
                    value={`₹${stats.pending_amount.toLocaleString()}`}
                    icon={Clock}
                    color="bg-orange-500"
                    subtitle="Available for Release"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Side: Current Batches & Earnings */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" /> Batch Earnings Breakdown
                            </h2>
                        </div>
                        {currentBatches.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Batch Info</th>
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">Sessions</th>
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-right">Earned Amount</th>
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
                                                <td className="py-4 text-right">
                                                    <span className="text-sm font-bold text-primary">₹{batch.total_earned.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center grayscale opacity-60">
                                <BookOpen className="w-12 h-12 text-gray-200 mb-2" />
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">No Active Batches Found</p>
                            </div>
                        )}
                    </div>

                    {/* Earnings Subject Summary */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" /> Monthly Subject Summary
                            </h2>
                        </div>
                        {earningBySubject.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Subject</th>
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Month</th>
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Earned</th>
                                            <th className="pb-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-right">Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {earningBySubject.map((earn, i) => (
                                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 text-sm font-medium text-gray-700">{earn.subject}</td>
                                                <td className="py-4 text-xs font-medium text-gray-400 italic">{earn.month}</td>
                                                <td className="py-4 text-sm font-semibold text-gray-800">₹{earn.total_earned.toLocaleString()}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`text-[10px] font-medium px-2 py-1 rounded-lg uppercase tracking-widest ${earn.pending_amount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                                        ₹{earn.pending_amount.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center grayscale opacity-60">
                                <TrendingUp className="w-12 h-12 text-gray-200 mb-2" />
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">No Earnings Summary Found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Recent Payouts History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" /> Payout History
                            </h2>
                        </div>
                        {recentPayments.length > 0 ? (
                            <div className="space-y-4">
                                {recentPayments.map((payment, i) => (
                                    <div key={i} className="p-4 rounded-3xl border border-gray-50 bg-gray-50/30 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">₹{payment.amount.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{new Date(payment.paid_on).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-green-100 text-green-600 text-[9px] font-medium px-2 py-1 rounded-lg uppercase tracking-widest">Settled</span>
                                            <p className="text-[9px] text-gray-300 font-mono mt-1">{payment.transaction_id || 'ID-N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center grayscale opacity-60">
                                <DollarSign className="w-12 h-12 text-gray-200 mb-2" />
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">No Settlements Yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPayouts;
