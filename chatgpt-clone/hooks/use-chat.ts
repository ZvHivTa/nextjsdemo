"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Conversation, Message, ChatState } from "@/types/chat"

const STORAGE_KEY = "chat-conversations"

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    searchQuery: "",
  })

  // 从本地存储加载对话
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const conversations = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setState((prev) => ({
          ...prev,
          conversations,
          currentConversationId: conversations[0]?.id || null,
        }))
      } catch (error) {
        console.error("Failed to load conversations:", error)
      }
    }
  }, [])

  // 保存到本地存储
  const saveToStorage = useCallback((conversations: Conversation[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [])

  // 搜索过滤后的对话列表
  const filteredConversations = useMemo(() => {
    if (!state.searchQuery.trim()) {
      return state.conversations
    }

    const query = state.searchQuery.toLowerCase()
    return state.conversations.filter((conv) => {
      // 搜索标题
      if (conv.title.toLowerCase().includes(query)) {
        return true
      }
      // 搜索消息内容
      return conv.messages.some((msg) => msg.content.toLowerCase().includes(query))
    })
  }, [state.conversations, state.searchQuery])

  // 设置搜索查询
  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }))
  }, [])

  // 重命名对话
  const renameConversation = useCallback(
    (conversationId: string, newTitle: string) => {
      setState((prev) => {
        const updatedConversations = prev.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                title: newTitle.trim().slice(0, 50) || "未命名对话", // 限制最大50个字符
                updatedAt: new Date(),
              }
            : conv,
        )
        saveToStorage(updatedConversations)
        return {
          ...prev,
          conversations: updatedConversations,
        }
      })
    },
    [saveToStorage],
  )

  // 创建新对话
  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "新对话",
      messages: [
        {
          id: "welcome",
          content: "你好！我是AI助手，有什么可以帮助你的吗？",
          role: "assistant",
          timestamp: new Date(),
          type: "text",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setState((prev) => {
      const newConversations = [newConversation, ...prev.conversations]
      saveToStorage(newConversations)
      return {
        ...prev,
        conversations: newConversations,
        currentConversationId: newConversation.id,
        searchQuery: "", // 清空搜索
      }
    })
  }, [saveToStorage])

  // 删除对话
  const deleteConversation = useCallback(
    (conversationId: string) => {
      setState((prev) => {
        const newConversations = prev.conversations.filter((conv) => conv.id !== conversationId)
        const newCurrentId =
          newConversations.length > 0
            ? prev.currentConversationId === conversationId
              ? newConversations[0].id
              : prev.currentConversationId
            : null

        saveToStorage(newConversations)
        return {
          ...prev,
          conversations: newConversations,
          currentConversationId: newCurrentId,
        }
      })
    },
    [saveToStorage],
  )

  // 切换对话
  const switchConversation = useCallback((conversationId: string) => {
    setState((prev) => ({
      ...prev,
      currentConversationId: conversationId,
    }))
  }, [])

  // 添加消息
  const addMessage = useCallback(
    (message: Message) => {
      setState((prev) => {
        const updatedConversations = prev.conversations.map((conv) => {
          if (conv.id === prev.currentConversationId) {
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
              title:
                conv.messages.length === 1 && message.role === "user"
                  ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "") // 限制自动标题为30个字符
                  : conv.title,
            }
            return updatedConv
          }
          return conv
        })

        saveToStorage(updatedConversations)
        return {
          ...prev,
          conversations: updatedConversations,
        }
      })
    },
    [saveToStorage],
  )

  // 模拟AI回复
  const simulateAIResponse = useCallback(async (userMessage: string, hasImage = false): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const imageResponses = [
      "我看到了你分享的图片！这很有趣。让我来分析一下...",
      "根据你上传的图片，我可以看出...",
      "这张图片很棒！我注意到了一些细节...",
      "感谢你分享这张图片，让我来为你解读一下...",
    ]

    const textResponses = [
      "这是一个很有趣的问题！让我来为你详细解答...",
      "根据你的描述，我建议你可以尝试以下几种方法：",
      "我理解你的需求。这里有一些相关的信息可能对你有帮助：",
      "让我来分析一下这个问题的几个关键点：",
      "这确实是一个值得深入探讨的话题。从我的角度来看...",
    ]

    const responses = hasImage ? imageResponses : textResponses
    return (
      responses[Math.floor(Math.random() * responses.length)] +
      "\n\n这只是一个演示回复，实际使用时你需要连接到真正的AI API服务。"
    )
  }, [])

  // 发送消息
  const sendMessage = useCallback(
    async (content: string, imageFile?: File) => {
      if ((!content.trim() && !imageFile) || state.isLoading) return

      // 如果没有当前对话，创建一个新的
      if (!state.currentConversationId) {
        createNewConversation()
        // 等待状态更新
        setTimeout(() => sendMessage(content, imageFile), 100)
        return
      }

      let imageUrl = ""
      let imageName = ""

      // 处理图片上传
      if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile)
        imageName = imageFile.name
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        content: content.trim() || (imageFile ? `[图片: ${imageFile.name}]` : ""),
        role: "user",
        timestamp: new Date(),
        type: imageFile ? "image" : "text",
        imageUrl,
        imageName,
      }

      addMessage(userMessage)
      setState((prev) => ({ ...prev, isLoading: true }))

      try {
        const aiResponse = await simulateAIResponse(content, !!imageFile)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          role: "assistant",
          timestamp: new Date(),
          type: "text",
        }
        addMessage(assistantMessage)
      } catch (error) {
        console.error("Error getting AI response:", error)
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [state.isLoading, state.currentConversationId, addMessage, createNewConversation, simulateAIResponse],
  )

  const currentConversation = state.conversations.find((conv) => conv.id === state.currentConversationId)

  return {
    ...state,
    currentConversation,
    filteredConversations,
    createNewConversation,
    deleteConversation,
    switchConversation,
    sendMessage,
    setSearchQuery,
    renameConversation,
  }
}
