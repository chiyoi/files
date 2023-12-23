import { Cross2Icon } from '@radix-ui/react-icons'
import * as Toast from '@radix-ui/react-toast'
import { Flex, IconButton } from '@radix-ui/themes'
import { useState } from 'react'

export default function useToast() {
  const [title, setTitle] = useState('')
  const [open, setOpen] = useState(false)
  function toast(title: string) {
    setTitle(title)
    setOpen(true)
  }
  return [toast, (
    <Toast.Provider>
      <Toast.Root open={open} onOpenChange={setOpen} style={{
        backgroundColor: 'var(--accent-3)',
        borderColor: 'var(--accent-5)',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 1000,
        listStyleType: 'none',
      }}>
        <Flex align='center' style={{
          marginLeft: 30,
          marginRight: 10,
          marginTop: 5,
          marginBlock: 5,
        }}>
          <Toast.Title>{title}</Toast.Title>
          <Toast.Close asChild style={{
            gridArea: 'action',
          }}>
            <IconButton ml='3' variant='soft' radius='full'>
              <Cross2Icon />
            </IconButton>
          </Toast.Close>
        </Flex>
      </Toast.Root>

      <Toast.Viewport style={{
        position: 'fixed',
        top: 0,
        right: 0,
        margin: 30,
        display: 'flex',
      }} />
    </Toast.Provider>
  )] as const
}
