import { createContext, useState } from 'react'

export default createContext<AccountConfigure>({ connecting: false, addressState: [undefined, () => { }], signMessage: () => { }, logout: () => { } })

export type AccountConfigure = {
  addressState: ReturnType<typeof useState<`0x${string}`>>,
  connecting: boolean,

  message?: string,
  signature?: string,

  signMessage: (args?: { message: string }) => void,
  logout: () => void,
}
