import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, recaptchaToken } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'invalid_email' })
    }

    // Validar reCAPTCHA v3 apenas se token foi fornecido
    if (recaptchaToken && recaptchaToken.length > 0) {
      const recaptchaRes = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        }
      )
      const recaptchaData = await recaptchaRes.json()

      if (!recaptchaData.success || recaptchaData.score < 0.3) {
        return NextResponse.json({ ok: false, error: 'recaptcha_failed' })
      }
    }

    // Supabase
    const { error: supabaseError } = await supabaseAdmin
      .from('label_builder_users')
      .upsert({ email: email.toLowerCase() }, { onConflict: 'email' })

    if (supabaseError) throw supabaseError

    // Brevo
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        listIds: [parseInt(process.env.BREVO_LIST_ID_LABEL_BUILDER!)],
        updateEnabled: true,
      }),
    })

    // 201 = criado, 204 = já existe, ambos são sucesso
    if (brevoRes.status !== 201 && brevoRes.status !== 204) {
      const brevoData = await brevoRes.json()
      console.error('[LB Register] Brevo error:', JSON.stringify(brevoData))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[LB Register] Erro:', err)
    return NextResponse.json({ ok: false, error: 'server_error' })
  }
}