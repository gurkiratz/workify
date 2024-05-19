'use client'

import { Inter } from 'next/font/google'
import '../globals.css'
import '@near-wallet-selector/modal-ui/styles.css'

import { MintbaseWalletContextProvider } from '@mintbase-js/react'

const inter = Inter({ subsets: ['latin'] })

const MintbaseWalletSetup = {
  contractAddress:
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    'hellovirtualworld.mintspace2.testnet',
  network: process.env.NEXT_PUBLIC_NETWORK || 'testnet',
  callbackUrl:
    process.env.NEXT_PUBLIC_CALLBACK_URL ||
    (typeof window !== 'undefined' ? window.location.origin : ''),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MintbaseWalletContextProvider {...MintbaseWalletSetup}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </MintbaseWalletContextProvider>
  )
}
