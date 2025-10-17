"use client";

import ChatWindow from '@/components/chatWindow/ChatWindow';

// 💡 Next.js 自动传递 params 对象
export default function ChatPage({ params }: { params: { conversationId: string } }) {
    // 选项 B (更简单): 让 ChatWindow 从 Context 的 URL 中获取 ID (推荐)
    return <ChatWindow />; 
}