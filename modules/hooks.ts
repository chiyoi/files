'use client'
import { getName } from '@/modules/ens-requests'
import { useEffect, useMemo, useState } from 'react'

export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

export function useAuthorization(message?: string, signature?: string) {
  return useMemo(() => {
    if (message === undefined || signature === undefined) return
    return `Signature ${btoa(message)}:${signature}`
  }, [message, signature])
}


export function useNameRegistered(address: `0x${string}` | undefined) {
  const [name, setName] = useState('')
  useEffect(() => {
    (async () => {
      if (address === undefined) return
      setName(await getName(address))
    })()
  }, [address])
  return name
}
