import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'invalid_email' })
    }

    // Inserir no Supabase (ignora se já existe)
    await supabaseAdmin
      .from('label_builder_users')
      .upsert({ email: email.toLowerCase() }, { onConflict: 'email' })

    // Enviar para Brevo via fetch
    const formData = new FormData()
    formData.append('EMAIL', email)
    formData.append('email_address_check', '')
    formData.append('locale', 'pt')

    await fetch(
      'https://3bb4fd44.sibforms.com/serve/MUIFABgxn6BqO6LRnDxlg48pzflg7V4UEMzCAUSkoyzhNFIvho2tczGGwv9c-a92RmRSgb9_PzyJ-m8F0ZHvfj31zhwOIvzJVG73dNf9GJalYnc-JzevddJ_kunOoGTijviV-gRrGlSjl0DbsFonobS0cLPDSOBQPUeei1ZL5pSvrXOwrLZGPQTJOkw_kHfnwWcyhdyqZ_caMR6gHw==',
      { method: 'POST', body: formData, mode: 'no-cors' }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' })
  }
}
