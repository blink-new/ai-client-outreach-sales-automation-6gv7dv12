import { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react'
import { Interaction, Lead, Campaign } from '../../types'

export function InteractionHistory() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      const [interactionsData, leadsData, campaignsData] = await Promise.all([
        blink.db.interactions.list({ 
          where: { userId: user.id }, 
          orderBy: { createdAt: 'desc' } 
        }),
        blink.db.leads.list({ where: { userId: user.id } }),
        blink.db.campaigns.list({ where: { userId: user.id } })
      ])

      setInteractions(interactionsData)
      setLeads(leadsData)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'call': return Phone
      case 'whatsapp': return MessageSquare
      case 'email': return Mail
      default: return MessageSquare
    }
  }

  const getStatusIcon = (status: Interaction['status']) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'failed': return XCircle
      case 'pending': return Clock
      default: return Clock
    }
  }

  const getStatusColor = (status: Interaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: Interaction['type']) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800'
      case 'whatsapp': return 'bg-green-100 text-green-800'
      case 'email': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredInteractions = interactions.filter(interaction => {
    const lead = leads.find(l => l.id === interaction.leadId)
    const campaign = campaigns.find(c => c.id === interaction.campaignId)
    
    const matchesSearch = lead?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead?.phone.includes(searchTerm) ||
                         campaign?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || interaction.type === typeFilter
    const matchesStatus = statusFilter === 'all' || interaction.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  const stats = {
    totalInteractions: interactions.length,
    completedCalls: interactions.filter(i => i.type === 'call' && i.status === 'completed').length,
    whatsappMessages: interactions.filter(i => i.type === 'whatsapp').length,
    emailsSent: interactions.filter(i => i.type === 'email').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interaction History</h1>
          <p className="text-muted-foreground">Track all calls, messages, and emails</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInteractions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCalls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.whatsappMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by lead name, phone, or campaign..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Interactions ({filteredInteractions.length})</CardTitle>
          <CardDescription>Complete history of all customer touchpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInteractions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No interactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start a campaign to see interactions here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInteractions.map((interaction) => {
                const lead = leads.find(l => l.id === interaction.leadId)
                const campaign = campaigns.find(c => c.id === interaction.campaignId)
                const InteractionIcon = getInteractionIcon(interaction.type)
                const StatusIcon = getStatusIcon(interaction.status)
                
                return (
                  <div key={interaction.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(interaction.type)}`}>
                          <InteractionIcon className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {lead?.name || 'Unknown Lead'}
                          </h3>
                          <Badge className={getTypeColor(interaction.type)}>
                            {interaction.type}
                          </Badge>
                          <Badge className={getStatusColor(interaction.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {interaction.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead?.phone || 'N/A'}
                          </div>
                          {campaign && (
                            <span>Campaign: {campaign.name}</span>
                          )}
                          {interaction.duration && (
                            <span>Duration: {formatDuration(interaction.duration)}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(interaction.createdAt).toLocaleDateString()} at{' '}
                            {new Date(interaction.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        {interaction.content && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-2">
                            <p className="text-sm font-medium mb-1">Content:</p>
                            <p className="text-sm text-muted-foreground">{interaction.content}</p>
                          </div>
                        )}
                        
                        {interaction.response && (
                          <div className="bg-accent/10 rounded-lg p-3">
                            <p className="text-sm font-medium mb-1">Response:</p>
                            <p className="text-sm text-muted-foreground">{interaction.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}