import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className={`w-full rounded-2xl border-0 bg-gray-100 py-4 px-5 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors ${
              error ? 'ring-2 ring-red-500' : ''
            } ${icon ? 'pr-12' : ''} ${className}`}
            {...props}
          />
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {icon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
