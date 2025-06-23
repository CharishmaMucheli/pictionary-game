"use client"

import { useState, useEffect } from "react"
import { EnhancedPlayerSetup } from "./components/enhanced-player-setup"
import { EnhancedRoomLobby } from "./components/enhanced-room-lobby"
import { FixedLayoutGameRoom } from "./components/fixed-layout-game-room"

type GamePhase = "setup" | "lobby" | "room"

export default function OnlinePictionaryEnhanced() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup")
  const [playerId, setPlayerId] = useState<string>("")
  const [playerName, setPlayerName] = useState<string>("")
  const [currentRoomId, setCurrentRoomId] = useState<string>("")

  useEffect(() => {
    // Generate unique player ID
    const savedPlayerId = localStorage.getItem("pictionary-player-id")
    if (savedPlayerId) {
      setPlayerId(savedPlayerId)
    } else {
      const newPlayerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      setPlayerId(newPlayerId)
      localStorage.setItem("pictionary-player-id", newPlayerId)
    }

    // Check if player was in a room (but don't auto-rejoin to allow name changes)
    const savedPlayerName = localStorage.getItem("pictionary-player-name")
    if (savedPlayerName) {
      setPlayerName(savedPlayerName)
      setGamePhase("lobby")
    }
  }, [])

  const handlePlayerReady = (name: string) => {
    setPlayerName(name)
    localStorage.setItem("pictionary-player-name", name)
    setGamePhase("lobby")
  }

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId)
    localStorage.setItem("pictionary-room-id", roomId)
    setGamePhase("room")
  }

  const handleLeaveRoom = () => {
    setCurrentRoomId("")
    localStorage.removeItem("pictionary-room-id")
    // Go back to setup to allow name change
    setGamePhase("setup")
    setPlayerName("")
    localStorage.removeItem("pictionary-player-name")
  }

  const handleBackToLobby = () => {
    setCurrentRoomId("")
    localStorage.removeItem("pictionary-room-id")
    setGamePhase("lobby")
  }

  if (gamePhase === "setup") {
    return <EnhancedPlayerSetup onPlayerReady={handlePlayerReady} />
  }

  if (gamePhase === "lobby") {
    return <EnhancedRoomLobby playerId={playerId} playerName={playerName} onJoinRoom={handleJoinRoom} />
  }

  if (gamePhase === "room" && currentRoomId) {
    return (
      <FixedLayoutGameRoom
        roomId={currentRoomId}
        playerId={playerId}
        playerName={playerName}
        onLeaveRoom={handleLeaveRoom}
        onBackToLobby={handleBackToLobby}
      />
    )
  }

  return null
}
