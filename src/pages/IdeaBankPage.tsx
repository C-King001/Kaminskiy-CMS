import { useEffect, useState } from 'react'
import { useIdeaStore } from '@/store/ideaStore'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { IdeaForm } from '@/components/ideas/IdeaForm'
import { IdeaDetailDrawer } from '@/components/ideas/IdeaDetailDrawer'
import { PageSpinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Idea } from '@/types'
import { Lightbulb, Plus, Search, X } from 'lucide-react'

export function IdeaBankPage() {
  const { fetchIdeas, filteredIdeas, loading, ideas, deleteIdea, setFilter, filters } = useIdeaStore()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Idea | null>(null)
  useEffect(() => { fetchIdeas() }, [])

  if (loading && ideas.length === 0) return <PageSpinner />

  const visible = filteredIdeas()

  const handleDelete = async (id: string) => {
    try {
      await deleteIdea(id)
      setSelected(null)
    } catch {
      // toast handled by caller
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-3 border-b border-white/[0.06] shrink-0"
        style={{ backgroundColor: '#13151f' }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 leading-none mb-0.5">Idea Bank</p>
          <p className="text-base font-bold text-white leading-none">{visible.length} ideas</p>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-40 max-w-64">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search ideas…"
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/40 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilter('search', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
            >
              <X size={11} />
            </button>
          )}
        </div>

        <div className="ml-auto">
          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancel' : 'Add Idea'}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {showForm && (
          <div className="mb-5 max-w-md">
            <IdeaForm onClose={() => setShowForm(false)} />
          </div>
        )}

        {visible.length === 0 ? (
          <EmptyState
            icon={<Lightbulb size={24} />}
            title="No ideas yet"
            description="Capture raw content ideas here. Paste video links, add notes, and promote them to the pipeline when ready."
            action={{ label: 'Add First Idea', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => setSelected(idea)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <IdeaDetailDrawer
          idea={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
