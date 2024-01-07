import { z } from 'zod'
import { API_ENDPOINT } from '.'

export const getCurrentPeriodBill = async (address: `0x${string}`) => {
  const response = await fetch(`${API_ENDPOINT}/${address}/bills/current_period`)
  if (!response.ok) throw new Error(`Get Current Period Bill error: ${await response.text()}`)
  return z.object({ amount: z.coerce.bigint() }).parse(await response.json())
}

export const getPastDueBill = async (address: `0x${string}`) => {
  const response = await fetch(`${API_ENDPOINT}/${address}/bills/past_due`)
  if (!response.ok) throw new Error(`Get Past Due error: ${await response.text()}`)
  return z.object({ amount: z.coerce.bigint() }).parse(await response.json())
}
