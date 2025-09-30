// frontend/src/components/common/Button.jsx
import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '', variant = 'primary', size = 'md' }) => {
  const baseClasses = 'px-4 py-2 rounded font-semibold transition duration-200';
  
  let variantClasses = '';
  if (variant === 'primary') variantClasses = 'bg-blue-600 text-white hover:bg-blue-700';
  if (variant === 'secondary') variantClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  if (variant === 'danger') variantClasses = 'bg-red-600 text-white hover:bg-red-700';

  let sizeClasses = '';
  if (size === 'sm') sizeClasses = 'px-3 py-1 text-sm';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;