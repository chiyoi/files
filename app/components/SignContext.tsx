import { useMounted } from '@/app/internal/hooks'
import { ReactNode, createContext, useContext, useEffect, useMemo } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

const SignContext = createContext<SignContextModel>({ signMessage: () => { }, resetSign: () => { } })
export const useSignContext = () => useContext(SignContext)

export default (props: Props) => {
  const { children } = props
  const { address } = useAccount()
  const { data, signMessage, reset: resetSign } = useSignMessage()
  const message = useMemo(() => {
    if (address === undefined) return
    return `Sign into files?\nAddress: ${address}\nDate: ${new Date().toUTCString()}`
  }, [address])
  const mounted = useMounted()
  useEffect(() => {
    if (!mounted || message === undefined) return
    signMessage({ message })
    return resetSign
  }, [mounted, message])

  const value: SignContextModel = useMemo(() => ({
    message,
    signature: data,
    signMessage,
    resetSign,
  }), [message, data])
  return (
    <SignContext.Provider value={value}>
      {children}
    </SignContext.Provider>
  )
}

type Props = {
  children: ReactNode,
}

export type SignContextModel = {
  message?: string,
  signature?: string,
  signMessage: (args?: { message: string }) => void,
  resetSign: () => void,
}
