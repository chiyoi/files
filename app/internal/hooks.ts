'use client'
import { getName } from '@/app/internal/ens-requests'
import { useEffect, useMemo, useState } from 'react'

export const useMounted = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

export const useAuthorization = (message?: string, signature?: string) => useMemo(() => {
  if (message === undefined || signature === undefined) return
  return `Signature ${btoa(message)}:${signature}`
}, [message, signature])

export const useNameRegistered = (address: `0x${string}` | undefined) => {
  const [name, setName] = useState<string>()
  useEffect(() => {
    (async () => {
      if (address === undefined) return setName(undefined)
      setName(await getName(address))
    })()
  }, [address])
  return name
}

export const useFallback = <T>(current?: T) => {
  const [state, setState] = useState<T>()
  return [current ?? state, setState] as const
}
