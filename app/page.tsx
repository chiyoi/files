'use client'
import { useContext, useEffect, useState } from 'react'
import { Box, IconButton, ScrollArea, Table, Text, Link, Tooltip } from '@radix-ui/themes'
import { CopyIcon, DotsVerticalIcon } from '@radix-ui/react-icons'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { z } from 'zod'
import { FontHachiMaruPop } from '@/app/lib/fonts'
import Delete from '@/app/components/Delete'
import SelectAddress from '@/app/components/SelectAddress'
import { useAuthorization, useMounted } from '@/app/lib/hooks'
import AccountContext, { useAccount } from '@/app/components/AccountContext'
import { Files, deleteFile, listFiles, putFile } from '@/app/lib/api-requests'
import { useToast } from '@/app/components/ToastContext'

const IPFS_GATEWAY_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_GATEWAY_ENDPOINT

const MAX_FILE_SIZE = 30 * 1024 * 1024

export default () => {
  const w3m = useWeb3Modal()
  const toast = useToast()

  const { connecting, addressState: [address, setAddress], message, signature, signMessage } = useAccount()
  const connected = address !== undefined && message !== undefined
  const authorization = useAuthorization(message, signature)
  const signed = authorization !== undefined

  const [listing, setListing] = useState(false)
  const handleListFiles = () => {
    if (!connected) return
    setListing(true)
    listFiles(address)
      .then(setFiles)
      .catch(error => console.error(error))
      .finally(() => setListing(false))
  }

  const [uploading, setUploading] = useState(false)
  const handlePutFile = (file: File) => {
    if (!connected || !signed) return
    if (file.size > MAX_FILE_SIZE) {
      console.error('Files is designed for small files.')
      return
    }
    setUploading(true)
    putFile(address, file, authorization)
      .then(handleListFiles)
      .catch(error => console.error(error))
      .finally(() => setUploading(false))
  }

  const [deleting, setDeleting] = useState(false)
  const handleDeleteFile = (filename: string) => {
    if (!connected || !signed) return
    setDeleting(true)
    deleteFile(address, filename, authorization)
      .then(handleListFiles)
      .catch(error => console.error(error))
      .finally(() => setDeleting(false))
  }

  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<z.infer<typeof Files>>([])
  useEffect(handleListFiles, [address])

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

  const [copyCIDTooltip, setCopyCIDTooltip] = useState('copy')
  const [copyCIDTooltipOpen, setCopyCIDTooltipOpen] = useState(false)
  const resetCopyCIDTooltip = () => setCopyCIDTooltip('copy')
  const setCopyCIDTooltipCopied = () => setCopyCIDTooltip('copied')

  const mounted = useMounted()
  return mounted && (
    <ScrollArea type='auto'
      scrollbars='both'
      onDragOver={e => {
        e.preventDefault()
        if (!signed) return
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault()
        if (!signed) return
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
            {address !== undefined && !listing && files.map(file => (
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
          {connecting ? (
            'Loading...'
          ) : listing ? (
            'Listing files...'
          ) : uploading ? (
            `Uploading${loadIndicator}`
          ) : deleting ? (
            'Deleting...'
          ) : dragOver ? (
            'Drop to upload.'
          ) : signed ? (
            <>Drag and drop or <Link onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = (event) => {
                const files = (event.target as HTMLInputElement).files
                if (!files) return
                for (const file of files)
                  handlePutFile(file)
              }
              input.click()
            }}>Select files...</Link></>
          ) : address === undefined ? (
            <><Link onClick={() => w3m.open()}>Sign in...</Link> or <SelectAddress addressState={[address, setAddress]}><Link>Look Around...</Link></SelectAddress></>
          ) : (
            <Link onClick={() => {
              if (connected) signMessage({ message })
              else w3m.open()
            }}>Sign in...</Link>
          )}
        </Text>
      </Box>
    </ScrollArea>
  )
}
