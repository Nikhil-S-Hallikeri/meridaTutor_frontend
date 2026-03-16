import React from 'react';

const AttendanceToggle = ({ status, onUpdate }) => {
    // Map our UI state to the colors in your Figma
    const getStyle = (s) => {
        switch (s) {
            case 'present': return 'bg-green-500 text-white';
            case 'absent': return 'bg-red-500 text-white';
            case 'late': return 'bg-yellow-500 text-white';
            default: return 'bg-gray-200 text-gray-700';
        }
    };

    return (
        <div className="flex gap-2">
            {['present', 'absent', 'late'].map((s) => (
                <button
                    key={s}
                    onClick={() => onUpdate(s)}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase transition-all ${status === s ? getStyle(s) : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                >
                    {s}
                </button>
            ))}
        </div>
    );
};

export default AttendanceToggle;