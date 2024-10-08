// components/ClipboardManager.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '../context/AppContext';
import Link from "next/link";
import EnhancedChatButton from './ui/enhancedChatButton';
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
    <div className="clipboard-manager grid grid-cols-1 mt-4 gap-4">
      {/* <h2 className="text-xl font-semibold">{t("Clipboard Manager")}</h2> */}

      <Button 
        onClick={() => writeToClipboard(requestText)}
        variant="outline"
        className="bg-blue-500 text-white px-4 py-2  rounded-lg hover:bg-blue-600"
      >
        {t("copy")} 
      </Button>
      <EnhancedChatButton/>
    </div>
  ); 
};

export default ClipboardManager;
