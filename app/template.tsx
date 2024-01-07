'use client'
import { ThemeProvider } from "next-themes"
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { Flex, Theme } from "@radix-ui/themes"
import { sepolia, mainnet } from 'viem/chains'
import { WagmiConfig } from 'wagmi'
import { ReactNode } from 'react'
import AccountTemplate from '@/components/AccountTemplate'

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

export default (props: Props) => {
  const { children } = props
  return (
    <ThemeProvider attribute='class'>
      <WagmiConfig config={wagmiConfig}>
        <Theme accentColor='pink'>
          <Flex style={{ height: '100vh', backgroundColor: 'var(--accent-2)' }}>
            <AccountTemplate>
              {children}
            </AccountTemplate>
          </Flex>
        </Theme>
      </WagmiConfig>
    </ThemeProvider>
  )
}

type Props = {
  children: ReactNode,
}
