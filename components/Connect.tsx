import SelectAddress from '@/components/SelectAddress'
import { DropdownMenu } from '@radix-ui/themes'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState } from 'react'

export default function Connect(props: Props) {
  const { trigger, addressState } = props
  const [open, setOpen] = useState(false)
  const w3m = useWeb3Modal()
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align='end'>
        <DropdownMenu.Item onSelect={e => e.preventDefault()} onClick={() => w3m.open()}>
          Sign In
        </DropdownMenu.Item>
        <SelectAddress closeMenu={() => setOpen(false)} trigger={
          <DropdownMenu.Item onSelect={e => e.preventDefault()}>
            Look Around
          </DropdownMenu.Item>
        } addressState={addressState} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

type Props = {
  trigger: React.ReactNode,
  addressState: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>],
}
