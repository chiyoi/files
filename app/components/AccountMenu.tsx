import SelectAddress from '@/app/components/SelectAddress'
import SetAddressName from '@/app/components/SetAddressName'
import { Box, Button, DropdownMenu, Flex, Heading, Text, HoverCard, Avatar, Link } from '@radix-ui/themes'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import ReactBlockies from 'react-blockies'
import { useAddressContext } from '@/app/components/AddressContext'
import { useNameRegistered } from '@/app/internal/hooks'
import { useSignContext } from '@/app/components/SignContext'
import { styled } from '@stitches/react'

export default () => {
  const { isConnected, isConnecting, isReconnecting } = useAccount()
  const { address } = useAddressContext()
  const isAddressSet = address !== undefined
  const { signature } = useSignContext()
  const isSigned = signature !== undefined
  const name = useNameRegistered(address)
  const isNameSet = name !== undefined
  const loading = isConnecting || isReconnecting
  const [open, setOpen] = useState(false)
  const w3m = useWeb3Modal()
  console.debug(isAddressSet, isNameSet)
  return (
    <HoverCard.Root open={open} onOpenChange={setOpen}>
      <HoverCard.Trigger>
        <Button variant='outline' radius='full' style={{
          position: 'fixed',
          right: 30,
          top: 5,
        }} onClick={() => setOpen(true)}>
          {loading ? (
            'Loading...'
          ) : address === undefined ? (
            'Connect'
          ) : (
            address.slice(0, 6) + '...'
          )}
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <Flex gap='4'>
          <Link onClick={() => w3m.open()}>
            <Avatar radius='full' fallback={
              isAddressSet ? (
                <Blockies seed={address} />
              ) : ''
            } >
            </Avatar>
          </Link>
          <Box>
            <Heading size='3' mb='3' as='h3'>{
              isNameSet ? (
                name
              ) : isAddressSet ? (
                address
              ) : (
                'Connect'
              )
            }</Heading>
            <Text as='div' size='2' mb='3' color='gray'>{
              isNameSet && isAddressSet ? (
                address
              ) : (
                ''
              )
            }</Text>
            {isSigned ? (
              <SetAddressName>
                <Text as='div' size='2'>
                  <Link>Set Name</Link>
                </Text>
              </SetAddressName>
            ) : (
              <SelectAddress>
                <Text as='div' size='2'>
                  <Link>{isAddressSet ? (
                    'Change Watching Address'
                  ) : (
                    'Watch Address'
                  )}</Link>
                </Text>
              </SelectAddress>
            )}
          </Box>
        </Flex>
      </HoverCard.Content>
    </HoverCard.Root >
  )
}

const Blockies = styled(ReactBlockies, {
  borderRadius: '100%',
  width: 30,
  height: 30,
})
