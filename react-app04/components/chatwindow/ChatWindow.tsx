
"use client";

import { MessageSquare, Send, Bot, User, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useAppContext } from "../AppContext";
import { ActionType, Message } from "@/reducers/AppReducer";

export default function ChatWindow() {
    const { state, dispatch } = useAppContext();
    const [inputContent, setInputContent] = useState('');
    const MAX_ROWS = 8; // 设置最大行数，用于限制高度

    // 过滤出当前会话的消息 (state 中有 currentConversationId)
    const currentMessages = state.messages.filter(
        msg => msg.conversationId === state.currentConversationId
    );

 

   // 构造当前标题
    const currentConversation = state.conversations.find(
        conv => conv.id === state.currentConversationId
    );
    const currentTitle = currentConversation ? currentConversation.title : "新对话";

    //处理消息发送
    const handleMessageSend = () => {
        const trimmedContent = inputContent.trim();
        
        if (trimmedContent) {
            // 1. 构造新的消息对象
            const newMessage: Message = {
                id: Date.now().toString(), // 简单的唯一 ID
                sender: 'user',
                content: trimmedContent,
                timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                conversationId: state.currentConversationId, // 关联到当前会话
            };
            
            // 2. 派发 Action
            dispatch({
                type: ActionType.SEND_MESSAGE,
                message: newMessage,
            });
            
            // 3. 清空输入框
            setInputContent('');
            
            // 4. (可选) 立即模拟 AI 响应，如果需要的话
            // simulateAiResponse(newMessage.id); 
        }
    };


    // 使用 useEffect 在消息列表更新后执行滚动
    useEffect(() => {
        // 检查 ref 是否存在
        if (messagesEndRef.current) {
            // 使用 scrollIntoView() 方法平滑滚动到这个元素
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentMessages]); // 依赖项是 currentMessages，当消息数量变化时触发
    
    return (
        <div className="flex flex-1 flex-col h-full w-full bg-background">
            
            {/* 1. 顶部栏 */}
            <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                <CardTitle className="text-xl font-semibold">
                    {currentTitle}
                </CardTitle>
                <Button variant="outline" size="icon">
                    <MessageSquare className="w-5 h-5" />
                </Button>
            </CardHeader>
            
            {/* 2. 消息内容区 */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {currentMessages.map(msg => (
                    <MessageBubble key={msg.id} {...msg} />
                ))}
                {/* 滚动占位符，确保消息在底部 */}
                <div className="h-4" /> 
            </div>
            
            {/* 3. 底部输入区 */}
            <CardFooter className="flex-shrink-0 border-t p-4">
            {/* 💡 主容器：用于限制输入区域的宽度 */}
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                
                {/* 3.1. 自适应输入框区域 */}
                <div className="w-full flex items-end space-x-2 border border-input rounded-lg p-2 mb-2 bg-background">
                    
                    {/* 💡 Autosize Textarea 替代 Shadcn Textarea */}
                    <TextareaAutosize
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleMessageSend();
                            }
                        }}
                        placeholder="请输入您的消息..."
                        maxRows={MAX_ROWS} // 限制最大行数 (达到后出现滚动条)
                        className="w-full resize-none bg-transparent focus:outline-none p-0 text-base"
                    />
                </div>
                
                {/* 3.2. 附件和发送按钮区域 */}
                <div className="w-full flex justify-between items-center text-muted-foreground">
                    
                    {/* 左侧：附件按钮 */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:bg-muted"
                        onClick={() => console.log("添加附件")}
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    
                    {/* 右侧：发送按钮 */}
                    <Button 
                        onClick={handleMessageSend} 
                        disabled={!inputContent.trim()} 
                        className="h-10 px-4"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        发送
                    </Button>
                </div>
            </div>
        </CardFooter>
        </div>
    );
}