import React from 'react';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative">
          <img 
            src="/smslogo.png" 
            alt="SMS Logo" 
            className="h-24 w-24 mx-auto mb-4 animate-bounce"
          />
          <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 animate-pulse">
          EduManager Pro
        </h1>
        <p className="text-blue-200">Loading your experience...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
