"use client";

import React from 'react';
import { MoreVertical } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string; status?: string }>({ columns, data, actions }: DataTableProps<T>) {
  
  const renderStatusPill = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-green-800 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
            {status}
          </span>
        );
      case 'ON LEAVE':
      case 'PENDING REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-orange-800 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b05e1c]"></span>
            {status}
          </span>
        );
      case 'DOCUMENT VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b2f2bb] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#053d26] uppercase">
            {status}
          </span>
        );
      case 'INTERVIEW SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffc9c9] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#c92a2a] uppercase">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-800 uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((col, i) => (
                <th key={i} className={`py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(actions || data.some(d => d.status)) && (
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                  {actions ? "Actions" : "Status"}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`py-4 px-6 align-middle ${col.className || ''}`}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                
                {(actions || row.status) && (
                  <td className="py-4 px-6 align-middle text-right">
                    <div className="flex items-center justify-end gap-4">
                      {row.status && renderStatusPill(row.status)}
                      {actions ? actions(row) : (
                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
