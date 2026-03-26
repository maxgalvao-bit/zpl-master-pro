import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'invalid_email' })
    }

    const { error } = await supabaseAdmin
      .from('label_builder_users')
      .upsert({ email: email.toLowerCase() }, { onConflict: 'email' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' })
  }
}
