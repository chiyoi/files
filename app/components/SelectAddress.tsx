import { useToast } from '@/app/components/ToastContext'
import { resolveName } from '@/app/lib/ens-requests'
import { Box, Button, Dialog, Flex, Tabs, Text, TextField } from '@radix-ui/themes'
import { ReactNode, useEffect, useState } from 'react'
import { isHex } from 'viem'

export default (props: Props) => {
  const { children, addressState: [savedAddress, setSavedAddress], closeMenu } = props
  const [address, setAddress] = useState(savedAddress as string)
  const [name, setName] = useState<string>()
  const [tab, setTab] = useState<'name' | 'address'>('name')
  const [open, setOpen] = useState(false)
  const toast = useToast()

  const handleSave = async () => {
    setOpen(false)
    closeMenu?.()
    try {
      setSavedAddress(
        tab === 'address' ? (
          isHex(address) ? (
            address
          ) : address === '' ? (
            undefined
          ) : (
            toast('Address should be hex~'), undefined
          )
        ) : (
          name !== undefined ? (
            await resolveName(name)
          ) : (
            toast('Enter a name~'), undefined
          )
        )
      )
    } catch (error) {
      toast(`Failed to resolve name...`)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => {
      !v && closeMenu?.()
      setOpen(v)
    }}>
      <Dialog.Trigger>
        {children}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Select Address</Dialog.Title>
        <Dialog.Description size='2' mb='3'>
          Select an address (or a name if registered) to watch.
        </Dialog.Description>

        <Tabs.Root value={tab} onValueChange={value => setTab(value === 'address' ? 'address' : 'name')}>
          <Tabs.List>
            <Tabs.Trigger value="name">Name</Tabs.Trigger>
            <Tabs.Trigger value="address">Address</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="name">
            <TextField.Input mt='3'
              mb='4'
              placeholder='Enter the name to watch...'
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            />
          </Tabs.Content>
          <Tabs.Content value="address">
            <TextField.Input mt='3'
              mb='4'
              placeholder='Enter the address to watch...'
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            />
          </Tabs.Content>
        </Tabs.Root>

        <Flex gap='3' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray'>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={handleSave}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

type Props = {
  children: ReactNode,
  addressState: ReturnType<typeof useState<`0x${string}`>>,
  closeMenu?: () => void,
}
