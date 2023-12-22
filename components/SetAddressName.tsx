import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

const APIEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

export default function SetAddressName(props: Props) {
  const { trigger, address, setAddressName, closeMenu } = props
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [nameFetched, setNameFetched] = useState('')
  useEffect(() => {
    (async () => {
      const response = await fetch(`${APIEndpoint}/names/${address}`)
      if (!response.ok) console.error(`Fetch address name error: ${await response.text()}`)
      setNameFetched(await response.text())
    })()
  }, [])

  function handleSave() {
    setOpen(false)
    closeMenu()
    if (name !== '') setAddressName(name)
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
        <Dialog.Title>Set Address Name</Dialog.Title>
        <Dialog.Description size='2' mb='3'>
          Register a name for your address.
        </Dialog.Description>
        <Text as='div'>Your address is {address}</Text>
        {nameFetched !== '' && (
          <Text as='div' mb='3'>Address name is "{nameFetched}"</Text>
        )}
        <TextField.Input mb='4'
          placeholder='Enter a name...'
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
        />
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
  address: string,
  closeMenu: () => void,
  setAddressName: (name: string) => void,
}