'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type ConsentUIContextValue = {
  isPreferencesOpen: boolean
  openPreferences: () => void
  closePreferences: () => void
}

const ConsentUIContext = createContext<ConsentUIContextValue | null>(null)

/**
 * Lets the footer's "cookie preferences" link reopen the preferences dialog
 * that lives next to the banner at the layout root, without threading state
 * through props.
 */
export function ConsentUIProvider({ children }: { children: ReactNode }) {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const value = useMemo<ConsentUIContextValue>(
    () => ({
      isPreferencesOpen,
      openPreferences: () => setIsPreferencesOpen(true),
      closePreferences: () => setIsPreferencesOpen(false),
    }),
    [isPreferencesOpen],
  )
  return <ConsentUIContext.Provider value={value}>{children}</ConsentUIContext.Provider>
}

export function useConsentUI(): ConsentUIContextValue {
  const ctx = useContext(ConsentUIContext)
  if (!ctx) throw new Error('useConsentUI must be used within ConsentUIProvider')
  return ctx
}
