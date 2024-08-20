import React, { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";



interface DialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dialog Component
export const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
};

// Dialog Trigger Component
export const DialogTrigger = DialogPrimitive.Trigger;

// Dialog Content Component
export const DialogContent = ({ children, className, ...props }: { children: ReactNode; className?: string }) => {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 w-full max-w-lg transform -translate-x-1/2 -translate-y-1/2",
          "bg-neutral-900 text-white p-6 rounded-lg shadow-lg",
          "focus:outline-none focus-visible:ring focus-visible:ring-primary-500",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute top-3 right-3 p-1 rounded-full",
            "text-neutral-400 hover:text-white hover:bg-neutral-800",
            "focus:outline-none focus-visible:ring focus-visible:ring-primary-500"
          )}
        >
          <X className="w-5 h-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

// Dialog Header Component
export const DialogHeader = ({ children, className, ...props }: { children: ReactNode; className?: string }) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

// Dialog Title Component
export const DialogTitle = ({ children, className, ...props }: { children: ReactNode; className?: string }) => (
  <DialogPrimitive.Title
    className={cn("text-2xl font-semibold", "text-white", className)}
    {...props}
  >
    {children}
  </DialogPrimitive.Title>
);

// Dialog Description Component
export const DialogDescription = ({ children, className, ...props }: { children: ReactNode; className?: string }) => (
  <DialogPrimitive.Description className={cn("text-sm text-neutral-400", className)} {...props}>
    {children}
  </DialogPrimitive.Description>
);
