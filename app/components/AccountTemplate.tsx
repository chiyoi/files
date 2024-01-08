import { createContext, useContext, useState } from 'react'
import { useTheme } from "next-themes"
import { createWeb3Modal, defaultWagmiConfig, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { sepolia, mainnet } from 'viem/chains'
import { useAccount, useSignMessage } from 'wagmi'
import { ReactNode, useEffect, useMemo } from 'react'
import AccountButton from '@/app/components/AccountMenu'
import { getCurrentPeriodBill, getPastDueBill } from '@/app/internal/api-requests'
import PastDueAlert from '@/app/components/PastDueAlert'
import { getName } from '@/app/internal/ens-requests'
import { useToastContext } from '@/app/components/ToastContext'
import { useSignContext } from '@/app/components/SignContext'
import { useMounted } from '@/app/internal/hooks'
import { useAddressContext } from '@/app/components/AddressContext'

export default (props: Props) => {
  const { children } = props
  const toast = useToastContext()

  const { resolvedTheme } = useTheme()
  const { setThemeMode } = useWeb3ModalTheme()
  useEffect(() => setThemeMode(resolvedTheme === 'dark' ? 'dark' : 'light'), [resolvedTheme])

  const { address } = useAddressContext()
  const { signature } = useSignContext()

  const [pastDueAmount, setPastDueAmount] = useState(0n)
  const showPastDueAlertState = useState(false)
  const [showPastDueAlert, setShowPastDueAlert] = showPastDueAlertState
  useEffect(() => {
    (async () => {
      if (address === undefined || signature === undefined) return
      const pastDue = await getPastDueBill(address)
      if (pastDue.amount > 0) {
        setPastDueAmount(pastDue.amount)
        setShowPastDueAlert(true)
      } else {
        const name = await getName(address)
        toast(`Hello, ${name || address}.`)
        await new Promise(resolve => { setTimeout(resolve, 3000) })
        const bill = await getCurrentPeriodBill(address)
        bill.amount > 0 && toast(`Your current bill is Ξ${(Number(bill.amount) / 1e18).toFixed(18)}.`)
      }
    })()
  }, [signature])

  const mounted = useMounted()
  return mounted && (
    <>
      {children}
      <AccountButton />
      <PastDueAlert open={showPastDueAlert} setOpen={setShowPastDueAlert} amount={pastDueAmount} />
    </>
  )
}

type Props = {
  children: ReactNode,
}
