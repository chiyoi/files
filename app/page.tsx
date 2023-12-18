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

export default function Page() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const w3m = useWeb3Modal()
  const { address, status: accountStatus } = useAccount()
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

  const [loading, setLoading] = useState(false)
  async function listFiles() {
    if (!mounted || typeof address !== 'string' || signStatus !== 'success') return
    setLoading(true)
    const response = await fetch(`${APIEndpoint}/${address}?list=1`, { headers })
    const body = await response.json()
    const parsed = Files.safeParse(body)
    if (parsed.success) setFiles(parsed.data)
    else console.error(parsed.error, body)
    setLoading(false)
  }

  async function putFile(file: File) {
    if (!mounted || typeof address !== 'string' || signStatus !== 'success') return
    const response = await fetch(`${APIEndpoint}/${address}/${file.name}`, {
      method: 'PUT',
      headers,
      body: file,
    })
    if (!response.ok) {
      console.warn(`Put ${file.name}: ${response.statusText}`)
      return
    }
  }

  async function deleteFile(key: string) {
    if (!mounted || typeof address !== 'string' || signStatus !== 'success') return
    const response = await fetch(`${APIEndpoint}/${key}`, {
      headers,
      method: 'DELETE',
    })
    if (!response.ok) {
      console.warn(`Delete ${key}: ${response.statusText}`)
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
          if (files === undefined) return
          for (const file of files) {
            putFile(file).then(listFiles)
          }
        }}>
        <Box m='3'>
          <Table.Root variant='surface'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell />
                <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Uploaded</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {signStatus === 'success' && !loading && files.map(file => (
                <Table.Row key={file.key}>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>{file.key.slice(`${address}/`.length)}</Table.Cell>
                  <Table.Cell>{bytesToHumanReadable(file.size)}</Table.Cell>
                  <Table.Cell>{file.uploaded.toUTCString()}</Table.Cell>
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
            {loading ? (
              'Loading...'
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
                    const file = (event.target as HTMLInputElement).files?.[0]
                    if (!file) return

                    // Process the file here
                    putFile(file).then(listFiles)
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

      <Flex direction='column' gap='2' style={{
        position: 'fixed',
        right: '10px',
        top: '5px',
      }}>
        <Button disabled={['connecting', 'reconnecting'].includes(accountStatus)} radius='full' onClick={() => w3m.open()}>
          {accountStatus === 'connected' ? (
            address ? address.slice(0, 6) + '...' : 'Unknown'
          ) : accountStatus === 'reconnecting' ? (
            'Loading...'
          ) : accountStatus === 'connecting' ? (
            'Connecting...'
          ) : (
            'Connect'
          )}
        </Button>
      </Flex>
    </>
  )
}

// Generated: GPT-4
function bytesToHumanReadable(numBytes: number): string {
  // Define the unit list
  const units: string[] = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
  let i: number = 0

  // Convert bytes to a higher unit until a suitable unit is found
  while (numBytes >= 1024 && i < units.length - 1) {
    numBytes /= 1024
    i++
  }

  // Return the formatted string
  return `${numBytes.toFixed(2)} ${units[i]}`
}

const Files = z.object({
  key: z.string(),
  size: z.number(),
  uploaded: z.coerce.date(),
}).array()
