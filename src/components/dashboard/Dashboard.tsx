import { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Users, 
  Phone, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Business, Lead, Campaign, Interaction } from '../../types'

export function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      
      const [businessesData, leadsData, campaignsData, interactionsData] = await Promise.all([
        blink.db.businesses.list({ where: { userId: user.id } }),
        blink.db.leads.list({ where: { userId: user.id } }),
        blink.db.campaigns.list({ where: { userId: user.id } }),
        blink.db.interactions.list({ where: { userId: user.id } })
      ])

      setBusinesses(businessesData)
      setLeads(leadsData)
      setCampaigns(campaignsData)
      setInteractions(interactionsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    totalLeads: leads.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalInteractions: interactions.length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0
  }

  const recentInteractions = interactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your AI outreach platform</p>
        </div>
        {businesses.length === 0 && (
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Setup Your Business
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.status === 'new').length} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === 'draft').length} in draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInteractions}</div>
            <p className="text-xs text-muted-foreground">
              {interactions.filter(i => i.type === 'call').length} calls made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.status === 'converted').length} conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
            <CardDescription>Latest calls, messages, and emails</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInteractions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interactions yet</p>
                <p className="text-sm">Start a campaign to see activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full ${
                      interaction.status === 'completed' ? 'bg-green-500' :
                      interaction.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {interaction.type === 'call' && <Phone className="h-4 w-4" />}
                        {interaction.type === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                        {interaction.type === 'email' && <MessageSquare className="h-4 w-4" />}
                        <span className="font-medium capitalize">{interaction.type}</span>
                        <Badge variant={
                          interaction.status === 'completed' ? 'default' :
                          interaction.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {interaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(interaction.createdAt).toLocaleDateString()} at{' '}
                        {new Date(interaction.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your outreach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Import New Leads
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Create New Campaign
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointments
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Review Interactions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Business Setup Prompt */}
      {businesses.length === 0 && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-accent-foreground">Get Started</CardTitle>
            <CardDescription>Set up your business profile to begin automating your outreach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your business details, upload leads, and create your first AI voice campaign to start converting prospects into customers.
                </p>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Setup Business Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}