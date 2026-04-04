export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'client'
  tier: 'Silver' | 'Gold' | 'Platinum'
  passport_num?: string
  dob?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  nationality?: string
  dietary_reqs?: string
  medical_needs?: string
  preferred_contact?: string
  emergency_name?: string
  emergency_phone?: string
  emergency_relation?: string
  notes?: string
  total_spent?: number
  trips_count?: number
  approved: boolean
  created_at: string
}

export interface Deal {
  id: string
  title: string
  destination: string
  price: string
  duration: string
  category: string
  description?: string
  image: string
  featured: boolean
  active: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  capacity: number
  exclusive: boolean
  active: boolean
  rsvp_count?: number
  created_at: string
}

export interface EventRsvp {
  id: string
  event_id: string
  client_id: string
  created_at: string
}

export interface GroupTrip {
  id: string
  name: string
  destination: string
  date?: string
  spots: number
  booked: number
  price?: string
  status: 'Open' | 'Sold Out' | 'Waitlist'
  description?: string
  created_at: string
}

export interface Appointment {
  id: string
  client_id?: string
  client_name: string
  date: string
  time: string
  type: 'Consultation' | 'Trip Planning' | 'Intake' | 'Follow-Up' | 'VIP Meeting'
  notes?: string
  status: 'Pending' | 'Confirmed' | 'Cancelled'
  created_at: string
}

export interface BlockedDate {
  id: string
  date: string
  reason?: string
}

export interface Booking {
  id: string
  client_id?: string
  client_name: string
  package_name: string
  travel_date?: string
  return_date?: string
  group_size?: number
  budget?: string
  accommodation?: string
  special_occasion?: string
  experience_types?: string[]
  destination?: string
  value?: number
  status: 'Pending' | 'Deposit Paid' | 'Confirmed' | 'Completed' | 'Cancelled'
  notes?: string
  created_at: string
}

export interface IntakeRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  dob?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  passport_num?: string
  nationality?: string
  destination?: string
  travel_dates?: string
  return_date?: string
  group_size?: number
  budget?: string
  accommodation?: string
  special_occasion?: string
  experience_types?: string[]
  dietary_reqs?: string
  medical_needs?: string
  preferred_contact?: string
  emergency_name?: string
  emergency_phone?: string
  emergency_relation?: string
  heard_from?: string
  notes?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Profile
  recipient?: Profile
}
