import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLogsheets, submitLogsheet, updateLogsheet, deleteLogsheet } from '../../services/attendance';
import { getBatches } from '../../services/batches';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import AttendanceToggle from '../../components/AttendanceToggle';
import { Plus, User, BookOpen, ClipboardCheck, Edit, Trash2, Lock, FileText, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Attendance = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
    const isStudent = user?.role === 'STUDENT';
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLogsheet, setEditingLogsheet] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'present'|'absent'|'late' }
    const [topic, setTopic] = useState('');
    const [remarks, setRemarks] = useState('');

    const canEditLogsheet = (logsheet) => {
        const now = new Date();
        const created = new Date(logsheet.created_at);
        const classDate = new Date(logsheet.date);

        // Same day check
        const isSameDay = now.toDateString() === classDate.toDateString();

        // 24h from creation check
        const diffInHours = (now - created) / (1000 * 60 * 60);
        const isWithin24h = diffInHours <= 24;

        return isSameDay || isWithin24h;
    };

    // Fetch Logsheets
    const { data: attendance, isLoading } = useQuery({
        queryKey: ['attendance'],
        queryFn: getLogsheets
    });

    // Fetch Batches for the dropdown
    const { data: batches } = useQuery({
        queryKey: ['batches'],
        queryFn: getBatches
    });

    // Mutation for submitting logsheet
    const submitMutation = useMutation({
        mutationFn: submitLogsheet,
        onSuccess: () => {
            queryClient.invalidateQueries(['attendance']);
            setIsModalOpen(false);
            resetForm();
            toast.success("Attendance marked successfully!");
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                "Failed to submit logsheet.";
            toast.error(errorMsg);
        }
    });


    const handleBatchChange = (batchId) => {
        const batch = batches.find(b => b.batch_id === parseInt(batchId));
        setSelectedBatch(batch);

        // Initialize attendance data for all students in the batch
        if (batch && batch.enrolled_students) {
            const initialData = {};
            batch.enrolled_students.forEach(student => {
                initialData[student.student_id] = 'present';
            });
            setAttendanceData(initialData);
        }
    };

    const handleToggleAttendance = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const deleteMutation = useMutation({
        mutationFn: deleteLogsheet,
        onSuccess: () => {
            queryClient.invalidateQueries(['attendance']);
            toast.success("Logsheet deleted.");
        }
    });

    const handleEdit = (row) => {
        if (!canEditLogsheet(row)) {
            return toast.error("This logsheet is locked (24h rule) and cannot be edited.");
        }
        setEditingLogsheet(row);
        const batch = batches.find(b => b.batch_id === row.batch);
        setSelectedBatch(batch);
        setTopic(row.topic_covered);
        setRemarks(row.remarks || '');

        // Initialize attendance
        const initialData = {};
        // Note: Backend doesn't return full attendance in list usually, 
        // but assuming the backend results include student lists as per models
        row.present_students?.forEach(id => initialData[id] = 'present');
        row.absent_students?.forEach(id => initialData[id] = 'absent');
        setAttendanceData(initialData);

        setIsModalOpen(true);
    };

    const handleDelete = (row) => {
        if (!isAdmin) return;
        if (!canEditLogsheet(row)) {
            return toast.error("Locked logsheets cannot be deleted.");
        }
        if (window.confirm("Delete this logsheet?")) {
            deleteMutation.mutate(row.id);
        }
    };

    const handleSubmit = () => {
        if (!selectedBatch) return toast.error("Please select a batch.");
        if (!topic.trim()) return toast.error("Please enter the topic covered.");

        const logData = {
            batch: selectedBatch.batch_id,
            tutor: selectedBatch.current_tutor,
            date: editingLogsheet?.date || new Date().toISOString().split('T')[0],
            topic_covered: topic,
            remarks: remarks,
            present_students: Object.entries(attendanceData)
                .filter(([_, status]) => status === 'present' || status === 'late')
                .map(([id]) => parseInt(id)),
            absent_students: Object.entries(attendanceData)
                .filter(([_, status]) => status === 'absent')
                .map(([id]) => parseInt(id)),
            half_day_students: Object.entries(attendanceData)
                .filter(([_, status]) => status === 'half_day')
                .map(([id]) => parseInt(id))
        };

        if (editingLogsheet) {
            updateMutation.mutate({ id: editingLogsheet.id, ...logData });
        } else {
            submitMutation.mutate(logData);
        }
    };

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => updateLogsheet(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['attendance']);
            setIsModalOpen(false);
            resetForm();
            toast.success("Logsheet updated!");
        }
    });

    const resetForm = () => {
        setSelectedBatch(null);
        setEditingLogsheet(null);
        setAttendanceData({});
        setTopic('');
        setRemarks('');
    };

    const columns = [
        {
            header: 'Class Session',
            accessor: 'date',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800 tracking-tight flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-primary" /> {row.date}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Batch #{row.batch}</span>
                </div>
            )
        },
        {
            header: 'Trainer',
            accessor: 'tutor_name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary border border-gray-100">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{row.tutor_name || 'Assigned Tutor'}</span>
                </div>
            )
        },
        {
            header: 'Topic',
            accessor: 'topic_covered',
            render: (row) => (
                <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-500 italic">"{row.topic_covered}"</span>
                </div>
            )
        },
        {
            header: isStudent ? 'Class Attendance' : 'Attendance',
            accessor: 'attendance_summary',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${row.attendance_summary?.attendance_percentage > 70 ? 'bg-green-500' : 'bg-orange-400'}`}
                            style={{ width: `${row.attendance_summary?.attendance_percentage || 0}%` }}
                        ></div>
                    </div>
                    <span className="font-medium text-[10px] text-gray-700">{row.attendance_summary?.attendance_percentage || 0}%</span>
                </div>
            )
        },
        ...(isStudent ? [{
            header: 'Your Attendance',
            accessor: 'my_attendance_status',
            render: (row) => {
                const status = row.my_attendance_status;
                const getStatusColor = (s) => {
                    switch(s) {
                        case 'Present': return 'bg-green-100 text-green-700';
                        case 'Absent': return 'bg-red-100 text-red-700';
                        case 'Half Day': return 'bg-blue-100 text-blue-700';
                        default: return 'bg-gray-100 text-gray-700';
                    }
                };

                return (
                    <div className="flex items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(status)}`}>
                            {status || 'N/A'}
                        </span>
                    </div>
                );
            }
        }] : []),
        {
            header: 'Status',
            accessor: 'created_at',
            render: (row) => (
                canEditLogsheet(row) ? (
                    <span className="text-[9px] font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-widest flex items-center gap-1">
                        <Edit className="w-2.5 h-2.5" /> Editable
                    </span>
                ) : (
                    <span className="text-[9px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 uppercase tracking-widest flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                )
            )
        },
        { header: 'Actions', accessor: 'actions' }
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden animate-fade-in">
            <div className="flex-none flex justify-between items-center mb-6">
                <h2 className="text-2xl font-medium text-gray-800">Attendance Logsheets</h2>
                {!isStudent && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Mark Attendance
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-3xl shadow-sm border border-gray-100 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={attendance || []}
                        onEdit={!isStudent ? handleEdit : null}
                        onDelete={isAdmin ? handleDelete : null}
                    />
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingLogsheet ? "Edit Attendance Session" : "Mark Daily Attendance"}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-6">
                    {/* Batch Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Select Batch
                            </label>
                            <select
                                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                onChange={(e) => handleBatchChange(e.target.value)}
                                value={selectedBatch?.batch_id || ''}
                            >
                                <option value="">Choose a batch...</option>
                                {batches?.map(batch => (
                                    <option key={batch.batch_id} value={batch.batch_id}>
                                        {batch.batch_name} ({batch.timing})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Assigned Trainer
                            </label>
                            <div className="p-3 rounded-xl border border-gray-100 bg-gray-100 text-gray-600 font-medium">
                                {selectedBatch ? selectedBatch.current_tutor_name : 'Select a batch first'}
                            </div>
                        </div>
                    </div>

                    {selectedBatch && (
                        <div className="space-y-6 animate-slide-up">
                            {/* Student List */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <ClipboardCheck className="w-4 h-4 text-primary" />
                                    Student Attendance
                                </label>
                                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {selectedBatch.enrolled_students?.map(student => (
                                        <div key={student.student_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800 text-sm">{student.name}</span>
                                                <span className="text-[10px] text-gray-500 uppercase font-medium tracking-wider">{student.admission_no}</span>
                                            </div>
                                            <AttendanceToggle
                                                status={attendanceData[student.student_id]}
                                                onUpdate={(status) => handleToggleAttendance(student.student_id, status)}
                                            />
                                        </div>
                                    ))}
                                    {(!selectedBatch.enrolled_students || selectedBatch.enrolled_students.length === 0) && (
                                        <div className="text-center py-6 text-gray-400 italic text-sm">
                                            No students found in this batch.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Class Details */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Topic Covered</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Introduction to React Hooks"
                                        className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Remarks (Optional)</label>
                                    <textarea
                                        placeholder="Add any specific observations..."
                                        className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all h-24 resize-none"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitMutation.isPending || !selectedBatch.enrolled_students?.length}
                                className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {submitMutation.isPending ? 'Submitting...' : 'Submit Logsheet'}
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Attendance;