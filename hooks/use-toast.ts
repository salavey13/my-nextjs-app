'use client'
import { Toaster, toast as hotToast, ToastOptions } from "react-hot-toast";

// Type for the toast
type ToastParams = {
  title: string;
  description?: string;
  variant?: "success" | "error" | "info" | "warning" | "destructive";
};

// Toast trigger function
export const toast = ({ title, description, variant = "info" }: ToastParams) => {
  const toastOptions: ToastOptions = {
    style: {
      fontSize: '0.75rem', // XS text
      fontFamily: 'monospace',
      letterSpacing: '1px',
      animation: 'glitchyFadeIn 0.5s ease-in-out forwards',
    },
    icon: '⚠️', // Default icon, can be replaced based on variant
  };

  switch (variant) {
    case 'success':
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(0, 255, 0, 0.75)', // Green for success
        color: '#000',
      };
      toastOptions.icon = '✅';
      break;
    case 'error':
    case 'destructive': // Treat "destructive" as error
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(255, 0, 0, 0.85)', // Red for error/destructive
        color: '#fff',
        border: '1px solid #fff',
      };
      toastOptions.icon = '🛑';
      break;
    case 'info':
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(0, 123, 255, 0.75)', // Blue for info
        color: '#fff',
      };
      toastOptions.icon = 'ℹ️';
      break;
    case 'warning':
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(255, 165, 0, 0.85)', // Orange for warning
        color: '#fff',
      };
      toastOptions.icon = '⚠️';
      break;
    default:
      toastOptions.style = {
        ...toastOptions.style,
        background: 'rgba(255, 0, 0, 0.85)', // Default: Red/sus
        color: '#fff',
        border: '1px solid #fff',
      };
  }

  // Displaying the toast with title + optional description
  hotToast(
    `${title} ${description ? '\n' + description : ''}`,
    toastOptions
  );
};

// Toast provider component
export const GlitchyToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000, // Adjust duration here
      }}
    />
  );
};
