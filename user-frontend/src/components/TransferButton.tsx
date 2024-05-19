// components/TransferButton.js
import { useState, useEffect } from 'react'
import { initNear, transferTokens } from '@/utils/near'

export default function TransferButton() {
  const [wallet, setWallet] = useState(null)

  useEffect(() => {
    const initializeWallet = async () => {
      const { wallet } = await initNear()
      // @ts-ignore
      setWallet(wallet)
      if (!wallet.isSignedIn()) {
        // @ts-ignore
        wallet.requestSignIn()
      }
    }
    initializeWallet()
  }, [])

  const handleTransfer = async () => {
    if (wallet && wallet.isSignedIn()) {
      const receiverId = 'example-account.testnet' // Replace with the target account
      const amount = '1000000000000000000000000' // 1 NEAR in yoctoNEAR (10^24)
      try {
        const result = await transferTokens(wallet, receiverId, amount)
        console.log('Transfer successful:', result)
      } catch (error) {
        console.error('Transfer failed:', error)
      }
    } else {
      wallet.requestSignIn()
    }
  }

  return <button onClick={handleTransfer}>Transfer Tokens</button>
}
