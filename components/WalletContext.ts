import { createContext } from 'react'

export default createContext<Wallet>({})

export type Wallet = {
  address?: string,
  message?: string,
  signature?: string,
  setWallet?: React.Dispatch<Wallet>,
}
