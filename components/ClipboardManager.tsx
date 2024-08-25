import React from 'react';
import { Button } from "@/components/ui/button";

interface ClipboardManagerProps {
  requestText: string;
}

const ClipboardManager: React.FC<ClipboardManagerProps> = ({ requestText }) => {

  // Function to write to clipboard
  const writeToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      //alert('Request copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="clipboard-manager mt-4">
      <h2 className="text-xl font-semibold">Clipboard Manager</h2>

      <Button 
        onClick={() => writeToClipboard(requestText)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
      >
        Copy Request to Clipboard
      </Button>
    </div>
  ); 
};

export default ClipboardManager;
