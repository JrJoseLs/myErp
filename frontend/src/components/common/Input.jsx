// frontend/src/components/common/Input.jsx
import React from 'react';

const Input = ({ label, name, type = 'text', value, onChange, required = false, disabled = false, step }) => {
  const isCheckbox = type === 'checkbox';

  const inputElement = (
    <input
      type={type}
      name={name}
      value={isCheckbox ? undefined : value}
      checked={isCheckbox ? value : undefined}
      onChange={onChange}
      required={required}
      disabled={disabled}
      step={step}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${isCheckbox ? 'h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500' : 'p-2 border'}`}
    />
  );

  return (
    <div className={`space-y-1 ${isCheckbox ? 'flex items-center gap-2' : ''}`}>
      <label htmlFor={name} className={`block text-sm font-medium text-gray-700 ${isCheckbox ? 'order-2' : ''}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isCheckbox ? inputElement : inputElement}
    </div>
  );
};

export default Input;