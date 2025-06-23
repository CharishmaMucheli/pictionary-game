"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OnlineDrawingCanvas } from "./online-drawing-canvas"
import { ChatPanel } from "./chat-panel"
import {
  getGameRoom,
  startGame,
  sendChatMessage,
  updateDrawing,
  skipTurn,
  updatePlayerStatus,
} from "../actions/game-actions"
import type { GameRoom } from "../types/game"

interface OnlineGameRoomProps {
  roomId: string
  playerId: string
  playerName: string
  onLeaveRoom: () => void
}

export function OnlineGameRoom({ roomId, playerId, playerName, onLeaveRoom }: OnlineGameRoomProps) {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRoom = useCallback(async () => {
    const result = await getGameRoom(roomId)
    if (result.success) {
      setRoom(result.room)
      setError(null)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [roomId])

  const updateStatus = useCallback(async () => {
    await updatePlayerStatus(roomId, playerId)
  }, [roomId, playerId])

  useEffect(() => {
    loadRoom()
    updateStatus()

    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      loadRoom()
      updateStatus()
    }, 2000)

    return () => clearInterval(interval)
  }, [loadRoom, updateStatus])

  const handleStartGame = async () => {
    const result = await startGame(roomId, playerId)
    if (result.success) {
      setRoom(result.room)
    } else {
      alert(result.error)
    }
  }

  const handleSendMessage = async (message: string) => {
    const result = await sendChatMessage(roomId, playerId, message)
    if (result.success) {
      setRoom(result.room)
    }
  }

  const handleDrawingChange = async (drawingData: any[]) => {
    await updateDrawing(roomId, playerId, drawingData)
  }

  const handleSkipTurn = async () => {
    const result = await skipTurn(roomId, playerId)
    if (result.success) {
      setRoom(result.room)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading room...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Room Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The room you're looking for doesn't exist."}</p>
            <Button onClick={onLeaveRoom}>Back to Lobby</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlayer = room.players.find((p) => p.id === playerId)
  const currentDrawer = room.players.find((p) => p.id === room.gameState.currentDrawer)
  const isHost = room.hostId === playerId
  const isCurrentPlayerDrawer = playerId === room.gameState.currentDrawer
  const currentTeam = room.teams.find((t) => t.id === room.gameState.currentTeam)

  // Waiting room
  if (room.gameState.phase === "waiting") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <p className="text-gray-600">
              Room ID: <span className="font-mono font-bold">{room.id}</span>
            </p>
          </div>
          <Button onClick={onLeaveRoom} variant="outline">
            Leave Room
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {room.teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {team.name}
                  <Badge variant="secondary">{team.players.length} players</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-2 rounded flex justify-between items-center ${
                        player.id === playerId ? "bg-blue-100" : "bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2">
                        {player.id === room.hostId && <Badge variant="outline">Host</Badge>}
                        <div className={`w-2 h-2 rounded-full ${player.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                      </div>
                    </div>
                  ))}
                  {team.players.length === 0 && <p className="text-gray-500 italic text-center py-4">No players yet</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          {isHost ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                {room.teams.every((team) => team.players.length > 0)
                  ? "Ready to start! Both teams have players."
                  : "Waiting for players to join both teams..."}
              </p>
              <Button
                onClick={handleStartGame}
                disabled={!room.teams.every((team) => team.players.length > 0)}
                size="lg"
              >
                Start Game
              </Button>
            </div>
          ) : (
            <p className="text-gray-600">Waiting for the host to start the game...</p>
          )}
        </div>
      </div>
    )
  }

  // Game finished
  if (room.gameState.phase === "finished") {
    const winner = room.teams.reduce((prev, current) => (prev.score > current.score ? prev : current))

    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">🎉 Game Over!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">{winner.name} Wins!</h2>
              <div className="grid grid-cols-2 gap-4">
                {room.teams.map((team) => (
                  <div key={team.id} className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <p className="text-3xl font-bold">{team.score}</p>
                    <p className="text-sm text-gray-600">{team.players.length} players</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={onLeaveRoom}>Back to Lobby</Button>
                {isHost && (
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Play Again
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active game
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-sm text-gray-600">Room: {room.id}</p>
        </div>
        <Button onClick={onLeaveRoom} variant="outline" size="sm">
          Leave
        </Button>
      </div>

      {/* Game Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-bold">Current Turn</h3>
            <p className="text-lg">{currentTeam?.name}</p>
            <p className="text-sm text-gray-600">{currentDrawer?.name} drawing</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-bold">Time Left</h3>
            <p className={`text-2xl font-mono ${room.gameState.timeLeft <= 10 ? "text-red-500" : "text-green-500"}`}>
              {room.gameState.timeLeft}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-bold">Round</h3>
            <p className="text-lg">
              {room.gameState.round} / {room.gameState.maxRounds}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-bold">Your Team</h3>
            <p className="text-lg">{currentPlayer?.team === "A" ? "Team A" : "Team B"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {room.teams.map((team) => (
          <Card key={team.id} className={team.id === room.gameState.currentTeam ? "ring-2 ring-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                {team.name}
                <span className="text-2xl">{team.score}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {team.players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded text-sm flex justify-between items-center ${
                      player.id === room.gameState.currentDrawer
                        ? "bg-blue-100 font-bold"
                        : player.id === playerId
                          ? "bg-green-50"
                          : "bg-gray-50"
                    }`}
                  >
                    <span>
                      {player.name}
                      {player.id === room.gameState.currentDrawer && " (Drawing)"}
                      {player.id === playerId && " (You)"}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${player.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Word Display for Drawer */}
      {isCurrentPlayerDrawer && room.gameState.currentWord && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-bold text-lg">Your word to draw:</h3>
              <p className="text-2xl font-bold text-yellow-800">{room.gameState.currentWord.toUpperCase()}</p>
              <p className="text-sm text-gray-600 mt-2">Draw this word! Don't use letters, numbers, or gestures.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Game Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Drawing Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Drawing Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <OnlineDrawingCanvas
                isDrawer={isCurrentPlayerDrawer}
                drawingData={room.drawingData}
                onDrawingChange={handleDrawingChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Guesses & Chat</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChatPanel
                messages={room.chatMessages}
                currentPlayerId={playerId}
                onSendMessage={handleSendMessage}
                isDrawer={isCurrentPlayerDrawer}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drawer Controls */}
      {isCurrentPlayerDrawer && (
        <div className="mt-6 text-center">
          <Button onClick={handleSkipTurn} variant="outline">
            Skip Turn
          </Button>
        </div>
      )}
    </div>
  )
}
