import { useAccount } from '@/app/components/AccountContext'
import { useAuthorization } from '@/app/lib/hooks'
import { DropdownMenu } from '@radix-ui/themes'

export default function Delete(props: Props) {
  const { children, filename, handleDeleteFile } = props

  const { message, signature } = useAccount()
  const authorization = useAuthorization(message, signature)
  const signed = authorization !== undefined

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {children}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align='end'>
        <DropdownMenu.Item disabled={!signed} color="red" onClick={() => handleDeleteFile(filename)}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

type Props = {
  children: React.ReactNode,
  filename: string,
  handleDeleteFile: (filename: string) => void,
}
