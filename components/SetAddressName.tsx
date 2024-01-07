import AccountContext from '@/components/AccountContext'
import { useAuthorization, useNameRegistered } from '@/modules/hooks'
import { setName as setAddressName } from '@/modules/ens-requests'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useContext, useState } from 'react'

export default (props: Props) => {
  const { children, closeMenu } = props
  const { addressState: [address], message, signature } = useContext(AccountContext)
  const authorization = useAuthorization(message, signature)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const nameRegistered = useNameRegistered(address)
  console.debug(address, message)

  const handleSave = () => {
    setOpen(false)
    closeMenu()
    if (authorization !== undefined && address !== undefined && name !== '')
      setAddressName(address, name, authorization)
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => {
      !v && closeMenu()
      setOpen(v)
    }}>
      <Dialog.Trigger>
        {children}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Set Address Name</Dialog.Title>
        <Dialog.Description size='2' mb='3'>
          Register a name for your address.
        </Dialog.Description>
        <Text as='div' mb='3'>Your address is {address}</Text>
        {nameRegistered !== '' && (
          <Text as='div' mb='3'>Address name is "{nameRegistered}"</Text>
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
  children: React.ReactNode,
  closeMenu: () => void,
}
