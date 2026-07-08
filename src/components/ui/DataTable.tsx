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
              {actions && (
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                  Actions
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
                
                {actions && (
                  <td className="py-4 px-6 align-middle text-right">
                    <div className="flex items-center justify-end gap-4">
                      {actions(row)}
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
