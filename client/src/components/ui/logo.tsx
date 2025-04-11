import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        className={`${sizes[size]} text-primary-600`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 2C10.059 2 2 10.059 2 20C2 29.941 10.059 38 20 38C29.941 38 38 29.941 38 20C38 10.059 29.941 2 20 2Z"
          stroke="currentColor"
          strokeWidth="3"
          fill="white"
        />
        <path
          d="M28 14C28 10.686 24.4183 8 20 8C15.5817 8 12 10.686 12 14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M28 26C28 29.314 24.4183 32 20 32C15.5817 32 12 29.314 12 26"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M28 14V26"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M12 14V26"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M20 16C21.6569 16 23 17.3431 23 19C23 20.6569 21.6569 22 20 22C18.3431 22 17 20.6569 17 19C17 17.3431 18.3431 16 20 16Z"
          fill="currentColor"
        />
      </svg>
      <span className="ml-2 font-semibold text-xl text-primary-600">Clínica Delica</span>
    </div>
  );
};

export default Logo;
