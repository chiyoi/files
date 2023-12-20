'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Box, Button, IconButton, ScrollArea, Table, Text, Link } from '@radix-ui/themes'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { useWeb3Modal, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { useSignMessage, useAccount } from 'wagmi'
import { z } from 'zod'
import { FontHachiMaruPop } from '@/modules/fonts'
import Connect from '@/components/Connect'
import Delete from '@/components/Delete'
import Configure from '@/components/Configure'
import SelectAddress from '@/components/SelectAddress'

const APIEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
const IPFSGatewayEndpoint = process.env.NEXT_PUBLIC_IPFS_GATEWAY_ENDPOINT

export default function Page() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const [address, setAddress] = useState<string>()

  const w3m = useWeb3Modal()
  const { address: addressWithCheck, isConnected, status: accountStatus } = useAccount()
  useEffect(() => {
    if (!isConnected) return
    setAddress(addressWithCheck?.toLowerCase())
  }, [isConnected, addressWithCheck])
  const isConnecting = accountStatus === 'connecting' || accountStatus === 'reconnecting'

  const message = useMemo(() => {
    if (!isConnected || address === undefined) return
    return `Sign into files?\nAddress: ${address}\nTimestamp: ${Date.now()}`
  }, [isConnected, address])

  const { data: signature, isSuccess: isSigned, signMessage, reset } = useSignMessage()
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
  }, [mounted, address])

  const [listing, setListing] = useState(false)
  async function listFiles() {
    if (!mounted || address === undefined) return
    setListing(true)
    try {
      const response = await fetch(`${APIEndpoint}/files/${address}`)
      if (!response.ok) console.error(`List files error: ${await response.text()}`)
      const files = Files.parse(await response.json())
      setFiles(files)
    } catch (error) {
      setFiles([])
      console.error(error)
    }
    setListing(false)
  }

  const [uploading, setUploading] = useState(false)

  async function putFile(file: File) {
    if (!mounted || address === undefined || !isSigned) return
    setUploading(true)
    try {
      const response = await fetch(`${APIEndpoint}/files/${address}/${file.name}`, {
        method: 'PUT',
        headers,
        body: file,
      })
      if (!response.ok) console.warn(`Put ${file.name} error: ${await response.text()}`)
    } catch (error) {
      console.error(error)
    }
    setUploading(false)
  }

  const [deleting, setDeleting] = useState(false)
  async function deleteFile(filename: string) {
    if (!mounted || address === undefined || !isSigned) return
    setDeleting(true)
    try {
      const response = await fetch(`${APIEndpoint}/files/${address}/${filename}`, {
        method: 'DELETE',
        headers,
      })
      if (!response.ok) console.warn(`Delete ${filename} error: ${await response.text()}`)
    } catch (error) {
      console.error(error)
    }
    setDeleting(false)
  }

  async function setAddressName(name: string) {
    if (!mounted || address === undefined || headers === undefined) return
    try {
      const response = await fetch(`${APIEndpoint}/names/${address}`, {
        method: 'PUT',
        headers,
        body: name,
      })
      if (!response.ok) console.warn(`Set address name error: ${await response.text()}`)
    } catch (error) {
      console.error(error)
    }
  }

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

  const TopRightButton = (
    <Button disabled={isConnecting} radius='full' style={{
      position: 'fixed',
      right: '10px',
      top: '5px',
    }}>
      {address !== undefined ? (
        address.slice(0, 6) + '...'
      ) : isConnecting ? (
        `Loading...`
      ) : (
        'Connect'
      )}
    </Button>
  )

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
              {address !== undefined && !listing && files.map(file => (
                <Table.Row key={file.cid}>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>
                    <Link download href={`${IPFSGatewayEndpoint}/ipfs/${file.cid}?filename=${file.filename}`}>
                      {file.cid}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{file.filename}</Table.Cell>
                  <Table.Cell>
                    <Delete filename={file.filename} isSigned={isSigned} deleteFile={deleteFile} listFiles={listFiles} trigger={
                      <IconButton variant='ghost' radius='full'>
                        <DotsVerticalIcon />
                      </IconButton>
                    } />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Text as='p' mt='3' mx='auto' style={{
            ...FontHachiMaruPop.style,
            textAlign: 'center',
          }}>
            {isConnecting ? (
              'Loading...'
            ) : listing ? (
              'Listing files...'
            ) : uploading ? (
              `Uploading${loadIndicator}`
            ) : deleting ? (
              'Deleting...'
            ) : dragOver ? (
              'Drop to upload.'
            ) : isSigned ? (
              <>Drag and drop or <Link onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.onchange = (event) => {
                  const files = (event.target as HTMLInputElement).files
                  if (!files) return
                  for (const file of files) {
                    putFile(file).then(listFiles)
                  }
                }
                input.click()
              }}>Select files...</Link></>
            ) : address === undefined ? (
              <><Link onClick={() => w3m.open()}>Sign in...</Link> or <SelectAddress closeMenu={() => void 0} addressState={[address, setAddress]} trigger={
                <Link>Look Around...</Link>
              } /></>
            ) : (
              <Link onClick={() => w3m.open()}>Sign in...</Link>
            )}
          </Text>
        </Box>
      </ScrollArea>

      {address === undefined ? (
        <Connect addressState={[address, setAddress]} trigger={TopRightButton} />
      ) : (
        <Configure isConnected={isConnected} isConnecting={isConnecting} addressState={[address, setAddress]} setAddressName={setAddressName} trigger={TopRightButton} />
      )}
    </>
  )
}

const Files = z.object({
  cid: z.string(),
  filename: z.string(),
}).array()
