'use client'

import React, { useEffect, useRef } from "react";
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
  const distortedTitleRef = useRef(title);
  const distortedDescriptionRef = useRef(description || '');
  const isGlitchingRef = useRef(false);

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

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      distortedTitleRef.current = distortText(title);
      distortedDescriptionRef.current = distortText(description || '');
      isGlitchingRef.current = true;
    }, 100);

    const audio = new Audio(`/stage_${stage}_xuinity_${lang}.mp3`);
    
    const audioTimeout = setTimeout(() => {
      audio.play().catch(error => console.error('Error playing audio:', error));
    }, 1000);

    return () => {
      clearInterval(glitchInterval);
      clearTimeout(audioTimeout);
      audio.pause();
    };
  }, [title, description, stage, lang]);

  hotToast.custom(
    (t) => (
      <ShineBorder
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        color={isGlitchingRef.current ? "#e1ff01" : "#000000"}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{distortedTitleRef.current}</p>
              {distortedDescriptionRef.current && (
                <p className="mt-1 text-sm text-gray-500">{distortedDescriptionRef.current}</p>
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