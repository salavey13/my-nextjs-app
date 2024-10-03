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

export const toast = ({ title, description, variant = "info", stage, lang = 'en' }: ToastParams) => {
  const [distortedTitle, setDistortedTitle] = useState(title);
  const [distortedDescription, setDistortedDescription] = useState(description || '');
  const [isGlitching, setIsGlitching] = useState(false);

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
    duration: 5000,
  };

  switch (variant) {
    case 'success':
      toastOptions.style.background = 'rgba(0, 255, 0, 0.2)';
      toastOptions.icon = '✅';
      break;
    case 'error':
    case 'destructive':
      toastOptions.style.background = 'rgba(255, 0, 0, 0.2)';
      toastOptions.style.color = '#f00';
      toastOptions.style.textShadow = '0 0 5px #f00';
      toastOptions.icon = '🛑';
      break;
    case 'warning':
      toastOptions.style.background = 'rgba(255, 165, 0, 0.2)';
      toastOptions.style.color = '#ffa500';
      toastOptions.style.textShadow = '0 0 5px #ffa500';
      toastOptions.icon = '⚠️';
      break;
  }

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setDistortedTitle(distortText(title));
      setDistortedDescription(distortText(description || ''));
      setIsGlitching(true);
    }, 100);

    const audio = new Audio(`/stage_${stage}_xuinity_${lang}.mp3`);
    
    setTimeout(() => {
      audio.play();
    }, 1000);

    return () => {
      clearInterval(glitchInterval);
      audio.pause();
    };
  }, [title, description, stage, lang]);

  hotToast.custom(
    (t) => (
      <ShineBorder
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
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
    ),
    toastOptions
  );
};

export const GlitchyToastProvider = () => {
  return <Toaster position="top-right" />;
};
