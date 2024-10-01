import React, { useContext } from "react";
import { useAppContext } from "../context/AppContext"; // Adjust path as necessary

const DebugInfo = () => {
  const { state } = useAppContext();

  return (
    <div
      className="fixed bottom-0 right-0 w-64 max-h-48 p-4 overflow-y-auto bg-black bg-opacity-75 text-white text-xs z-50 rounded-tl-lg shadow-lg"
    >
      {state.debugLogs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  );
};

export default DebugInfo;
