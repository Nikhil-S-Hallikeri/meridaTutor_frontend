import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getReceiptDetail } from '../../services/finance';
import { Printer, ArrowLeft, Download, CheckCircle, ShieldCheck } from 'lucide-react';

const ReceiptDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: receiptResponse, isLoading } = useQuery({
        queryKey: ['receipt', id],
        queryFn: () => getReceiptDetail(id)
    });

    const receipt = receiptResponse?.data;

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-2"></div>
            <p className="text-gray-400 font-medium uppercase tracking-widest animate-pulse">Loading Official Receipt...</p>
        </div>
    );

    if (!receipt) return <div className="p-10 text-center text-red-500 font-medium">Receipt not found.</div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10">
            {/* Top Controls - Hidden on Print */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-all font-medium group"
                >
                    <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    Back to Financials
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                    >
                        <Printer className="w-5 h-5" /> Print Receipt
                    </button>
                </div>
            </div>

            {/* Receipt Content */}
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 relative print:shadow-none print:border-0">
                {/* Header Decoration */}
                <div className="h-4 bg-linear-to-r from-primary via-blue-400 to-indigo-500 print:hidden" />

                <div className="p-8 md:p-16">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
                        <div>
                            <h1 className="text-4xl font-medium text-gray-900 tracking-tighter mb-2">MERIDA <span className="text-primary">TUITION</span></h1>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-[0.2em]">Academic Excellence Portal</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="bg-green-50 text-success px-4 py-2 rounded-2xl flex items-center gap-2 mb-4 border border-green-100">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="font-medium uppercase tracking-widest text-xs">Verified Payment</span>
                            </div>
                            <p className="text-gray-500 font-medium text-sm">Receipt #: <span className="text-gray-900">{receipt.receipt_number}</span></p>
                            <p className="text-gray-400 text-xs mt-1">Date: {new Date(receipt.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                        {/* Student Info */}
                        <div>
                            <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">Received From</h3>
                            <p className="text-2xl font-medium text-gray-800">{receipt.invoice_details.student_name}</p>
                            <p className="text-gray-500 text-sm mt-2">Subject: <span className="font-medium text-gray-700">{receipt.invoice_details.subject_name}</span></p>
                        </div>

                        {/* Invoice Info */}
                        <div className="md:text-right">
                            <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">Payment Reference</h3>
                            <p className="text-lg font-medium text-gray-800">Invoice #{receipt.invoice_details.invoice_number}</p>
                            <p className="text-gray-500 text-sm mt-1">Mode: <span className="font-medium text-gray-700 uppercase">{receipt.invoice_details.payment_mode}</span></p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border-t border-b border-gray-100 py-8 mb-12">
                        <div className="flex justify-between items-center mb-4 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                            <span>Description</span>
                            <span>Amount</span>
                        </div>
                        <div className="bg-gray-50/50 rounded-3xl p-6 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800 text-lg">{receipt.invoice_details.description || 'Tuition Fees'}</p>
                                <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Academic Year 2024-25</p>
                            </div>
                            <p className="font-medium text-2xl text-gray-900 leading-none">₹{receipt.invoice_details.total_amount}</p>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col items-end gap-3 px-6 mb-16">
                        <div className="flex justify-between w-64 text-sm text-gray-500 font-medium">
                            <span>Subtotal</span>
                            <span>₹{receipt.invoice_details.total_amount}</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm text-gray-500 font-medium">
                            <span>Discount</span>
                            <span className="text-success">- ₹0.00</span>
                        </div>
                        <div className="flex justify-between w-64 text-2xl font-medium text-gray-900 mt-4 border-t border-gray-100 pt-4">
                            <span>Total Paid</span>
                            <span className="text-primary">₹{receipt.invoice_details.amount_paid}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-dashed border-gray-200">
                        <div className="max-w-xs">
                            <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Remarks</h4>
                            <p className="text-xs text-gray-500 leading-relaxed italic">"{receipt.remarks || 'Thank you for choosing Merida Tuition for your academic journey. This is a computer generated receipt.'}"</p>
                        </div>
                        <div className="text-center md:text-right">
                            <div className="mb-4">
                                <div className="text-primary font-medium text-lg mb-1">{receipt.received_by || 'ADMIN'}</div>
                                <div className="h-0.5 w-32 bg-gray-100 ml-auto mb-1" />
                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Authorized Signatory</div>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-medium text-gray-300 uppercase tracking-widest">
                                <CheckCircle className="w-3 h-3" /> Digital Copy Stored Securely
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block text-center text-[10px] text-gray-400 py-8 border-t border-gray-100 mt-8">
                    This is an electronically generated receipt. No physical signature is required.
                    <br />Merida Tuition Excellence Portal | terms apply.
                </div>
            </div>

            {/* Custom Styles for Printing */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border-0 { border: 0 !important; }
                }
            `}} />
        </div>
    );
};

export default ReceiptDetail;
