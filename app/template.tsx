'use client'
import { ThemeProvider } from "next-themes"
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { Flex, Theme } from "@radix-ui/themes"

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""
const chains = [{
  chainId: 11155111,
  name: 'Sepolia Testnet',
  currency: 'SepoliaETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: `https://eth.neko03.moe/v1/sepolia`,
}]
const ethersConfig = defaultConfig({
  metadata: {
    name: 'Files',
    description: 'Web temporary file storage.',
    url: 'https://files.neko03.moe',
    icons: ['https://files.neko03.moe/favicon.ico'],
  },
})
createWeb3Modal({ ethersConfig, projectId, chains, defaultChain: chains[0], themeVariables: { '--w3m-accent': 'pink' } })

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute='class'>
      <Theme accentColor='pink'>
        <Flex style={{ height: '100vh', backgroundColor: 'var(--accent-2)' }}>
          {children}
        </Flex>
      </Theme>
    </ThemeProvider>
  )
}
