'use client'

import React, { useState, useEffect } from "react";
import { Toaster, toast as hotToast, ToastOptions } from "react-hot-toast";
import ShineBorder from "@/components/ui/ShineBorder";

type ToastParams = {
  title: string;
  description?: string;
  variant?: "success" | "error" | "info" | "warning" | "destructive";
  stage?: number;
  lang?: 'en' | 'ru' | 'ukr';
};

const distortText = (text: string) => {
  return text.split('').map(char => 
    Math.random() > 0.7 ? String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 5)) : char
  ).join('');
};

const CustomToast: React.FC<ToastParams & { visible: boolean }> = ({ title, description, variant, stage, lang, visible }) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [distortedTitle, setDistortedTitle] = useState(title);
  const [distortedDescription, setDistortedDescription] = useState(description || '');
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setDistortedTitle(distortText(title));
      setDistortedDescription(distortText(description || ''));
      setIsGlitching(true);
    }, 4200);

    const audio = new Audio(`/stage_${stage}_Xuinity_${lang}.mp3`);
    const audioTimeout = setTimeout(() => {
      audio.play().catch(error => console.error('Error playing audio:', error));
    }, 1000);

    const visibilityTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 13000);

    return () => {
      clearInterval(glitchInterval);
      clearTimeout(audioTimeout);
      clearTimeout(visibilityTimeout);
    };
  }, [title, description, stage, lang]);

  if (!isVisible) {
    return null;
  }

  return (
    <ShineBorder
      className={`${
        visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full top-16 pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      color={isGlitching ? "#e1ff01" : "#000000"}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{distortedTitle}</p>
            {distortedDescription && (
              <p className="mt-1 text-sm text-gray-500">{distortedDescription}</p>
            )}
          </div>
        </div>
      </div>
    </ShineBorder>
  );
};

export const toast = ({ title, description, variant = "info", stage, lang = 'en' }: ToastParams) => {
  const toastOptions: ToastOptions = {
    style: {
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      letterSpacing: '1px',
      animation: 'glitchyFadeIn 0.5s ease-in-out forwards',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#0f0',
      border: '1px solid #0f0',
      textShadow: '0 0 5px #0f0',
    },
    icon: '⚠️',
    duration: 13000,
  };

  switch (variant) {
    case 'success':
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(0, 255, 0, 0.2)',
      };
      toastOptions.icon = '✅';
      break;
    case 'error':
    case 'destructive':
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(255, 0, 0, 0.2)',
        color: '#f00',
        textShadow: '0 0 5px #f00',
      };
      toastOptions.icon = '🛑';
      break;
    case 'warning':
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(255, 165, 0, 0.2)',
        color: '#ffa500',
        textShadow: '0 0 5px #ffa500',
      };
      toastOptions.icon = '⚠️';
      break;
  }

  hotToast.custom(
    (t) => <CustomToast {...{ title, description, variant, stage, lang, visible: t.visible }} />,
    toastOptions
  );
};

export const GlitchyToastProvider = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  );
};

export default function Component() {
  return null; // This component doesn't render anything directly
}