import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ActiveModal = 'create-card' | 'invite-user' | 'promote-idea' | null

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  activeModal: ActiveModal
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
  openModal: (modal: ActiveModal) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: true,
      sidebarOpen: true,
      activeModal: null,

      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode
          document.documentElement.classList.toggle('dark', next)
          return { darkMode: next }
        }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'cms-ui',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
)
