import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6">
            <div
                className={`bg-white rounded-4xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-6 border-b border-gray-50">
                    <h2 className="text-xl md:text-2xl font-medium text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-6 -mt-5 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;