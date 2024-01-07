import AccountContext from '@/components/AccountContext'
import { useNameRegistered } from '@/modules/hooks'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { useContext } from 'react'

export default (props: Props) => {
  const { openState: [open, setOpen], amount, } = props
  const { addressState: [address], logout } = useContext(AccountContext)
  const name = useNameRegistered(address)
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Content>
        <AlertDialog.Title>Welcome</AlertDialog.Title>
        <AlertDialog.Description size='2' mb='3'>
          Hello, {name || address}
        </AlertDialog.Description>
        <Text as='div' mb='4'>You have past-due bill of Ξ{(Number(amount) / 1e18).toFixed(18)}. Pay it before you can make any change.</Text>
        <Flex gap='3' justify='end'>
          <AlertDialog.Action>
            <Button variant='soft' color='red' onClick={logout}>
              Log Out
            </Button>
          </AlertDialog.Action>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray'>
              Close
            </Button>
          </AlertDialog.Cancel>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}

type Props = {
  openState: [boolean, React.Dispatch<boolean>],
  amount: bigint,
}
