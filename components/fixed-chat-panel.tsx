"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageCircle } from "lucide-react"

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  isCorrectGuess?: boolean
}

interface FixedChatPanelProps {
  messages: ChatMessage[]
  currentPlayerId: string
  onSendMessage: (message: string) => void
  isDrawer: boolean
}

export function FixedChatPanel({ messages, currentPlayerId, onSendMessage, isDrawer }: FixedChatPanelProps) {
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && !isDrawer) {
      onSendMessage(inputMessage.trim())
      setInputMessage("")
    }
  }

  // Fixed scroll behavior - only scroll chat container, not entire page
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      // Use scrollIntoView with block: 'nearest' to prevent page scrolling
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-800">Chat & Guesses</h3>
        <div className="ml-auto">
          <span className="text-sm text-gray-500">{messages.length} messages</span>
        </div>
      </div>

      {/* Messages Container - Fixed height with internal scroll */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
        style={{
          scrollBehavior: "smooth",
          overscrollBehavior: "contain", // Prevent scroll chaining to parent
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No messages yet...</p>
            <p className="text-sm text-gray-400">Start guessing!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg transition-all duration-200 ${
                message.isCorrectGuess
                  ? "bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300 shadow-md"
                  : message.playerId === currentPlayerId
                    ? "bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 ml-8"
                    : "bg-gray-100 border border-gray-200 mr-8"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`font-semibold text-sm ${message.isCorrectGuess ? "text-green-800" : "text-gray-700"}`}
                >
                  {message.playerName}
                  {message.playerId === currentPlayerId && " (You)"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className={`${message.isCorrectGuess ? "font-bold text-green-800 text-lg" : "text-gray-800"}`}>
                {message.message}
                {message.isCorrectGuess && <span className="ml-2 text-green-600">✅ Correct Answer!</span>}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isDrawer ? "You're drawing - no guessing allowed!" : "Type your guess here..."}
            disabled={isDrawer}
            className={`flex-1 ${
              isDrawer ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white focus:ring-2 focus:ring-blue-500"
            }`}
            maxLength={100}
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isDrawer}
            className="px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {isDrawer && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            🎨 You're the artist! Let others guess your masterpiece.
          </p>
        )}
      </div>
    </div>
  )
}
