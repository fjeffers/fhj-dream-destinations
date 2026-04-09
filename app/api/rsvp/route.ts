import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function sendEmail(type: string, data: Record<string, any>, origin: string) {
  try {
    await fetch(`${origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
  } catch (e) {
    console.warn('Email send failed (non-critical):', e)
  }
}

export async function POST(req: Request) {
  try {
    const origin = new URL(req.url).origin
    const { event_id, full_name, email, phone, party_size = 1, dietary_needs, message } = await req.json()

    if (!event_id || !full_name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Event, name, and email are required.' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
    }

    // 1. Verify event exists, is active, and has capacity
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, capacity, active, date, location')
      .eq('id', event_id)
      .eq('active', true)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'This event is not available.' }, { status: 404 })
    }

    // 2. Check capacity
    const { data: existingRsvps } = await supabaseAdmin
      .from('event_rsvps')
      .select('party_size')
      .eq('event_id', event_id)

    const totalAttending = existingRsvps?.reduce((sum, r) => sum + (r.party_size || 1), 0) || 0
    const spotsLeft = (event.capacity || 100) - totalAttending

    if (spotsLeft < party_size) {
      return NextResponse.json({
        error: spotsLeft <= 0
          ? 'Sorry, this event is now full.'
          : `Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining. Please reduce your party size.`
      }, { status: 400 })
    }

    // 3. Check if already RSVPd
    const { data: existingRsvp } = await supabaseAdmin
      .from('event_rsvps')
      .select('id')
      .eq('event_id', event_id)
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingRsvp) {
      return NextResponse.json({ error: "This email has already RSVP'd for this event." }, { status: 400 })
    }

    // 4. Upsert profile — create client account if they don't have one
    let profileId: string | null = null
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingAuthUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase().trim())

    if (existingUser) {
      profileId = existingUser.id
      await supabaseAdmin.from('profiles').upsert({
        id: existingUser.id,
        email: email.toLowerCase().trim(),
        full_name: existingUser.user_metadata?.full_name || full_name,
        phone: phone || existingUser.user_metadata?.phone,
        role: existingUser.user_metadata?.role || 'client',
        approved: true,
      }, { onConflict: 'id', ignoreDuplicates: true })
    } else {
      const tempPassword = `FHJ_${Math.random().toString(36).slice(2, 10).toUpperCase()}!`
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name, phone, role: 'client', source: 'rsvp' }
      })
      if (!createError && newUser?.user) {
        profileId = newUser.user.id
        await supabaseAdmin.from('profiles').upsert({
          id: newUser.user.id,
          email: email.toLowerCase().trim(),
          full_name,
          phone: phone || null,
          role: 'client',
          tier: 'Silver',
          approved: true,
        }, { onConflict: 'id' })
      }
    }

    // 5. Insert the RSVP record
    const rsvpPayload: any = {
      event_id,
      party_size: party_size || 1,
      name: full_name,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      dietary_needs: dietary_needs || null,
      message: message || null,
      source: 'public_link',
      status: 'confirmed',
    }
    if (profileId) rsvpPayload.client_id = profileId

    const { error: rsvpError } = await supabaseAdmin.from('event_rsvps').insert(rsvpPayload)

    if (rsvpError) {
      console.error('RSVP insert error:', rsvpError)
      return NextResponse.json({ error: 'Could not save your RSVP. Please try again.' }, { status: 500 })
    }

    // 6. Send emails (non-blocking)
    const emailData = {
      name: full_name,
      email: email.toLowerCase().trim(),
      phone,
      party_size,
      dietary_needs,
      message,
      event_title: event.title,
      event_date: event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : null,
      event_location: event.location,
    }

    // Guest confirmation
    sendEmail('rsvp-confirmation-guest', emailData, origin)
    // Admin notification
    sendEmail('rsvp-notification-admin', emailData, origin)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('RSVP API error:', e)
    return NextResponse.json({ error: e.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}
