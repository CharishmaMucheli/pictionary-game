// Enhanced in-memory storage with multiple correct guesses support
const gameRooms: Map<string, GameRoom> = new Map()
const gameTimers: Map<string, NodeJS.Timeout> = new Map()

interface GameRoom {
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

interface Player {
  id: string
  name: string
  team: "A" | "B"
  isOnline: boolean
  lastSeen: number
}

interface Team {
  id: "A" | "B"
  name: string
  score: number
  players: Player[]
}

interface GameState {
  phase: "waiting" | "playing" | "finished"
  currentTeam: "A" | "B"
  currentDrawer: string | null
  currentWord: string | null
  wordOptions: string[] | null // New: word options for drawer
  timeLeft: number
  round: number
  maxRounds: number
  roundStartTime: number | null
  correctGuessers: string[]
  firstCorrectGuessTime: number | null
  extendedTime: boolean
}

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  isCorrectGuess?: boolean
}

interface DrawingPoint {
  x: number
  y: number
  isDrawing: boolean
  color: string
  size: number
  timestamp: number
}

interface RoomListItem {
  id: string
  name: string
  playerCount: number
  phase: string
  isJoinable: boolean
}

// Expanded word list with more variety
const WORD_POOL = [
  // Animals
  "elephant",
  "giraffe",
  "penguin",
  "octopus",
  "butterfly",
  "kangaroo",
  "dolphin",
  "tiger",
  "peacock",
  "flamingo",
  "rhinoceros",
  "cheetah",
  "hippopotamus",
  "crocodile",
  "orangutan",
  "zebra",
  "koala",
  "panda",
  "sloth",
  "chameleon",

  // Objects
  "telescope",
  "guitar",
  "umbrella",
  "bicycle",
  "camera",
  "lighthouse",
  "rocket",
  "crown",
  "diamond",
  "sandwich",
  "microscope",
  "compass",
  "hourglass",
  "typewriter",
  "gramophone",
  "binoculars",
  "thermometer",
  "stethoscope",
  "calculator",
  "flashlight",

  // Nature
  "rainbow",
  "volcano",
  "mountain",
  "waterfall",
  "tornado",
  "glacier",
  "desert",
  "forest",
  "canyon",
  "aurora",
  "thunderstorm",
  "earthquake",
  "avalanche",
  "geyser",
  "coral reef",
  "meadow",
  "swamp",
  "tundra",
  "oasis",
  "archipelago",

  // Food
  "pizza",
  "hamburger",
  "spaghetti",
  "sushi",
  "taco",
  "croissant",
  "pretzel",
  "pancake",
  "waffle",
  "donut",
  "ice cream",
  "chocolate",
  "popcorn",
  "marshmallow",
  "cupcake",
  "bagel",
  "burrito",
  "lasagna",
  "quesadilla",
  "smoothie",

  // Transportation
  "helicopter",
  "submarine",
  "spaceship",
  "motorcycle",
  "sailboat",
  "hot air balloon",
  "train",
  "airplane",
  "skateboard",
  "scooter",
  "yacht",
  "bulldozer",
  "ambulance",
  "fire truck",
  "taxi",
  "limousine",
  "trolley",
  "gondola",
  "rickshaw",
  "hovercraft",

  // Buildings/Places
  "castle",
  "pyramid",
  "skyscraper",
  "windmill",
  "barn",
  "cathedral",
  "mosque",
  "temple",
  "observatory",
  "greenhouse",
  "factory",
  "stadium",
  "theater",
  "museum",
  "library",
  "hospital",
  "school",
  "restaurant",
  "hotel",
  "airport",

  // Activities/Sports
  "swimming",
  "skiing",
  "surfing",
  "dancing",
  "singing",
  "painting",
  "cooking",
  "gardening",
  "fishing",
  "camping",
  "basketball",
  "soccer",
  "tennis",
  "volleyball",
  "baseball",
  "golf",
  "bowling",
  "archery",
  "gymnastics",
  "wrestling",

  // Fantasy/Fictional
  "dragon",
  "unicorn",
  "wizard",
  "fairy",
  "mermaid",
  "phoenix",
  "centaur",
  "griffin",
  "pegasus",
  "sphinx",
  "vampire",
  "werewolf",
  "ghost",
  "alien",
  "robot",
  "cyborg",
  "superhero",
  "ninja",
  "pirate",
  "knight",

  // Emotions/Abstract
  "happiness",
  "excitement",
  "surprise",
  "confusion",
  "anger",
  "sadness",
  "fear",
  "love",
  "jealousy",
  "pride",
  "freedom",
  "peace",
  "chaos",
  "mystery",
  "adventure",
  "discovery",
  "imagination",
  "creativity",
  "wisdom",
  "courage",
]

function getRandomWords(count = 2): string[] {
  const shuffled = [...WORD_POOL].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function createRoom(roomName: string, hostId: string, hostName: string): GameRoom {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()

  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    team: "A",
    isOnline: true,
    lastSeen: Date.now(),
  }

  const room: GameRoom = {
    id: roomId,
    name: roomName,
    hostId,
    players: [hostPlayer],
    teams: [
      { id: "A", name: "Team Red", score: 0, players: [hostPlayer] },
      { id: "B", name: "Team Blue", score: 0, players: [] },
    ],
    gameState: {
      phase: "waiting",
      currentTeam: "A",
      currentDrawer: null,
      currentWord: null,
      wordOptions: null,
      timeLeft: 90,
      round: 1,
      maxRounds: 12,
      roundStartTime: null,
      correctGuessers: [],
      firstCorrectGuessTime: null,
      extendedTime: false,
    },
    chatMessages: [],
    drawingData: [],
    createdAt: Date.now(),
    lastActivity: Date.now(),
  }

  gameRooms.set(roomId, room)
  return room
}

