import { supabase } from '@/lib/supabase'

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

  const labels = counters['total_labels_processed'] ?? 0
  const splits = counters['total_files_split'] ?? 0
  const validations = counters['total_validations'] ?? 0

  if (labels + splits + validations === 0) return null

  return (
    <div className="flex justify-center gap-8 py-4 text-sm text-slate-400 border-t border-slate-800">
      <span>
        <strong className="text-yellow-500">
          +{labels.toLocaleString('pt-BR')}
        </strong> etiquetas processadas
      </span>
      <span>
        <strong className="text-yellow-500">
          +{splits.toLocaleString('pt-BR')}
        </strong> arquivos divididos
      </span>
      <span>
        <strong className="text-yellow-500">
          +{validations.toLocaleString('pt-BR')}
        </strong> códigos validados
      </span>
    </div>
  )
}
