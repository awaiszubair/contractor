import React from "react";

function Loading({ message = "Loading Dashboard..." }) {
  return (
   <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
  <div className="text-center">
    {/* Animated Circles Loader */}
    <div className="relative w-32 h-32 mx-auto mb-8">
      {/* Outer rotating circle */}
      <div className="absolute inset-0 border-8 border-gray-200 rounded-full animate-spin border-t-black"></div>
      
      {/* Middle rotating circle (opposite direction) */}
      <div className="absolute inset-3 border-8 border-gray-300 rounded-full animate-spin-slow border-t-gray-700"></div>
      
      {/* Inner pulsing circle */}
      <div className="absolute inset-6 bg-gradient-to-br from-gray-800 to-black rounded-full animate-pulse"></div>
      
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-white rounded-full shadow-lg animate-bounce border-2 border-gray-300"></div>
      </div>
    </div>

    {/* Loading Text */}
    <h2 className="text-2xl font-bold text-black mb-2">
      {message}
    </h2>
    
    {/* Animated Dots */}
    <div className="flex justify-center space-x-2">
      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>

    {/* Optional Progress Bar */}
    <div className="mt-8 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-gray-700 to-black rounded-full animate-loading-bar"></div>
    </div>
  </div>
</div>
  );
}

export default Loading;