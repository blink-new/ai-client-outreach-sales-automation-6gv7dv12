import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings as SettingsIcon, 
  Building, 
  Phone, 
  MessageSquare, 
  Mail, 
  User,
  Save,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import { blink } from '@/blink/client'
import type { Business } from '@/types'

export function Settings() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    service_type: '',
    description: '',
    phone: '',
    email: ''
  })
  const [integrationSettings, setIntegrationSettings] = useState({
    whatsapp_enabled: false,
    email_enabled: false,
    voice_enabled: true,
    auto_followup: true,
    followup_delay: 24
  })

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      const businessesData = await blink.db.businesses.list({ 
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      })
      
      setBusinesses(businessesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddBusiness = async () => {
    try {
      setSaving(true)
      const user = await blink.auth.me()
      const businessData = {
        id: `business_${Date.now()}`,
        user_id: user.id,
        ...newBusiness,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await blink.db.businesses.create(businessData)
      setBusinesses(prev => [businessData, ...prev])
      setNewBusiness({
        name: '',
        service_type: '',
        description: '',
        phone: '',
        email: ''
      })
    } catch (error) {
      console.error('Failed to add business:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      await blink.db.businesses.delete(businessId)
      setBusinesses(prev => prev.filter(b => b.id !== businessId))
    } catch (error) {
      console.error('Failed to delete business:', error)
    }
  }

  const serviceTypes = [
    'Salon & Beauty',
    'Plumbing',
    'Fitness & Personal Training',
    'Real Estate',
    'Consulting',
    'Home Services',
    'Healthcare',
    'Legal Services',
    'Marketing Agency',
    'Restaurant',
    'Retail',
    'Other'
  ]

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your business information and integrations</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Business Setup</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Business Setup */}
        <TabsContent value="business" className="space-y-6">
          {/* Add New Business */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Business
              </CardTitle>
              <CardDescription>
                Set up a new business profile for your outreach campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business-name">Business Name *</Label>
                  <Input
                    id="business-name"
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Elite Fitness Studio"
                  />
                </div>
                <div>
                  <Label htmlFor="service-type">Service Type *</Label>
                  <Select value={newBusiness.service_type} onValueChange={(value) => setNewBusiness(prev => ({ ...prev, service_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBusiness.description}
                  onChange={(e) => setNewBusiness(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your business and services..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newBusiness.phone}
                    onChange={(e) => setNewBusiness(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBusiness.email}
                    onChange={(e) => setNewBusiness(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@business.com"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddBusiness} 
                disabled={!newBusiness.name || !newBusiness.service_type || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Adding...' : 'Add Business'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Businesses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Your Businesses ({businesses.length})
              </CardTitle>
              <CardDescription>
                Manage your existing business profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businesses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No businesses added yet</p>
                  <p className="text-sm">Add your first business above to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {businesses.map((business) => (
                    <div key={business.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                            <Badge className="bg-blue-100 text-blue-800">
                              {business.service_type}
                            </Badge>
                          </div>
                          
                          {business.description && (
                            <p className="text-gray-600 mb-3">{business.description}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {business.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {business.phone}
                              </span>
                            )}
                            {business.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {business.email}
                              </span>
                            )}
                            <span className="text-gray-400">
                              Added {new Date(business.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteBusiness(business.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Communication Integrations
              </CardTitle>
              <CardDescription>
                Configure your outreach channels and automation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Calls */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">AI Voice Calls</h4>
                    <p className="text-sm text-gray-600">Automated phone calls with AI agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <Switch 
                    checked={integrationSettings.voice_enabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, voice_enabled: checked }))}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">WhatsApp Integration</h4>
                    <p className="text-sm text-gray-600">Send follow-up messages via WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-800">Setup Required</Badge>
                  <Switch 
                    checked={integrationSettings.whatsapp_enabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, whatsapp_enabled: checked }))}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email Integration</h4>
                    <p className="text-sm text-gray-600">Send confirmations and receipts via email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-800">Setup Required</Badge>
                  <Switch 
                    checked={integrationSettings.email_enabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, email_enabled: checked }))}
                  />
                </div>
              </div>

              {/* Automation Settings */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Automation Settings</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-followup">Automatic Follow-ups</Label>
                      <p className="text-sm text-gray-600">Send automatic follow-up messages after calls</p>
                    </div>
                    <Switch 
                      id="auto-followup"
                      checked={integrationSettings.auto_followup}
                      onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, auto_followup: checked }))}
                    />
                  </div>

                  {integrationSettings.auto_followup && (
                    <div>
                      <Label htmlFor="followup-delay">Follow-up Delay (hours)</Label>
                      <Select 
                        value={integrationSettings.followup_delay.toString()} 
                        onValueChange={(value) => setIntegrationSettings(prev => ({ ...prev, followup_delay: parseInt(value) }))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="12">12 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="48">48 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Profile settings will be available soon</p>
                <p className="text-sm">Contact support for account changes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}