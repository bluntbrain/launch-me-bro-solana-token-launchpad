import { toast } from 'sonner'

interface ToastOptions {
  description?: string
}

export function useTransactionToast() {
  const toastSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
    })
  }

  const toastError = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
    })
  }

  const transactionToast = (signature: string) => {
    toast.success('Transaction sent!', {
      description: (
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View on Solana Explorer
        </a>
      ),
    })
  }

  return { toastSuccess, toastError, transactionToast }
}
