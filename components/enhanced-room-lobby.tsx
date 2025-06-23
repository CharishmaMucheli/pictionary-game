"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Play, Clock, Trophy } from "lucide-react"
import { createGameRoom, joinGameRoom, getAvailableRooms } from "../actions/game-actions"

interface RoomLobbyProps {
  playerId: string
  playerName: string
  onJoinRoom: (roomId: string) => void
}

export function EnhancedRoomLobby({ playerId, playerName, onJoinRoom }: RoomLobbyProps) {
  const [roomName, setRoomName] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadRooms = async () => {
    const result = await getAvailableRooms()
    if (result.success) {
      setAvailableRooms(result.rooms)
    }
  }

  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim()) return

    setLoading(true)
    const result = await createGameRoom(roomName.trim(), playerId, playerName)
    setLoading(false)

    if (result.success) {
      onJoinRoom(result.room.id)
    } else {
      alert(result.error)
    }
  }

  const handleJoinRoom = async (roomId: string, teamId: "A" | "B" = "A") => {
    setLoading(true)
    const result = await joinGameRoom(roomId, playerId, playerName, teamId)
    setLoading(false)

    if (result.success) {
      onJoinRoom(roomId)
    } else {
      alert(result.error)
    }
  }

  const handleJoinRoomById = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinRoomId.trim()) return
    await handleJoinRoom(joinRoomId.trim().toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <span className="text-4xl">🎨</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Pictionary Online</h1>
          <p className="text-xl text-white/90 mb-2">
            Welcome back, <span className="font-semibold">{playerName}</span>!
          </p>
          <p className="text-white/80">Create or join a game room to start playing</p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Room */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Create New Room</CardTitle>
              <p className="text-gray-600">Start a new game and invite friends</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name (e.g., 'Friday Fun Game')"
                  maxLength={30}
                  className="text-lg py-3"
                />
                <Button
                  type="submit"
                  disabled={!roomName.trim() || loading}
                  className="w-full py-3 text-lg bg-green-500 hover:bg-green-600"
                  size="lg"
                >
                  {loading ? "Creating..." : "🚀 Create Room"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join by Room ID */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Join by Room ID</CardTitle>
              <p className="text-gray-600">Have a room code? Join directly</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoomById} className="space-y-4">
                <Input
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID (e.g., ABC123)"
                  maxLength={6}
                  className="text-lg py-3 text-center font-mono"
                />
                <Button
                  type="submit"
                  disabled={!joinRoomId.trim() || loading}
                  className="w-full py-3 text-lg bg-blue-500 hover:bg-blue-600"
                  size="lg"
                >
                  {loading ? "Joining..." : "🎯 Join Room"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Available Rooms */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-800">Available Rooms</CardTitle>
                  <p className="text-gray-600">Join an existing game</p>
                </div>
              </div>
              <Button onClick={loadRooms} variant="outline" size="sm" className="gap-2">
                <Clock className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availableRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No rooms available</p>
                <p className="text-gray-400">Create one to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{room.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{room.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {room.playerCount} players
                          </span>
                          <Badge variant={room.phase === "waiting" ? "default" : "secondary"}>{room.phase}</Badge>
                          <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{room.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleJoinRoom(room.id, "A")}
                        disabled={!room.isJoinable || loading}
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Join Red Team
                      </Button>
                      <Button
                        onClick={() => handleJoinRoom(room.id, "B")}
                        disabled={!room.isJoinable || loading}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Join Blue Team
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
