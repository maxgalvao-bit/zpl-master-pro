import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, recaptchaToken } = await request.json()
    console.log('[LB Register] Email:', email)
    console.log('[LB Register] Token presente:', !!recaptchaToken)

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
      console.log('[LB Register] reCAPTCHA score:', recaptchaData.score)
      console.log('[LB Register] reCAPTCHA success:', recaptchaData.success)

      if (!recaptchaData.success || recaptchaData.score < 0.3) {
        return NextResponse.json({ ok: false, error: 'recaptcha_failed' })
      }
    }

    // Supabase
    const { error: supabaseError } = await supabaseAdmin
      .from('label_builder_users')
      .upsert({ email: email.toLowerCase() }, { onConflict: 'email' })

    console.log('[LB Register] Supabase error:', supabaseError)

    if (supabaseError) throw supabaseError

    // Brevo
    console.log('[LB Register] BREVO_API_KEY presente:', !!process.env.BREVO_API_KEY)
    console.log('[LB Register] BREVO_LIST_ID:', process.env.BREVO_LIST_ID_LABEL_BUILDER)

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

    const brevoData = await brevoRes.json()
    console.log('[LB Register] Brevo status:', brevoRes.status)
    console.log('[LB Register] Brevo response:', JSON.stringify(brevoData))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[LB Register] Erro:', err)
    return NextResponse.json({ ok: false, error: 'server_error' })
  }
}
