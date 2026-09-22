import React from 'react';

export const IosSpinner = ({ className = "", size = 24, color = "currentColor" }) => {
  return (
    <div 
      className={`inline-block ${className}`} 
      style={{ 
        width: size, 
        height: size,
        animation: 'spin 1s steps(12, end) infinite'
      }}
    >
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .ios-spinner-blade {
          position: absolute;
          left: 46%;
          top: 0;
          width: 8%;
          height: 25%;
          border-radius: 5px;
          background-color: ${color};
          transform-origin: 50% 200%;
        }
      `}</style>
      <div className="relative w-full h-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="ios-spinner-blade"
            style={{
              transform: `rotate(${i * 30}deg)`,
              opacity: (i + 1) / 12
            }}
          />
        ))}
      </div>
    </div>
  );
};
