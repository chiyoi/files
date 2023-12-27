'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Box, Button, IconButton, ScrollArea, Table, Text, Link, Tooltip, DropdownMenu, Flex } from '@radix-ui/themes'
import { CopyIcon, DotsVerticalIcon } from '@radix-ui/react-icons'
import { useWeb3Modal, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { useSignMessage, useAccount } from 'wagmi'
import { z } from 'zod'
import { FontHachiMaruPop } from '@/modules/fonts'
import Connect from '@/components/Connect'
import Delete from '@/components/Delete'
import Configure from '@/components/Configure'
import SelectAddress from '@/components/SelectAddress'

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT
const ENS_ENDPOINT = process.env.NEXT_PUBLIC_END_ENDPOINT
const IPFS_GATEWAY_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_GATEWAY_ENDPOINT

const CHUNK_SIZE = 10 * 1024 * 1024

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

  const [file, setFile] = useState<[File, z.infer<typeof UploadController>]>()

  async function setAddressName(name: string) {
    if (!mounted || address === undefined || headers === undefined) return
    try {
      const response = await fetch(`${ENS_ENDPOINT}/${address}/name`, {
        method: 'PUT',
        headers,
        body: name,
      })
      if (!response.ok) console.warn(`Set address name error: ${await response.text()}`)
    } catch (error) {
      console.error(error)
    }
  }

  if (!mounted) return null
  return (
    <>
      <Flex gap='3' direction='column' m='auto'>
        <Flex gap='3'>
          <Button onClick={() => {
            if (address === undefined) return
            const input = document.createElement('input')
            input.type = 'file'
            input.onchange = (event) => {
              const file = (event.target as HTMLInputElement).files?.[0]
              if (file === undefined) return
              setFile([file, UploadController.parse(localStorage.getItem(`${address}/${file.name}`) ?? {
                parts_count: Math.ceil(file.size / CHUNK_SIZE),
                stated: false,
                completed: false,
                uploaded: [],
              })])
            }
            input.click()
          }}>{file === undefined ? (
            'Select File'
          ) : (
            file[0].name
          )}</Button>
          {file !== undefined && (
            <Text>Progress: {file[1].uploaded.length}/{file[1].parts_count}</Text>
          )}
        </Flex>

        {file !== undefined && (
          <Button onClick={() => {
            // Working
          }}>Upload</Button>
        )}
      </Flex>

      <Button radius='full' onClick={() => w3m.open()} style={{
        position: 'fixed',
        right: '10px',
        top: '5px',
      }}>{address === undefined ? (
        'Connect'
      ) : (
        address.slice(0, 6) + '...'
      )}</Button>
    </>
  )
}

const UploadController = z.object({
  parts_count: z.number(),
  started: z.boolean(),
  completed: z.boolean(),
  uploaded: z.object({
    partNumber: z.number(),
    etag: z.string(),
  }).array(),
})
