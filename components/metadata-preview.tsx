"use client"

import React from "react"

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isRemoving, setIsRemoving] = useState(false)
  const [removeProgress, setRemoveProgress] = useState(0)
  const [processedFiles, setProcessedFiles] = useState<{ name: string; content: string }[]>([])

  const metadata = isCidUpdated ? updatedMetadata[currentIndex] : generatedResults?.[currentIndex]?.metadata
  const metadataString = metadata ? JSON.stringify(metadata, null, 2) : ""

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(files)
    setProcessedFiles([])
  }

  const handleRemoveJsonExtension = async () => {
    if (uploadedFiles.length === 0) return

    setIsRemoving(true)
    setRemoveProgress(0)

    const processed: { name: string; content: string }[] = []

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i]
      const content = await file.text()
      const fileName = file.name.endsWith(".json") ? file.name.slice(0, -5) : file.name

      processed.push({
        name: fileName,
        content: content,
      })

      setRemoveProgress(i + 1)
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    setProcessedFiles(processed)
    setIsRemoving(false)
  }

  const handleDownloadProcessedFiles = async () => {
    if (processedFiles.length === 0) return

    const JSZip = (await import("jszip")).default
    const zip = new JSZip()

    processedFiles.forEach((file) => {
      zip.file(file.name, file.content)
    })

    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "metadata_update.zip"
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasGeneratedResults = generatedResults && generatedResults.length > 0

  return (
    <div className="space-y-4">
      {/* JSON Extension Remover - Always Visible */}
      <div className="p-4 bg-muted/50 rounded-lg border-2 space-y-4">
        <h3 className="font-semibold text-lg">Remove .json Extension</h3>
        <div className="space-y-2">
          <Label htmlFor="json-files">Upload JSON Files</Label>
          <Input
            id="json-files"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="border-2 cursor-pointer"
          />
          {uploadedFiles.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {uploadedFiles.length} file(s) uploaded
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRemoveJsonExtension}
            className="flex-1"
            disabled={uploadedFiles.length === 0 || isRemoving}
          >
            {isRemoving ? (
              <span>
                {removeProgress}/{uploadedFiles.length}
              </span>
            ) : (
              "Remove .json"
            )}
          </Button>
          <Button
            onClick={handleDownloadProcessedFiles}
            variant="outline"
            className="flex-1 bg-transparent"
            disabled={processedFiles.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Metadata Preview Section - Only when NFTs are generated */}
      {hasGeneratedResults && (
        <>
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
        </>
      )}

      {/* Placeholder when no results generated */}
      {!hasGeneratedResults && (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
          <p>Generate images to preview and download metadata with CID</p>
        </div>
      )}
    </div>
  )
}
