"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Team } from "../types/game"

interface GameSetupProps {
  teams: Team[]
  onAddPlayer: (name: string, teamId: "A" | "B") => void
  onStartGame: () => void
}

export function GameSetup({ teams, onAddPlayer, onStartGame }: GameSetupProps) {
  const [playerName, setPlayerName] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B">("A")

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      onAddPlayer(playerName.trim(), selectedTeam)
      setPlayerName("")
    }
  }

  const canStartGame = teams.every((team) => team.players.length > 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎨 Pictionary Game</h1>
        <p className="text-gray-600">Add players to teams and start drawing!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {team.name}
                <span className="text-sm font-normal">
                  {team.players.length} player{team.players.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {team.players.map((player) => (
                  <div key={player.id} className="p-2 bg-gray-100 rounded">
                    {player.name}
                  </div>
                ))}
                {team.players.length === 0 && <p className="text-gray-500 italic">No players yet</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Player</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPlayer} className="flex gap-4">
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="flex-1"
            />
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value as "A" | "B")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="A">Team A</option>
              <option value="B">Team B</option>
            </select>
            <Button type="submit" disabled={!playerName.trim()}>
              Add Player
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={onStartGame} disabled={!canStartGame} size="lg" className="px-8">
          {canStartGame ? "Start Game!" : "Add players to both teams first"}
        </Button>
      </div>
    </div>
  )
}
