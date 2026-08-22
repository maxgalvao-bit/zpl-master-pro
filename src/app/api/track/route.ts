import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Teto por requisicao. O campo `count` vem do cliente e nao e confiavel.
// O Bulk Splitter envia legitimamente centenas de etiquetas de uma vez,
// por isso o teto tem folga. Se aparecerem lotes reais acima disso,
// e so aumentar esta constante.
const MAX_COUNT = 1000

export async function POST(request: NextRequest) {
  try {
    const { event, count = 1 } = await request.json()

    const counterMap: Record<string, string> = {
      'export_pdf': 'total_labels_processed',
      'export_zpl': 'total_labels_processed',
      'label_built': 'total_labels_processed',
      'shopee_fixed': 'total_labels_processed',
      'labels_split': 'total_files_split',
      'zpl_validated': 'total_validations',
    }

    const key = counterMap[event]
    if (!key) return NextResponse.json({ ok: false })

    const parsed = Number(count)
    if (!Number.isInteger(parsed) || parsed < 1) {
      return NextResponse.json({ ok: false, error: 'invalid_count' })
    }
    const amount = Math.min(parsed, MAX_COUNT)

    await supabaseAdmin.rpc('increment_counter', { counter_key: key, amount })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
