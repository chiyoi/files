import { FontHachiMaruPop } from '@/fonts'
import { StyleTextAccent } from '@/styles'
import { Flex, Text } from '@radix-ui/themes'

export default function Loading() {
  return (
    <Flex align='center' justify='center' style={{
      margin: 'auto',
      borderRadius: '10px',
      width: '30vw',
      height: '30vh',
      backgroundColor: 'var(--accent-5)',
    }}>
      <Text size='6' style={{ ...FontHachiMaruPop.style, ...StyleTextAccent }}>Loading~</Text>
    </Flex>
  )
}