import { toast } from 'sonner'

export interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  return {
    success: (title: string, options?: ToastOptions) => {
      toast.success(title, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      })
    },
    error: (title: string, options?: ToastOptions) => {
      toast.error(title, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      })
    },
    info: (title: string, options?: ToastOptions) => {
      toast.info(title, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      })
    },
    warning: (title: string, options?: ToastOptions) => {
      toast.warning(title, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action,
      })
    },
    loading: (title: string, options?: ToastOptions) => {
      return toast.loading(title, {
        description: options?.description,
        duration: options?.duration,
      })
    },
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string
        error: string
      }
    ) => {
      return toast.promise(promise, messages)
    },
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId)
    },
  }
}
