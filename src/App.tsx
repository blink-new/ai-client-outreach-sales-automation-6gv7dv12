import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { LeadManagement } from '@/components/leads/LeadManagement'
import { CampaignManagement } from '@/components/campaigns/CampaignManagement'
import { CalendarView } from '@/components/calendar/CalendarView'
import { InteractionHistory } from '@/components/history/InteractionHistory'
import { Settings } from '@/components/settings/Settings'
import { blink } from '@/blink/client'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'leads':
        return <LeadManagement />
      case 'campaigns':
        return <CampaignManagement />
      case 'calendar':
        return <CalendarView />
      case 'history':
        return <InteractionHistory />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your AI outreach platform...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Outreach Platform</h1>
          <p className="text-gray-600 mb-8">
            Automate your client outreach and sales with AI-powered voice agents, WhatsApp, and email integrations.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Sign In to Get Started
          </button>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">AI</div>
              <div className="text-xs text-gray-500">Voice Agent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">📱</div>
              <div className="text-xs text-gray-500">WhatsApp</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">📧</div>
              <div className="text-xs text-gray-500">Email</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        {renderContent()}
      </main>
    </div>
  )
}

export default App