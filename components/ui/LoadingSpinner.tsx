// components/ui/LoadingSpinner.tsx
"use client"

import React, { useEffect } from "react";
import useTelegram from "@/hooks/useTelegram";

const LoadingSpinner = () => {
  const { showProgress } = useTelegram();

  useEffect(() => {
    // Show the native Telegram progress bar when the component is mounted
    showProgress(true);

    // Optionally, hide the progress bar when the component is unmounted
    return () => {
      showProgress(false);
    };
  }, [showProgress]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="text-center">
        <div className="loader border-4 border-t-4 border-gray-400 h-16 w-16 mb-4 animate-spin rounded-full"></div>
        {/* <p className="text-xl text-gray-200 neon-glow">Loading...</p> */}
      </div>
    </div>
  );
};

export default LoadingSpinner;

