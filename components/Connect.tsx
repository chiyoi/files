import SelectAddress from '@/components/SelectAddress'
import { Button, DropdownMenu } from '@radix-ui/themes'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState } from 'react'

export default function Connect(props: Props) {
  const { addressState, isConnecting } = props
  const [open, setOpen] = useState(false)
  const w3m = useWeb3Modal()
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger>
        <Button disabled={isConnecting} radius='full' style={{
          position: 'fixed',
          right: '10px',
          top: '5px',
        }}>
          {isConnecting ? (
            `Loading...`
          ) : (
            'Connect'
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align='end'>
        <DropdownMenu.Item onSelect={e => e.preventDefault()} onClick={() => w3m.open()}>
          Sign In
        </DropdownMenu.Item>
        <SelectAddress closeMenu={() => setOpen(false)} addressState={addressState}>
          <DropdownMenu.Item onSelect={e => e.preventDefault()}>
            Look Around
          </DropdownMenu.Item>
        </SelectAddress>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

type Props = {
  isConnecting: boolean,
  addressState: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>],
}
