import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

interface Props {
  onFile: (file: File) => void
  currentUrl?: string | null
  uploading?: boolean
  onClear?: () => void
}

const ACCEPTED = {
  'image/jpeg': [], 'image/png': [], 'image/gif': [], 'image/webp': [],
  'video/mp4': [], 'video/quicktime': [],
}

export function FileUploadZone({ onFile, currentUrl, uploading, onClear }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onFile(files[0])
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled: uploading,
  })

  if (currentUrl) {
    const isVideo = currentUrl.includes('.mp4') || currentUrl.includes('.mov')
    return (
      <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
        {isVideo ? (
          <video src={currentUrl} className="w-full max-h-48 object-cover" controls />
        ) : (
          <img src={currentUrl} alt="Upload" className="w-full max-h-48 object-cover" />
        )}
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90 transition-colors"
          >
            <X size={11} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-all
        ${isDragActive
          ? 'border-[#22c55e]/60 bg-[#22c55e]/[0.06]'
          : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03]'
        }
      `}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Spinner size={22} />
      ) : (
        <Upload size={22} className="text-white/20" />
      )}
      <div className="text-center">
        <p className="text-sm text-white/35">
          {uploading ? 'Uploading...' : isDragActive ? 'Drop it here' : 'Drop a file or click to upload'}
        </p>
        <p className="text-xs text-white/20 mt-0.5">Images & videos up to 50MB</p>
      </div>
    </div>
  )
}

export function DriveLink({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] focus-within:ring-1 focus-within:ring-[#22c55e]/50 transition-all">
      <File size={13} className="text-white/25 shrink-0" />
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste Google Drive link..."
        className="flex-1 text-sm bg-transparent text-white/70 placeholder-white/20 outline-none"
      />
    </div>
  )
}
