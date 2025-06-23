"use client"

import { useState, useCallback, useEffect } from "react"
import type { Player, Team, GameState, ChatMessage } from "../types/game"
import { getRandomWord } from "../data/words"

export function useGame() {
  const [teams, setTeams] = useState<Team[]>([
    { id: "A", name: "Team A", score: 0, players: [] },
    { id: "B", name: "Team B", score: 0, players: [] },
  ])

  const [gameState, setGameState] = useState<GameState>({
    phase: "setup", // ✅ Now valid after fixing types
    currentTeam: "A",
    currentDrawer: null,
    currentWord: null,
    timeLeft: 60,
    round: 1,
    maxRounds: 6,
  })

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const addPlayer = useCallback((name: string, teamId: "A" | "B") => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      team: teamId,
    }

    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, players: [...team.players, newPlayer] } : team)),
    )
  }, [])

  const startGame = useCallback(() => {
    const teamA = teams.find((t) => t.id === "A")
    if (!teamA || teamA.players.length === 0) return

    setGameState((prev) => ({
      ...prev,
      phase: "playing",
      currentDrawer: teamA.players[0].id,
      currentWord: getRandomWord("easy"),
      timeLeft: 60,
    }))
  }, [teams])

  const nextTurn = useCallback(() => {
    setGameState((prev) => {
      const currentTeam = teams.find((t) => t.id === prev.currentTeam)
      const otherTeamId = prev.currentTeam === "A" ? "B" : "A"
      const otherTeam = teams.find((t) => t.id === otherTeamId)

      if (!currentTeam || !otherTeam) return prev

      const newRound = prev.currentTeam === "B" ? prev.round + 1 : prev.round

      if (newRound > prev.maxRounds) {
        return { ...prev, phase: "finished" }
      }

      return {
        ...prev,
        currentTeam: otherTeamId,
        currentDrawer: otherTeam.players[0]?.id || null,
        currentWord: getRandomWord("medium"),
        timeLeft: 60,
        round: newRound,
      }
    })
  }, [teams])

  const addChatMessage = useCallback(
    (playerId: string, message: string) => {
      const player = teams.flatMap((t) => t.players).find((p) => p.id === playerId)
      if (!player) return

      const isCorrectGuess =
        gameState.currentWord && message.toLowerCase().trim() === gameState.currentWord.toLowerCase()

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerId,
        playerName: player.name,
        message,
        timestamp: Date.now(),
        isCorrectGuess,
      }

      setChatMessages((prev) => [...prev, newMessage])

      if (isCorrectGuess) {
        setTeams((prev) =>
          prev.map((team) =>
            team.id === player.team ? { ...team, score: team.score + 1 } : team
          )
        )
        setTimeout(nextTurn, 2000)
      }
    },
    [teams, gameState.currentWord, nextTurn],
  )

  // Timer effect
  useEffect(() => {
    if (gameState.phase !== "playing" || gameState.timeLeft <= 0) return

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          setTimeout(nextTurn, 1000)
          return { ...prev, timeLeft: 0 }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.phase, gameState.timeLeft, nextTurn])

  return {
    teams,
    gameState,
    chatMessages,
    addPlayer,
    startGame,
    nextTurn,
    addChatMessage,
  }
}
