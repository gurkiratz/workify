import { Appbar } from '@/components/Appbar'
import { NextTask } from '@/components/NextTask'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: '👷Workify Worker',
  description: 'Simple Login with Next.js 14',
}

export default function Home() {
  return (
    <div>
      <Appbar />
      <NextTask />
    </div>
  )
}
