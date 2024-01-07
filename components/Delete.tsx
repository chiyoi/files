import AccountContext from '@/components/AccountContext'
import { useAuthorization } from '@/modules/hooks'
import { DropdownMenu } from '@radix-ui/themes'
import { useContext } from 'react'

export default function Delete(props: Props) {
  const { children, filename, handleDeleteFile } = props

  const { message, signature } = useContext(AccountContext)
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
