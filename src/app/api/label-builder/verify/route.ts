import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ ok: false })

    const { data } = await supabaseAdmin
      .from('label_builder_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    return NextResponse.json({ ok: !!data })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
