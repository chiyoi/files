import { Dispatch, SetStateAction, createContext } from 'react'

export default createContext<AccountConfigure>({ connecting: false, setAddress: () => void 0, signMessage: () => void 0 })

export type AccountConfigure = {
  connecting: boolean,

  address?: string,
  message?: string,
  signature?: string,

  setAddress: Dispatch<SetStateAction<string | undefined>>,
  signMessage: (args?: { message: string }) => void,
}
