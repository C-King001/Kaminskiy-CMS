interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getColor(name?: string | null): string {
  const colors = ['#22c55e', '#EC4899', '#3B82F6', '#10B981', '#F97316', '#8B5CF6']
  if (!name) return colors[0]
  const i = name.charCodeAt(0) % colors.length
  return colors[i]
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={`rounded-full object-cover shrink-0 ${sizes[size]} ${className}`}
      />
    )
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${sizes[size]} ${className}`}
      style={{ backgroundColor: getColor(name) }}
    >
      {getInitials(name)}
    </div>
  )
}
