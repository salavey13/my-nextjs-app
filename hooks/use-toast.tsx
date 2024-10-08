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
  let distortedTitle = title;
  let distortedDescription = description || '';
  let isGlitching = false;

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
    duration: 13000, // Set duration to 13 seconds
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

  // Glitch effect interval
  const glitchInterval = setInterval(() => {
    distortedTitle = distortText(title);
    distortedDescription = distortText(description || '');
    isGlitching = true;
  }, 100);

  const audio = new Audio(`/stage_${stage}_Xuinity_${lang}.mp3`);
  
  setTimeout(() => {
    audio.play().catch(error => console.error('Error playing audio:', error));
  }, 1000);

  // Show the toast
  hotToast.custom(
    (t) => {
      const [isVisible, setIsVisible] = useState(true);

      useEffect(() => {
        if (!t.visible) {
          clearInterval(glitchInterval); // Clear interval when toast disappears
        }

        // Set a timeout to hide the toast after 13 seconds
        const timeout = setTimeout(() => {
          setIsVisible(false);
        }, 13000);

        return () => {
          clearTimeout(timeout);
          clearInterval(glitchInterval);
        };
      }, [t.visible]);

      if (!isVisible) {
        return null; // Don't render anything if the toast should be hidden
      }

      return (
        <ShineBorder
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
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
    },
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
