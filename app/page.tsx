'use client'
import { FontHachiMaruPop } from '@/fonts'
import { StyleTextColor } from '@/styles'
import { Button, ScrollArea, Table } from '@radix-ui/themes'
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useWeb3ModalTheme } from '@web3modal/ethers/react'
import { BrowserProvider } from 'ethers'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'


export default function Page() {
  const web3Modal = useWeb3Modal()
  const account = useWeb3ModalAccount()

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const { walletProvider } = useWeb3ModalProvider()
  const [signature, setSignature] = useState('')
  useEffect(() => {
    async function getSignature() {
      if (!account.isConnected || walletProvider === undefined) {
        return ''
      }
      const provider = new BrowserProvider(walletProvider)
      const signer = await provider.getSigner()
      const signature = await signer?.signMessage(`Sign ${account.address} into Files at ${new Date().toISOString()}.`)
      return signature
    }
    getSignature().then(s => setSignature(s))
  }, [account.address, account.isConnected, walletProvider])

  if (!mounted) return null
  return (
    <>
      <ScrollArea m='3' type='auto' scrollbars='vertical' style={{ height: 'auto' }}>
        <Table.Root variant='surface'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width='300px'>Object</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='100px'>Size</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width='300px'>Modified</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.RowHeaderCell>Danilo Sousa</Table.RowHeaderCell>
              <Table.Cell>danilo@example.com</Table.Cell>
              <Table.Cell>Developer</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
              <Table.Cell>zahra@example.com</Table.Cell>
              <Table.Cell>Admin</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
              <Table.Cell>jasper@example.com</Table.Cell>
              <Table.Cell>Developer</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{resolvedTheme}</Table.Cell>
              <Table.Cell>{signature}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </ScrollArea>
      <Button radius='full' onClick={() => web3Modal.open()} style={{
        position: 'fixed',
        right: '30px',
        top: '30px',
      }}>
        {account.isConnected ? ((addr?: string) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : 'Unknown')(account.address?.toLowerCase()) : 'Connect'}
      </Button>
    </>
  )
}
