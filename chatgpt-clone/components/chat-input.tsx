"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ImageIcon, X } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string, imageFile?: File) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || isLoading) return

    onSendMessage(input, selectedImage || undefined)
    setInput("")
    clearImage()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="border-t bg-white shadow-lg">
      {/* 图片预览 */}
      {imagePreview && (
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="relative">
              <img src={imagePreview || "/placeholder.svg"} alt="预览" className="w-16 h-16 object-cover rounded-lg" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                onClick={clearImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedImage?.name}</p>
              <p className="text-xs text-gray-500">{selectedImage && `${(selectedImage.size / 1024).toFixed(1)} KB`}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedImage ? "添加描述（可选）..." : "输入你的消息..."}
              disabled={isLoading}
              className="pr-20 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isLoading}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

        <div className="text-xs text-gray-500 mt-2 text-center">
          支持上传图片 • 这是一个演示界面，实际使用需要连接AI API服务
        </div>
      </div>
    </div>
  )
}
