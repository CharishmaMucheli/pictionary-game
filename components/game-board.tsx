"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DrawingCanvas } from "./drawing-canvas"
import { ChatPanel } from "./chat-panel"
import type { Team, GameState, ChatMessage } from "../types/game"

interface GameBoardProps {
  teams: Team[]
  gameState: GameState
  chatMessages: ChatMessage[]
  currentPlayerId: string
  onSendMessage: (message: string) => void
  onNextTurn: () => void
}

export function GameBoard({
  teams,
  gameState,
  chatMessages,
  currentPlayerId,
  onSendMessage,
  onNextTurn,
}: GameBoardProps) {
  const currentTeam = teams.find((t) => t.id === gameState.currentTeam)
  const currentDrawer = teams.flatMap((t) => t.players).find((p) => p.id === gameState.currentDrawer)
  const isCurrentPlayerDrawer = currentPlayerId === gameState.currentDrawer

  if (gameState.phase === "finished") {
    const winner = teams.reduce((prev, current) => (prev.score > current.score ? prev : current))

    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">🎉 Game Over!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{winner.name} Wins!</h2>
              <div className="grid grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="p-4 border rounded-lg">
                    <h3 className="font-bold">{team.name}</h3>
                    <p className="text-2xl">{team.score} points</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => window.location.reload()}>Play Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Game Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-bold">Current Turn</h3>
              <p className="text-lg">{currentTeam?.name}</p>
              <p className="text-sm text-gray-600">{currentDrawer?.name} is drawing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-bold">Time Left</h3>
              <p className={`text-2xl font-mono ${gameState.timeLeft <= 10 ? "text-red-500" : "text-green-500"}`}>
                {gameState.timeLeft}s
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-bold">Round</h3>
              <p className="text-lg">
                {gameState.round} / {gameState.maxRounds}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {teams.map((team) => (
          <Card key={team.id} className={team.id === gameState.currentTeam ? "ring-2 ring-blue-500" : ""}>
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
                    className={`p-2 rounded text-sm ${
                      player.id === gameState.currentDrawer ? "bg-blue-100 font-bold" : "bg-gray-50"
                    }`}
                  >
                    {player.name}
                    {player.id === gameState.currentDrawer && " (Drawing)"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Word Display for Drawer */}
      {isCurrentPlayerDrawer && gameState.currentWord && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-bold text-lg">Your word to draw:</h3>
              <p className="text-2xl font-bold text-yellow-800">{gameState.currentWord.toUpperCase()}</p>
              <p className="text-sm text-gray-600 mt-2">
                Don't let others see this! Draw the word without using letters or numbers.
              </p>
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
              <DrawingCanvas isDrawer={isCurrentPlayerDrawer} />
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Guesses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChatPanel
                messages={chatMessages}
                currentPlayerId={currentPlayerId}
                onSendMessage={onSendMessage}
                isDrawer={isCurrentPlayerDrawer}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Controls */}
      {isCurrentPlayerDrawer && (
        <div className="mt-6 text-center">
          <Button onClick={onNextTurn} variant="outline">
            Skip Turn
          </Button>
        </div>
      )}
    </div>
  )
}
