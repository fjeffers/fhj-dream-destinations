import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { trip_id, full_name, email, phone, travelers, special_requests, deposit_acknowledged } = await req.json()

    if (!trip_id || !full_name || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: trip } = await supabase.from('group_trips').select('name, price, destination, date').eq('id', trip_id).single()

    const { error: insertError } = await supabase.from('group_trip_registrations').insert({
      trip_id,
      full_name,
      email,
      phone: phone || null,
      travelers: travelers || 1,
      special_requests: special_requests || null,
      deposit_acknowledged: deposit_acknowledged || false,
      status: 'pending',
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await resend.emails.send({
      from: 'FHJ Dream Destinations <info@fhjdreamdestinations.com>',
      to: 'info@fhjdreamdestinations.com',
      subject: `New Group Trip Registration — ${trip?.name || 'Group Trip'}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDFAF3; border: 1px solid rgba(196,154,10,0.2);">
          <div style="background: linear-gradient(135deg, #073030, #0E6060); padding: 32px 40px; text-align: center;">
            <div style="font-size: 10px; letter-spacing: 4px; color: #E8C87A; margin-bottom: 8px;">NEW REGISTRATION</div>
            <h1 style="font-size: 28px; font-weight: 300; color: white; margin: 0;">Group Trip Sign-Up</h1>
          </div>
          <div style="padding: 40px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); color: #666; font-size: 12px; letter-spacing: 2px;">TRIP</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); font-size: 16px; color: #2E2318;">${trip?.name || '—'}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); color: #666; font-size: 12px; letter-spacing: 2px;">NAME</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); font-size: 16px; color: #2E2318;">${full_name}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); color: #666; font-size: 12px; letter-spacing: 2px;">EMAIL</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); font-size: 16px; color: #2E2318;">${email}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); color: #666; font-size: 12px; letter-spacing: 2px;">PHONE</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); font-size: 16px; color: #2E2318;">${phone || '—'}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); color: #666; font-size: 12px; letter-spacing: 2px;">TRAVELERS</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); font-size: 16px; color: #2E2318;">${travelers || 1}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); color: #666; font-size: 12px; letter-spacing: 2px;">DEPOSIT</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(196,154,10,0.1); font-size: 16px; color: #2E2318;">${deposit_acknowledged ? '✓ Acknowledged' : 'Not acknowledged'}</td></tr>
              ${special_requests ? `<tr><td style="padding: 10px 0; color: #666; font-size: 12px; letter-spacing: 2px; vertical-align: top;">REQUESTS</td><td style="padding: 10px 0; font-size: 16px; color: #2E2318; font-style: italic;">${special_requests}</td></tr>` : ''}
            </table>
            <div style="margin-top: 32px; text-align: center;">
              <a href="https://fhjdreamdestinations.com/admin/group-trips" style="display: inline-block; background: #076060; color: white; padding: 14px 32px; text-decoration: none; font-size: 11px; letter-spacing: 3px; font-weight: 700; border-radius: 4px;">VIEW IN ADMIN →</a>
            </div>
          </div>
          <div style="padding: 20px 40px; text-align: center; border-top: 1px solid rgba(196,154,10,0.1);">
            <p style="font-size: 12px; color: #999; font-style: italic;">FHJ Dream Destinations · info@fhjdreamdestinations.com</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
