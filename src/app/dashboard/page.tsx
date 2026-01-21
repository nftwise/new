'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import NeuralDashboard from '@/components/NeuralDashboard'
import { Loading } from '@/components/neural'

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [loading, setLoading] = useState(!!clientId)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role === 'admin' && !clientId) {
      // Admins without clientId go to Team Overview
      router.push('/admin')
    }
  }, [status, session, router, clientId])

  // Fetch client info if admin is viewing a specific client
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin' && clientId) {
      fetchClientInfo()
    }
  }, [status, session, clientId])

  const fetchClientInfo = async () => {
    try {
      const response = await fetch(`/api/clients/list`)
      const data = await response.json()

      if (data.success) {
        const client = data.clients.find((c: any) => c.slug === clientId)
        if (client) {
          setClientInfo(client)
        }
      }
    } catch (error) {
      console.error('Error fetching client info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <Loading text="Loading dashboard..." />
  }

  if (!session) {
    return null // Will redirect
  }

  // Admin viewing a specific client
  if (session.user.role === 'admin' && clientId && clientInfo) {
    console.log('[Dashboard Page] Admin viewing client:', {
      clientId,
      clientInfoId: clientInfo.id,
      clientInfoName: clientInfo.name,
      clientInfoSlug: clientInfo.slug
    });

    return (
      <NeuralDashboard
        user={{
          id: clientInfo.slug,
          email: clientInfo.contact_email || '',
          companyName: clientInfo.name,
          role: 'admin'
        }}
      />
    )
  }

  // Regular client user - show their dashboard
  if (session.user.role === 'client') {
    return (
      <NeuralDashboard
        user={{
          id: session.user.clientSlug || '',
          email: session.user.email || '',
          companyName: session.user.clientName || '',
          role: session.user.role
        }}
      />
    )
  }

  return null
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading text="Loading dashboard..." />}>
      <DashboardContent />
    </Suspense>
  )
}
