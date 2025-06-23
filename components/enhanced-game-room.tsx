"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EnhancedDrawingCanvas } from "./enhanced-drawing-canvas"
import { EnhancedChatPanel } from "./enhanced-chat-panel"
import { Clock, Users, Trophy, Crown, Zap, Target, LogOut, SkipForward, CheckCircle } from "lucide-react"
import {
  getGameRoom,
  startGame,
  sendChatMessage,
  updateDrawing,
  skipTurn,
  updatePlayerStatus,
} from "../actions/game-actions"

interface GameRoom {
  id: string
  name: string
  hostId: string
  players: any[]
  teams: any[]
  gameState: any
  chatMessages: any[]
  drawingData: any[]
  createdAt: number
  lastActivity: number
}

interface EnhancedGameRoomProps {
  roomId: string
  playerId: string
  playerName: string
  onLeaveRoom: () => void
}

export function EnhancedGameRoom({ roomId, playerId, playerName, onLeaveRoom }: EnhancedGameRoomProps) {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRoom = useCallback(async () => {
    const result = await getGameRoom(roomId)
    if (result.success) {
      setRoom(result.room??null)
      setError(null)
    } else {
      setError(result.error??null)
    }
    setLoading(false)
  }, [roomId])

  const updateStatus = useCallback(async () => {
    await updatePlayerStatus(roomId, playerId)
  }, [roomId, playerId])

  useEffect(() => {
    loadRoom()
    updateStatus()

    const interval = setInterval(() => {
      loadRoom()
      updateStatus()
    }, 1000)

    return () => clearInterval(interval)
  }, [loadRoom, updateStatus])

  const handleStartGame = async () => {
    const result = await startGame(roomId, playerId)
    if (result.success) {
      setRoom(result.room??null)
    } else {
      alert(result.error)
    }
  }

  const handleSendMessage = async (message: string) => {
    const result = await sendChatMessage(roomId, playerId, message)
    if (result.success) {
      setRoom(result.room??null)
    } else if (result.error) {
      // Show error message for already guessed
      alert(result.error)
    }
  }

  const handleDrawingChange = async (drawingData: any[]) => {
    await updateDrawing(roomId, playerId, drawingData)
  }

  const handleSkipTurn = async () => {
    const result = await skipTurn(roomId, playerId)
    if (result.success) {
      setRoom(result.room??null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading room...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold mb-4">Room Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The room you're looking for doesn't exist."}</p>
            <Button onClick={onLeaveRoom} className="w-full">
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlayer = room.players.find((p: any) => p.id === playerId)
  const currentDrawer = room.players.find((p: any) => p.id === room.gameState.currentDrawer)
  const isHost = room.hostId === playerId
  const isCurrentPlayerDrawer = playerId === room.gameState.currentDrawer
  const currentTeam = room.teams.find((t: any) => t.id === room.gameState.currentTeam)

  // Waiting room
  if (room.gameState.phase === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{room.name}</h1>
            <div className="flex items-center justify-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Room ID: <span className="font-mono font-bold text-lg">{room.id}</span>
              </span>
              <Button
                onClick={onLeaveRoom}
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Room
              </Button>
            </div>
          </div>

          {/* Teams */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {room.teams.map((team: any) => (
              <Card key={team.id} className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      team.id === "A" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl flex items-center justify-center gap-3">
                    {team.name}
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Users className="w-4 h-4 mr-1" />
                      {team.players.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.players.map((player: any) => (
                      <div
                        key={player.id}
                        className={`p-3 rounded-lg flex justify-between items-center transition-all ${
                          player.id === playerId
                            ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${player.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                          <span
                            className={`font-medium ${player.id === playerId ? "text-yellow-800" : "text-gray-800"}`}
                          >
                            {player.name}
                            {player.id === playerId && " (You)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {player.id === room.hostId && (
                            <Badge variant="outline" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Host
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {team.players.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 italic">No players yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Game Controls */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {isHost ? (
                  <>
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Start?</h3>
                      <p className="text-gray-600 mb-4">
                        {room.teams.every((team: any) => team.players.length > 0)
                          ? "Both teams have players. Let's begin the fun!"
                          : "Waiting for players to join both teams..."}
                      </p>
                    </div>
                    <Button
                      onClick={handleStartGame}
                      disabled={!room.teams.every((team: any) => team.players.length > 0)}
                      size="lg"
                      className="px-8 py-3 text-lg bg-green-500 hover:bg-green-600"
                    >
                      🚀 Start Game!
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Host</h3>
                      <p className="text-gray-600">The host will start the game when everyone is ready!</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Game finished
  if (room.gameState.phase === "finished") {
    const winner = room.teams.reduce((prev: any, current: any) => (prev.score > current.score ? prev : current))
    const isDraw = room.teams[0].score === room.teams[1].score

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <CardTitle className="text-4xl font-bold text-gray-800 mb-2">
              {isDraw ? "It's a Draw!" : `${winner.name} Wins!`}
            </CardTitle>
            <p className="text-gray-600 text-lg">Great game everyone!</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {room.teams.map((team: any) => (
                <div
                  key={team.id}
                  className={`p-6 rounded-xl text-center transition-all ${
                    !isDraw && team.score === winner.score
                      ? "bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 scale-105"
                      : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      team.id === "A" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800">{team.name}</h3>
                  <p className="text-4xl font-bold text-gray-800 my-2">{team.score}</p>
                  <p className="text-sm text-gray-600">{team.players.length} players</p>
                </div>
              ))}
            </div>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Room: <span className="font-mono font-bold">{room.id}</span>
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={onLeaveRoom} size="lg" className="px-6">
                  Back to Lobby
                </Button>
                {isHost && (
                  <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="px-6">
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
  const timeProgress = (room.gameState.timeLeft / 90) * 100
  const nonDrawerPlayers = room.players.filter((p: any) => p.id !== room.gameState.currentDrawer)
  const correctGuessers = room.gameState.correctGuessers || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">{room.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{room.name}</h1>
                <p className="text-sm text-gray-600">Room: {room.id}</p>
              </div>
            </div>
            <Button onClick={onLeaveRoom} variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Game Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-700 text-sm">Current Turn</h3>
              <p className="text-lg font-semibold text-gray-800">{currentTeam?.name}</p>
              <p className="text-xs text-gray-600">{currentDrawer?.name}</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  room.gameState.timeLeft <= 15 ? "bg-red-500" : "bg-green-500"
                }`}
              >
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-700 text-sm">Time Left</h3>
              <p
                className={`text-xl font-bold font-mono ${
                  room.gameState.timeLeft <= 15 ? "text-red-500" : "text-green-500"
                }`}
              >
                {room.gameState.timeLeft}s
              </p>
              <Progress value={timeProgress} className="mt-1 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-700 text-sm">Round</h3>
              <p className="text-lg font-semibold text-gray-800">
                {room.gameState.round} / {room.gameState.maxRounds}
              </p>
              <Progress value={(room.gameState.round / room.gameState.maxRounds) * 100} className="mt-1 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-700 text-sm">Guessed</h3>
              <p className="text-lg font-semibold text-gray-800">
                {correctGuessers.length} / {nonDrawerPlayers.length}
              </p>
              <Progress
                value={(correctGuessers.length / Math.max(nonDrawerPlayers.length, 1)) * 100}
                className="mt-1 h-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Word Display for Drawer */}
        {isCurrentPlayerDrawer && room.gameState.currentWord && (
          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-yellow-800 mb-2">Your word to draw:</h3>
              <p className="text-4xl font-bold text-yellow-900 mb-3">{room.gameState.currentWord.toUpperCase()}</p>
              <p className="text-yellow-700">🎨 Draw this word! No letters, numbers, or gestures allowed.</p>
            </CardContent>
          </Card>
        )}

        {/* Scores */}
        <div className="grid grid-cols-2 gap-6">
          {room.teams.map((team: any) => (
            <Card
              key={team.id}
              className={`bg-white shadow-lg border-0 transition-all ${
                team.id === room.gameState.currentTeam ? "ring-4 ring-blue-300 scale-[1.02]" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        team.id === "A" ? "bg-red-500" : "bg-blue-500"
                      }`}
                    >
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    {team.name}
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold">{team.score}</span>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {team.players.map((player: any) => (
                    <div
                      key={player.id}
                      className={`p-2 rounded-lg text-sm flex justify-between items-center transition-all ${
                        player.id === room.gameState.currentDrawer
                          ? "bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300 font-bold"
                          : correctGuessers.includes(player.id)
                            ? "bg-gradient-to-r from-green-100 to-green-200 border border-green-300"
                            : player.id === playerId
                              ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300"
                              : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span>
                        {player.name}
                        {player.id === room.gameState.currentDrawer && " 🎨"}
                        {correctGuessers.includes(player.id) && !isCurrentPlayerDrawer && " ✅"}
                        {player.id === playerId && " (You)"}
                      </span>
                      <div className="flex items-center gap-2">
                        {player.id === room.hostId && (
                          <Badge variant="outline" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Host
                          </Badge>
                        )}
                        <div className={`w-2 h-2 rounded-full ${player.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Game Area */}
        <div className="lg:col-span-2">
    <Card className="bg-white shadow-lg border-0 h-[650px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎨</span>
          </div>
          Drawing Canvas
        </CardTitle>
      </CardHeader>
              {/* Scrollable Canvas Area */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <EnhancedDrawingCanvas
          isDrawer={isCurrentPlayerDrawer}
          drawingData={room.drawingData}
          onDrawingChange={handleDrawingChange}
          onClearCanvas={() => {}}
        />
      </div>

      

              <CardContent>
                <EnhancedDrawingCanvas
                  isDrawer={isCurrentPlayerDrawer}
                  drawingData={room.drawingData}
                  onDrawingChange={handleDrawingChange}
                  onClearCanvas={() => {}}
                />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Chat Panel */}
          <div>
            <EnhancedChatPanel
              messages={room.chatMessages}
              currentPlayerId={playerId}
              onSendMessage={handleSendMessage}
              isDrawer={isCurrentPlayerDrawer}
              correctGuessers={correctGuessers}
              players={room.players}
              timeLeft={room.gameState.timeLeft}
              firstCorrectGuessTime={room.gameState.firstCorrectGuessTime}
            />
          </div>
        </div>

        {/* Drawer Controls */}
        {isCurrentPlayerDrawer && (
          <div className="text-center pb-8">
            <Button onClick={handleSkipTurn} variant="outline" size="lg" className="gap-2">
              <SkipForward className="w-4 h-4" />
              Skip Turn
            </Button>
          </div>
        )}
      </div>
    
  )
}
