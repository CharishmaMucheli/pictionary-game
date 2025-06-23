"use client"

import { useState, useEffect } from "react"
import { PlayerSetup } from "./components/player-setup"
import { RoomLobby } from "./components/room-lobby"
import { OnlineGameRoom } from "./components/online-game-room"

type GamePhase = "setup" | "lobby" | "room"

export default function OnlinePictionary() {
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

    // Check if player was in a room
    const savedPlayerName = localStorage.getItem("pictionary-player-name")
    const savedRoomId = localStorage.getItem("pictionary-room-id")

    if (savedPlayerName && savedRoomId) {
      setPlayerName(savedPlayerName)
      setCurrentRoomId(savedRoomId)
      setGamePhase("room")
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
    setGamePhase("lobby")
  }

  if (gamePhase === "setup") {
    return <PlayerSetup onPlayerReady={handlePlayerReady} />
  }

  if (gamePhase === "lobby") {
    return <RoomLobby playerId={playerId} playerName={playerName} onJoinRoom={handleJoinRoom} />
  }

  if (gamePhase === "room" && currentRoomId) {
    return (
      <OnlineGameRoom
        roomId={currentRoomId}
        playerId={playerId}
        playerName={playerName}
        onLeaveRoom={handleLeaveRoom}
      />
    )
  }

  return null
}
