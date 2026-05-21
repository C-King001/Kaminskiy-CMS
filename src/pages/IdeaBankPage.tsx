import { useEffect, useState } from 'react'
import { useIdeaStore } from '@/store/ideaStore'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { IdeaForm } from '@/components/ideas/IdeaForm'
import { PageSpinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Lightbulb, Plus } from 'lucide-react'

export function IdeaBankPage() {
  const { fetchIdeas, filteredIdeas, loading, ideas } = useIdeaStore()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchIdeas() }, [])

  if (loading && ideas.length === 0) return <PageSpinner />

  const visible = filteredIdeas()

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Idea Bank</p>
          <h2 className="text-xl font-bold text-white">{visible.length} Raw Ideas</h2>
        </div>
        <Button
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setShowForm((v) => !v)}
        >
          Add Idea
        </Button>
      </div>

      {showForm && (
        <div className="mb-5">
          <IdeaForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={24} />}
          title="No ideas yet"
          description="Capture raw content ideas here and promote them to the pipeline when ready."
          action={{ label: 'Add First Idea', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  )
}
