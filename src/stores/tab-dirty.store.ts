import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Each tab registers itself here when it becomes dirty/clean.
// BusinessSettings reads this to intercept tab navigation.
// ---------------------------------------------------------------------------

export interface TabDirtyEntry {
  isDirty: boolean
  /** Reset draft back to last saved state (no API call) */
  reset: () => void
  /** Save + navigate away */
  save: () => Promise<void>
}

interface TabDirtyState {
  tabs: Record<string, TabDirtyEntry>
  register: (tabId: string, entry: TabDirtyEntry) => void
  unregister: (tabId: string) => void
  getTab: (tabId: string) => TabDirtyEntry | null
}

export const useTabDirtyStore = create<TabDirtyState>((set, get) => ({
  tabs: {},

  register: (tabId, entry) =>
    set(state => ({
      tabs: { ...state.tabs, [tabId]: entry }
    })),

  unregister: tabId =>
    set(state => {
      const next = { ...state.tabs }
      delete next[tabId]
      return { tabs: next }
    }),

  getTab: tabId => get().tabs[tabId] ?? null
}))
