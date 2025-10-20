"use client";

import ChatWindow from '@/components/chatWindow/ChatWindow';
import React from 'react';

// 💡 Next.js 自动传递 params 对象，类型结构是 { conversationId: string }
export default function ChatPage({ params }: { params: { conversationId: string } }) {
    
    // 提取出唯一的对话 ID
   const unwrappedParams = React.use(params);
    const currentConversationId = unwrappedParams.conversationId;
    
    return (
        <ChatWindow 
            key={currentConversationId}
        />
    );
}