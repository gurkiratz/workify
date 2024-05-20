'use client'
import { BACKEND_URL } from '@/utils'
import { useMbWallet } from '@mintbase-js/react'
import axios from 'axios'
import { ConnectedWalletAccount, utils } from 'near-api-js'
import { useEffect } from 'react'

export const NearWalletConnector = () => {
  const { isConnected, selector, connect, activeAccountId } = useMbWallet()

  const handleSignout = async () => {
    const wallet = await selector.wallet()
    return wallet.signOut()
  }

  const handleSignIn = async () => {
    await connect()
  }

  const handleTransfer = async () => {
    const wallet = await selector.wallet()

    // Define the receiver's account ID and amount to transfer
    const receiverId = 'mattloktest.testnet' // Replace with the target account
    const amount = utils.format.parseNearAmount('1') // 1 NEAR in yoctoNEAR (10^24)

    try {
      const result = await wallet.signAndSendTransaction({
        receiverId,
        actions: [
          {
            type: 'Transfer',
            params: { deposit: amount || '0' },
          },
        ],
      })
      console.log('Transfer successful:', result)
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  useEffect(() => {
    if (activeAccountId) {
      setToken()
    }
  }, [activeAccountId])

  const setToken = async () => {
    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
      address: activeAccountId,
    })
    console.log(response.data)
    localStorage.setItem('token', response.data.token)
  }

  if (!isConnected) {
    return (
      <button
        className="bg-white text-black rounded p-3 hover:bg-[#e1e1e1]"
        onClick={handleSignIn}
      >
        Connect To NEAR
      </button>
    )
  }

  return (
    <div>
      <p>You are connected as {activeAccountId}</p>
      <div className="flex justify-center items-center mt-4">
        <button
          className="bg-white text-black rounded p-3 hover:bg-[#e1e1e1]"
          onClick={handleSignout}
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}
