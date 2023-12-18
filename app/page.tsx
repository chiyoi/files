'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Box, Button, DropdownMenu, Flex, IconButton, ScrollArea, Table, Text, Link } from '@radix-ui/themes'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { useWeb3Modal, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { useSignMessage, useAccount } from 'wagmi'
import { z } from 'zod'
import { FontHachiMaruPop } from '@/fonts'

const APIEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
const IPFSEndpoint = process.env.NEXT_PUBLIC_IPFS_ENDPOINT

export default function Page() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const w3m = useWeb3Modal()
  const { address: addressWithCheck, status: accountStatus } = useAccount()
  const address = addressWithCheck?.toLowerCase()
  const [message, setMessage] = useState('')
  const { data, status: signStatus, signMessage, reset } = useSignMessage()
  useEffect(() => {
    if (!mounted || accountStatus !== 'connected') return
    const message = `Sign into files?\n${JSON.stringify({
      address,
      timestamp: Date.now(),
    })}`
    setMessage(message)
    signMessage({ message })
    return reset
  }, [mounted, accountStatus])

  const headers = useMemo(() => {
    const headers = new Headers()
    headers.set('Authorization', `Signature ${btoa(message)}:${data}`)
    return headers
  }, [data])

  const [files, setFiles] = useState<z.infer<typeof Files>>([])
  const [dragOver, setDragOver] = useState(false)
  useEffect(() => {
    listFiles()
  }, [mounted, signStatus])

  const [uploading, setUploading] = useState(false)
  const [listing, setListing] = useState(false)
  const [loadIndicator, setLoadIndicator] = useState('...')
  useEffect(() => {
    if (!uploading) return
    const timer = setInterval(() => setLoadIndicator(loadIndicator => {
      switch (loadIndicator) {
      case '.': return '..'
      case '..': return '...'
      case '...': return '.'
      default: return '...'
      }
    }), 1000)
    return () => clearInterval(timer)
  }, [uploading])

  async function listFiles() {
    if (!mounted || typeof address !== 'string' || signStatus !== 'success') return
    try {
      setListing(true)
      const response = await fetch(`${APIEndpoint}/${address}`, { headers })
      const body = await response.json()
      setFiles(Files.parse(body))
    } catch (error) {
      console.error(error)
    } finally {
      setListing(false)
    }
  }

  async function putFile(file: File) {
    if (!mounted || typeof address !== 'string' || signStatus !== 'success') return
    try {
      setUploading(true)
      const response = await fetch(`${APIEndpoint}/${address}/${file.name}`, {
        method: 'PUT',
        headers,
        body: file,
      })
      if (!response.ok) throw new Error(`Put ${file.name}: ${response.statusText}`)
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  async function deleteFile(key: string) {
    if (!mounted || typeof address !== 'string' || signStatus !== 'success') return
    try {
      const response = await fetch(`${APIEndpoint}/${key}`, {
        headers,
        method: 'DELETE',
      })
      if (!response.ok) {
        console.warn(`Delete ${key}: ${response.statusText}`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (!mounted) return null
  return (
    <>
      <ScrollArea type='auto'
        scrollbars='both'
        onDragOver={e => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          const files = e.dataTransfer?.files
          if (!files) return
          for (const file of files) {
            putFile(file).then(listFiles)
          }
        }}>
        <Box m='3'>
          <Table.Root variant='surface'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width={1} />
                <Table.ColumnHeaderCell width={1}>CID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width={1} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {signStatus === 'success' && !listing && files.map(file => (
                <Table.Row key={file.cid}>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Link href={`${IPFSEndpoint}/ipfs/${file.cid}`}>
                      {file.cid}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{file.key.slice(`${address}/`.length)}</Table.Cell>
                  <Table.Cell>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton variant='ghost' radius='full'>
                          <DotsVerticalIcon />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content align='end'>
                        <DropdownMenu.Item color="red" onClick={() => {
                          deleteFile(file.key).then(listFiles)
                        }}>
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <Text as='p' mt='3' mx='auto' style={{
            ...FontHachiMaruPop.style,
            textAlign: 'center',
          }}>
            {listing ? (
              'Listing files...'
            ) : uploading ? (
              `Uploading${loadIndicator}`
            ) : dragOver ? (
              'Drop to upload.'
            ) : signStatus === 'success' ? (
              <>
                Drag and drop or <Link onClick={() => {
                  // Generated: Create a dummy input and click it. (GPT-4)
                  // Create a new input element
                  const input = document.createElement('input')
                  input.type = 'file'

                  // Handle file selection
                  input.onchange = (event) => {
                    const files = (event.target as HTMLInputElement).files
                    // Modified
                    if (!files) return
                    for (const file of files) {
                      putFile(file).then(listFiles)
                    }
                    // End Modified
                  }

                  // Simulate a click to open the file dialog
                  input.click()
                  // End Generated
                }}>Select files...</Link>
              </>
            ) : (
              'Sign in...'
            )}
          </Text>
        </Box>
      </ScrollArea>

      <Flex gap='2' style={{
        position: 'fixed',
        right: '10px',
        top: '5px',
      }}>
        <Button disabled={['connecting', 'reconnecting'].includes(accountStatus)} radius='full' onClick={() => w3m.open()}>
          {accountStatus === 'connected' ? (
            address ? address.slice(0, 6) + '...' : 'Unknown'
          ) : accountStatus === 'reconnecting' ? (
            `Loading...`
          ) : accountStatus === 'connecting' ? (
            `Connecting...`
          ) : (
            'Connect'
          )}
        </Button>
      </Flex>
    </>
  )
}

const Files = z.object({
  cid: z.string(),
  key: z.string(),
}).array()
