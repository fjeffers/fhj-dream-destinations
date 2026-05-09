/**
 * /api/loyalty/[id]
 * PUT    — update an existing loyalty program
 * DELETE — delete a loyalty program
 *
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

// ─── PUT: update a program ────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const user = await assertAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { program_type, provider, program_name, membership_number, username, password, pin, tier, notes } = body

  if (!provider?.trim()) return NextResponse.json({ error: 'provider required' }, { status: 400 })

  // Build update payload — only encrypt if a new value was provided
  // If password is the sentinel '__UNCHANGED__' we skip re-encrypting
  const updatePayload: Record<string, any> = {
    program_type:      program_type || 'Airline',
    provider:          provider.trim(),
    program_name:      program_name || null,
    membership_number: membership_number || null,
    username:          username || null,
    tier:              tier || null,
    notes:             notes || null,
  }

  if (password !== '__UNCHANGED__') {
    updatePayload.password_encrypted = encrypt(password) || null
  }
  if (pin !== '__UNCHANGED__') {
    updatePayload.pin_encrypted = encrypt(pin) || null
  }

  const { data, error } = await supabase
    .from('travel_loyalty')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    program: {
      ...data,
      password: decrypt(data.password_encrypted),
      pin:      decrypt(data.pin_encrypted),
      password_encrypted: undefined,
      pin_encrypted:      undefined,
    }
  })
}

// ─── DELETE: remove a program ─────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const user = await assertAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('travel_loyalty')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
