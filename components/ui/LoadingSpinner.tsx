// components/ui/LoadingSpinner.tsx

import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="text-center">
        <div className="loader rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
        <p className="text-xl text-gray-200 neon-glow">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
