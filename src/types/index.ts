export interface Business {
  id: string
  user_id: string
  name: string
  service_type: string
  description?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  user_id: string
  business_id: string
  name: string
  phone: string
  email?: string
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested'
  source?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  user_id: string
  business_id: string
  name: string
  script: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  scheduled_at?: string
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  user_id: string
  lead_id: string
  campaign_id?: string
  type: 'call' | 'whatsapp' | 'email'
  status: 'pending' | 'completed' | 'failed'
  content?: string
  response?: string
  duration?: number
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  lead_id: string
  business_id: string
  title: string
  description?: string
  scheduled_at: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
}