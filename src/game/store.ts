import { create } from 'zustand'
import type { GamePhase, WorldTheme } from './types'

interface WorldState {
  theme: WorldTheme
  phase: GamePhase
  setTheme: (theme: WorldTheme) => void
}

export const getThemeFromLocalTime = (hour = new Date().getHours()): WorldTheme =>
  hour >= 6 && hour < 18 ? 'day' : 'night'

export const useWorldStore = create<WorldState>((set) => ({
  theme: getThemeFromLocalTime(),
  phase: 'explore',
  setTheme: (theme) => set({ theme }),
}))
