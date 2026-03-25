import { supabase } from '@/lib/supabase'
import { getTranslations } from 'next-intl/server'

async function getCounters() {
  const { data } = await supabase
    .from('counters')
    .select('key, value')

  const map: Record<string, number> = {}
  data?.forEach(row => { map[row.key] = row.value })
  return map
}

export async function StatsBar() {
  const counters = await getCounters()
  const t = await getTranslations('stats')

  const labels = counters['total_labels_processed'] ?? 0
  const splits = counters['total_files_split'] ?? 0
  const validations = counters['total_validations'] ?? 0

  if (labels + splits + validations === 0) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
      <div className="flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">

        <div className="flex flex-col items-center px-7 py-3 gap-0.5 border-r border-slate-700">
          <span className="text-xl font-medium text-yellow-500">
            +{labels.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {t('labelsProcessed')}
          </span>
        </div>

        <div className="flex flex-col items-center px-7 py-3 gap-0.5 border-r border-slate-700">
          <span className="text-xl font-medium text-yellow-500">
            +{splits.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {t('filesSplit')}
          </span>
        </div>

        <div className="flex flex-col items-center px-7 py-3 gap-0.5">
          <span className="text-xl font-medium text-yellow-500">
            +{validations.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {t('codesValidated')}
          </span>
        </div>

      </div>
    </div>
  )
}
