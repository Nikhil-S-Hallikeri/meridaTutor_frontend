import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoices, recordPayment, deleteInvoice, getTermPayments, generateReceipt } from '../../services/finance';
import DataTable from '../../components/DataTable';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, X, CheckCircle, Clock, FileText, Printer } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const TermPaymentsList = ({ enrollmentId, invoiceId }) => {
    const { data: terms, isLoading } = useQuery({
        queryKey: ['term-payments', enrollmentId],
        queryFn: () => getTermPayments({ enrollment_id: enrollmentId })
    });

    if (isLoading) return <div className="py-2 text-xs text-gray-500 animate-pulse">Loading installments...</div>;
    if (!terms || terms.length === 0) return <div className="py-2 text-xs text-gray-400 italic">No installment plan found for this enrollment.</div>;

    return (
        <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                <Clock className="w-3 h-3" /> Installment Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {terms.map((term) => (
                    <div key={term.payment_id} className={`p-3 rounded-xl border-2 ${term.payment_status === 'paid' ? 'border-green-100 bg-green-50/30' : 'border-gray-100 bg-white shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">Term {term.term_number}</span>
                            {term.payment_status === 'paid' ? (
                                <CheckCircle className="w-3 h-3 text-success" />
                            ) : (
                                <Clock className="w-3 h-3 text-warning" />
                            )}
                        </div>
                        <div className="text-sm font-medium text-gray-800">₹{term.enrollment_fee_per_term || term.amount_paid}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Due: {term.due_date}</div>
                        <div className={`mt-2 text-[9px] font-medium px-1.5 py-0.5 rounded-md inline-block ${term.payment_status === 'paid' ? 'bg-green-100 text-success' : 'bg-red-50 text-danger'}`}>
                            {term.payment_status.toUpperCase()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Invoices = () => {
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState({ open: false, invoice: null });
    const [receiptModal, setReceiptModal] = useState({ open: false, invoice: null });

    const { user } = useContext(AuthContext);
    const userRole = user?.role?.toUpperCase() || localStorage.getItem('user_role')?.toUpperCase();
    const isStudent = userRole === 'STUDENT';

    const { data: invoices, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: getInvoices });

    const payMutation = useMutation({
        mutationFn: recordPayment,
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success("Payment recorded!");
        }
    });

    const receiptMutation = useMutation({
        mutationFn: generateReceipt,
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success("Receipt generated successfully!");
            setReceiptModal({ open: false, invoice: null });
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || "Failed to generate receipt.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success("Invoice removed.");
            setDeleteModal({ open: false, invoice: null });
        },
        onError: (err) => {
            toast.error(err.message || "Failed to remove invoice.");
        }
    });

    const handleDelete = (row) => {
        setDeleteModal({ open: true, invoice: row });
    };

    const confirmDelete = () => {
        if (deleteModal.invoice) {
            deleteMutation.mutate(deleteModal.invoice.invoice_id);
        }
    };

    const handleGenerateReceipt = (invoice) => {
        receiptMutation.mutate({
            invoiceId: invoice.invoice_id,
            data: { received_by: "Admin" }
        });
    };

    const columns = [
        { header: 'Invoice #', accessor: 'invoice_number' },
        { header: 'Student', accessor: 'student_name' },
        {
            header: 'Amount',
            accessor: 'amount_pending',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800">₹{row.total_amount}</span>
                    <span className="text-[10px] text-gray-400 italic">Pending: ₹{row.amount_pending}</span>
                </div>
            )
        },
        { header: 'Due Date', accessor: 'due_date' },
        {
            header: 'Status',
            accessor: 'payment_status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${row.payment_status === 'paid' ? 'bg-green-100 text-success' : 'bg-red-100 text-danger'
                    }`}>
                    {row.payment_status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    {!isStudent && row.payment_status !== 'paid' && (
                        <button
                            onClick={() => payMutation.mutate({
                                id: row.invoice_id,
                                data: {
                                    amount_paid: row.total_amount, // Use total amount to mark fully paid
                                    payment_mode: 'cash',
                                    payment_date: new Date().toISOString().split('T')[0]
                                }
                            })}
                            className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                            Mark Paid
                        </button>
                    )}
                    {row.payment_status === 'paid' && !row.has_receipt && (
                        <button
                            disabled={receiptMutation.isPending}
                            onClick={() => handleGenerateReceipt(row)}
                            className="flex items-center gap-1.5 bg-success/10 text-success hover:bg-success hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-success/20"
                        >
                            <FileText className="w-3.5 h-3.5" /> Generate Receipt
                        </button>
                    )}
                    {row.has_receipt && (
                        <Link
                            to={`/admin/receipts/${row.receipt_id}`}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-blue-200"
                        >
                            <Printer className="w-3.5 h-3.5" /> View Receipt
                        </Link>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-none flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-medium text-gray-800 tracking-tight">Financial Hub</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage enrollments, installments, and printable receipts.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Revenue</span>
                        <span className="text-lg font-medium text-gray-800">₹{invoices?.reduce((acc, inv) => acc + parseFloat(inv.amount_paid || 0), 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded shadow-sm border border-gray-100 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-60 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2"></div>
                        <p className="text-gray-400 font-medium animate-pulse text-sm tracking-wide uppercase">Fetching Financial Data...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={invoices || []}
                        onDelete={!isStudent ? handleDelete : null}
                        renderExpanded={(row) => (
                            <TermPaymentsList enrollmentId={row.enrollment_id} invoiceId={row.invoice_id} />
                        )}
                    />
                )}
            </div>

            {/* Delete Modal (Omitted for brevity, keep existing logic) */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300"
                    onClick={() => setDeleteModal({ open: false, invoice: null })}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-[pop_0.3s_ease-out]"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6 rotate-12">
                                <AlertTriangle className="w-8 h-8 text-red-500 -rotate-12" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-800 mb-2 tracking-tight">Confirm Deletion</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Are you sure you want to remove invoice <span className="text-gray-800 font-extrabold">#{deleteModal.invoice?.invoice_number}</span>?
                                <br /><span className="text-red-400 text-[10px] font-medium uppercase tracking-widest mt-2 block">This cannot be undone</span>
                            </p>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setDeleteModal({ open: false, invoice: null })} className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 text-gray-400 font-medium hover:bg-gray-100 transition-all text-sm border border-gray-100">
                                Dismiss
                            </button>
                            <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all text-sm border-b-4 border-red-700 active:border-b-0 active:translate-y-1">
                                {deleteMutation.isPending ? 'Working...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
