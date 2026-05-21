import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-8">
      <p className="text-5xl font-bold text-gray-200 dark:text-gray-700">404</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">This page doesn't exist.</p>
      <Button size="sm" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>
  )
}
