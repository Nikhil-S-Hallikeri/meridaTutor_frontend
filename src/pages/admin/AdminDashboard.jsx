import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
    // Mock data representing the colorful cards in your Figma
    const stats = [
        { title: 'New Enquiry', count: '201', date: 'Jul 21 - Oct 21', bg: 'bg-gradient-to-br from-pink-400 to-purple-500' },
        { title: 'Enquires Pending', count: '201', date: 'Jul 21 - Oct 21', bg: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
        { title: 'Tuition Requests', count: '201', date: 'Jul 21 - Oct 21', bg: 'bg-gradient-to-br from-blue-400 to-blue-600' },
        { title: 'Converted Enrolls', count: '201', date: 'Jul 21 - Oct 21', bg: 'bg-gradient-to-br from-orange-400 to-orange-500' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Top Colorful Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`${stat.bg} rounded-3xl p-6 text-white shadow-lg relative overflow-hidden h-40 flex flex-col justify-between`}>
                        {/* Background decorative element to mimic Figma waves/charts */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

                        <h3 className="text-lg font-medium opacity-90">{stat.title}</h3>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-4xl font-bold">{stat.count}</p>
                                <p className="text-sm opacity-80 mt-1">{stat.date}</p>
                            </div>
                            {/* Dummy chart graphic placeholder */}
                            <div className="flex items-end gap-1 opacity-70">
                                <div className="w-1.5 h-6 bg-white rounded-t-sm"></div>
                                <div className="w-1.5 h-10 bg-white rounded-t-sm"></div>
                                <div className="w-1.5 h-8 bg-white rounded-t-sm"></div>
                                <div className="w-1.5 h-12 bg-white rounded-t-sm"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area (To be filled with Tables later) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 bg-white rounded-3xl shadow-sm p-6 min-h-[400px]">
                    <h3 className="text-xl font-bold mb-4">Lost Enrollment</h3>
                    {/* We will build this table next */}
                    <p className="text-gray-500">Table loading...</p>
                </div>

                <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm p-6 min-h-[400px]">
                    <h3 className="text-xl font-bold mb-4">Enrollment Lists</h3>
                    {/* We will build this table next */}
                    <p className="text-gray-500">Table loading...</p>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;