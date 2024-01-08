import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useFallback } from '@/app/internal/hooks'

const AddressContext = createContext<AddressContext>({ setAddressFallback: () => { } })
export const useAddressContext = () => useContext(AddressContext)

export default (props: Props) => {
  const { children } = props
  const { address: addressWithCheck } = useAccount()
  const addressConnected = useMemo(() => addressWithCheck?.toLowerCase() as `0x${string}`, [addressWithCheck])
  const [address, setAddressFallback] = useFallback(addressConnected)
  const value = useMemo(() => ({
    address,
    setAddressFallback,
  }), [address])
  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  )
}

type Props = {
  children: ReactNode,
}

export type AddressContext = {
  address?: `0x${string}`,
  setAddressFallback: Dispatch<SetStateAction<`0x${string}` | undefined>>,
}
