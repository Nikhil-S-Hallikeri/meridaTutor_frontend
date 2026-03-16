import React, { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getBatchAttendanceSummary } from '../../services/batches';
import { getLogsheetByBatchAndDate, submitLogsheet, updateLogsheet, getLogsheetsByBatch } from '../../services/attendance';
import { Calendar, Users, ChevronLeft, ChevronRight, Loader2, ArrowLeft, CheckCircle2, XCircle, AlertCircle, TrendingUp, Target, CheckCircle, BarChart3, FileText, CalendarDays } from 'lucide-react';
import { format, addMonths, subMonths, isSameDay } from 'date-fns';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const BatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
    const isStudent = user?.role === 'STUDENT';
    const [activeTab, setActiveTab] = useState('details');

    // Monthly Summary State (for Details tab or general overview)
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const monthStr = format(selectedMonth, 'yyyy-MM');

    // Daily Attendance State
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'present' | 'absent' | 'half_day' }
    const [topic, setTopic] = useState('');
    const [remarks, setRemarks] = useState('');

    // Fetch Batch Details & Monthly Summary
    const { data: batchData, isLoading: isBatchLoading } = useQuery({
        queryKey: ['batchAttendance', id, monthStr],
        queryFn: () => getBatchAttendanceSummary(id, monthStr),
        enabled: !!id,
    });

    // Fetch Daily Logsheet for selected date
    const { data: dailyLogsheet, isLoading: isDailyLoading } = useQuery({
        queryKey: ['dailyLogsheet', id, attendanceDate],
        queryFn: () => getLogsheetByBatchAndDate(id, attendanceDate),
        enabled: !!id && !!attendanceDate,
    });

    // Fetch Trainer Logs
    const { data: trainerLogs, isLoading: isLogsLoading } = useQuery({
        queryKey: ['trainerLogs', id],
        queryFn: () => getLogsheetsByBatch(id),
        enabled: !!id && (activeTab === 'logs' || isStudent),
    });

    // Initialize/Update daily attendance data when logsheet or batch changes
    useEffect(() => {
        if (batchData?.batch_details && activeTab === 'attendance') {
            const initialData = {};

            // Map existing logsheet if found
            if (dailyLogsheet) {
                dailyLogsheet.present_students?.forEach(sid => initialData[sid] = 'present');
                dailyLogsheet.absent_students?.forEach(sid => initialData[sid] = 'absent');
                dailyLogsheet.half_day_students?.forEach(sid => initialData[sid] = 'half_day');
                setTopic(dailyLogsheet.topic_covered || '');
                setRemarks(dailyLogsheet.remarks || '');
            } else {
                // Default to 'present' for all enrolled students if no logsheet exists
                // Or leave empty if preferred. Based on typical UX, we might want them marked as something.
                // But looking at the image, they are being marked on-the-fly.
                setTopic('');
                setRemarks('');
            }
            setAttendanceData(initialData);
        }
    }, [dailyLogsheet, batchData, activeTab]);

    const handleToggle = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const submitMutation = useMutation({
        mutationFn: (data) => dailyLogsheet ? updateLogsheet(dailyLogsheet.id, data) : submitLogsheet(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['dailyLogsheet', id, attendanceDate]);
            queryClient.invalidateQueries(['batchAttendance', id, monthStr]);
            toast.success(dailyLogsheet ? "Attendance updated!" : "Attendance marked successfully!");
        },
        onError: () => toast.error("Failed to save attendance.")
    });

    const handleSubmit = () => {
        if (!topic.trim()) {
            return toast.error("Please enter the topic covered.");
        }

        const payload = {
            batch: parseInt(id),
            tutor: batchData.batch_details.tutor_id || null, // Ensure tutor ID is passed
            date: attendanceDate,
            topic_covered: topic,
            remarks: remarks,
            present_students: Object.keys(attendanceData).filter(sid => attendanceData[sid] === 'present').map(sid => parseInt(sid)),
            absent_students: Object.keys(attendanceData).filter(sid => attendanceData[sid] === 'absent').map(sid => parseInt(sid)),
            half_day_students: Object.keys(attendanceData).filter(sid => attendanceData[sid] === 'half_day').map(sid => parseInt(sid)),
        };

        // Fallback: If tutor isn't in batch_details, we might need to handle it.
        // Based on backend LogSheet model, tutor is required.
        submitMutation.mutate(payload);
    };

    const handlePrevMonth = () => setSelectedMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1));

    if (isBatchLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-gray-500 font-medium italic">Synchronizing Batch Records...</p>
            </div>
        );
    }

    const { batch_details, attendance } = batchData || {};

    // Calculate daily summary from local state
    const dailySummary = {
        present: Object.values(attendanceData).filter(v => v === 'present').length,
        absent: Object.values(attendanceData).filter(v => v === 'absent').length,
        halfDay: Object.values(attendanceData).filter(v => v === 'half_day').length,
    };
    const totalSelected = Object.keys(attendanceData).length;
    const attendanceRate = totalSelected > 0
        ? Math.round(((dailySummary.present + (dailySummary.halfDay * 0.5)) / (batch_details?.total_students || 1)) * 100)
        : 0;

    return (
        <div className="flex flex-col h-full space-y-2 -mt-5">
            {/* Header / Breadcrumb area */}
            <div className="flex flex-col gap-1">
                <button
                    onClick={() => navigate(isStudent ? '/admin/batches' : '/admin/batches')}
                    className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-xs font-medium uppercase tracking-widest mb-2"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Batches
                </button>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-medium text-gray-800 tracking-tight">
                        {batch_details?.batch_name}
                    </h1>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest rounded-full">
                        {batch_details?.subject_name}
                    </span>
                </div>
            </div>

            {/* Batch Progress Dashboard (Production Hybrid Approach) */}
            {batch_details && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Target Sessions</p>
                            <h3 className="text-2xl font-medium text-gray-800">{batch_details.total_sessions_planned || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Target className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Classes Done</p>
                            <h3 className="text-2xl font-medium text-emerald-600">{batch_details.total_classes_conducted || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Completion %</p>
                            <h3 className="text-2xl font-medium text-primary">{batch_details.completion_percentage || 0}%</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center hover:shadow-md transition-all group">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-600 transition-colors">Latest Topic</p>
                        <p className="text-sm font-bold text-gray-700 truncate" title={batch_details.last_topic_covered || 'N/A'}>
                            {batch_details.last_topic_covered || 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            {!isStudent && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">

                    {/* Header Tabs - Image Matched Style */}
                    <div className="flex items-center space-x-2 px-6 pt-4 border-b border-gray-100 bg-gray-50/30">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-3 px-6 text-sm font-semibold tracking-tight transition-all rounded-t-xl ${activeTab === 'details' ? 'bg-white text-primary border-t border-x border-gray-100' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Class Details
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`py-3 px-6 text-sm font-semibold tracking-tight transition-all rounded-t-xl flex items-center gap-2 ${activeTab === 'attendance' ? 'bg-white text-primary border-t border-x border-gray-100' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Users className="w-4 h-4" /> Student Attendance
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`py-3 px-6 text-sm font-semibold tracking-tight transition-all rounded-t-xl flex items-center gap-2 ${activeTab === 'logs' ? 'bg-white text-primary border-t border-x border-gray-100' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <FileText className="w-4 h-4" /> Trainer Logs
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    {activeTab === 'details' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Monthly View Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-medium text-gray-800 tracking-tight">Monthly Overview</h2>
                                <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1">
                                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg text-gray-400 transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                                    <span className="px-4 text-xs font-medium text-gray-600 tracking-tight min-w-[100px] text-center">{format(selectedMonth, 'MMM yyyy')}</span>
                                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg text-gray-400 transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Batch/section name</p>
                                        <p className="text-sm font-semibold text-gray-700">{batch_details?.batch_name}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Subject</p>
                                        <p className="text-sm font-semibold text-primary">{batch_details?.subject_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Class teacher</p>
                                        <p className="text-sm font-semibold text-gray-700">{batch_details?.tutor_name}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Academic Year</p>
                                        <p className="text-sm font-semibold text-gray-700">{batch_details?.academic_year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance History Table (Same as before but moved to details tab as history) */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest text-center">SI No</th>
                                            <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest">Student Name</th>
                                            <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest text-center">Present</th>
                                            <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest text-center">Absent</th>
                                            <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest text-center">Half Days</th>
                                            <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest text-center">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {attendance?.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4 text-center text-xs font-semibold text-gray-400 italic">{row.si_no}</td>
                                                <td className="px-6 py-4">
                                                    {isAdmin ? (
                                                        <span onClick={() => navigate(`/admin/students/${row.student_id}`)} className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                                            {row.student_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {row.student_name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-semibold text-emerald-600">{row.present_days}</td>
                                                <td className="px-6 py-4 text-center text-sm font-semibold text-red-500">{row.absent_days}</td>
                                                <td className="px-6 py-4 text-center text-sm font-semibold text-orange-500">{row.half_days}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${row.attendance_percentage > 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                                        {row.attendance_percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeTab === 'logs' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-medium text-gray-800 tracking-tight">Trainer Logs & Syllabus</h2>
                                    <p className="text-xs font-medium text-gray-400 italic">History of classes covered by the trainer</p>
                                </div>
                            </div>

                            {isLogsLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest">Topic Covered</th>
                                                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest">Trainer Name</th>
                                                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest text-center">Students Attended</th>
                                                <th className="px-6 py-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {trainerLogs?.length > 0 ? (
                                                trainerLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                                <CalendarDays className="w-4 h-4 text-gray-400" />
                                                                {format(new Date(log.date), 'MMM dd, yyyy')}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-semibold text-gray-800 text-sm">
                                                            {log.topic_covered}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-primary">
                                                            {log.tutor_name || batch_details?.tutor_name}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                {log.present_students?.length || 0} Present
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 italic max-w-[200px] truncate" title={log.remarks}>
                                                            {log.remarks || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm italic">
                                                        No classes have been logged for this batch yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'attendance' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Left Column: Take Attendance */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-medium text-gray-800 tracking-tight">Take Attendance</h2>
                                    <p className="text-xs font-medium text-gray-400 italic">Record attendance for today's class</p>
                                </div>

                                {/* Date Selector */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Date</label>
                                    <div className="relative max-w-xs">
                                        <input
                                            type="date"
                                            value={attendanceDate}
                                            onChange={(e) => setAttendanceDate(e.target.value)}
                                            className="w-full p-3 pl-10 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-semibold text-gray-700"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60" />
                                    </div>
                                </div>

                                {/* Student List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Students in class</label>
                                        <span className="text-[10px] font-medium text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">{batch_details?.total_students} Enrolled</span>
                                    </div>

                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {batchData?.attendance?.map((student, idx) => {
                                            const status = attendanceData[student.student_id];
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium text-sm border border-gray-50 group-hover:border-primary group-hover:text-primary transition-colors">
                                                            {student.student_name?.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 tracking-tight">{student.student_name}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggle(student.student_id, 'present')}
                                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-widest transition-all flex items-center gap-1.5 ${status === 'present'
                                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 border-transparent'
                                                                : 'bg-white text-emerald-500 border border-emerald-100 hover:bg-emerald-50'
                                                                }`}
                                                        >
                                                            {status === 'present' && <CheckCircle2 className="w-3 h-3" />} ✓ Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggle(student.student_id, 'absent')}
                                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-widest transition-all flex items-center gap-1.5 ${status === 'absent'
                                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 border-transparent'
                                                                : 'bg-white text-rose-500 border border-rose-100 hover:bg-rose-50'
                                                                }`}
                                                        >
                                                            {status === 'absent' && <XCircle className="w-3 h-3" />} ✕ Absent
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggle(student.student_id, 'half_day')}
                                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-widest transition-all flex items-center gap-1.5 ${status === 'half_day'
                                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 border-transparent'
                                                                : 'bg-white text-orange-500 border border-orange-100 hover:bg-orange-50'
                                                                }`}
                                                        >
                                                            {status === 'half_day' && <AlertCircle className="w-3 h-3" />} ⚠ Half Day
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Class Details */}
                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Topic Covered <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Introduction to React Hooks"
                                            className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-semibold text-gray-700"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Remarks (Optional)</label>
                                        <textarea
                                            placeholder="Add any specific observations..."
                                            className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all h-24 resize-none text-sm text-gray-700"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitMutation.isPending || Object.keys(attendanceData).length === 0 || !topic.trim()}
                                    className="px-12 py-3.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>

                            {/* Right Column: Attendance Summary */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8 sticky top-6">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-medium text-gray-800 tracking-tight">Attendance summary</h3>
                                        <p className="text-xs font-medium text-gray-400 italic">Today's attendance overview</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Present Card */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-medium text-emerald-700 tracking-wide">Present</span>
                                            </div>
                                            <span className="text-xl font-medium text-emerald-700">{dailySummary.present}</span>
                                        </div>

                                        {/* Absent Card */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-rose-500 rounded-lg text-white">
                                                    <XCircle className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-medium text-rose-700 tracking-wide">Absent</span>
                                            </div>
                                            <span className="text-xl font-medium text-rose-700">{dailySummary.absent}</span>
                                        </div>

                                        {/* Half Day Card */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 border border-orange-100 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-orange-500 rounded-lg text-white">
                                                    <AlertCircle className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-medium text-orange-700 tracking-wide">Half Day</span>
                                            </div>
                                            <span className="text-xl font-medium text-orange-700">{dailySummary.halfDay}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                                        </div>
                                        <span className="text-2xl font-extrabold text-primary">{attendanceRate}%</span>
                                    </div>

                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-2 text-center">Batch Health</p>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${attendanceRate > 80 ? 'bg-emerald-500' : 'bg-orange-400'}`}
                                                style={{ width: `${attendanceRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            )}

            {isStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Left Column: Learning Progress Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">
                           <div className="flex items-center justify-between mb-8">
                               <div>
                                   <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Learning Progress</h2>
                                   <p className="text-xs font-medium text-gray-400 mt-1">Timeline of completed topics</p>
                               </div>
                               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                   <TrendingUp className="w-5 h-5" />
                               </div>
                           </div>
                           
                           {isLogsLoading ? (
                               <div className="flex justify-center p-12">
                                   <Loader2 className="w-8 h-8 text-primary animate-spin" />
                               </div>
                           ) : (
                               <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                                   {trainerLogs?.length > 0 ? (
                                       trainerLogs.map((log) => (
                                           <div key={log.id} className="relative pl-6 sm:pl-8 group">
                                               {/* Timeline dot */}
                                               <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary left-[-9px] top-1 group-hover:bg-primary transition-colors duration-300 shadow-sm" />
                                               
                                               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                                                   <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                                       {log.topic_covered}
                                                   </h3>
                                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md shrink-0">
                                                       {format(new Date(log.date), 'MMM dd, yyyy')}
                                                   </span>
                                               </div>
                                               
                                               <div className="text-sm font-medium text-gray-500">
                                                   Trainer: <span className="text-gray-700">{log.tutor_name || batch_details?.tutor_name}</span>
                                               </div>
                                               
                                               {log.remarks && (
                                                   <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic flex gap-2">
                                                       <span className="text-gray-400 text-lg leading-none">"</span>
                                                       {log.remarks}
                                                       <span className="text-gray-400 text-lg leading-none">"</span>
                                                   </div>
                                               )}
                                           </div>
                                       ))
                                   ) : (
                                       <div className="text-center py-12">
                                           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                               <CalendarDays className="w-8 h-8 text-gray-300" />
                                           </div>
                                           <h3 className="text-gray-900 font-medium mb-1">No topics covered yet</h3>
                                           <p className="text-sm text-gray-500">Your learning timeline will appear here once classes begin.</p>
                                       </div>
                                   )}
                               </div>
                           )}
                        </div>
                    </div>

                    {/* Right Column: Info Cards */}
                    <div className="space-y-6">
                        {/* Instructor Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary/10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                            
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Your Instructor</h3>
                            
                            <div className="flex items-center gap-4 mb-5 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20 shadow-sm">
                                    {(batch_details?.tutor_name || 'T').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 tracking-tight">{batch_details?.tutor_name || 'Assigned Tutor'}</h4>
                                    <p className="text-xs font-medium text-gray-500">Subject Matter Expert</p>
                                </div>
                            </div>
                            
                            {/* <div className="pt-4 border-t border-gray-100 relative z-10">
                                <button className="w-full py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-600 font-medium rounded-xl text-sm transition-all shadow-sm">
                                    View Profile
                                </button>
                            </div> */}
                        </div>

                        {/* Schedule Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Class Schedule</h3>
                            
                            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="p-3 bg-white rounded-xl text-orange-500 shadow-sm shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="self-center">
                                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                                        {batch_details?.timing || 'Schedule pending'}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Regular Batch</p>
                                </div>
                            </div>
                        </div>

                        {/* Resources Placeholder */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-sm border border-gray-100 p-6 border-dashed">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Study Resources</h3>
                            
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                                    <FileText className="w-5 h-5 text-gray-300" />
                                </div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">No resources yet</h4>
                                <p className="text-xs text-gray-500 max-w-[160px]">Study materials will appear here when uploaded by your tutor.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchDetail;
