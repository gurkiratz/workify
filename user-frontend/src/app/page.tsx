import { Appbar } from '@/components/Appbar'
import { Hero } from '@/components/Hero'
import { Upload } from '@/components/Upload'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '⛏️Workify',
  description: 'Simple Login with Next.js 14',
}

export default function Home() {
  return (
    <main>
      <Appbar />
      <Hero />
      <Upload />
    </main>
  )
}
