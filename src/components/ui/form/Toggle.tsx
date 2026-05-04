import React from 'react';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export const Toggle: React.FC<ToggleProps> = ({ label, description, checked, onChange, icon }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-100 text-[#b05e1c]">
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-bold text-gray-900">{label}</div>
          {description && <div className="text-xs text-gray-500">{description}</div>}
        </div>
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:ring-offset-2 ${
          checked ? 'bg-[#053d26]' : 'bg-gray-200'
        }`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
