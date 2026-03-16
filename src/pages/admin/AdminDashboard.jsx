import {
  Users,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Search,
  UserPlus,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  LayoutGrid,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DataTable from '../../components/DataTable';
import RevenueChart from '../../components/RevenueChart';
import { useQuery } from '@tanstack/react-query';
import { getRevenueData, getStudentAnalytics, getMonthlyTrend } from '../../services/analytics';
import { getStudents } from '../../services/students';
import { getLeads } from '../../services/leads';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // 1. Fetch Real Data
  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['revenue'],
    queryFn: getRevenueData
  });

  const { data: studentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['student-analytics'],
    queryFn: getStudentAnalytics
  });

  const { data: recentEnrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: getStudents
  });

  const { data: monthlyTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: getMonthlyTrend
  });

  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['recent-leads'],
    queryFn: getLeads
  });

  const isLoading = revLoading || statsLoading || enrollLoading || trendLoading || leadsLoading;

  const handleRefresh = () => {
    refetchLeads();
    toast.success('Dashboard data updated');
  };

  // 2. Map real data to Stats Cards
  const stats = [
    {
      title: 'Total Students',
      value: studentStats?.summary?.total_students || '0',
      description: `${studentStats?.summary?.active_students || 0} currently active`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      accentBg: 'bg-blue-50/50',
      accentBorder: 'border-blue-100',
      trend: { value: '12%', isUp: true, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' }
    },
    {
      title: 'Monthly Enrolls',
      value: monthlyTrend?.summary?.total_enrollments || '0',
      description: `Growth from last month`,
      icon: <UserPlus className="w-5 h-5 text-indigo-600" />,
      accentBg: 'bg-indigo-50/50',
      accentBorder: 'border-indigo-100',
      trend: { value: `${monthlyTrend?.summary?.latest_month_growth_rate || 0}%`, isUp: true, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' }
    },
    {
      title: 'Active Tutors',
      value: revenueData?.summary?.active_tutors || '0',
      description: `${revenueData?.summary?.total_classes || 0} classes assigned`,
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      accentBg: 'bg-emerald-50/50',
      accentBorder: 'border-emerald-100',
      trend: { value: '4%', isUp: true, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' }
    },
    {
      title: 'Total Revenue',
      value: `₹${revenueData?.summary?.total_earnings?.toLocaleString() || '0'}`,
      description: `₹${revenueData?.summary?.total_pending?.toLocaleString() || 0} pending`,
      icon: <CreditCard className="w-5 h-5 text-orange-600" />,
      accentBg: 'bg-orange-50/50',
      accentBorder: 'border-orange-100',
      trend: { value: '8%', isUp: true, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' }
    },
  ];

  // ... (rest of column definitions)


  // 3. Table Column Definitions
  const lostColumns = [
    {
      header: 'Student',
      accessor: 'name',
      render: (row) => <span className="font-semibold text-gray-800">{row.name}</span>
    },
    {
      header: 'Reason',
      accessor: 'special_notes',
      render: (row) => <span className="text-gray-500 text-xs italic">{row.special_notes || 'No notes provided'}</span>
    },
  ];

  const enrollColumns = [
    {
      header: 'Student',
      accessor: 'name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 tracking-tight">{row.name}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row.admission_no}</span>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'phone',
      render: (row) => <span className="text-gray-500 font-medium">{row.phone}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${row.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
          }`}>
          {row.status}
        </span>
      )
    },
  ];

  const allStudents = recentEnrollments?.results || [];
  const lostData = allStudents.filter(s => s.status === 'inactive').slice(0, 4);
  const enrollData = allStudents.slice(0, 6);

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in custom-scrollbar overflow-y-auto pb-8 pr-2">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] italic">Comprehensive insights for institutional governance</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition-all active:scale-95"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
              Live Status
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </span>
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl text-gray-400 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Simplified Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.accentBg} border ${stat.accentBorder} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.trend.color} ${stat.trend.bg} px-2 py-1 rounded-lg border ${stat.trend.border}`}>
                {stat.trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend.value}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.title}</p>
              <h3 className="text-2xl font-medium text-gray-800 leading-none tracking-tight">
                {isLoading ? <span className="animate-pulse opacity-20">---</span> : stat.value}
              </h3>
              <p className="text-[10px] font-medium text-gray-400 italic mt-2">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Financial Performance</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Revenue vs Receivables Flow</p>
            </div>
            <div className="flex bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
              <button className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-white shadow-sm border border-gray-100 text-primary rounded-xl">Historical</button>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-50">
                <div className="w-10 h-10 border-3 border-gray-100 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Computing Aggregates...</span>
              </div>
            ) : (
              <RevenueChart data={revenueData?.data || []} />
            )}
          </div>
        </div>

        {/* Action Center - Refined & Simplified */}
        <div className="space-y-8 h-full flex flex-col">

          {/* Quick Actions Card */}
          <div className="bg-gray-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-50" />
            <h4 className="text-[10px] font-extrabold text-white/50 uppercase tracking-[0.3em] mb-8">Administrative Actions</h4>

            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={() => window.print()}
                className="w-full py-4 bg-white text-gray-900 rounded-2xl font-medium text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Print Dashboard
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/admin/leads')}
                className="w-full py-4 bg-white/10 text-white border border-white/10 rounded-2xl font-medium text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Manage All Leads
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activity Mini List - REPLACED PROSPECTS WITH RECENT LEADS */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-8 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">Recent Leads</h3>
              <span className="p-1 px-3 bg-indigo-50 text-indigo-500 rounded-full text-[9px] font-bold uppercase tracking-widest">Global Feed</span>
            </div>

            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
              {!isLoading && leads?.slice(0, 5).map((lead, i) => (
                <div
                  key={lead.id}
                  onClick={() => navigate('/admin/leads')}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/80 border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-medium text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                    {lead.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h5 className="text-[9px] font-bold text-gray-300 uppercase tracking-widest truncate max-w-[120px]">{lead.type || 'Inquiry'}</h5>
                    <p className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{lead.name}</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowUpRight className="w-3 h-3 text-primary" />
                  </div>
                </div>
              ))}
              {!isLoading && (!leads || leads.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-10">
                  <Clock className="w-10 h-10 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Recent Leads</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualization Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">

        {/* Table Breakage Fixed Container 1 */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-800">Retention Risk Alpha</h3>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Priority Attrition Monitoring</p>
            </div>
            <button className="p-2 text-gray-300 hover:text-gray-500"><MoreHorizontal className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 w-full overflow-hidden">
            <div className="min-w-full inline-block align-middle overflow-x-auto custom-scrollbar pb-2">
              <DataTable columns={lostColumns} data={lostData} />
              {lostData.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zero Attrition Detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Breakage Fixed Container 2 */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-800">Live Enrollments</h3>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest italic">Real-time Admission Feed</p>
            </div>
            <div className="relative group w-full sm:w-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="ID Lookup..."
                className="pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 text-[10px] font-bold uppercase tracking-widest rounded-2xl w-full sm:w-48 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="flex-1 w-full overflow-hidden">
            <div className="min-w-full inline-block align-middle overflow-x-auto custom-scrollbar pb-2">
              <DataTable columns={enrollColumns} data={enrollData} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;

