"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void
  existingImageUrl?: string
}

export default function ImageUploader({ onImageUploaded, existingImageUrl }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const filePreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(filePreviewUrl)

    // Upload the file
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      onImageUploaded(data.url)
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
      // Reset preview if upload fails
      if (existingImageUrl) {
        setPreviewUrl(existingImageUrl)
      } else {
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const clearImage = () => {
    setPreviewUrl(null)
    onImageUploaded("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {previewUrl && (
        <div className="relative w-full h-48">
          <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-contain rounded-md" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

