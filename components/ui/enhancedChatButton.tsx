import React, { useEffect } from 'react';
import useTelegram from '../../hooks/useTelegram';

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
    openLink('https://chatgpt.com/?temporary-chat=true');
    hideMainButton();
    //closeWebApp();
  };

  return (
    <div className={`flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'} p-4`}>
      <button
        onClick={handleOpenChatGPT}
        className="group flex flex-col items-center justify-center text-gray-400 w-12 h-12 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
      >
        <span className="text-sm mb-1 transition-all duration-300 group-hover:text-blue-500">ChatGPT</span>
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
      </button>
    </div>
  );
};

export default EnhancedChatButton;
