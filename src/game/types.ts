export type WorldTheme = 'day' | 'night'

export type GamePhase = 'explore' | 'storm-warning' | 'storm' | 'ending'

export type PlayerAction = 'idle' | 'walk' | 'sigh' | 'rest'

export interface PlayerState {
  id: string
  displayName: string
  position: [number, number, number]
  rotation: number
  action: PlayerAction
}

export type WorldEventType = 'sigh' | 'smoke' | 'cloud-created' | 'storm-started'

export interface WorldEvent {
  id: string
  type: WorldEventType
  playerId: string
  timestamp: number
}
