"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayerManager } from "@/components/layer-manager"
import { MetadataPreview } from "@/components/metadata-preview"
import { CanvasPreview, type GeneratedNFT } from "@/components/canvas-preview"
import { GenerationResults } from "@/components/generation-results"
import { Layers, ImageIcon, FileJson } from "lucide-react"

export default function NFTGenerator() {
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [totalGeneration, setTotalGeneration] = useState("100")
  const [canvasSize, setCanvasSize] = useState({ width: "500", height: "500" })
  const [generatedResults, setGeneratedResults] = useState<GeneratedNFT[]>([])
  const [collapsedLayers, setCollapsedLayers] = useState<Record<string, boolean>>({})
  const [layers, setLayers] = useState<
    Array<{
      id: string
      name: string
      images: Array<{
        id: string
        file: File
        preview: string
        rarity: number
        name: string
      }>
    }>
  >([])

  const addLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      images: [],
    }
    setLayers([...layers, newLayer])
  }

  const updateLayer = (layerId: string, updates: any) => {
    setLayers(layers.map((layer) => (layer.id === layerId ? { ...layer, ...updates } : layer)))
  }

  const deleteLayer = (layerId: string) => {
    setLayers(layers.filter((layer) => layer.id !== layerId))
  }

  const generateMetadata = (edition: number) => {
    // Generate random combination based on rarities
    const attributes = layers
      .map((layer) => {
        if (layer.images.length === 0) return null

        // Calculate total rarity weight
        const totalWeight = layer.images.reduce((sum, img) => sum + img.rarity, 0)

        // Random selection based on rarity
        let random = Math.random() * totalWeight
        let selectedImage = layer.images[0]

        for (const img of layer.images) {
          random -= img.rarity
          if (random <= 0) {
            selectedImage = img
            break
          }
        }

        return {
          trait_type: layer.name,
          value: selectedImage.name,
        }
      })
      .filter(Boolean)

    return {
      name: `${collectionName} #${edition}`,
      description: collectionDescription,
      image: `ipfs://NEW_HASH_HERE/${edition}.png`,
      edition,
      date: Date.now(),
      attributes,
      compiler: "Skullines",
    }
  }

  const toggleLayerCollapse = (layerId: string) => {
    setCollapsedLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-balance mb-2">NFT Generator</h1>
          <p className="text-muted-foreground">Create your NFT collection with custom layers and rarity settings</p>
        </div>

        <div className="space-y-6">
          {/* Collection Info */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Collection Information
              </CardTitle>
              <CardDescription>Basic details about your NFT collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  placeholder="My NFT Collection"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="A unique NFT collection"
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total Generation</Label>
                <Input
                  id="total"
                  type="number"
                  placeholder="100"
                  value={totalGeneration}
                  onChange={(e) => setTotalGeneration(e.target.value)}
                  onBlur={(e) => {
                    if (!e.target.value) setTotalGeneration("100")
                  }}
                  className="border-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Canvas Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize({ ...canvasSize, width: e.target.value })}
                    onBlur={(e) => {
                      if (!e.target.value) setCanvasSize({ ...canvasSize, width: "500" })
                    }}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Canvas Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize({ ...canvasSize, height: e.target.value })}
                    onBlur={(e) => {
                      if (!e.target.value) setCanvasSize({ ...canvasSize, height: "500" })
                    }}
                    className="border-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Layers and Preview */}
          <Tabs defaultValue="layers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="layers" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Metadata
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layers" className="mt-4">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Layer Management</CardTitle>
                      <CardDescription>Add layers and upload images with rarity settings</CardDescription>
                    </div>
                    <Button onClick={addLayer} size="sm">
                      Add Layer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {layers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No layers yet. Click "Add Layer" to get started.</p>
                    </div>
                  ) : (
                    <LayerManager
                      layers={layers}
                      onUpdateLayer={updateLayer}
                      onDeleteLayer={deleteLayer}
                      collapsedLayers={collapsedLayers}
                      onToggleCollapse={toggleLayerCollapse}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Canvas Preview</CardTitle>
                  <CardDescription>Preview your NFT layers and generate collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <CanvasPreview
                    layers={layers}
                    canvasSize={{
                      width: Number.parseInt(canvasSize.width) || 500,
                      height: Number.parseInt(canvasSize.height) || 500,
                    }}
                    totalGeneration={Number.parseInt(totalGeneration) || 100}
                    collectionName={collectionName}
                    collectionDescription={collectionDescription}
                    onGenerate={setGeneratedResults}
                  />
                  {generatedResults.length > 0 && (
                    <div className="mt-6">
                      <GenerationResults
                        results={generatedResults}
                        layers={layers}
                        canvasSize={{
                          width: Number.parseInt(canvasSize.width) || 500,
                          height: Number.parseInt(canvasSize.height) || 500,
                        }}
                        collectionName={collectionName}
                        collectionDescription={collectionDescription}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="mt-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Metadata Preview</CardTitle>
                  <CardDescription>Metadata for your generated NFT collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <MetadataPreview generatedResults={generatedResults} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
