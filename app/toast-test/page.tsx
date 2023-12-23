'use client'
import useToast from '@/modules/toast'
import { Button } from '@radix-ui/themes'

export default function Page() {
  const [toast, Toast] = useToast()
  return (
    <>
      <Button onClick={() => {
        toast('Nyan~')
      }}>Nyan</Button>
      {Toast}
    </>
  )
}
