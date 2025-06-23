"use server"

import { createRoom, getRoom, updateRoom, getRoomList, joinRoom, startGameTimer, nextTurn } from "../lib/game-storage"

export async function createGameRoom(roomName: string, hostId: string, hostName: string) {
  try {
    const room = createRoom(roomName, hostId, hostName)
    return { success: true, room }
  } catch (error) {
    return { success: false, error: "Failed to create room" }
  }
}

export async function joinGameRoom(roomId: string, playerId: string, playerName: string, teamId: "A" | "B") {
  try {
    const room = joinRoom(roomId, playerId, playerName, teamId)
    if (!room) {
      return { success: false, error: "Room not found or not joinable" }
    }
    return { success: true, room }
  } catch (error) {
    return { success: false, error: "Failed to join room" }
  }
}

export async function getGameRoom(roomId: string) {
  try {
    const room = getRoom(roomId)
    if (!room) {
      return { success: false, error: "Room not found" }
    }
    return { success: true, room }
  } catch (error) {
    return { success: false, error: "Failed to get room" }
  }
}

export async function getAvailableRooms() {
  try {
    const rooms = getRoomList()
    return { success: true, rooms }
  } catch (error) {
    return { success: false, error: "Failed to get rooms" }
  }
}

export async function startGame(roomId: string, playerId: string) {
  try {
    const room = getRoom(roomId)
    if (!room || room.hostId !== playerId) {
      return { success: false, error: "Not authorized or room not found" }
    }

    if (room.teams.some((team) => team.players.length === 0)) {
      return { success: false, error: "Both teams need at least one player" }
    }

    // Start with first team's first player
    const firstTeam = room.teams[0]
    const firstDrawer = firstTeam.players[0]

    // Get word options for the first drawer
    const wordOptions = ["elephant", "rainbow", "guitar"] // Will be randomized in storage

    const updatedRoom = updateRoom(roomId, {
      gameState: {
        ...room.gameState,
        phase: "playing",
        currentDrawer: firstDrawer.id,
        currentWord: null, // Will be set when drawer chooses
        wordOptions: wordOptions,
        timeLeft: 90,
        roundStartTime: Date.now(),
        correctGuessers: [],
        firstCorrectGuessTime: null,
        extendedTime: false,
      },
    })

    // Don't start timer yet - wait for word selection
    return { success: true, room: updatedRoom }
  } catch (error) {
    return { success: false, error: "Failed to start game" }
  }
}

export async function chooseWord(roomId: string, playerId: string, word: string) {
  try {
    const room = getRoom(roomId)
    if (!room || room.gameState.currentDrawer !== playerId) {
      return { success: false, error: "Not authorized to select word" }
    }

    const updatedRoom = updateRoom(roomId, {
      gameState: {
        ...room.gameState,
        currentWord: word,
        wordOptions: null,
      },
    })

    // Start timer after word selection
    startGameTimer(roomId)

    return { success: true, room: updatedRoom }
  } catch (error) {
    return { success: false, error: "Failed to select word" }
  }
}

export async function selectWord(roomId: string, playerId: string, word: string) {
  try {
    const room = getRoom(roomId)
    if (!room || room.gameState.currentDrawer !== playerId) {
      return { success: false, error: "Not authorized to select word" }
    }

    // Import the selectWord function from game-storage
    const { selectWord: selectWordFromStorage } = await import("../lib/game-storage")
    const updatedRoom = selectWordFromStorage(roomId, playerId, word)

    if (!updatedRoom) {
      return { success: false, error: "Failed to select word" }
    }

    return { success: true, room: updatedRoom }
  } catch (error) {
    return { success: false, error: "Failed to select word" }
  }
}

export async function sendChatMessage(roomId: string, playerId: string, message: string) {
  try {
    const room = getRoom(roomId)
    if (!room) {
      return { success: false, error: "Room not found" }
    }

    const player = room.players.find((p) => p.id === playerId)
    if (!player) {
      return { success: false, error: "Player not found" }
    }

    if (room.gameState.correctGuessers.includes(playerId)) {
      return { success: false, error: "You have already guessed correctly!" }
    }

    const isCorrectGuess =
      room.gameState.currentWord &&
      message.toLowerCase().trim() === room.gameState.currentWord.toLowerCase() &&
      playerId !== room.gameState.currentDrawer

    const chatMessage = {
      id: Date.now().toString(),
      playerId,
      playerName: player.name,
      message,
      timestamp: Date.now(),
      isCorrectGuess,
    }

    let updatedGameState = room.gameState
    let updatedTeams = room.teams

    if (isCorrectGuess) {
      const newCorrectGuessers = [...room.gameState.correctGuessers, playerId]
      const firstCorrectGuessTime = room.gameState.firstCorrectGuessTime || Date.now()
      const guessOrder = newCorrectGuessers.length
      const basePoints = Math.max(1, Math.floor(room.gameState.timeLeft / 15))
      const bonusPoints = Math.max(0, 4 - guessOrder)
      const totalPoints = basePoints + bonusPoints

      updatedTeams = room.teams.map((team) =>
        team.id === player.team ? { ...team, score: team.score + totalPoints } : team,
      )

      updatedGameState = {
        ...room.gameState,
        correctGuessers: newCorrectGuessers,
        firstCorrectGuessTime,
      }
    }

    const updatedRoom = updateRoom(roomId, {
      chatMessages: [...room.chatMessages, chatMessage],
      teams: updatedTeams,
      gameState: updatedGameState,
    })

    return { success: true, room: updatedRoom }
  } catch (error) {
    return { success: false, error: "Failed to send message" }
  }
}

export async function updateDrawing(roomId: string, playerId: string, drawingData: any[]) {
  try {
    const room = getRoom(roomId)
    if (!room || room.gameState.currentDrawer !== playerId) {
      return { success: false, error: "Not authorized to draw" }
    }

    const updatedRoom = updateRoom(roomId, {
      drawingData: drawingData,
    })

    return { success: true, room: updatedRoom }
  } catch (error) {
    return { success: false, error: "Failed to update drawing" }
  }
}

export async function skipTurn(roomId: string, playerId: string) {
  try {
    const room = getRoom(roomId)
    if (!room || room.gameState.currentDrawer !== playerId) {
      return { success: false, error: "Not authorized" }
    }

    nextTurn(roomId)
    const updatedRoom = getRoom(roomId)
    return { success: true, room: updatedRoom }
  } catch (error) {
    return { success: false, error: "Failed to skip turn" }
  }
}

export async function updatePlayerStatus(roomId: string, playerId: string) {
  try {
    const room = getRoom(roomId)
    if (!room) {
      return { success: false, error: "Room not found" }
    }

    const updatedPlayers = room.players.map((p) =>
      p.id === playerId ? { ...p, isOnline: true, lastSeen: Date.now() } : p,
    )

    const updatedTeams = room.teams.map((team) => ({
      ...team,
      players: updatedPlayers.filter((p) => p.team === team.id),
    }))

    const updatedRoom = updateRoom(roomId, {
      players: updatedPlayers,
      teams: updatedTeams,
    })

    return { success: true, room: updatedRoom }
  } catch (error) {
    return { success: false, error: "Failed to update status" }
  }
}
