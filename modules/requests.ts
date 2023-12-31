import { useMemo } from 'react'
import { z } from 'zod'

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT
const ENS_ENDPOINT = process.env.NEXT_PUBLIC_END_ENDPOINT
const IPFS_GATEWAY_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_GATEWAY_ENDPOINT

export function useHeaders(message?: string, signature?: string) {
  return useMemo(() => {
    if (message === undefined || signature === undefined) return
    const headers = new Headers()
    headers.set('Authorization', `Signature ${btoa(message)}:${signature}`)
    return headers
  }, [message, signature])
}

export async function listFiles(address: string) {
  const response = await fetch(`${API_ENDPOINT}/files/${address}`)
  if (!response.ok) throw new Error(`List files error: ${await response.text()}`)
  return Files.parse(await response.json())
}

export async function putFile(headers: HeadersInit, address: string, file: File,) {
  const response = await fetch(`${API_ENDPOINT}/files/${address}/${file.name}`, {
    method: 'PUT',
    headers,
    body: file,
  })
  if (!response.ok) throw new Error(`Put ${file.name} error: ${await response.text()}`)
}

export async function deleteFile(headers: HeadersInit, address: string, filename: string) {
  const response = await fetch(`${API_ENDPOINT}/files/${address}/${filename}`, {
    method: 'DELETE',
    headers,
  })
  if (!response.ok) throw new Error(`Delete ${filename} error: ${await response.text()}`)
}

export async function setAddressName(headers: HeadersInit, address: string, name: string) {
  const response = await fetch(`${ENS_ENDPOINT}/${address}/name`, {
    method: 'PUT',
    headers,
    body: name,
  })
  if (!response.ok) throw new Error(`Set address name error: ${await response.text()}`)
}

export const Files = z.object({
  cid: z.string(),
  filename: z.string(),
}).array()
