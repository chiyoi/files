import { DropdownMenu } from '@radix-ui/themes'

export default function Delete(props: Props) {
  const { children, filename, isSigned, deleteFile, listFiles } = props
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {children}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align='end'>
        <DropdownMenu.Item disabled={!isSigned} color="red" onClick={() => {
          deleteFile(filename).then(listFiles)
        }}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

type Props = {
  children: React.ReactNode,
  filename: string,
  isSigned: boolean,
  deleteFile: (filename: string) => Promise<void>,
  listFiles: () => Promise<void>,
}
