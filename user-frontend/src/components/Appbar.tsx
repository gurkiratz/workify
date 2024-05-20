'use client'
import { useMbWallet } from '@mintbase-js/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '@/utils'
import Link from 'next/link'
import { NearWalletConnector } from './NearWalletSelector'

export const Appbar = () => {
  // const { publicKey, signMessage } = useWallet()

  // async function signAndSend() {
  //   if (!publicKey) {
  //     return
  //   }
  //   const message = new TextEncoder().encode('Sign into mechanical workers')
  //   const signature = await signMessage?.(message)
  //   console.log(signature)
  //   console.log(publicKey)
  //   const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
  //     signature,
  //     publicKey: publicKey?.toString(),
  //   })

  //   localStorage.setItem('token', response.data.token)
  // }

  // useEffect(() => {
  //   signAndSend()
  // }, [publicKey])

  return (
    <div className="flex justify-between border-b pb-2 pt-2">
      <div className="text-2xl pl-4 flex justify-center pt-3">
        <Link href={'/'}>⛏️Workify</Link>
      </div>
      <div className="text-xl pr-4 pb-2">
        <NearWalletConnector />
      </div>
    </div>
  )
}
