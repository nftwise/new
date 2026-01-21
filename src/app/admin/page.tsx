'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NeuralAdminOverview from '@/components/NeuralAdminOverview'
import { Loading } from '@/components/neural'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <Loading text="Loading admin dashboard..." />
  }

  if (!session || session.user.role !== 'admin') {
    return null // Will redirect
  }

  return (
    <NeuralAdminOverview
      user={{
        email: session.user.email || '',
        role: session.user.role
      }}
    />
  )
}
