'use client'
import { ThemeProvider, useTheme } from "next-themes"
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { Flex, Theme } from "@radix-ui/themes"
import { sepolia, mainnet } from 'viem/chains'
import { WagmiConfig, useAccount, useSignMessage } from 'wagmi'
import AccountContext from '@/components/AccountContext'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import Account from '@/components/Account'
import { useMounted } from '@/modules/useMounted'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""
const chains = [sepolia, mainnet]
const metadata = {
  name: 'Files',
  description: 'Temporary file storage.',
  url: 'https://files.neko03.moe',
  icons: ['https://files.neko03.moe/favicon.ico'],
}
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: sepolia, themeVariables: { '--w3m-accent': 'pink' } })

export default function Template({ children }: { children: ReactNode }) {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const [address, setAddress] = useState<string>()
  const { address: addressWithCheck, isConnected, status: accountStatus } = useAccount()
  useEffect(() => {
    if (!isConnected) return
    setAddress(addressWithCheck?.toLowerCase())
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
  useEffect(() => {
    (async () => {
      if (signature === undefined) return
      // Working
      console.debug(`Hello, ${address}.`)
      const pastDue = Number((await (await fetch(`/api/${address}/bills/past_due`)).text()))
      if (pastDue !== 0) console.debug(`You have past-due bill of Ξ${pastDue}e-18. Pay it before you can make any change.`)
      else console.debug(`Your current period bill is Ξ${await (await fetch(`/api/${address}/bills/current_period`)).text()}e-18.`)
    })()
  }, [signature])

  return (
    <ThemeProvider attribute='class'>
      <WagmiConfig config={wagmiConfig}>
        <Theme accentColor='pink'>
          <Flex style={{ height: '100vh', backgroundColor: 'var(--accent-2)' }}>
            <AccountContext.Provider value={{ connecting, address, message, signature, setAddress, signMessage }}>
              {children}
            </AccountContext.Provider>
            <Account isConnecting={connecting} isConnected={isConnected} isSigned={signature !== undefined} addressState={[address, setAddress]} />
          </Flex>
        </Theme>
      </WagmiConfig>
    </ThemeProvider>
  )
}
