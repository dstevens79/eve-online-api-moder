import React from 'react';
import { Rocket, Shield, ExclamationTriangle } from '@phosphor-icons/react';

interface EVELoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showCorporationCount?: number;
  showValidationStatus?: 'configured' | 'no-corps' | 'not-configured';
}

export function EVELoginButton({ 
  onClick, 
  disabled = false, 
  size = 'medium', 
  className = '',
  showCorporationCount,
  showValidationStatus
}: EVELoginButtonProps) {
  const sizeClasses = {
    small: 'h-6 text-xs px-2',
    medium: 'h-8 text-sm px-3', 
    large: 'h-10 text-base px-4'
  };

  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20
  };

  const getStatusIcon = () => {
    if (showValidationStatus === 'configured') {
      return <Shield size={iconSizes[size]} className="text-green-400" />;
    } else if (showValidationStatus === 'no-corps') {
      return <ExclamationTriangle size={iconSizes[size]} className="text-yellow-400" />;
    } else if (showValidationStatus === 'not-configured') {
      return <ExclamationTriangle size={iconSizes[size]} className="text-red-400" />;
    }
    return <Rocket size={iconSizes[size]} className="text-orange-400" />;
  };

  const getStatusText = () => {
    if (showValidationStatus === 'not-configured') {
      return 'ESI Not Configured';
    } else if (showValidationStatus === 'no-corps') {
      return 'Sign In with EVE Online';
    }
    return 'Sign In with EVE Online';
  };

  const getTooltipText = () => {
    if (showValidationStatus === 'not-configured') {
      return 'ESI authentication is not configured. Contact your administrator.';
    } else if (showValidationStatus === 'no-corps') {
      return 'No corporations registered. Directors/CEOs can register their corporation automatically.';
    } else if (showValidationStatus === 'configured' && showCorporationCount) {
      return `${showCorporationCount} corporation${showCorporationCount > 1 ? 's' : ''} registered`;
    }
    return 'Authenticate with EVE Online SSO';
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={getTooltipText()}
      >
        {/* EVE Online SSO Login Button */}
        <div 
          className={`bg-black text-white py-1 rounded font-medium flex items-center gap-2 ${sizeClasses[size]} ${
            showValidationStatus === 'not-configured' ? 'border border-red-400/50' :
            showValidationStatus === 'no-corps' ? 'border border-yellow-400/50' :
            showValidationStatus === 'configured' ? 'border border-green-400/50' :
            'border border-orange-400/30'
          }`}
          style={{
            background: showValidationStatus === 'not-configured' 
              ? 'linear-gradient(135deg, #2d1b1b 0%, #1a0000 100%)'
              : showValidationStatus === 'no-corps'
              ? 'linear-gradient(135deg, #2d2b1b 0%, #1a1800 100%)'
              : showValidationStatus === 'configured'
              ? 'linear-gradient(135deg, #1b2d1b 0%, #001a00 100%)'
              : 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)'
          }}
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
          {showCorporationCount !== undefined && showCorporationCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
              showValidationStatus === 'configured' ? 'bg-green-400/20 text-green-400' : 'bg-orange-400/20 text-orange-400'
            }`}>
              {showCorporationCount}
            </span>
          )}
        </div>
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
        {getTooltipText()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
      </div>
    </div>
  );
}