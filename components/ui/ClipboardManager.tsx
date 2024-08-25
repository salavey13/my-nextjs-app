"use client";
//components/ui/ClipboardManager.tsx
import React, { useState } from 'react';

const ClipboardManager: React.FC = () => {
  const [clipboardContent, setClipboardContent] = useState<string>('');

  // Function to write to clipboard
  const writeToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Function to read from clipboard
  const readFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardContent(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return (
    <div className="clipboard-manager mt-4">
      <h2 className="text-xl font-semibold">Clipboard Manager</h2>

      <button 
        onClick={() => writeToClipboard('Sample text to copy')}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
      >
        Copy to Clipboard
      </button>

      <button 
        onClick={readFromClipboard}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
      >
        Read from Clipboard
      </button>

      {clipboardContent && (
        <div>
          <h3 className="text-lg font-semibold">Clipboard Content:</h3>
          <p className="text-gray-700">{clipboardContent}</p>
        </div>
      )}
    </div>
  );
};

export default ClipboardManager;
