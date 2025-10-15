"use client"

import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Bot, Sparkles } from "lucide-react"
import { MessageComponent } from "./message"
import { ChatInput } from "./chat-input"
import type { Conversation } from "@/types/chat"
import { SidebarTrigger } from "./ui/sidebar"

interface ChatAreaProps {
  conversation: Conversation | undefined
  isLoading: boolean
  onSendMessage: (message: string) => void
}

export function ChatArea({ conversation, isLoading, onSendMessage }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [conversation?.messages])

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">欢迎使用 AI Chat</h2>
          <p className="text-gray-600 mb-6">选择一个对话或创建新对话开始聊天</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 truncate">{conversation.title}</h1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="px-4 py-6 space-y-6">
            {conversation.messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">AI正在思考...</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  )
}
