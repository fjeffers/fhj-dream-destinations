/**
 * /api/loyalty
 * GET  ?clientId=xxx  — list all loyalty programs for a client (decrypted)
 * POST               — create a new loyalty program (encrypts password/pin)
 *
 * Server-only: encryption/decryption never reaches the browser.
 * Auth: admin/manager/employee only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/encrypt'

const ADMIN_ROLES = ['admin', 'manager', 'employee']

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !ADMIN_ROLES.includes(profile.role)) return null
  return user
}

// ─── GET: list programs for a client ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

  const supabase = await createClient()
  const user = await assertAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('travel_loyalty')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Decrypt sensitive fields server-side before sending to admin UI
  const decrypted = (data || []).map(row => ({
    ...row,
    password: decrypt(row.password_encrypted),
    pin:      decrypt(row.pin_encrypted),
    // Strip the raw encrypted blobs — client only sees plaintext
    password_encrypted: undefined,
    pin_encrypted:      undefined,
  }))

  return NextResponse.json({ programs: decrypted })
}

// ─── POST: create a new program ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const user = await assertAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { client_id, program_type, provider, program_name, membership_number, username, password, pin, tier, notes } = body

  if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 })
  if (!provider?.trim()) return NextResponse.json({ error: 'provider required' }, { status: 400 })

  const { data, error } = await supabase
    .from('travel_loyalty')
    .insert({
      client_id,
      program_type:       program_type || 'Airline',
      provider:           provider.trim(),
      program_name:       program_name || null,
      membership_number:  membership_number || null,
      username:           username || null,
      password_encrypted: encrypt(password) || null,
      pin_encrypted:      encrypt(pin) || null,
      tier:               tier || null,
      notes:              notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return the record with decrypted fields (no raw ciphertext)
  return NextResponse.json({
    program: {
      ...data,
      password: decrypt(data.password_encrypted),
      pin:      decrypt(data.pin_encrypted),
      password_encrypted: undefined,
      pin_encrypted:      undefined,
    }
  }, { status: 201 })
}
