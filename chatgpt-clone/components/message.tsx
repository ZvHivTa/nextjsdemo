"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Bot, User, ImageIcon } from "lucide-react"
import type { Message } from "@/types/chat"

interface MessageProps {
  message: Message
}

export function MessageComponent({ message }: MessageProps) {
  return (
    <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      {message.role === "assistant" && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <Card
        className={`max-w-[80%] ${
          message.role === "user" ? "bg-blue-500 text-white border-blue-500" : "bg-white border-gray-200"
        }`}
      >
        <div className="p-4">
          {/* 图片消息 */}
          {message.type === "image" && message.imageUrl && (
            <div className="mb-3">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={message.imageUrl || "/placeholder.svg"}
                  alt={message.imageName || "上传的图片"}
                  className="max-w-full h-auto max-h-64 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = "flex"
                  }}
                />
                <div
                  className="hidden items-center justify-center bg-gray-100 text-gray-500 rounded-lg p-8"
                  style={{ minHeight: "100px" }}
                >
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">图片加载失败</p>
                  </div>
                </div>
              </div>
              {message.imageName && (
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                  {message.imageName}
                </p>
              )}
            </div>
          )}

          {/* 文本内容 */}
          {message.content && (
            <div className="prose prose-sm max-w-none">
              <p className={`whitespace-pre-wrap ${message.role === "user" ? "text-white" : "text-gray-900"}`}>
                {message.content}
              </p>
            </div>
          )}

          <div className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </Card>

      {message.role === "user" && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-blue-500 text-white">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
