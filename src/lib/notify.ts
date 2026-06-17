import { toast } from "sonner";

type NotifyOptions = {
  description?: string;
};

function formatMessage(message: string, options?: NotifyOptions) {
  if (options?.description) {
    return { description: options.description };
  }
  return undefined;
}

/** Centralized toast notifications — top-right, modern card style via global Toaster config. */
export const notify = {
  success(message: string, options?: NotifyOptions) {
    toast.success(message, formatMessage(message, options));
  },
  error(message: string, options?: NotifyOptions) {
    toast.error(message, formatMessage(message, options));
  },
  info(message: string, options?: NotifyOptions) {
    toast.info(message, formatMessage(message, options));
  },
  warning(message: string, options?: NotifyOptions) {
    toast.warning(message, formatMessage(message, options));
  },
};

export { toast };
