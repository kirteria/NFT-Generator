"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"

interface GeneratedNFT {
  image: string
  metadata: any
}

interface MetadataPreviewProps {
  generatedResults: GeneratedNFT[]
}

export function MetadataPreview({ generatedResults }: MetadataPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cid, setCid] = useState("")
  const [isCidUpdated, setIsCidUpdated] = useState(false)
  const [updatedMetadata, setUpdatedMetadata] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)

  if (!generatedResults || generatedResults.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Generate images first to preview metadata</p>
      </div>
    )
  }

  const metadata = isCidUpdated ? updatedMetadata[currentIndex] : generatedResults[currentIndex].metadata
  const metadataString = JSON.stringify(metadata, null, 2)

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < generatedResults.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSubmitCid = async () => {
    if (!cid.trim()) return

    setIsProcessing(true)
    setProcessProgress(0)

    const updated: any[] = []
    for (let i = 0; i < generatedResults.length; i++) {
      updated.push({
        ...generatedResults[i].metadata,
        image: `https://gateway.lighthouse.storage/ipfs/${cid}/${i + 1}.png`,
      })
      setProcessProgress(i + 1)
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    setUpdatedMetadata(updated)
    setIsCidUpdated(true)
    setIsProcessing(false)
  }

  const handleDownloadMetadata = async () => {
    if (!isCidUpdated) return

    const JSZip = (await import("jszip")).default
    const zip = new JSZip()

    updatedMetadata.forEach((meta, index) => {
      const fileName = `${index + 1}.json`
      zip.file(fileName, JSON.stringify(meta, null, 2))
    })

    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "metadata.zip"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Metadata for NFT #{currentIndex + 1} ({currentIndex + 1}.json)
        </p>
      </div>

      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs md:text-sm border-2 font-mono">
        {metadataString}
      </pre>

      <div className="flex justify-center gap-2">
        <Button onClick={handlePrev} size="sm" variant="outline" disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          size="sm"
          variant="outline"
          disabled={currentIndex === generatedResults.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cid">IPFS CID</Label>
          <Input
            id="cid"
            placeholder="Enter your IPFS CID"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            className="border-2"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmitCid} 
            className="flex-1" 
            disabled={!cid.trim() || isProcessing}
          >
            {isProcessing ? (
              <span>
                {processProgress}/{generatedResults.length}
              </span>
            ) : (
              "Submit CID"
            )}
          </Button>
          <Button
            onClick={handleDownloadMetadata}
            variant="outline"
            className="flex-1 bg-transparent"
            disabled={!isCidUpdated}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
