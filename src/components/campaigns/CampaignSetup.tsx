import { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Plus, 
  Bot, 
  Play, 
  Pause, 
  Settings,
  Mic,
  Phone,
  Calendar,
  Users,
  Edit,
  Trash2
} from 'lucide-react'
import { Campaign, Business, Lead } from '../../types'
import { toast } from 'sonner'

export function CampaignSetup() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    businessId: '',
    script: '',
    scheduledAt: ''
  })

  const defaultScript = `Hello [LEAD_NAME], this is [AI_AGENT_NAME] calling from [BUSINESS_NAME].

I hope I'm not catching you at a bad time. I'm reaching out because we specialize in [SERVICE_TYPE] and I believe we could help you with [SPECIFIC_BENEFIT].

Could I ask you a quick question - are you currently looking for [SERVICE_TYPE] services?

[WAIT FOR RESPONSE]

That's great! We've been helping customers in your area for [YEARS] years, and we have some special offers available this month.

Would you be interested in learning more about how we can help you with [SPECIFIC_SERVICE]?

[WAIT FOR RESPONSE]

Perfect! I'd love to schedule a quick 15-minute consultation where we can discuss your specific needs. 

What works better for you - mornings or afternoons this week?

[SCHEDULE APPOINTMENT]

Thank you so much for your time, [LEAD_NAME]. I'll send you a confirmation message shortly. Have a wonderful day!`

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      const [campaignsData, businessesData, leadsData] = await Promise.all([
        blink.db.campaigns.list({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
        blink.db.businesses.list({ where: { userId: user.id } }),
        blink.db.leads.list({ where: { userId: user.id } })
      ])

      setCampaigns(campaignsData)
      setBusinesses(businessesData)
      setLeads(leadsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.businessId || !newCampaign.script) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const user = await blink.auth.me()
      
      await blink.db.campaigns.create({
        id: `campaign_${Date.now()}`,
        userId: user.id,
        businessId: newCampaign.businessId,
        name: newCampaign.name,
        script: newCampaign.script,
        status: 'draft',
        scheduledAt: newCampaign.scheduledAt || undefined
      })

      toast.success('Campaign created successfully')
      setShowCreateDialog(false)
      setNewCampaign({ name: '', businessId: '', script: '', scheduledAt: '' })
      loadData()
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Failed to create campaign')
    }
  }

  const handleUpdateCampaignStatus = async (campaignId: string, status: Campaign['status']) => {
    try {
      await blink.db.campaigns.update(campaignId, { 
        status, 
        updatedAt: new Date().toISOString() 
      })
      
      toast.success(`Campaign ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'updated'}`)
      loadData()
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await blink.db.campaigns.delete(campaignId)
      toast.success('Campaign deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCampaignLeads = (businessId: string) => {
    return leads.filter(lead => lead.businessId === businessId)
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Voice Agent</h1>
          <p className="text-muted-foreground">Create and manage your automated calling campaigns</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Set up your AI voice agent campaign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  placeholder="e.g., Spring Promotion Outreach"
                />
              </div>
              <div>
                <Label htmlFor="business">Business *</Label>
                <Select value={newCampaign.businessId} onValueChange={(value) => setNewCampaign({...newCampaign, businessId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name} - {business.serviceType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduled-at">Schedule For (Optional)</Label>
                <Input
                  id="scheduled-at"
                  type="datetime-local"
                  value={newCampaign.scheduledAt}
                  onChange={(e) => setNewCampaign({...newCampaign, scheduledAt: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="script">Voice Script *</Label>
                <Textarea
                  id="script"
                  value={newCampaign.script}
                  onChange={(e) => setNewCampaign({...newCampaign, script: e.target.value})}
                  placeholder="Enter your AI voice script..."
                  className="min-h-[200px]"
                />
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewCampaign({...newCampaign, script: defaultScript})}
                  >
                    Use Default Script Template
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Campaigns</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>Manage your AI voice agent campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI voice campaign to start automating your outreach
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const business = businesses.find(b => b.id === campaign.businessId)
                const campaignLeads = getCampaignLeads(campaign.businessId)
                
                return (
                  <div key={campaign.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        {business && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Business: {business.name} ({business.serviceType})
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {campaignLeads.length} leads
                          </div>
                          {campaign.scheduledAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Scheduled: {new Date(campaign.scheduledAt).toLocaleDateString()}
                            </div>
                          )}
                          <span>
                            Created: {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {campaign.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateCampaignStatus(campaign.id, 'paused')}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Script Preview */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Voice Script Preview</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {campaign.script}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Voice Agent Info */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Voice Agent Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Natural Conversations</h4>
              <p className="text-sm text-muted-foreground">
                AI agent handles objections, answers questions, and maintains natural dialogue flow
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Smart Scheduling</h4>
              <p className="text-sm text-muted-foreground">
                Automatically books appointments and sends calendar invites to interested prospects
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Follow-up Automation</h4>
              <p className="text-sm text-muted-foreground">
                Sends WhatsApp and email follow-ups based on call outcomes
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Real-time Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Track call success rates, conversion metrics, and campaign performance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}