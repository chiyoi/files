'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Box, Button, DropdownMenu, Flex, IconButton, ScrollArea, Table, Text, Link } from '@radix-ui/themes'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { useWeb3Modal, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { useSignMessage, useAccount } from 'wagmi'
import { z } from 'zod'
import { FontHachiMaruPop } from '@/modules/fonts'

const APIEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
const IPFSEndpoint = process.env.NEXT_PUBLIC_IPFS_ENDPOINT

function Message(salt: string) {
  return `Sign into files? (Signature of this message will be used as encrypt key and authorization token.)\nSalt: ${salt}`
}

export default function Page() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const w3m = useWeb3Modal()
  const { address: addressWithCheck, isConnected, status: accountStatus } = useAccount()
  const address = addressWithCheck?.toLowerCase()

  const [salt, setSalt] = useState<string>()
  const message = salt === undefined ? undefined : Message(salt)
  useEffect(() => {
    (async () => {
      if (!mounted || !isConnected) return
      try {
        setSalt(z.string().parse(await (await fetch(`${APIEndpoint}/salts/${address}`)).json()))
      } catch (error) {
        console.error(error)
      }
    })()
  }, [mounted, isConnected])

  const { data: signature, status: signStatus, signMessage, reset } = useSignMessage()
  useEffect(() => {
    if (!mounted || !isConnected || message === undefined) return
    signMessage({ message })
    return reset
  }, [mounted, isConnected, message])

  const headers = useMemo(() => {
    if (message === undefined || signature === undefined) return
    const headers = new Headers()
    headers.set('Authorization', `Signature ${btoa(message)}:${signature}`)
    return headers
  }, [message, signature])

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
    if (!mounted || address === undefined || signStatus !== 'success') return
    setListing(true)
    try {
      const response = await (await fetch(`${APIEndpoint}/${address}`, { headers })).json()
      const files = Files.parse(response)
      setFiles(files)
    } catch (error) {
      setFiles([])
      console.error(error)
    }
    setListing(false)
  }

  async function putFile(file: File) {
    if (!mounted || address === undefined || signStatus !== 'success') return
    setUploading(true)
    try {
      const response = await fetch(`${APIEndpoint}/${address}/${file.name}`, {
        method: 'PUT',
        headers,
        body: file,
      })
      if (!response.ok) console.warn(`Put ${file.name} error.`)
    } catch (error) {
      console.error(error)
    }
    setUploading(false)
  }

  async function deleteFile(filename: string) {
    if (!mounted || address === undefined || signStatus !== 'success') return
    try {
      const response = await fetch(`${APIEndpoint}/${address}/${filename}`, {
        method: 'DELETE',
        headers,
      })
      if (!response.ok) console.warn(`Delete ${filename} error.`)
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
          const items = e.dataTransfer.items
          for (const item of items) {
            const entry = item.webkitGetAsEntry()
            if (entry?.isFile) {
              const file = item.getAsFile()
              if (file instanceof File) putFile(file).then(listFiles)
            } else if (entry?.isDirectory) {
              console.error('Directory is not supported.') // TODO: Add toast
            }
          }
        }}>
        <Box m='3'>
          <Table.Root variant='surface'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell width={1} />
                <Table.ColumnHeaderCell width={1}>CID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Filename</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell width={1} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {signStatus === 'success' && !listing && files.map(file => (
                <Table.Row key={file.cid}>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Link download href={`${IPFSEndpoint}/ipfs/${file.cid}?filename=${file.filename}`}>
                      {file.cid}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{file.filename}</Table.Cell>
                  <Table.Cell>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton variant='ghost' radius='full'>
                          <DotsVerticalIcon />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content align='end'>
                        <DropdownMenu.Item color="red" onClick={() => {
                          deleteFile(file.filename).then(listFiles)
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
              <>Drag and drop or <Link onClick={() => {
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
              }}>Select files...</Link></>
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
        <Button radius='full' onClick={async () => {
          await fetch(`${APIEndpoint}/salts/${address}`, {
            method: 'POST',
            headers,
          })
        }}>Reset</Button>
        <Button disabled={['connecting', 'reconnecting'].includes(accountStatus)} radius='full' onClick={() => w3m.open()}>
          {accountStatus === 'connected' ? (
            address ? address.slice(0, 6) + '...' : 'Unknown'
          ) : ['reconnecting', 'connecting'].includes(accountStatus) ? (
            `Loading...`
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
  filename: z.string(),
}).array()
