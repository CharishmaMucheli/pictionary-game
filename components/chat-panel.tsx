"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ChatMessage } from "../types/game"

interface ChatPanelProps {
  messages: ChatMessage[]
  currentPlayerId: string
  onSendMessage: (message: string) => void
  isDrawer: boolean
}

export function ChatPanel({ messages, currentPlayerId, onSendMessage, isDrawer }: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && !isDrawer) {
      onSendMessage(inputMessage.trim())
      setInputMessage("")
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-2 rounded-lg ${
              message.isCorrectGuess
                ? "bg-green-100 border border-green-300"
                : message.playerId === currentPlayerId
                  ? "bg-blue-100 ml-8"
                  : "bg-gray-100 mr-8"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="font-semibold text-sm">{message.playerName}</span>
              <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className={`mt-1 ${message.isCorrectGuess ? "font-bold text-green-800" : ""}`}>
              {message.message}
              {message.isCorrectGuess && " ✓ Correct!"}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isDrawer ? "You're drawing - no guessing!" : "Type your guess..."}
            disabled={isDrawer}
            className="flex-1"
          />
          <Button type="submit" disabled={!inputMessage.trim() || isDrawer}>
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}
