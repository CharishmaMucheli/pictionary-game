"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Sparkles } from "lucide-react"

interface EnhancedPlayerSetupProps {
  onPlayerReady: (playerName: string) => void
}

export function EnhancedPlayerSetup({ onPlayerReady }: EnhancedPlayerSetupProps) {
  const [playerName, setPlayerName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      onPlayerReady(playerName.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Floating elements for visual appeal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/15 rounded-full animate-ping"></div>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-50"></div>

          <CardHeader className="text-center pb-6 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🎨</span>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Pictionary Online
            </CardTitle>
            <p className="text-gray-600 text-lg">Enter your name to join the fun!</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-600 font-medium">Draw, Guess, Win!</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>

          <CardContent className="p-8 relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="playerName"
                  className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Your Name
                </label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your awesome name..."
                  maxLength={20}
                  className="text-center text-lg py-3 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={!playerName.trim()}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                🚀 Let's Play!
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Join friends online • Draw and guess • Have fun!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
