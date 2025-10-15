export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  type?: "text" | "image"
  imageUrl?: string
  imageName?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  searchQuery: string
}
