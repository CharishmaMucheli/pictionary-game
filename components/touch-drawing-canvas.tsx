"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface DrawingPoint {
  x: number
  y: number
  isDrawing: boolean
  color: string
  size: number
  timestamp: number
}

interface TouchDrawingCanvasProps {
  isDrawer: boolean
  drawingData: DrawingPoint[]
  onDrawingChange?: (points: DrawingPoint[]) => void
  onClearCanvas?: () => void
  gameStartTime?: number | null
}

export function TouchDrawingCanvas({
  isDrawer,
  drawingData,
  onDrawingChange,
  onClearCanvas,
  gameStartTime,
}: TouchDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(4)
  const [localDrawingPoints, setLocalDrawingPoints] = useState<DrawingPoint[]>([])
  const [showWatchMessage, setShowWatchMessage] = useState(true)

  // Hide "Watch and guess" message after 5 seconds when drawing starts
  useEffect(() => {
    if (!isDrawer && drawingData.length > 0 && showWatchMessage) {
      const timer = setTimeout(() => {
        setShowWatchMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isDrawer, drawingData.length, showWatchMessage])

  // Reset message visibility when new round starts
  useEffect(() => {
    if (gameStartTime) {
      setShowWatchMessage(true)
    }
  }, [gameStartTime])

  // Get coordinates from mouse or touch event
  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }, [])

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawer) return

      // Prevent default touch behavior (scrolling, zooming)
      e.preventDefault()

      setIsDrawing(true)
      const { x, y } = getCoordinates(e)

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
    [isDrawer, currentColor, brushSize, getCoordinates],
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !isDrawer) return

      // Prevent default touch behavior
      e.preventDefault()

      const { x, y } = getCoordinates(e)

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
    [isDrawing, isDrawer, currentColor, brushSize, getCoordinates],
  )

  const stopDrawing = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawer) return

      // Prevent default touch behavior
      if (e) e.preventDefault()

      setIsDrawing(false)
      setLocalDrawingPoints((prev) => [
        ...prev,
        { x: 0, y: 0, isDrawing: false, color: currentColor, size: brushSize, timestamp: Date.now() },
      ])
    },
    [isDrawer, currentColor, brushSize],
  )

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
    }
  }, [drawingData])

  // Prevent context menu on long press (mobile)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventContextMenu = (e: Event) => {
      e.preventDefault()
    }

    canvas.addEventListener("contextmenu", preventContextMenu)
    return () => canvas.removeEventListener("contextmenu", preventContextMenu)
  }, [])

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
  ]

  return (
    <div className="flex flex-col items-center space-y-2 w-full h-full">
      {/* Canvas */}
      <div className="relative flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400} // Optimized for compact viewport
          height={250} // Optimized for compact viewport
          className={`border-2 border-gray-300 rounded-xl bg-white shadow-lg touch-none ${
            isDrawer ? "cursor-crosshair" : "cursor-not-allowed"
          }`}
          style={{
            touchAction: "none", // Prevent scrolling/zooming on touch
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          // Mouse events
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          // Touch events
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
        {!isDrawer && showWatchMessage && (
          <div className="absolute inset-0 bg-black/5 rounded-xl flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 px-3 py-2 rounded-lg shadow-lg animate-pulse">
              <p className="text-gray-700 font-medium text-sm">👀 Watch and guess!</p>
            </div>
          </div>
        )}
      </div>

      {/* Drawing Tools - Ultra Compact */}
      {isDrawer && (
        <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-100 w-full max-w-md">
          <div className="space-y-1">
            {/* Color Palette */}
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 touch-manipulation ${
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

            {/* Brush Size and Clear Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Size:</span>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-12 accent-blue-500"
                />
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: currentColor }}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{
                      width: `${Math.min(brushSize / 3, 8)}px`,
                      height: `${Math.min(brushSize / 3, 8)}px`,
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={clearCanvas}
                variant="outline"
                size="sm"
                className="gap-1 text-xs touch-manipulation h-6"
              >
                <RotateCcw className="w-2 h-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isDrawer && !showWatchMessage && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-2 text-center">
          <p className="text-blue-800 font-medium text-xs">🎯 Type your guess in the chat!</p>
        </div>
      )}
    </div>
  )
}
