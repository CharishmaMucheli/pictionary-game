"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Palette, RotateCcw, Brush } from "lucide-react"

interface DrawingPoint {
  x: number
  y: number
  isDrawing: boolean
  color: string
  size: number
  timestamp: number
}

interface EnhancedDrawingCanvasProps {
  isDrawer: boolean
  drawingData: DrawingPoint[]
  onDrawingChange?: (points: DrawingPoint[]) => void
  onClearCanvas?: () => void
}

export function EnhancedDrawingCanvas({
  isDrawer,
  drawingData,
  onDrawingChange,
  onClearCanvas,
}: EnhancedDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(4)
  const [localDrawingPoints, setLocalDrawingPoints] = useState<DrawingPoint[]>([])
  const [showWatchOverlay, setShowWatchOverlay] = useState(true)

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawer) return
      setIsDrawing(true)
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newPoint: DrawingPoint = {
        x,
        y,
        isDrawing: true,
        color: currentColor,
        size: brushSize,
        timestamp: Date.now(),
      }

      setLocalDrawingPoints((prev) => [...prev, newPoint])
    },
    [isDrawer, currentColor, brushSize],
  )

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !isDrawer) return
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newPoint: DrawingPoint = {
        x,
        y,
        isDrawing: true,
        color: currentColor,
        size: brushSize,
        timestamp: Date.now(),
      }

      setLocalDrawingPoints((prev) => [...prev, newPoint])
    },
    [isDrawing, isDrawer, currentColor, brushSize],
  )

  const stopDrawing = useCallback(() => {
    if (!isDrawer) return
    setIsDrawing(false)
    setLocalDrawingPoints((prev) => [
      ...prev,
      { x: 0, y: 0, isDrawing: false, color: currentColor, size: brushSize, timestamp: Date.now() },
    ])
  }, [isDrawer, currentColor, brushSize])

  const clearCanvas = useCallback(() => {
    if (!isDrawer) return
    setLocalDrawingPoints([])
    onClearCanvas?.()
  }, [isDrawer, onClearCanvas])

  useEffect(() => {
    if (isDrawer && localDrawingPoints.length > 0) {
      onDrawingChange?.(localDrawingPoints)
    }
  }, [localDrawingPoints, isDrawer, onDrawingChange])

  const activeDrawingData = isDrawer ? localDrawingPoints : drawingData

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let lastPoint: DrawingPoint | null = null

    activeDrawingData.forEach((point) => {
      if (point.isDrawing && lastPoint && lastPoint.isDrawing) {
        ctx.beginPath()
        ctx.moveTo(lastPoint.x, lastPoint.y)
        ctx.lineTo(point.x, point.y)
        ctx.strokeStyle = point.color
        ctx.lineWidth = point.size
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()
      }
      lastPoint = point.isDrawing ? point : null
    })
  }, [activeDrawingData])

  useEffect(() => {
    if (drawingData.length === 0) {
      setLocalDrawingPoints([])
      setShowWatchOverlay(true) // Reset overlay for new round
    }
  }, [drawingData])

  useEffect(() => {
    if (!isDrawer && drawingData.length > 0 && showWatchOverlay) {
      const timeout = setTimeout(() => {
        setShowWatchOverlay(false)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [drawingData, isDrawer, showWatchOverlay])

  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF",
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
    "#800080", "#FFC0CB", "#A52A2A", "#808080",
  ]

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={350}
          className={`border-4 border-gray-300 rounded-xl bg-white shadow-lg ${
            isDrawer ? "cursor-crosshair" : "cursor-not-allowed"
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        {!isDrawer && showWatchOverlay && (
          <div className="absolute inset-0 bg-black/5 rounded-xl flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
              <p className="text-gray-700 font-medium">👀 Watch and guess!</p>
            </div>
          </div>
        )}
      </div>

      {/* Drawing Tools */}
      {isDrawer && (
        <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-100 w-full max-w-lg">
          <div className="space-y-3">
            {/* Color Palette */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Palette className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-700 text-sm">Colors</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                      currentColor === color
                        ? "border-gray-800 shadow-lg scale-110"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Brush className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-700 text-sm">Size</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-gray-600">S</span>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20 accent-blue-500"
                />
                <span className="text-xs text-gray-600">L</span>
                <div
                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: currentColor }}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{
                      width: `${Math.min(brushSize, 16)}px`,
                      height: `${Math.min(brushSize, 16)}px`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center">
              <Button onClick={clearCanvas} variant="outline" size="sm" className="gap-1 text-xs">
                <RotateCcw className="w-3 h-3" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message below canvas for guessers */}
      {!isDrawer && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-medium">
            🎯 Watch the drawing and type your guess in the chat!
          </p>
        </div>
      )}
    </div>
  )
} 