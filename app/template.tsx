'use client'
import { ThemeProvider } from "next-themes"
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { Flex, Theme } from "@radix-ui/themes"

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""
const ethersConfig = defaultConfig({
  metadata: {
    name: 'Files',
    description: 'File storage.',
    url: 'https://files.neko03.moe',
    icons: ['https://files.neko03.moe'],
  },
  rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
})
createWeb3Modal({ ethersConfig, projectId, themeVariables: { '--w3m-accent': 'pink' } })

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute='class'>
      <Theme accentColor='pink'>
        <Flex style={{ height: '100vh', backgroundColor: 'var(--accent-4)' }}>
          {children}
        </Flex>
      </Theme>
    </ThemeProvider>
  )
}
