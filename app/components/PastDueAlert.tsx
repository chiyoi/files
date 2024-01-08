import { useSignContext } from '@/app/components/SignContext'
import { useMounted, useNameRegistered } from '@/app/internal/hooks'
import { AlertDialog, Button, Flex } from '@radix-ui/themes'
import { Dispatch, SetStateAction } from 'react'
import { useAccount } from 'wagmi'

export default (props: Props) => {
  const { open, setOpen, amount, } = props
  const { address } = useAccount()
  const { resetSign: reset } = useSignContext()
  const name = useNameRegistered(address)
  const mounted = useMounted()
  return mounted && (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Content>
        <AlertDialog.Title>Alert</AlertDialog.Title>
        <AlertDialog.Description size='2' mb='3'>
          Hello, {name || address}.
          You have past-due bill of Ξ{(Number(amount) / 1e18).toFixed(18)}.
          Pay it before you can make any change.
        </AlertDialog.Description>
        <Flex gap='3' justify='end'>
          <AlertDialog.Action>
            <Button variant='soft' color='red' onClick={reset}>
              Log Out
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root >
  )
}

type Props = {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  amount: bigint,
}
