import { useQuery } from '@tanstack/react-query';
import { getReviews } from '../../services/reviews';
import DataTable from '../../components/DataTable';
import {
    Star,
    MessageCircle,
    TrendingUp,
    Users,
    Filter,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';

const AdminReviews = () => {
    const { data: reviews, isLoading } = useQuery({
        queryKey: ['admin-reviews'],
        queryFn: () => getReviews()
    });

    const averageRating = reviews?.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const columns = [
        {
            header: 'Student',
            accessor: 'student_name',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{row.student_name}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Enrolment ID: {row.enrollment}</span>
                </div>
            )
        },
        {
            header: 'Trainer',
            accessor: 'tutor_name',
            render: (row) => (
                <span className="text-xs font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100">
                    {row.tutor_name || 'Assigned Tutor'}
                </span>
            )
        },
        {
            header: 'Rating',
            accessor: 'rating',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <span className={`font-medium text-sm ${row.rating >= 4 ? 'text-green-500' : 'text-orange-500'}`}>{row.rating}</span>
                    <Star className={`w-3.5 h-3.5 ${row.rating >= 4 ? 'text-green-500 fill-green-500' : 'text-orange-500 fill-orange-500'}`} />
                </div>
            )
        },
        {
            header: 'Feedback',
            accessor: 'review_text',
            render: (row) => (
                <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    <p className="text-xs italic text-gray-500">"{row.review_text || 'No comment provided'}"</p>
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'created_at',
            render: (row) => (
                <span className="text-[10px] font-medium text-gray-400">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-medium text-gray-800 tracking-tighter">Quality Control</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor trainer performance through student feedback.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Avg Rating
                        </span>
                        <span className="text-2xl font-medium text-gray-800">{averageRating}</span>
                    </div>
                </div>
            </div>

            {/* Top Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/5 p-6 rounded-4xl border border-primary/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-primary uppercase tracking-widest">Satisfaction Score</p>
                        <p className="text-xl font-medium text-gray-800">{(averageRating * 20).toFixed(0)}% <span className="text-xs font-medium text-gray-400">High</span></p>
                    </div>
                </div>
                <div className="bg-green-50 p-6 rounded-4xl border border-green-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-green-600 uppercase tracking-widest">Reviews Tracked</p>
                        <p className="text-xl font-medium text-gray-800">{reviews?.length || 0}</p>
                    </div>
                </div>
                <div className="bg-orange-50 p-6 rounded-4xl border border-orange-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-orange-600 uppercase tracking-widest">Improvements Flagged</p>
                        <p className="text-xl font-medium text-gray-800">{reviews?.filter(r => r.rating < 3).length || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 min-h-[500px]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-medium text-gray-800 tracking-tight flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary" /> Live Feedback Feed
                    </h3>
                    <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-60 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2"></div>
                        <p className="text-gray-400 font-medium uppercase tracking-widest animate-pulse">Aggregating Quality Metrics...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={reviews || []}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
