import { API_ENDPOINT } from '.'
import { z } from 'zod'

export async function listFiles(address: string) {
  const response = await fetch(`${API_ENDPOINT}/${address}/files`)
  if (!response.ok) throw new Error(`List files error: ${await response.text()}`)
  return Files.parse(await response.json())
}

export async function putFile(address: string, file: File, authorization: string) {
  const headers = new Headers()
  headers.set('Authorization', authorization)
  const response = await fetch(`${API_ENDPOINT}/${address}/files/${file.name}`, {
    method: 'PUT',
    headers,
    body: file,
  })
  if (!response.ok) throw new Error(`Put ${file.name} error: ${await response.text()}`)
}

export async function deleteFile(address: string, filename: string, authorization: string) {
  const headers = new Headers()
  headers.set('Authorization', authorization)
  const response = await fetch(`${API_ENDPOINT}/${address}/files/${filename}`, {
    method: 'DELETE',
    headers,
  })
  if (!response.ok) throw new Error(`Delete ${filename} error: ${await response.text()}`)
}

export const Files = z.object({
  cid: z.string(),
  filename: z.string(),
}).array()
