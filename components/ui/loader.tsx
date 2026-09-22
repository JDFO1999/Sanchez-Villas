import React from 'react';

export const Loader = ({ className = "", size = 48, color = "currentColor", text = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div 
        className="relative" 
        style={{ width: size, height: size, animation: 'ios-spin 1s steps(12, end) infinite' }}
      >
        <style>{`
          @keyframes ios-spin {
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
      {text && <p className="text-sm font-medium animate-pulse" style={{ color }}>{text}</p>}
    </div>
  );
};

export const FullScreenLoader = ({ text = "Cargando..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size={64} color="#22c55e" text={text} />
    </div>
  );
};
