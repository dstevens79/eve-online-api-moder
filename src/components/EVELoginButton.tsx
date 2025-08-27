import React from 'react';

interface EVELoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function EVELoginButton({ onClick, disabled = false, size = 'medium', className = '' }: EVELoginButtonProps) {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8', 
    large: 'h-10'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {/* EVE Online SSO Login Button */}
      <div 
        className={`bg-black text-white px-3 py-1 rounded font-medium text-sm flex items-center gap-2 ${sizeClasses[size]}`}
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
          border: '1px solid #333'
        }}
      >
        <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
        <span>EVE Online SSO</span>
      </div>
    </button>
  );
}