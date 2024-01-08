'use client'
import { useEffect, useState } from 'react'
import { Box, IconButton, ScrollArea, Table, Text, Link, Tooltip } from '@radix-ui/themes'
import { CopyIcon, DotsVerticalIcon } from '@radix-ui/react-icons'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { z } from 'zod'
import { FontHachiMaruPop } from '@/app/internal/fonts'
import Delete from '@/app/components/Delete'
import SelectAddress from '@/app/components/SelectAddress'
import { useAuthorization, useFallback } from '@/app/internal/hooks'
import { Files, deleteFile, listFiles, putFile } from '@/app/internal/api-requests'
import { useToastContext } from '@/app/components/ToastContext'
import { useAccount } from 'wagmi'
import { useSignContext } from '@/app/components/SignContext'
import { useAddressContext } from '@/app/components/AddressContext'

const IPFS_GATEWAY_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_GATEWAY_ENDPOINT

const MAX_FILE_SIZE = 30 * 1024 * 1024

export default () => {
  const w3m = useWeb3Modal()
  const { isConnecting, isReconnecting, isConnected } = useAccount()
  const loading = isConnecting || isReconnecting
  const { message, signature, signMessage } = useSignContext()
  const authorization = useAuthorization(message, signature)
  const isMessageSet = message !== undefined
  const isSigned = authorization !== undefined

  const { address } = useAddressContext()
  const isAddressSet = address !== undefined

  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<z.infer<typeof Files>>([])

  const [copyCIDTooltip, setCopyCIDTooltip] = useState('copy')
  const [copyCIDTooltipOpen, setCopyCIDTooltipOpen] = useState(false)
  const resetCopyCIDTooltip = () => setCopyCIDTooltip('copy')
  const setCopyCIDTooltipCopied = () => setCopyCIDTooltip('copied')

  const toast = useToastContext()

  const [listing, setListing] = useState(false)
  const handleListFiles = () => {
    if (!isAddressSet) return
    setListing(true)
    listFiles(address)
      .then(setFiles)
      .catch(error => (console.error(error), toast('Error occurred while listing files...')))
      .finally(() => setListing(false))
  }
  useEffect(handleListFiles, [address])

  const [uploading, setUploading] = useState(false)
  const handlePutFile = (file: File) => {
    if (!isAddressSet || !isSigned) return
    if (file.size > MAX_FILE_SIZE) {
      console.error('Files is designed for small files.')
      return
    }
    setUploading(true)
    putFile(address, file, authorization)
      .then(handleListFiles)
      .catch(error => (console.error(error), toast('Error occurred while uploading...')))
      .finally(() => setUploading(false))
  }

  const [deleting, setDeleting] = useState(false)
  const handleDeleteFile = (filename: string) => {
    if (!isAddressSet || !isSigned) return
    setDeleting(true)
    deleteFile(address, filename, authorization)
      .then(handleListFiles)
      .catch(error => (console.error(error), toast('Error occurred while deleting...')))
      .finally(() => setDeleting(false))
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

  return (
    <ScrollArea type='auto'
      scrollbars='both'
      onDragOver={e => {
        e.preventDefault()
        if (!isSigned) return
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault()
        if (!isSigned) return
        setDragOver(false)
        const items = e.dataTransfer.items
        for (const item of items) {
          const entry = item.webkitGetAsEntry()
          if (entry?.isFile) {
            const file = item.getAsFile()
            if (file instanceof File) handlePutFile(file)
          } else if (entry?.isDirectory) {
            toast('Directory is not supported.')
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
            {isAddressSet && !listing && files.map(file => (
              <Table.Row key={file.cid}>
                <Table.Cell></Table.Cell>
                <Table.Cell>
                  <Link download href={`${IPFS_GATEWAY_ENDPOINT}/ipfs/${file.cid}?filename=${file.filename}`}>
                    {file.cid}
                  </Link>
                  <Tooltip delayDuration={0} content={copyCIDTooltip} open={copyCIDTooltipOpen} onOpenChange={v => (setCopyCIDTooltipOpen(v), !v && resetCopyCIDTooltip())}>
                    <IconButton ml='3' variant='ghost' radius='full' onClick={() => {
                      navigator.clipboard.writeText(file.cid)
                      setCopyCIDTooltipCopied()
                      setCopyCIDTooltipOpen(true)
                    }}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Table.Cell>
                <Table.Cell>{file.filename}</Table.Cell>
                <Table.Cell>
                  <Delete filename={file.filename} handleDeleteFile={handleDeleteFile}>
                    <IconButton variant='ghost' radius='full'>
                      <DotsVerticalIcon />
                    </IconButton>
                  </Delete>
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
          ) : listing ? (
            'Listing files...'
          ) : uploading ? (
            `Uploading${loadIndicator}`
          ) : deleting ? (
            'Deleting...'
          ) : dragOver ? (
            'Drop to upload.'
          ) : (
            isSigned ? (
              <>Drag and drop or {
                <Link onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.onchange = (event) => {
                    const files = (event.target as HTMLInputElement).files
                    if (!files) return
                    for (const file of files)
                      handlePutFile(file)
                  }
                  input.click()
                }}>Select files...</Link>
              }</>
            ) : isMessageSet ? (
              <Link onClick={() => signMessage({ message })}>Sign in...</Link>
            ) : (
              <>{
                <Link onClick={() => w3m.open()}>Sign in...</Link>
              } or {
                  <SelectAddress>
                    <Link>{
                      isAddressSet ? (
                        'Change Watching Address...'
                      ) : (
                        'Look Around...'
                      )}</Link>
                  </SelectAddress>
                }</>
            )
          )}
        </Text>
      </Box>
    </ScrollArea>
  )
}
