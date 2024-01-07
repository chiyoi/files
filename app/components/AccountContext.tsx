import { createContext, useContext, useState } from 'react'
import { useTheme } from "next-themes"
import { createWeb3Modal, defaultWagmiConfig, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { sepolia, mainnet } from 'viem/chains'
import { useAccount as useWagmiAccount, useSignMessage } from 'wagmi'
import { ReactNode, useEffect, useMemo } from 'react'
import Account from '@/app/components/Account'
import { getCurrentPeriodBill, getPastDueBill } from '@/app/lib/api-requests'
import PastDueAlert from '@/app/components/PastDueAlert'
import { getName } from '@/app/lib/ens-requests'
import { useToast } from '@/app/components/ToastContext'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ''
const chains = [sepolia, mainnet]
const wagmiConfig = defaultWagmiConfig({
  chains, projectId, metadata: {
    name: 'Files',
    description: 'Temporary file storage.',
    url: 'https://files.neko03.moe',
    icons: ['https://files.neko03.moe/favicon.ico'],
  }
})
createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: sepolia, themeVariables: { '--w3m-accent': 'pink' } })

const AccountContext = createContext<AccountConfigure>({ connecting: false, addressState: [undefined, () => { }], signMessage: () => { }, logout: () => { } })
export const useAccount = () => useContext(AccountContext)

export default (props: Props) => {
  const { children } = props
  const toast = useToast()

  const { resolvedTheme } = useTheme()
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const addressState = useState<`0x${string}`>()
  const [address, setAddress] = addressState
  const { address: addressWithCheck, isConnected, status: accountStatus } = useWagmiAccount()
  useEffect(() => {
    if (!isConnected) return
    setAddress(addressWithCheck?.toLowerCase() as `0x${string}`)
  }, [isConnected, addressWithCheck])
  const connecting = accountStatus === 'connecting' || accountStatus === 'reconnecting'

  const message = useMemo(() => {
    if (!isConnected || address === undefined) return
    return `Sign into files?\nAddress: ${address}\nTimestamp: ${Date.now()}`
  }, [isConnected, address])

  const { data: signature, signMessage, reset } = useSignMessage()
  useEffect(() => {
    if (!isConnected || message === undefined) return
    signMessage({ message })
    return reset
  }, [isConnected, message])

  const [pastDueAmount, setPastDueAmount] = useState(0n)
  const showPastDueAlertState = useState(false)
  const [showPastDueAlert, setShowPastDueAlert] = showPastDueAlertState
  useEffect(() => {
    (async () => {
      if (address === undefined || signature === undefined) return
      const pastDue = await getPastDueBill(address)
      if (pastDue.amount > 0) {
        setPastDueAmount(pastDue.amount)
        setShowPastDueAlert(true)
      } else {
        const name = await getName(address)
        toast(`Hello, ${name || address}.`)
        await new Promise(resolve => { setTimeout(resolve, 3000) })
        const bill = await getCurrentPeriodBill(address)
        toast(`Your current bill is Ξ${(Number(bill.amount) / 1e18).toFixed(18)}.`)
      }
    })()
  }, [signature])

  return ( // BUG: Context update will not trigger children update.
    <AccountContext.Provider value={{ connecting, addressState, message, signature, signMessage, logout: reset }}>
      {children}
      <Account isConnecting={connecting} isConnected={isConnected} isSigned={signature !== undefined} addressState={addressState} />
      <PastDueAlert openState={showPastDueAlertState} amount={pastDueAmount} />
    </AccountContext.Provider>
  )
}

type Props = {
  children: ReactNode,
}

export type AccountConfigure = {
  addressState: ReturnType<typeof useState<`0x${string}`>>,
  connecting: boolean,

  message?: string,
  signature?: string,

  signMessage: (args?: { message: string }) => void,
  logout: () => void,
}
