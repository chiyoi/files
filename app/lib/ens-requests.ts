import { z } from 'zod'

const ENS_ENDPOINT = process.env.NEXT_PUBLIC_ENS_ENDPOINT

export const resolveName = async (name: string) => {
  console.debug(`${ENS_ENDPOINT}/${name}/address`)
  const response = await fetch(`${ENS_ENDPOINT}/${name}/address`)
  if (!response.ok) throw new Error(`Resolve Name error: ${await response.text()}`)
  return await response.text() as `0x${string}`
}

export const getName = async (address: `0x${string}`) => {
  const response = await fetch(`${ENS_ENDPOINT}/${address}/name`)
  if (!response.ok) throw new Error(`Get Name error: ${await response.text()}`)
  return response.text()
}

export const setName = async (address: string, name: string, authorization: string) => {
  const headers = new Headers()
  headers.set('Authorization', authorization)
  const response = await fetch(`${ENS_ENDPOINT}/${address}/name`, {
    method: 'PUT',
    headers,
    body: name,
  })
  if (!response.ok) throw new Error(`Set Name error: ${await response.text()}`)
  return z.object({ set: z.object({ name: z.string(), address: z.string() }) }).parse(await response.json())
}
