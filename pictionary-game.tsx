"use client"

import { useState } from "react"
import { useGame } from "./hooks/useGame"
import { GameSetup } from "./components/game-setup"
import { GameBoard } from "./components/game-board"

export default function PictionaryGame() {
  const [currentPlayerId] = useState(() => `player-${Date.now()}`)
  const { teams, gameState, chatMessages, addPlayer, startGame, nextTurn, addChatMessage } = useGame()

  const handleSendMessage = (message: string) => {
    addChatMessage(currentPlayerId, message)
  }

  if (gameState.phase === "setup") {
    return <GameSetup teams={teams} onAddPlayer={addPlayer} onStartGame={startGame} />
  }

  return (
    <GameBoard
      teams={teams}
      gameState={gameState}
      chatMessages={chatMessages}
      currentPlayerId={currentPlayerId}
      onSendMessage={handleSendMessage}
      onNextTurn={nextTurn}
    />
  )
}
