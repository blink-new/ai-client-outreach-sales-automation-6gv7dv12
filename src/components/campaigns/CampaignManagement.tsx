import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Phone, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Mic,
  Calendar,
  Users,
  BarChart3,
  Clock
} from 'lucide-react'
import { blink } from '@/blink/client'
import type { Campaign, Business, Lead } from '@/types'

export function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    business_id: '',
    script: `Hello, this is [Agent Name] calling from [Business Name]. 

I hope I'm not catching you at a bad time. I'm reaching out because we specialize in [Service Type] and I noticed you might benefit from our services.

Could I take just 2 minutes to tell you about how we've helped other customers like yourself?

[Wait for response]

Great! We offer [Brief Service Description]. What makes us different is [Unique Value Proposition].

Would you be interested in learning more? I could schedule a quick 15-minute consultation to discuss your specific needs.

What works better for you - this week or next week?`,
    scheduled_at: ''
  })

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      const [campaignsData, businessesData, leadsData] = await Promise.all([
        blink.db.campaigns.list({ 
          where: { user_id: user.id },
          orderBy: { created_at: 'desc' }
        }),
        blink.db.businesses.list({ where: { user_id: user.id } }),
        blink.db.leads.list({ where: { user_id: user.id } })
      ])
      
      setCampaigns(campaignsData)
      setBusinesses(businessesData)
      setLeads(leadsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCampaign = async () => {
    try {
      const user = await blink.auth.me()
      const campaignData = {
        id: `campaign_${Date.now()}`,
        user_id: user.id,
        ...newCampaign,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await blink.db.campaigns.create(campaignData)
      setCampaigns(prev => [campaignData, ...prev])
      setNewCampaign({
        name: '',
        business_id: '',
        script: newCampaign.script,
        scheduled_at: ''
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create campaign:', error)
    }
  }

  const handleUpdateCampaignStatus = async (campaignId: string, status: Campaign['status']) => {
    try {
      await blink.db.campaigns.update(campaignId, { 
        status,
        updated_at: new Date().toISOString()
      })
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, status } : campaign
      ))
    } catch (error) {
      console.error('Failed to update campaign status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId)
    return business?.name || 'Unknown Business'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Voice Agent</h1>
          <p className="text-gray-600">Create and manage automated calling campaigns</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up an AI voice campaign to automatically call your leads.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="script">Voice Script</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., New Customer Outreach"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business">Business *</Label>
                  <Select value={newCampaign.business_id} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, business_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name} - {business.service_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduled-at">Schedule Campaign (Optional)</Label>
                  <Input
                    id="scheduled-at"
                    type="datetime-local"
                    value={newCampaign.scheduled_at}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to start manually
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="script" className="space-y-4">
                <div>
                  <Label htmlFor="script">Voice Script *</Label>
                  <Textarea
                    id="script"
                    value={newCampaign.script}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, script: e.target.value }))}
                    placeholder="Enter your AI voice script..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Script Variables:</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p><code>[Agent Name]</code> - AI agent's name</p>
                      <p><code>[Business Name]</code> - Your business name</p>
                      <p><code>[Service Type]</code> - Type of service you offer</p>
                      <p><code>[Customer Name]</code> - Lead's name</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCampaign} 
                disabled={!newCampaign.name || !newCampaign.business_id || !newCampaign.script}
              >
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-amber-600">
                  {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Your Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first AI voice campaign to start reaching out to leads automatically.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Settings className="w-4 h-4" />
                          {getBusinessName(campaign.business_id)}
                        </span>
                        {campaign.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(campaign.scheduled_at).toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {campaign.script.substring(0, 200)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {campaign.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {campaign.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'paused')}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}

                      {campaign.status === 'paused' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}

                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}