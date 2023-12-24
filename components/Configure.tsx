import SelectAddress from '@/components/SelectAddress'
import SetAddressName from '@/components/SetAddressName'
import { Button, DropdownMenu } from '@radix-ui/themes'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState } from 'react'

export default function Configure(props: Props) {
  const { isConnected, isConnecting, isSigned, addressState, setAddressName } = props
  const [address] = addressState
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
          {address === undefined ? (
            'Loading...'
          ) : (
            address.slice(0, 6) + '...'
          )}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align='end'>
        <DropdownMenu.Item disabled={isConnecting} onSelect={e => e.preventDefault()} onClick={() => w3m.open()}>
          {!isConnected || address === undefined ? (
            'Sign In'
          ) : (
            'Wallet'
          )}
        </DropdownMenu.Item>
        {!isConnected || address === undefined || !isSigned ? (
          <SelectAddress closeMenu={() => setOpen(false)} addressState={addressState}>
            <DropdownMenu.Item onSelect={e => e.preventDefault()}>
              Change Address
            </DropdownMenu.Item>
          </SelectAddress>
        ) : (
          <SetAddressName closeMenu={() => setOpen(false)} address={address} setAddressName={setAddressName} trigger={
            <DropdownMenu.Item onSelect={e => e.preventDefault()}>
              Set Address Name
            </DropdownMenu.Item>
          } />
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

type Props = {
  isConnected: boolean,
  isConnecting: boolean,
  isSigned: boolean,
  addressState: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>],
  setAddressName: (name: string) => void,
}
