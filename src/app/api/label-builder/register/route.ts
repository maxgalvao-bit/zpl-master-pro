import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BREVO_URL =
  'https://3bb4fd44.sibforms.com/serve/MUIFABgxn6BqO6LRnDxlg48pzflg7V4UEMzCAUSkoyzhNFIvho2tczGGwv9c-a92RmRSgb9_PzyJ-m8F0ZHvfj31zhwOIvzJVG73dNf9GJalYnc-JzevddJ_kunOoGTijviV-gRrGlSjl0DbsFonobS0cLPDSOBQPUeei1ZL5pSvrXOwrLZGPQTJOkw_kHfnwWcyhdyqZ_caMR6gHw=='

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

    // Brevo fire-and-forget — não aguardar resultado
    const formData = new FormData()
    formData.append('EMAIL', email)
    formData.append('email_address_check', '')
    formData.append('locale', 'pt')

    fetch(BREVO_URL, { method: 'POST', body: formData }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' })
  }
}
