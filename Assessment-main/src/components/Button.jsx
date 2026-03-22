import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ children, to, variant = 'default', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700',
    accent: 'bg-yellow-600 text-white hover:bg-yellow-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]}`;

  if (to) {
    return (
      <Link to={to} className={buttonClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
