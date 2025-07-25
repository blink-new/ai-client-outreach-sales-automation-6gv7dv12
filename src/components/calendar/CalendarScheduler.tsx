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
import { Calendar } from '../ui/calendar'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { Appointment, Lead, Business } from '../../types'
import { toast } from 'sonner'

export function CalendarScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [newAppointment, setNewAppointment] = useState({
    leadId: '',
    businessId: '',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60
  })

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      const [appointmentsData, leadsData, businessesData] = await Promise.all([
        blink.db.appointments.list({ 
          where: { userId: user.id }, 
          orderBy: { scheduledAt: 'asc' } 
        }),
        blink.db.leads.list({ where: { userId: user.id } }),
        blink.db.businesses.list({ where: { userId: user.id } })
      ])

      setAppointments(appointmentsData)
      setLeads(leadsData)
      setBusinesses(businessesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateAppointment = async () => {
    if (!newAppointment.leadId || !newAppointment.businessId || !newAppointment.title || !newAppointment.scheduledAt) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const user = await blink.auth.me()
      
      await blink.db.appointments.create({
        id: `appointment_${Date.now()}`,
        userId: user.id,
        leadId: newAppointment.leadId,
        businessId: newAppointment.businessId,
        title: newAppointment.title,
        description: newAppointment.description || undefined,
        scheduledAt: newAppointment.scheduledAt,
        duration: newAppointment.duration,
        status: 'scheduled'
      })

      toast.success('Appointment scheduled successfully')
      setShowCreateDialog(false)
      setNewAppointment({
        leadId: '',
        businessId: '',
        title: '',
        description: '',
        scheduledAt: '',
        duration: 60
      })
      loadData()
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Failed to schedule appointment')
    }
  }

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await blink.db.appointments.update(appointmentId, { status })
      toast.success(`Appointment ${status}`)
      loadData()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await blink.db.appointments.delete(appointmentId)
      toast.success('Appointment deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Failed to delete appointment')
    }
  }

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return Clock
      case 'completed': return CheckCircle
      case 'cancelled': return XCircle
      default: return Clock
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return appointments.filter(apt => 
      new Date(apt.scheduledAt).toDateString() === dateStr
    )
  }

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.scheduledAt) >= new Date() && apt.status === 'scheduled')
    .slice(0, 5)

  const todayAppointments = getAppointmentsForDate(new Date())

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    totalAppointments: appointments.length,
    scheduledAppointments: appointments.filter(a => a.status === 'scheduled').length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,
    todayAppointments: todayAppointments.length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar & Scheduler</h1>
          <p className="text-muted-foreground">Manage appointments and meetings</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>Book a meeting with a lead</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lead">Lead *</Label>
                <Select value={newAppointment.leadId} onValueChange={(value) => setNewAppointment({...newAppointment, leadId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} - {lead.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="business">Business *</Label>
                <Select value={newAppointment.businessId} onValueChange={(value) => setNewAppointment({...newAppointment, businessId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                  placeholder="e.g., Initial Consultation"
                />
              </div>
              <div>
                <Label htmlFor="scheduled-at">Date & Time *</Label>
                <Input
                  id="scheduled-at"
                  type="datetime-local"
                  value={newAppointment.scheduledAt}
                  onChange={(e) => setNewAppointment({...newAppointment, scheduledAt: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select 
                  value={newAppointment.duration.toString()} 
                  onValueChange={(value) => setNewAppointment({...newAppointment, duration: parseInt(value)})}
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
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                  placeholder="Meeting agenda or notes"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAppointment}>
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
            <div className="mt-4">
              <h4 className="font-medium mb-2">
                Appointments for {selectedDate.toLocaleDateString()}
              </h4>
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments scheduled</p>
              ) : (
                <div className="space-y-2">
                  {getAppointmentsForDate(selectedDate).map(appointment => {
                    const lead = leads.find(l => l.id === appointment.leadId)
                    return (
                      <div key={appointment.id} className="text-sm p-2 bg-muted rounded">
                        <div className="font-medium">{appointment.title}</div>
                        <div className="text-muted-foreground">
                          {new Date(appointment.scheduledAt).toLocaleTimeString()} - {lead?.name}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your next scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => {
                  const lead = leads.find(l => l.id === appointment.leadId)
                  const business = businesses.find(b => b.id === appointment.businessId)
                  const StatusIcon = getStatusIcon(appointment.status)
                  
                  return (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium">{appointment.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(appointment.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {appointment.status}
                            </Badge>
                            {business && (
                              <Badge variant="outline">{business.name}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(appointment.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(appointment.scheduledAt).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {appointment.duration} minutes
                        </div>
                        {lead && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {lead.name} - {lead.phone}
                          </div>
                        )}
                      </div>
                      
                      {appointment.description && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                          {appointment.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}