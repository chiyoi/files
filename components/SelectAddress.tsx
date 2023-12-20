import { Box, Button, Dialog, Flex, Tabs, Text, TextField } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

const APIEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

export default function SelectAddress(props: Props) {
  const { trigger, addressState: [savedAddress, setSavedAddress], closeMenu } = props
  const [address, setAddress] = useState(savedAddress)
  const [name, setName] = useState<string>()
  const [tab, setTab] = useState<string>('name')
  const [open, setOpen] = useState(false)

  async function handleSave() {
    setOpen(false)
    closeMenu()
    switch (tab) {
    case 'name':
      const response = await fetch(`${APIEndpoint}/addresses/${name}`)
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Name not exist.') // TODO: toast
          return
        }
        console.error(`Resolve name error: ${await response.text()}`)
      }
      setSavedAddress(await response.text())
      return
    case 'address':
      setSavedAddress(address)
      return
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => {
      !v && closeMenu()
      setOpen(v)
    }}>
      <Dialog.Trigger>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Select Address</Dialog.Title>
        <Dialog.Description size='2' mb='3'>
          Select an address (or a name if registered) to watch.
        </Dialog.Description>

        <Tabs.Root value={tab} onValueChange={value => setTab(value)}>
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
  trigger: React.ReactNode,
  closeMenu: () => void,
  addressState: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>],
}
