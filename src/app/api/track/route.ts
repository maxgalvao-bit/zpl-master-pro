import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    await supabaseAdmin.rpc('increment_counter', { counter_key: key, amount: count })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
