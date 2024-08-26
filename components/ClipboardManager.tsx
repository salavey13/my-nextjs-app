import React from 'react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '../context/AppContext';
import Link from "next/link";
interface ClipboardManagerProps {
  requestText: string;
}

const ClipboardManager: React.FC<ClipboardManagerProps> = ({ requestText }) => {
    const { t } = useAppContext();
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
        variant="outline"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
      >
        {t("copy")} 
      </Button>
      <Link
        href="https://chatgpt.com/?temporary-chat=true"
        className="group flex flex-col items-center justify-center text-gray-400 w-12 h-12 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
        target="_blank"
        rel="noopener noreferrer"
        >
        <span className="text-sm w-full mb-1 transition-all duration-300 group-hover:text-blue-500">
            ChatGPT
        </span>
        <svg
            className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-all duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4-4m0 0l4 4m-4-4v6"></path>
        </svg>
        </Link>
    </div>
  ); 
};

export default ClipboardManager;
