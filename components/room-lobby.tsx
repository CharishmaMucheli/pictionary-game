"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createGameRoom, joinGameRoom, getAvailableRooms } from "../actions/game-actions"
import type { RoomListItem } from "../types/game"

interface RoomLobbyProps {
  playerId: string
  playerName: string
  onJoinRoom: (roomId: string) => void
}

export function RoomLobby({ playerId, playerName, onJoinRoom }: RoomLobbyProps) {
  const [roomName, setRoomName] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [availableRooms, setAvailableRooms] = useState<RoomListItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadRooms = async () => {
    const result = await getAvailableRooms()
    if (result.success) {
      setAvailableRooms(result.rooms)
    }
  }

  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 3000) // Refresh every 3 seconds
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎨 Online Pictionary</h1>
        <p className="text-gray-600">Welcome, {playerName}! Create or join a game room.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Create Room */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Room</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                maxLength={30}
              />
              <Button type="submit" disabled={!roomName.trim() || loading} className="w-full">
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Join by Room ID */}
        <Card>
          <CardHeader>
            <CardTitle>Join by Room ID</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinRoomById} className="space-y-4">
              <Input
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID (e.g., ABC123)"
                maxLength={6}
              />
              <Button type="submit" disabled={!joinRoomId.trim() || loading} className="w-full">
                {loading ? "Joining..." : "Join Room"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Available Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Available Rooms
            <Button onClick={loadRooms} variant="outline" size="sm">
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableRooms.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No rooms available. Create one to get started!</p>
          ) : (
            <div className="space-y-3">
              {availableRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{room.name}</h3>
                    <p className="text-sm text-gray-600">
                      Room ID: {room.id} • {room.playerCount} players • {room.phase}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleJoinRoom(room.id, "A")}
                      disabled={!room.isJoinable || loading}
                      size="sm"
                    >
                      Join Team A
                    </Button>
                    <Button
                      onClick={() => handleJoinRoom(room.id, "B")}
                      disabled={!room.isJoinable || loading}
                      size="sm"
                      variant="outline"
                    >
                      Join Team B
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
