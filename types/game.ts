export interface Player {
  id: string
  name: string
  team: "A" | "B"
  isOnline: boolean
  lastSeen: number
}

export interface Team {
  id: "A" | "B"
  name: string
  score: number
  players: Player[]
}

export interface GameRoom {
  id: string
  name: string
  hostId: string
  players: Player[]
  teams: Team[]
  gameState: GameState
  chatMessages: ChatMessage[]
  drawingData: DrawingPoint[]
  createdAt: number
  lastActivity: number
}

export interface GameState {
  phase: "setup"|"waiting" | "playing" | "finished"
  currentTeam: "A" | "B"
  currentDrawer: string | null
  currentWord: string | null
  timeLeft: number
  round: number
  maxRounds: number
  roundStartTime: number | null
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  isCorrectGuess?: boolean
}

export interface DrawingPoint {
  x: number
  y: number
  isDrawing: boolean
  color: string
  size: number
  timestamp: number
}

export interface RoomListItem {
  id: string
  name: string
  playerCount: number
  phase: GameState["phase"]
  isJoinable: boolean
}
