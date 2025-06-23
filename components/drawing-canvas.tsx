"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { DrawingPoint } from "../types/game"

interface DrawingCanvasProps {
  isDrawer: boolean
  onDrawingChange?: (points: DrawingPoint[]) => void
}

export function DrawingCanvas({ isDrawer, onDrawingChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(3)
  const [drawingPoints, setDrawingPoints] = useState<DrawingPoint[]>([])

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
        timestamp: Date.now(), // 🛠 Fix: add timestamp
      }

      setDrawingPoints((prev) => [...prev, newPoint])
    },
    [isDrawer, currentColor, brushSize]
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
        timestamp: Date.now(), // 🛠 Fix: add timestamp
      }

      setDrawingPoints((prev) => [...prev, newPoint])
    },
    [isDrawing, isDrawer, currentColor, brushSize]
  )

  const stopDrawing = useCallback(() => {
    if (!isDrawer) return
    setIsDrawing(false)
    const endPoint: DrawingPoint = {
      x: 0,
      y: 0,
      isDrawing: false,
      color: currentColor,
      size: brushSize,
      timestamp: Date.now(), // 🛠 Fix: add timestamp
    }
    setDrawingPoints((prev) => [...prev, endPoint])
  }, [isDrawer, currentColor, brushSize])

  const clearCanvas = useCallback(() => {
    if (!isDrawer) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDrawingPoints([])
  }, [isDrawer])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let lastPoint: DrawingPoint | null = null

    drawingPoints.forEach((point) => {
      if (point.isDrawing && lastPoint && lastPoint.isDrawing) {
        ctx.beginPath()
        ctx.moveTo(lastPoint.x, lastPoint.y)
        ctx.lineTo(point.x, point.y)
        ctx.strokeStyle = point.color
        ctx.lineWidth = point.size
        ctx.lineCap = "round"
        ctx.stroke()
      }
      lastPoint = point.isDrawing ? point : null
    })

    onDrawingChange?.(drawingPoints)
  }, [drawingPoints, onDrawingChange])

  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"]

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {isDrawer && (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${
                  currentColor === color ? "border-gray-800" : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm">Brush Size:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-6">{brushSize}</span>
          </div>

          <Button onClick={clearCanvas} variant="outline">
            Clear Canvas
          </Button>
        </div>
      )}
    </div>
  )
}
