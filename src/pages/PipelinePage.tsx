import { useEffect, useState } from 'react'
import { useContentStore } from '@/store/contentStore'
import { KanbanColumn } from '@/components/pipeline/KanbanColumn'
import { PipelineTableView } from '@/components/pipeline/PipelineTableView'
import { FilterBar } from '@/components/pipeline/FilterBar'
import { PageSpinner } from '@/components/ui/Spinner'
import { STATUS_ORDER } from '@/lib/constants'

export function PipelinePage() {
  const { fetchCards, loading, cards, cardsByStatus, filteredCards } = useContentStore()
  const [view, setView] = useState<'kanban' | 'table'>('kanban')

  useEffect(() => { fetchCards() }, [])

  if (loading && cards.length === 0) return <PageSpinner />

  const byStatus = cardsByStatus()
  const allFiltered = filteredCards()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterBar view={view} onViewChange={setView} />

      {view === 'table' ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div
            className="rounded-[14px] overflow-hidden border border-white/[0.06]"
            style={{ backgroundColor: '#1a1d27' }}
          >
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                Content Pipeline · {allFiltered.length} posts
              </h3>
            </div>
            <PipelineTableView cards={allFiltered} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full p-4 md:p-6" style={{ minWidth: 'max-content' }}>
            {STATUS_ORDER.map((status) => (
              <KanbanColumn key={status} status={status} cards={byStatus[status] ?? []} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
