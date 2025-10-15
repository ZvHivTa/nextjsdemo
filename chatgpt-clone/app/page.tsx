"use client"

import { CustomizedSidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { useChat } from "@/hooks/use-chat"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function ChatInterface() {
  const {
    filteredConversations,
    currentConversation,
    currentConversationId,
    isLoading,
    searchQuery,
    createNewConversation,
    deleteConversation,
    switchConversation,
    sendMessage,
    setSearchQuery,
    renameConversation,
  } = useChat()

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <CustomizedSidebar
          conversations={filteredConversations}
          currentConversationId={currentConversationId}
          searchQuery={searchQuery}
          onNewConversation={createNewConversation}
          onSwitchConversation={switchConversation}
          onDeleteConversation={deleteConversation}
          onSearchChange={setSearchQuery}
          onRenameConversation={renameConversation}
        />
        <ChatArea conversation={currentConversation} isLoading={isLoading} onSendMessage={sendMessage} />
      </div>
    </SidebarProvider>
  )
}
