import React, { useEffect } from 'react';
import useTelegram from '../../hooks/useTelegram';
import { Button } from './button';

const EnhancedChatButton = () => {
  const {
    tg,
    user,
    theme,
    openLink,
    showMainButton,
    hideMainButton,
    showBackButton,
    closeWebApp,
  } = useTelegram();

  useEffect(() => {
    if (tg) {
      showMainButton('ChatGPT');
      tg.MainButton?.onClick(handleOpenChatGPT)
      tg.MainButton?.setParams({color: "#000000", text_color: "#e1ff01"})
      //showBackButton();
    }
  }, [tg, showMainButton, showBackButton]);

  const handleOpenChatGPT = () => {
    openLink('https://chatgpt.com/');
    hideMainButton();
  };

  const handleOpenVPN = () => {
    openLink('https://s3.amazonaws.com/psiphon/web/mjr4-p23r-puwl/download.html#direct');
  };
  
  return (
    <div className={`flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'} p-4 gap-8`}>
      <Button
        onClick={handleOpenVPN}
        className="group flex flex-col items-center justify-center text-gray-400 w-36 h-8 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
      >
        <span className="text-sm mb-1 transition-all duration-300 group-hover:text-blue-500">VPN</span>
      </Button>
      <button
        onClick={handleOpenChatGPT}
        className="group flex flex-col items-center justify-center  items-center text-gray-400 w-12 h-12 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
      >
        <span className="text-sm mb-1 transition-all duration-300 group-hover:text-blue-500">ChatGPT</span>
        <svg
          className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-all duration-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4-4m0 0l4 4m-4-4v6"></path>
        </svg>
      </button>
    </div>
  );
};

export default EnhancedChatButton;
