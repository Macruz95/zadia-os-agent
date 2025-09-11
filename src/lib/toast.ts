import { toast } from 'sonner';

// Centralized toast notification system
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  info: (message: string) => {
    toast.info(message);
  },
  
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, options);
  }
};

// Dismiss toast by ID
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};