export function getRoom(roomId: string): GameRoom | null {
  return gameRooms.get(roomId) || null
}

export function updateRoom(roomId: string, updates: Partial<GameRoom>): GameRoom | null {
  const room = gameRooms.get(roomId)
  if (!room) return null

  const updatedRoom = { ...room, ...updates, lastActivity: Date.now() }
  gameRooms.set(roomId, updatedRoom)
  return updatedRoom
}

export function getRoomList(): RoomListItem[] {
  return Array.from(gameRooms.values()).map((room) => ({
    id: room.id,
    name: room.name,
    playerCount: room.players.length,
    phase: room.gameState.phase,
    isJoinable: room.gameState.phase === "waiting" && room.players.length < 8,
  }))
}

export function joinRoom(roomId: string, playerId: string, playerName: string, teamId: "A" | "B"): GameRoom | null {
  const room = gameRooms.get(roomId)
  if (!room || room.gameState.phase !== "waiting") return null

  const existingPlayerIndex = room.players.findIndex((p) => p.id === playerId)

  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    team: teamId,
    isOnline: true,
    lastSeen: Date.now(),
  }

  let updatedPlayers: Player[]
  if (existingPlayerIndex >= 0) {
    updatedPlayers = room.players.map((p, i) => (i === existingPlayerIndex ? newPlayer : p))
  } else {
    updatedPlayers = [...room.players, newPlayer]
  }

  const updatedTeams = room.teams.map((team) => ({
    ...team,
    players: updatedPlayers.filter((p) => p.team === team.id),
  }))

  return updateRoom(roomId, {
    players: updatedPlayers,
    teams: updatedTeams,
  })
}

export function startGameTimer(roomId: string): void {
  stopGameTimer(roomId)

  const timer = setInterval(() => {
    const room = gameRooms.get(roomId)
    if (!room || room.gameState.phase !== "playing") {
      stopGameTimer(roomId)
      return
    }

    // Check if we should extend time after first correct guess
    if (
      room.gameState.correctGuessers.length > 0 &&
      !room.gameState.extendedTime &&
      room.gameState.firstCorrectGuessTime
    ) {
      updateRoom(roomId, {
        gameState: {
          ...room.gameState,
          timeLeft: Math.max(room.gameState.timeLeft, 30),
          extendedTime: true,
        },
      })
      return
    }

    if (room.gameState.timeLeft <= 0) {
      nextTurn(roomId)
      return
    }

    // Check if all non-drawer players have guessed correctly
    const nonDrawerPlayers = room.players.filter((p) => p.id !== room.gameState.currentDrawer)
    const allGuessed =
      nonDrawerPlayers.length > 0 && nonDrawerPlayers.every((p) => room.gameState.correctGuessers.includes(p.id))

    if (allGuessed) {
      setTimeout(() => nextTurn(roomId), 3000)
      return
    }

    updateRoom(roomId, {
      gameState: {
        ...room.gameState,
        timeLeft: room.gameState.timeLeft - 1,
      },
    })
  }, 1000)

  gameTimers.set(roomId, timer)
}

export function stopGameTimer(roomId: string): void {
  const timer = gameTimers.get(roomId)
  if (timer) {
    clearInterval(timer)
    gameTimers.delete(roomId)
  }
}

export function nextTurn(roomId: string): void {
  const room = gameRooms.get(roomId)
  if (!room) return

  const currentTeamIndex = room.teams.findIndex((t) => t.id === room.gameState.currentTeam)
  const nextTeamIndex = (currentTeamIndex + 1) % room.teams.length
  const nextTeam = room.teams[nextTeamIndex]

  const newRound = nextTeamIndex === 0 ? room.gameState.round + 1 : room.gameState.round

  if (newRound > room.gameState.maxRounds) {
    stopGameTimer(roomId)
    updateRoom(roomId, {
      gameState: { ...room.gameState, phase: "finished" },
    })
    return
  }

  const nextDrawer = nextTeam.players[Math.floor(Math.random() * nextTeam.players.length)]
  const wordOptions = getRandomWords(2) // Give drawer 2 options

  updateRoom(roomId, {
    gameState: {
      ...room.gameState,
      currentTeam: nextTeam.id,
      currentDrawer: nextDrawer.id,
      currentWord: null, // Will be set when drawer chooses
      wordOptions: wordOptions,
      timeLeft: 90,
      round: newRound,
      roundStartTime: Date.now(),
      correctGuessers: [],
      firstCorrectGuessTime: null,
      extendedTime: false,
    },
    drawingData: [],
  })
}

export function selectWord(roomId: string, playerId: string, selectedWord: string): GameRoom | null {
  const room = gameRooms.get(roomId)
  if (!room || room.gameState.currentDrawer !== playerId) return null

  const updatedRoom = updateRoom(roomId, {
    gameState: {
      ...room.gameState,
      currentWord: selectedWord,
      wordOptions: null, // Clear options after selection
    },
  })

  // Start the timer after word selection
  startGameTimer(roomId)

  return updatedRoom
}

export function cleanupOldRooms() {
  const now = Date.now()
  const maxAge = 2 * 60 * 60 * 1000

  for (const [roomId, room] of gameRooms.entries()) {
    if (now - room.lastActivity > maxAge) {
      stopGameTimer(roomId)
      gameRooms.delete(roomId)
    }
  }
}

// Add this export at the end of the file if it's missing
