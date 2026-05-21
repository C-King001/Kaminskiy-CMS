import { useEffect } from 'react'
import { useContentStore } from '@/store/contentStore'

export function useContent() {
  const store = useContentStore()

  useEffect(() => {
    if (store.cards.length === 0 && !store.loading) {
      store.fetchCards()
    }
  }, [])

  return store
}
