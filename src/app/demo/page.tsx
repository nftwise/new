'use client'

import { Suspense, useEffect, useState } from 'react'
import NeuralDashboard from '@/components/NeuralDashboard'
import { Loading } from '@/components/neural'

function DemoContent() {
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDemoClient()
  }, [])

  const fetchDemoClient = async () => {
    try {
      const response = await fetch(`/api/clients/list`)
      const data = await response.json()

      if (data.success && data.clients.length > 0) {
        // Use first client as demo (Dr DiGrado)
        setClientInfo(data.clients[0])
      } else {
        // Fallback to hardcoded demo client
        setClientInfo({
          id: 'dr-digrado',
          slug: 'dr-digrado',
          name: 'Dr DiGrado',
          contact_email: 'demo@example.com'
        })
      }
    } catch (error) {
      console.error('Error fetching demo client:', error)
      // Fallback to hardcoded demo client
      setClientInfo({
        id: 'dr-digrado',
        slug: 'dr-digrado',
        name: 'Dr DiGrado (Demo)',
        contact_email: 'demo@example.com'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Loading demo dashboard..." />
  }

  if (!clientInfo) {
    return <Loading text="Demo not available..." />
  }

  return (
    <NeuralDashboard
      user={{
        id: clientInfo.slug,
        email: clientInfo.contact_email || 'demo@example.com',
        companyName: clientInfo.name + ' (Demo)',
        role: 'client'
      }}
    />
  )
}

export default function DemoPage() {
  return (
    <Suspense fallback={<Loading text="Loading demo..." />}>
      <DemoContent />
    </Suspense>
  )
}
