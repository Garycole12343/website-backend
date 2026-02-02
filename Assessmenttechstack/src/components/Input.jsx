import React from 'react';
import { Link } from 'react-router-dom';

const Input = ({ label, type, name, placeholder, value, onChange, error, to, ...props }) => {
  const inputClasses = `w-full rounded border border-gray-300 p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none ${error ? 'border-red-500' : ''}`;

  if (to) {
    return (
      <Link to={to} className={inputClasses} {...props}>
        {label}
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClasses}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
