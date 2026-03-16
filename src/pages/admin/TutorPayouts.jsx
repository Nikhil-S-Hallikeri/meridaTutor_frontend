import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTutorsWithPendingPayments, recordTutorPayment } from '../../services/tutors';
import DataTable from '../../components/DataTable';
import { toast } from 'react-toastify';
import { useState } from 'react';
import {
    Wallet,
    Banknote,
    HandCoins,
    AlertCircle,
    CheckCircle2,
    ArrowRightCircle,
    UserCircle
} from 'lucide-react';

const PayoutModal = ({ tutor, isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState(tutor?.pending_amount || 0);
    const [mode, setMode] = useState('bank_transfer');
    const [transactionId, setTransactionId] = useState('');

    const mutation = useMutation({
        mutationFn: recordTutorPayment,
        onSuccess: () => {
            queryClient.invalidateQueries(['pending-payouts']);
            toast.success(`Successfully recorded payout for ${tutor.tutor.name}`);
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || "Failed to record payment.");
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-[pop_0.3s_ease-out]">
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                            <Banknote className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-medium text-gray-800 tracking-tight">Record Payout</h3>
                            <p className="text-gray-400 text-sm font-medium">Paying {tutor.tutor_name}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block mb-2 px-1">Amount to Pay (Max: ₹{tutor.pending_amount})</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-medium text-gray-400 text-lg">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    max={tutor.pending_amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-6 font-medium text-xl text-gray-800 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block mb-2 px-1">Payment Mode</label>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-medium text-gray-700 focus:border-primary/30 outline-none transition-all appearance-none"
                                >
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI / GPay</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block mb-2 px-1">Ref ID (Optional)</label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="TXN-123456"
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-medium text-gray-700 focus:border-primary/30 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-12">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-4 rounded-2xl bg-gray-50 text-gray-400 font-medium hover:bg-gray-100 transition-all text-sm border border-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={mutation.isPending || !amount || amount <= 0}
                            onClick={() => mutation.mutate({
                                tutor: tutor.tutor,
                                amount: amount,
                                payment_mode: mode,
                                transaction_id: transactionId,
                                paid_on: new Date().toISOString().split('T')[0],
                                remarks: "Portal Managed Payout"
                            })}
                            className="flex-3 px-8 py-4 rounded-2xl bg-primary text-white font-medium hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Processing...' : (
                                <>Verify & Pay <ArrowRightCircle className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TutorPayouts = () => {
    const { data: pendingTutors, isLoading } = useQuery({
        queryKey: ['pending-payouts'],
        queryFn: getTutorsWithPendingPayments
    });

    const [payoutModal, setPayoutModal] = useState({ open: false, tutor: null });

    const columns = [
        {
            header: 'Trainer',
            accessor: 'tutor_name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary border border-gray-100">
                        <UserCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 text-sm tracking-tight">{row.tutor_name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{row.tutor_email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Subject',
            accessor: 'subject_name',
            render: (row) => (
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 capitalize">
                    {row.subject_name}
                </span>
            )
        },
        {
            header: 'Earned',
            accessor: 'total_earned',
            render: (row) => <span className="font-medium text-gray-800">₹{row.total_earned.toLocaleString()}</span>
        },
        {
            header: 'Pending',
            accessor: 'pending_amount',
            render: (row) => (
                <span className="font-medium text-orange-500 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center gap-2 w-fit">
                    <AlertCircle className="w-3.5 h-3.5" /> ₹{row.pending_amount.toLocaleString()}
                </span>
            )
        },
        {
            header: 'Action',
            accessor: 'id',
            render: (row) => (
                <button
                    onClick={() => setPayoutModal({ open: true, tutor: row })}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-medium uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                >
                    <HandCoins className="w-3.5 h-3.5" /> Release Payment
                </button>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-medium text-gray-800 tracking-tighter">Trainer Payouts</h2>
                    <p className="text-gray-500 text-sm mt-1">Settle pending balances for your expert faculty.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-3xl shadow-sm border border-orange-100 flex flex-col items-center">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3" /> Total Liability
                        </span>
                        <span className="text-xl font-medium text-orange-500">
                            ₹{pendingTutors?.reduce((acc, t) => acc + parseFloat(t.pending_amount), 0).toLocaleString() || 0}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 min-h-[500px]">
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-60 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2"></div>
                        <p className="text-gray-400 font-medium uppercase tracking-widest animate-pulse">Scanning Payroll...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={pendingTutors || []}
                    />
                )}
            </div>

            <PayoutModal
                isOpen={payoutModal.open}
                tutor={payoutModal.tutor}
                onClose={() => setPayoutModal({ open: false, tutor: null })}
            />
        </div>
    );
};

export default TutorPayouts;
