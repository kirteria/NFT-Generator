"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Ban } from "lucide-react"

export interface ExclusionRule {
  id: string
  layerAId: string
  layerAName: string
  imageAId: string
  imageAName: string
  layerBId: string
  layerBName: string
  imageBId: string
  imageBName: string
}

interface ExclusionRulesProps {
  layers: Array<{
    id: string
    name: string
    images: Array<{
      id: string
      name: string
    }>
  }>
  rules: ExclusionRule[]
  onUpdateRules: (rules: ExclusionRule[]) => void
}

export function ExclusionRules({ layers, rules, onUpdateRules }: ExclusionRulesProps) {
  const [selectedLayerA, setSelectedLayerA] = useState("")
  const [selectedImageA, setSelectedImageA] = useState("")
  const [selectedLayerB, setSelectedLayerB] = useState("")
  const [selectedImageB, setSelectedImageB] = useState("")

  const layerAImages = layers.find((l) => l.id === selectedLayerA)?.images || []
  const layerBImages = layers.find((l) => l.id === selectedLayerB)?.images || []

  const addRule = () => {
    if (!selectedLayerA || !selectedImageA || !selectedLayerB || !selectedImageB) {
      return
    }

    const layerA = layers.find((l) => l.id === selectedLayerA)
    const imageA = layerA?.images.find((i) => i.id === selectedImageA)
    const layerB = layers.find((l) => l.id === selectedLayerB)
    const imageB = layerB?.images.find((i) => i.id === selectedImageB)

    if (!layerA || !imageA || !layerB || !imageB) return

    const newRule: ExclusionRule = {
      id: `rule-${Date.now()}`,
      layerAId: selectedLayerA,
      layerAName: layerA.name,
      imageAId: selectedImageA,
      imageAName: imageA.name,
      layerBId: selectedLayerB,
      layerBName: layerB.name,
      imageBId: selectedImageB,
      imageBName: imageB.name,
    }

    onUpdateRules([...rules, newRule])

    setSelectedLayerA("")
    setSelectedImageA("")
    setSelectedLayerB("")
    setSelectedImageB("")
  }

  const deleteRule = (ruleId: string) => {
    onUpdateRules(rules.filter((r) => r.id !== ruleId))
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="w-5 h-5" />
          Exclusion Rules
        </CardTitle>
        <CardDescription>Prevent specific image combinations from appearing together</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
          <p className="text-sm font-medium">Create New Rule</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">IF this combination exists...</p>
              <Select value={selectedLayerA} onValueChange={setSelectedLayerA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Layer A" />
                </SelectTrigger>
                <SelectContent>
                  {layers.map((layer) => (
                    <SelectItem key={layer.id} value={layer.id}>
                      {layer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedImageA}
                onValueChange={setSelectedImageA}
                disabled={!selectedLayerA || layerAImages.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Image A" />
                </SelectTrigger>
                <SelectContent>
                  {layerAImages.map((image) => (
                    <SelectItem key={image.id} value={image.id}>
                      {image.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">CANNOT combine with...</p>
              <Select value={selectedLayerB} onValueChange={setSelectedLayerB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Layer B" />
                </SelectTrigger>
                <SelectContent>
                  {layers.map((layer) => (
                    <SelectItem key={layer.id} value={layer.id}>
                      {layer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedImageB}
                onValueChange={setSelectedImageB}
                disabled={!selectedLayerB || layerBImages.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Image B" />
                </SelectTrigger>
                <SelectContent>
                  {layerBImages.map((image) => (
                    <SelectItem key={image.id} value={image.id}>
                      {image.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={addRule}
            size="sm"
            className="w-full"
            disabled={!selectedLayerA || !selectedImageA || !selectedLayerB || !selectedImageB}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exclusion Rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No exclusion rules yet</p>
            <p className="text-xs mt-1">Add rules to prevent certain trait combinations</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Active Rules ({rules.length})</p>
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium text-destructive">{rule.layerAName}</span>
                    {" - "}
                    <span className="text-muted-foreground">{rule.imageAName}</span>
                    <span className="mx-2">⊗</span>
                    <span className="font-medium text-destructive">{rule.layerBName}</span>
                    {" - "}
                    <span className="text-muted-foreground">{rule.imageBName}</span>
                  </p>
                </div>
                <Button onClick={() => deleteRule(rule.id)} size="icon" variant="ghost" className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
