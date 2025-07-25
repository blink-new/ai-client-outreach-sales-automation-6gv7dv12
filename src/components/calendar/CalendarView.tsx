import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, CalendarProps } from '@/components/ui/calendar'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  Phone,
  Video,
  Coffee
} from 'lucide-react'
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { blink } from '@/blink/client'
import type { Appointment, Lead, Business } from '@/types'

export function CalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    lead_id: '',
    business_id: '',
    scheduled_at: '',
    duration: 60
  })

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      const [appointmentsData, leadsData, businessesData] = await Promise.all([
        blink.db.appointments.list({ 
          where: { user_id: user.id },
          orderBy: { scheduled_at: 'asc' }
        }),
        blink.db.leads.list({ where: { user_id: user.id } }),
        blink.db.businesses.list({ where: { user_id: user.id } })
      ])
      
      setAppointments(appointmentsData)
      setLeads(leadsData)
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

  const handleCreateAppointment = async () => {
    try {
      const user = await blink.auth.me()
      const appointmentData = {
        id: `appointment_${Date.now()}`,
        user_id: user.id,
        ...newAppointment,
        status: 'scheduled' as const,
        created_at: new Date().toISOString()
      }

      await blink.db.appointments.create(appointmentData)
      setAppointments(prev => [...prev, appointmentData])
      setNewAppointment({
        title: '',
        description: '',
        lead_id: '',
        business_id: '',
        scheduled_at: '',
        duration: 60
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create appointment:', error)
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.scheduled_at), date)
    )
  }

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    return lead?.name || 'Unknown Lead'
  }

  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId)
    return business?.name || 'Unknown Business'
  }

  const selectedDateAppointments = getAppointmentsForDate(selectedDate)

  const getAppointmentTypeIcon = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('call') || titleLower.includes('phone')) {
      return <Phone className="w-4 h-4" />
    }
    if (titleLower.includes('video') || titleLower.includes('zoom') || titleLower.includes('meet')) {
      return <Video className="w-4 h-4" />
    }
    if (titleLower.includes('coffee') || titleLower.includes('lunch') || titleLower.includes('meeting')) {
      return <Coffee className="w-4 h-4" />
    }
    return <CalendarIcon className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Schedule and manage your appointments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment with a lead.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Initial Consultation"
                />
              </div>

              <div>
                <Label htmlFor="lead">Lead *</Label>
                <Select value={newAppointment.lead_id} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, lead_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} - {lead.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="business">Business *</Label>
                <Select value={newAppointment.business_id} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, business_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled-at">Date & Time *</Label>
                  <Input
                    id="scheduled-at"
                    type="datetime-local"
                    value={newAppointment.scheduled_at}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select 
                    value={newAppointment.duration.toString()} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Meeting agenda, location, or additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAppointment} 
                  disabled={!newAppointment.title || !newAppointment.lead_id || !newAppointment.business_id || !newAppointment.scheduled_at}
                >
                  Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(selectedDate, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasAppointments: (date) => getAppointmentsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasAppointments: {
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Has appointments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            <CardDescription>
              {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No appointments</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Schedule One
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getAppointmentTypeIcon(appointment.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {appointment.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(appointment.scheduled_at), 'h:mm a')} 
                          <span className="text-gray-400">•</span>
                          {appointment.duration}min
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <User className="w-3 h-3" />
                          {getLeadName(appointment.lead_id)}
                        </div>
                        {appointment.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>Your next scheduled meetings</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.filter(apt => new Date(apt.scheduled_at) > new Date()).slice(0, 5).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments
                .filter(apt => new Date(apt.scheduled_at) > new Date())
                .slice(0, 5)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getAppointmentTypeIcon(appointment.title)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getLeadName(appointment.lead_id)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(appointment.scheduled_at), 'MMM d, h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.duration}min
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}