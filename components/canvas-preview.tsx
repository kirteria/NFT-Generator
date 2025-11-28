"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { ExclusionRule } from "@/components/exclusion-rules"

interface Layer {
  id: string
  name: string
  images: Array<{
    id: string
    file: File
    preview: string
    rarity: number
    name: string
  }>
}

interface LayerPosition {
  x: number
  y: number
  scale: number
}

interface CanvasPreviewProps {
  layers: Layer[]
  canvasSize: { width: number; height: number }
  totalGeneration: number
  collectionName: string
  collectionDescription: string
  exclusionRules: ExclusionRule[]
  onGenerate?: (results: GeneratedNFT[]) => void
}

export interface GeneratedNFT {
  id: number
  dataUrl: string
  metadata: any
}

export function CanvasPreview({
  layers,
  canvasSize,
  totalGeneration,
  collectionName,
  collectionDescription,
  exclusionRules,
  onGenerate,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [hasGeneratedInitial, setHasGeneratedInitial] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const selectImageByRarity = (layerImages: any[]) => {
    if (layerImages.length === 0) return null

    const totalWeight = layerImages.reduce((sum, img) => sum + img.rarity, 0)
    const random = Math.random() * totalWeight
    let accumulated = 0

    for (const img of layerImages) {
      accumulated += img.rarity
      if (random <= accumulated) {
        return img
      }
    }

    return layerImages[0]
  }

  const checkExclusionRules = (combination: Array<{ layerId: string; imageId: string }>) => {
    for (const rule of exclusionRules) {
      const hasLayerA = combination.find((c) => c.layerId === rule.layerAId && c.imageId === rule.imageAId)
      const hasLayerB = combination.find((c) => c.layerId === rule.layerBId && c.imageId === rule.imageBId)

      if (hasLayerA && hasLayerB) {
        return false // Violates rule
      }
    }
    return true // Valid combination
  }

  const generateValidCombination = useCallback(() => {
    const maxRetries = 100
    let attempts = 0

    while (attempts < maxRetries) {
      const combination = layers
        .map((layer) => {
          const selected = selectImageByRarity(layer.images)
          return selected ? { layerId: layer.id, imageId: selected.id, preview: selected.preview } : null
        })
        .filter(Boolean) as Array<{ layerId: string; imageId: string; preview: string }>

      if (checkExclusionRules(combination)) {
        return combination
      }

      attempts++
    }

    // If we can't find a valid combination after max retries, return any combination
    return layers
      .map((layer) => {
        const selected = selectImageByRarity(layer.images)
        return selected ? { layerId: layer.id, imageId: selected.id, preview: selected.preview } : null
      })
      .filter(Boolean) as Array<{ layerId: string; imageId: string; preview: string }>
  }, [layers, exclusionRules])

  const generateRandomCombination = useCallback(() => {
    const combination = generateValidCombination()
    setSelectedImages(combination.map((c) => c.preview))
  }, [generateValidCombination])

  useEffect(() => {
    if (layers.length > 0 && !hasGeneratedInitial) {
      generateRandomCombination()
      setHasGeneratedInitial(true)
    }
  }, [layers.length, hasGeneratedInitial, generateRandomCombination])

  const drawCanvas = useCallback(
    async (imageSrcs: string[]) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
      ctx.fillStyle = "#f5f5f5"
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

      for (const src of imageSrcs) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height)
            resolve()
          }
          img.onerror = () => resolve()
          img.src = src
        })
      }
    },
    [canvasSize],
  )

  useEffect(() => {
    if (selectedImages.length > 0) {
      drawCanvas(selectedImages)
    }
  }, [selectedImages, drawCanvas])

  const handleGenerate = async () => {
    if (layers.length === 0) return

    setIsGenerating(true)
    const results: GeneratedNFT[] = []

    for (let i = 1; i <= totalGeneration; i++) {
      const combination = generateValidCombination()

      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = canvasSize.width
      tempCanvas.height = canvasSize.height
      const tempCtx = tempCanvas.getContext("2d")

      if (tempCtx) {
        tempCtx.imageSmoothingEnabled = true
        tempCtx.imageSmoothingQuality = "high"

        tempCtx.fillStyle = "#6A3CFF"
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

        for (const item of combination) {
          await new Promise<void>((resolve) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
              tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height)
              resolve()
            }
            img.onerror = () => resolve()
            img.src = item.preview
          })
        }

        const attributes = combination.map((item, idx) => {
          const layer = layers[idx]
          const image = layer.images.find((img) => img.id === item.imageId)
          return {
            trait_type: layer.name,
            value: image?.name || "",
          }
        })

        const metadata = {
          name: `${collectionName} #${i}`,
          description: collectionDescription,
          image: `ipfs://NEW_HASH_HERE/${i}.png`,
          edition: i,
          date: Date.now(),
          attributes,
          compiler: "Skullines",
        }

        results.push({
          id: i,
          dataUrl: tempCanvas.toDataURL("image/png", 1.0),
          metadata,
        })
      }
    }

    setIsGenerating(false)
    if (onGenerate) {
      onGenerate(results)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-4 border-primary rounded-lg max-w-full h-auto"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      {layers.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleGenerate} size="lg" className="w-full md:w-auto" disabled={isGenerating}>
            {isGenerating ? `Generating ${totalGeneration} NFTs...` : `Generate ${totalGeneration} NFTs`}
          </Button>
        </div>
      )}
    </div>
  )
}
