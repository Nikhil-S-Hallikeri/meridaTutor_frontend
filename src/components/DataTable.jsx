import React, { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const DataTable = ({ columns, data, onEdit, onDelete, renderExpanded }) => {
    const [expandedRows, setExpandedRows] = useState({});

    const toggleRow = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <table className="w-full text-left border-collapse min-w-max">
            <thead>
                <tr>
                    {renderExpanded && (
                        <th className="sticky top-0 z-10 py-4 px-4 bg-gray-900 text-white font-medium text-[11px] uppercase tracking-widest w-10 first:rounded-tl-2xl"></th>
                    )}
                    {columns.map((col, i) => (
                        <th
                            key={i}
                            className={`sticky top-0 z-10 py-4 px-4 bg-gray-900 text-white font-medium text-[11px] uppercase tracking-widest whitespace-nowrap 
                                ${!renderExpanded && i === 0 ? 'rounded-l-2xl' : ''} 
                                ${i === columns.length - 1 ? 'rounded-r-2xl' : ''}`}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {Array.isArray(data) && data.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                            {renderExpanded && (
                                <td className="py-4 px-4 text-sm text-gray-700">
                                    <button onClick={() => toggleRow(rowIndex)} className="text-gray-400 hover:text-primary transition-colors">
                                        {expandedRows[rowIndex] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                </td>
                            )}
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="py-2 px-4 text-sm text-gray-700">
                                    {col.accessor === 'actions' ? (
                                        <div className="flex items-center gap-2">
                                            {col.render && col.render(row, rowIndex)}
                                            {onEdit && (
                                                <button onClick={() => onEdit(row)} className="p-2 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(row)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        col.render ? col.render(row, rowIndex) : row[col.accessor]
                                    )}
                                </td>
                            ))}
                        </tr>
                        {expandedRows[rowIndex] && renderExpanded && (
                            <tr className="bg-gray-50/50">
                                <td colSpan={columns.length + (renderExpanded ? 1 : 0)} className="py-4 px-8 border-l-4 border-primary/20">
                                    {renderExpanded(row)}
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                {Array.isArray(data) && data.length === 0 && (
                    <tr>
                        <td colSpan={columns.length + (renderExpanded ? 1 : 0)} className="py-10 text-center text-gray-500 font-medium">
                            No records found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default DataTable;
