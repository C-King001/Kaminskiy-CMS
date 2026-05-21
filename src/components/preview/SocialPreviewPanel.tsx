import { useState, useRef } from 'react'
import type { ContentCard } from '@/types'
import { Tabs } from '@/components/ui/Tabs'
import { InstagramFeedPreview } from './InstagramFeedPreview'
import { InstagramReelPreview } from './InstagramReelPreview'
import { FacebookPostPreview } from './FacebookPostPreview'
interface Props {
  card: ContentCard
}

const PREVIEW_TABS = [
  { id: 'ig-feed', label: 'IG Feed' },
  { id: 'ig-reel', label: 'IG Reel' },
  { id: 'facebook', label: 'Facebook' },
]

export function SocialPreviewPanel({ card }: Props) {
  const [tab, setTab] = useState('ig-feed')
  const containerRef = useRef<HTMLDivElement>(null)

  const previewMap = {
    'ig-feed': <InstagramFeedPreview card={card} />,
    'ig-reel': (
      <div className="flex justify-center">
        <InstagramReelPreview card={card} />
      </div>
    ),
    'facebook': (
      <div className="flex justify-center">
        <FacebookPostPreview card={card} />
      </div>
    ),
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Social Preview</h3>
        <Tabs tabs={PREVIEW_TABS} active={tab} onChange={setTab} />
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-4"
      >
        <div className="overflow-hidden rounded-xl shadow-xl" style={{ maxWidth: '100%' }}>
          <ScaledPreview containerRef={containerRef} tab={tab}>
            {previewMap[tab as keyof typeof previewMap]}
          </ScaledPreview>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Pixel-accurate preview · Not all features may render identically on platform
      </p>
    </div>
  )
}

function ScaledPreview({
  children,
  containerRef,
  tab,
}: {
  children: React.ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
  tab: string
}) {
  const naturalWidth = tab === 'ig-reel' ? 270 : tab === 'facebook' ? 500 : 470
  const containerWidth = containerRef.current?.clientWidth ?? naturalWidth
  const scale = Math.min(1, (containerWidth - 32) / naturalWidth)

  return (
    <div
      style={{
        transformOrigin: 'top center',
        transform: `scale(${scale})`,
        width: naturalWidth,
        marginBottom: scale < 1 ? `${(1 - scale) * -100}%` : 0,
      }}
    >
      {children}
    </div>
  )
}
