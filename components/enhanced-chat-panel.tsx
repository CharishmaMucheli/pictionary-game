"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, CheckCircle, Clock } from "lucide-react"

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  isCorrectGuess?: boolean
}

interface EnhancedChatPanelProps {
  messages: ChatMessage[]
  currentPlayerId: string
  onSendMessage: (message: string) => void
  isDrawer: boolean
  correctGuessers: string[]
  players: any[]
  timeLeft: number
  firstCorrectGuessTime: number | null
}

export function EnhancedChatPanel({
  messages,
  currentPlayerId,
  onSendMessage,
  isDrawer,
  correctGuessers,
  players,
  timeLeft,
  firstCorrectGuessTime,
}: EnhancedChatPanelProps) {
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const hasGuessedCorrectly = correctGuessers.includes(currentPlayerId)
  const canGuess = !isDrawer && !hasGuessedCorrectly

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && canGuess) {
      onSendMessage(inputMessage.trim())
      setInputMessage("")
    }
  }

  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      })
    }
  }, [messages])

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    return player ? player.name : "Unknown"
  }

  const getGuessOrder = (playerId: string) => {
    return correctGuessers.indexOf(playerId) + 1
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Chat Header with Correct Guessers */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Chat & Guesses</h3>
          <div className="ml-auto">
            <span className="text-xs text-gray-500">{messages.length}</span>
          </div>
        </div>

        {/* Show correct guessers */}
        {correctGuessers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-green-700">Correct:</span>
              {firstCorrectGuessTime && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-2 h-2 mr-1" />
                  +30s
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {correctGuessers.map((playerId) => (
                <Badge
                  key={playerId}
                  variant="default"
                  className="bg-green-100 text-green-800 border-green-300 text-xs"
                >
                  #{getGuessOrder(playerId)} {getPlayerName(playerId)}
                  {playerId === currentPlayerId && " (You)"}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 scroll-smooth"
        style={{
          scrollBehavior: "smooth",
          overscrollBehavior: "contain",
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No messages yet...</p>
            <p className="text-xs text-gray-400">Start guessing!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg transition-all duration-200 ${
                message.isCorrectGuess
                  ? "bg-gradient-to-r from-green-100 to-green-200 border border-green-300 shadow-sm"
                  : message.playerId === currentPlayerId
                    ? "bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 ml-4"
                    : "bg-gray-100 border border-gray-200 mr-4"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1">
                  <span
                    className={`font-semibold text-xs ${message.isCorrectGuess ? "text-green-800" : "text-gray-700"}`}
                  >
                    {message.playerName}
                    {message.playerId === currentPlayerId && " (You)"}
                  </span>
                  {message.isCorrectGuess && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                      #{getGuessOrder(message.playerId)}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className={`text-sm ${message.isCorrectGuess ? "font-bold text-green-800" : "text-gray-800"}`}>
                {message.message}
                {message.isCorrectGuess && <span className="ml-1 text-green-600">✅</span>}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isDrawer ? "You're drawing!" : hasGuessedCorrectly ? "You've guessed! Wait..." : "Type your guess..."
            }
            disabled={!canGuess}
            className={`flex-1 text-sm ${
              !canGuess ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white focus:ring-2 focus:ring-blue-500"
            }`}
            maxLength={100}
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || !canGuess}
            className="px-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
            size="sm"
          >
            <Send className="w-3 h-3" />
          </Button>
        </form>

        {/* Status Messages */}
        <div className="mt-2 text-center">
          {isDrawer && <p className="text-xs text-gray-500">🎨 You're drawing!</p>}
          {hasGuessedCorrectly && !isDrawer && (
            <p className="text-xs text-green-600">✅ Correct! Waiting for others...</p>
          )}
          {!isDrawer && !hasGuessedCorrectly && correctGuessers.length > 0 && (
            <p className="text-xs text-orange-600">⏰ Extra time to guess!</p>
          )}
        </div>
      </div>
    </div>
  )
}
