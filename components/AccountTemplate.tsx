'use client'
import { ThemeProvider, useTheme } from "next-themes"
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { Flex, Theme } from "@radix-ui/themes"
import { sepolia, mainnet } from 'viem/chains'
import { WagmiConfig, useAccount, useSignMessage } from 'wagmi'
import AccountContext from '@/components/AccountContext'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import Account from '@/components/Account'
import { useMounted } from '@/modules/hooks'
import { getCurrentPeriodBill, getPastDueBill } from '@/modules/api-requests'
import PastDueAlert from '@/components/PastDueAlert'
import { useToast } from '@/modules/toast'
import { getName } from '@/modules/ens-requests'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""
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

export default (props: Props) => {
  const { children } = props
  const [info, toast] = useToast()

  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const addressState = useState<`0x${string}`>()
  const [address, setAddress] = addressState
  const { address: addressWithCheck, isConnected, status: accountStatus } = useAccount()
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
    if (!mounted || !isConnected || message === undefined) return
    signMessage({ message })
    return reset
  }, [mounted, isConnected, message])

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
        info(`Hello, ${name || address}.`)
        await new Promise(resolve => { setTimeout(resolve, 3000) })
        const bill = await getCurrentPeriodBill(address)
        info(`Your current bill is Ξ${(Number(bill.amount) / 1e18).toFixed(18)}.`)
      }
    })()
  }, [signature])

  return (
    <AccountContext.Provider value={{ connecting, addressState, message, signature, signMessage, logout: reset }}>
      {children}
      <Account isConnecting={connecting} isConnected={isConnected} isSigned={signature !== undefined} addressState={addressState} />
      <PastDueAlert openState={showPastDueAlertState} amount={pastDueAmount} />
      {toast}
    </AccountContext.Provider>
  )
}

type Props = {
  children: React.ReactNode,
}
