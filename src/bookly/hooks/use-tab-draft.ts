'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTabDirtyStore } from '@/stores/tab-dirty.store'
import type { FieldChange } from '@/bookly/components/molecules/confirm-changes-dialog'

// ---------------------------------------------------------------------------
// Utility: flatten a nested object to Record<string, string> for diffing
// ---------------------------------------------------------------------------
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  result: Record<string, string> = {}
): Record<string, string> {
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      flattenObject(val as Record<string, unknown>, fullKey, result)
    } else if (Array.isArray(val)) {
      result[fullKey] = JSON.stringify(val)
    } else {
      result[fullKey] = String(val ?? '')
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// useTabDraft — generic hook for tab-level local draft state
// ---------------------------------------------------------------------------
interface UseTabDraftOptions<T> {
  tabId: string
  labels: Record<string, string>
  saved: T
  applyDraft: (draft: T) => void
  saveAction: () => Promise<void>
}

export function useTabDraft<T extends Record<string, unknown>>({
  tabId,
  labels,
  saved,
  applyDraft,
  saveAction
}: UseTabDraftOptions<T>) {
  const [draft, setDraft] = useState<T>(() => structuredClone(saved) as T)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Keep refs for the latest values so that the registered callbacks
  // always see the current state WITHOUT being in effect deps (avoids
  // re-registering and triggering the infinite-loop).
  const draftRef = useRef(draft)
  draftRef.current = draft
  const savedRef = useRef(saved)
  savedRef.current = saved
  const applyDraftRef = useRef(applyDraft)
  applyDraftRef.current = applyDraft
  const saveActionRef = useRef(saveAction)
  saveActionRef.current = saveAction

  // Compute flat diffs
  const flatSaved = flattenObject(saved as Record<string, unknown>)
  const flatDraft = flattenObject(draft as Record<string, unknown>)

  const changes: FieldChange[] = Object.keys(labels)
    .filter(k => flatSaved[k] !== flatDraft[k])
    .map(k => ({
      field: labels[k],
      from: flatSaved[k] ?? '',
      to: flatDraft[k] ?? ''
    }))

  const isDirty = changes.length > 0

  // Keep isDirty in a ref for use inside stable callbacks
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  const handleCancel = useCallback(() => {
    setDraft(structuredClone(savedRef.current) as T)
    setConfirmOpen(false)
  }, [])

  const handleConfirm = useCallback(async () => {
    applyDraftRef.current(draftRef.current)
    setConfirmOpen(false)
    await new Promise(r => setTimeout(r, 30))
    await saveActionRef.current()
  }, [])

  // ----- Tab dirty registration -----
  // Use stable callbacks in refs so we never re-register on every render.
  const handleCancelRef = useRef(handleCancel)
  handleCancelRef.current = handleCancel
  const handleConfirmRef = useRef(handleConfirm)
  handleConfirmRef.current = handleConfirm

  const { register, unregister } = useTabDirtyStore()

  // Register once on mount; update the entry's isDirty via a stable wrapper
  // that reads isDirtyRef at call time.
  useEffect(() => {
    register(tabId, {
      get isDirty() {
        return isDirtyRef.current
      },
      reset: () => handleCancelRef.current(),
      save: () => handleConfirmRef.current()
    })
    // Only re-register when isDirty flips (not on every render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, tabId, register])

  useEffect(() => {
    return () => unregister(tabId)
  }, [tabId, unregister])

  // Sync draft when saved values change externally (e.g. after initial loadSettings)
  const savedKey = JSON.stringify(saved)
  const prevSavedKey = useRef(savedKey)
  useEffect(() => {
    if (prevSavedKey.current !== savedKey && !isDirtyRef.current) {
      setDraft(structuredClone(saved) as T)
    }
    prevSavedKey.current = savedKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedKey])

  return {
    draft,
    setDraft,
    isDirty,
    changes,
    confirmOpen,
    setConfirmOpen,
    handleCancel,
    handleConfirm
  }
}
