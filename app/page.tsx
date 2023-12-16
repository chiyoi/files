'use client'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button, Flex, ScrollArea, Table } from '@radix-ui/themes'
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalTheme } from '@web3modal/ethers/react'
import { useSignMessage } from 'wagmi'

export default function Page() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const w3m = useWeb3Modal()
  const account = useWeb3ModalAccount()
  const [message, setMessage] = useState('')
  const { data, status, signMessage } = useSignMessage()
  useEffect(() => {
    if (!mounted || !account.isConnected) return
    const message = JSON.stringify({
      message: "Sign into files?",
      address: account.address,
      timestamp: Date.now(),
    })
    setMessage(message)
    signMessage({ message })
  }, [mounted, account.isConnected])

  const [files, setFiles] = useState([])

  if (!mounted) return null
  return (
    <>
      <ScrollArea m='3' type='auto' scrollbars='both' style={{ height: 'auto' }}>
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
              <Table.RowHeaderCell>工事中〜</Table.RowHeaderCell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </ScrollArea>
      <Flex direction='column' gap='2' style={{
        position: 'fixed',
        right: '30px',
        top: '30px',
      }}>
        <Button radius='full' onClick={() => w3m.open()}>
          {account.isConnected ? (account.address ? account.address.slice(0, 6) + '...' : 'Unknown') : 'Connect'}
        </Button>
      </Flex>
    </>
  )
}
