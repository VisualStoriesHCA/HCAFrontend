interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Text Loading Spinner - Animated text lines writing themselves
const TextLoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizePx = size === "sm" ? 80 : size === "lg" ? 120 : 100;
  
  return (
    <div 
      className={`relative ${className}`} 
      style={{ width: sizePx, height: sizePx }}
    >
      {/* Background circle */}
      <div className="absolute inset-0 border-2 border-gray-200 rounded-full" />
      
      {/* Animated text lines */}
      <div className="absolute inset-0 flex flex-col justify-center items-center space-y-2 p-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="relative w-full max-w-[70%]"
          >
            <div 
              className="h-0.5 bg-blue-500 rounded animate-write-line"
              style={{
                animationDelay: `${index * 0.4}s`,
                animationDuration: '2s',
                width: index === 3 ? '60%' : '100%'
              }}
            />
            {/* Blinking cursor at the end of each line */}
            <div 
              className="absolute top-0 w-0.5 h-0.5 bg-blue-600 animate-blink-cursor"
              style={{
                right: index === 3 ? '40%' : '0%',
                animationDelay: `${index * 0.4 + 1.8}s`
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Pen tip following the writing */}
      <div 
        className="absolute w-2 h-2 bg-gray-600 rounded-full animate-pen-follow"
        style={{ 
          top: '20%', 
          left: '15%',
          animationDuration: '8s'
        }}
      />
      
      <style jsx>{`
        @keyframes write-line {
          0% { width: 0%; }
          70% { width: var(--target-width, 100%); }
          100% { width: var(--target-width, 100%); }
        }
        
        @keyframes blink-cursor {
          0%, 50% { opacity: 0; }
          51%, 100% { opacity: 1; }
        }
        
        @keyframes pen-follow {
          0% { transform: translate(0, 0); }
          25% { transform: translate(40px, 8px); }
          50% { transform: translate(0, 16px); }
          75% { transform: translate(35px, 24px); }
          100% { transform: translate(0, 32px); }
        }
        
        .animate-write-line {
          animation: write-line 2s ease-out infinite;
        }
        
        .animate-blink-cursor {
          animation: blink-cursor 1s ease-in-out infinite;
        }
        
        .animate-pen-follow {
          animation: pen-follow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Image Loading Spinner - Morphing geometric shapes with color transitions
const ImageLoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizePx = size === "sm" ? 80 : size === "lg" ? 120 : 100;
  
  return (
    <div 
      className={`relative ${className}`} 
      style={{ width: sizePx, height: sizePx }}
    >
      {/* Outer rotating ring */}
      <div className="absolute inset-0 border-2 border-purple-200 rounded-full animate-slow-spin" />
      
      {/* Central morphing shape */}
      <div className="absolute inset-1/4 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Base morphing shape */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 animate-shape-morph rounded-lg" />
          
          {/* Overlapping shapes with different timings */}
          <div 
            className="absolute inset-2 bg-gradient-to-tr from-blue-400 to-cyan-400 animate-shape-morph-2 rounded-full opacity-70"
          />
          <div 
            className="absolute inset-1 bg-gradient-to-bl from-green-400 to-emerald-400 animate-shape-morph-3 opacity-50"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="absolute w-2 h-2 bg-purple-400 rounded-full animate-float-particle opacity-60"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + (index % 2) * 40}%`,
              animationDelay: `${index * 0.4}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>
      
      {/* Inner pulsing core */}
      <div className="absolute inset-1/3 bg-white rounded-full animate-pulse-core opacity-80" />
      
      <style jsx>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shape-morph {
          0% { 
            border-radius: 50%; 
            transform: rotate(0deg) scale(1);
            background: linear-gradient(45deg, #8B5CF6, #EC4899);
          }
          33% { 
            border-radius: 20%; 
            transform: rotate(120deg) scale(1.1);
            background: linear-gradient(45deg, #06B6D4, #3B82F6);
          }
          66% { 
            border-radius: 0%; 
            transform: rotate(240deg) scale(0.9);
            background: linear-gradient(45deg, #10B981, #059669);
          }
          100% { 
            border-radius: 50%; 
            transform: rotate(360deg) scale(1);
            background: linear-gradient(45deg, #8B5CF6, #EC4899);
          }
        }
        
        @keyframes shape-morph-2 {
          0% { transform: rotate(0deg) scale(1); border-radius: 50%; }
          50% { transform: rotate(180deg) scale(1.2); border-radius: 10%; }
          100% { transform: rotate(360deg) scale(1); border-radius: 50%; }
        }
        
        @keyframes shape-morph-3 {
          0% { transform: rotate(0deg) scale(1); }
          33% { transform: rotate(120deg) scale(0.8); }
          66% { transform: rotate(240deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes float-particle {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(0.8); 
            opacity: 0.4; 
          }
          50% { 
            transform: translateY(-20px) translateX(10px) scale(1.2); 
            opacity: 0.8; 
          }
        }
        
        @keyframes pulse-core {
          0%, 100% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
        }
        
        .animate-slow-spin {
          animation: slow-spin 8s linear infinite;
        }
        
        .animate-shape-morph {
          animation: shape-morph 4s ease-in-out infinite;
        }
        
        .animate-shape-morph-2 {
          animation: shape-morph-2 3s ease-in-out infinite;
        }
        
        .animate-shape-morph-3 {
          animation: shape-morph-3 5s ease-in-out infinite;
        }
        
        .animate-float-particle {
          animation: float-particle 3s ease-in-out infinite;
        }
        
        .animate-pulse-core {
          animation: pulse-core 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export { TextLoadingSpinner, ImageLoadingSpinner };