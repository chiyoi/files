'use client'
import { useContext, useState } from 'react'
import { Button, Flex, Text } from '@radix-ui/themes'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { z } from 'zod'
import { useMounted } from '@/modules/useMounted'
import { useHeaders } from '@/modules/api-requests'
import AccountContext from '@/components/AccountContext'

const CHUNK_SIZE = 10 * 1024 * 1024

export default function Page() {
  const w3m = useWeb3Modal()
  const mounted = useMounted()

  const { connecting, address, message, signature, setAddress, signMessage } = useContext(AccountContext)
  const connected = address !== undefined && message !== undefined
  const headers = useHeaders(message, signature)
  const signed = headers !== undefined

  const [file, setFile] = useState<[File, z.infer<typeof UploadController>]>()

  if (!mounted) return null
  return (
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
