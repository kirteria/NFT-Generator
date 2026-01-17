"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Trash2, Upload, X, ChevronDown, ChevronUp } from "lucide-react"
import { useRef } from "react"

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

interface LayerManagerProps {
  layers: Layer[]
  onUpdateLayer: (layerId: string, updates: any) => void
  onDeleteLayer: (layerId: string) => void
  collapsedLayers: Record<string, boolean>
  onToggleCollapse: (layerId: string) => void
}

export function LayerManager({
  layers,
  onUpdateLayer,
  onDeleteLayer,
  collapsedLayers,
  onToggleCollapse,
}: LayerManagerProps) {
  return (
    <div className="space-y-4">
      {layers.map((layer) => (
        <LayerItem
          key={layer.id}
          layer={layer}
          onUpdate={(updates) => onUpdateLayer(layer.id, updates)}
          onDelete={() => onDeleteLayer(layer.id)}
          isCollapsed={collapsedLayers[layer.id] || false}
          onToggleCollapse={() => onToggleCollapse(layer.id)}
        />
      ))}
    </div>
  )
}

function LayerItem({
  layer,
  onUpdate,
  onDelete,
  isCollapsed,
  onToggleCollapse,
}: {
  layer: Layer
  onUpdate: (updates: any) => void
  onDelete: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })

        return {
          id: `img-${Date.now()}-${Math.random()}`,
          file,
          preview,
          rarity: 100,
          name: file.name.replace(/\.[^/.]+$/, ""),
        }
      }),
    )

    onUpdate({ images: [...layer.images, ...newImages] })
  }

  const removeImage = (imageId: string) => {
    onUpdate({ images: layer.images.filter((img) => img.id !== imageId) })
  }

  const updateImage = (imageId: string, updates: any) => {
    onUpdate({
      images: layer.images.map((img) => (img.id === imageId ? { ...img, ...updates } : img)),
    })
  }

  return (
    <Card className="p-4 border-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Input
            value={layer.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="font-semibold border-2"
            placeholder="Layer name"
          />
          <div className="flex items-center gap-2 shrink-0">
            {layer.images.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="text-xs">
                {layer.images.length} {layer.images.length === 1 ? "image" : "images"}
                {isCollapsed ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />}
              </Button>
            )}
            <Button variant="destructive" size="icon" onClick={onDelete} className="shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full border-2">
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
        </div>

        {layer.images.length > 0 && !isCollapsed && (
          <div className="space-y-3">
            {layer.images.map((image) => (
              <div key={image.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg border-2">
                <img
                  src={image.preview || "/placeholder.svg"}
                  alt={image.name}
                  className="w-16 h-16 object-cover rounded border-2"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    value={image.name}
                    onChange={(e) => updateImage(image.id, { name: e.target.value })}
                    placeholder="Image name"
                    className="text-sm border-2"
                  />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Rarity: {image.rarity}%</Label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={image.rarity}
                      onChange={(e) => updateImage(image.id, { rarity: Number.parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeImage(image.id)} className="shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
