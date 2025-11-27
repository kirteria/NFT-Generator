"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Edit, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import JSZip from "jszip"
import type { GeneratedNFT } from "./canvas-preview"

interface GenerationResultsProps {
  results: GeneratedNFT[]
  layers: any[]
  canvasSize: { width: number; height: number }
  collectionName: string
  collectionDescription: string
}

export function GenerationResults({
  results,
  layers,
  canvasSize,
  collectionName,
  collectionDescription,
}: GenerationResultsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedResults, setEditedResults] = useState(results)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setEditedResults(results)
  }, [results])

  const drawFirstImage = useCallback(() => {
    if (!canvasRef.current || results.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    ctx.fillStyle = "#6A3CFF"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, position.x, position.y, canvasSize.width, canvasSize.height)
    }
    img.src = results[0].dataUrl
  }, [results, canvasSize, position])

  useEffect(() => {
    if (isEditing) {
      drawFirstImage()
    }
  }, [isEditing, drawFirstImage])

  const moveImage = (direction: "up" | "down" | "left" | "right") => {
    const moveAmount = 1
    setPosition((prev) => {
      switch (direction) {
        case "up":
          return { ...prev, y: prev.y - moveAmount }
        case "down":
          return { ...prev, y: prev.y + moveAmount }
        case "left":
          return { ...prev, x: prev.x - moveAmount }
        case "right":
          return { ...prev, x: prev.x + moveAmount }
        default:
          return prev
      }
    })
  }

  const handleReposition = async () => {
    const newResults: GeneratedNFT[] = []

    for (const result of results) {
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = canvasSize.width
      tempCanvas.height = canvasSize.height
      const tempCtx = tempCanvas.getContext("2d")

      if (tempCtx) {
        tempCtx.imageSmoothingEnabled = true
        tempCtx.imageSmoothingQuality = "high"

        tempCtx.fillStyle = "#6A3CFF"
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

        await new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            tempCtx.drawImage(img, position.x, position.y, canvasSize.width, canvasSize.height)
            resolve()
          }
          img.src = result.dataUrl
        })

        newResults.push({
          ...result,
          dataUrl: tempCanvas.toDataURL("image/png", 1.0),
        })
      }
    }

    setEditedResults(newResults)
    setIsEditing(false)
    setPosition({ x: 0, y: 0 })
  }

  const downloadAllImages = async () => {
    const zip = new JSZip()
    const imageFolder = zip.folder("image")

    if (!imageFolder) return

    for (let i = 0; i < editedResults.length; i++) {
      const nft = editedResults[i]
      const response = await fetch(nft.dataUrl)
      const blob = await response.blob()
      imageFolder.file(`${i + 1}.png`, blob)
    }

    const content = await zip.generateAsync({ type: "blob" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(content)
    link.download = `${collectionName || "nft-collection"}.zip`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (results.length === 0) return null

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Generated Collection</CardTitle>
            <CardDescription>{editedResults.length} NFTs generated</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative w-full max-w-[300px]">
              {isEditing ? (
                <>
                  <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="border-4 border-primary rounded-lg w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-32 h-32 pointer-events-auto">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-0 left-1/2 -translate-x-1/2 opacity-60 hover:opacity-100"
                        onClick={() => moveImage("up")}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-60 hover:opacity-100"
                        onClick={() => moveImage("down")}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute left-0 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                        onClick={() => moveImage("left")}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                        onClick={() => moveImage("right")}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={editedResults[0].dataUrl || "/placeholder.svg"}
                  alt="First NFT"
                  className="border-4 border-primary rounded-lg w-full h-auto"
                />
              )}
            </div>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {isEditing ? (
              <>
                <Button onClick={handleReposition} size="sm">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Apply to All
                </Button>
                <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Position
                </Button>
                <Button onClick={downloadAllImages} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Images
                </Button>
              </>
            )}
          </div>

          {isEditing && (
            <p className="text-xs text-muted-foreground bg-primary/10 p-2 rounded text-center">
              Use the arrow buttons to reposition the image, then click "Apply to All" to update all NFTs
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {editedResults.map((nft) => (
            <div key={nft.id} className="relative group">
              <img
                src={nft.dataUrl || "/placeholder.svg"}
                alt={`NFT #${nft.id}`}
                className="w-full h-auto rounded border-2 border-border group-hover:border-primary transition-colors"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 text-center rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                #{nft.id}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
