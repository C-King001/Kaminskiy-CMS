interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height: height ?? '1rem' }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-[14px] p-4 border border-white/[0.06] flex flex-col gap-3"
      style={{ backgroundColor: '#1a1d27' }}
    >
      <div className="flex items-center gap-2">
        <Skeleton width={60} height={20} className="rounded-full" />
        <Skeleton width={40} height={20} className="rounded-full" />
      </div>
      <Skeleton height={14} />
      <Skeleton height={14} width="80%" />
      <div className="flex items-center justify-between mt-1">
        <Skeleton width={80} height={12} />
        <Skeleton width={24} height={24} className="rounded-full" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04]">
      <Skeleton width={100} height={14} />
      <Skeleton width={140} height={14} className="flex-1" />
      <Skeleton width={80} height={22} className="rounded-full" />
      <Skeleton width={60} height={14} />
      <Skeleton width={28} height={28} className="rounded-full" />
    </div>
  )
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 p-4 md:p-6 overflow-x-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <Skeleton width={100} height={14} />
            <Skeleton width={24} height={18} className="rounded-full" />
          </div>
          {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
            <CardSkeleton key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}
