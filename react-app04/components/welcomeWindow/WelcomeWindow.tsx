"use client";
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import WelcomeCard from "@/components/welcomeWindow/WelcomeCard";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";

import { ActionType, Message } from "@/reducers/AppReducer";
import { useAppContext } from "@/components/AppContext";
import { useState } from "react";

export default function WelcomeWindow() {
  const { state, dispatch } = useAppContext();
  const [isLoading, setIsLoading] = useState(false); //消息加载状态
  const MAX_ROWS = 8; // 设置最大行数，用于限制高度
  //处理消息发送
    const handleMessageSend = () => {
      const trimmedContent = inputContent.trim();
  
      if (trimmedContent) {
        // 1. 构造新的消息对象
        const newMessage: Message = {
          id: Date.now().toString(), // 简单的唯一 ID
          sender: "user",
          content: trimmedContent,
          timestamp: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          conversationId: state.currentConversationId, // 关联到当前会话
        };
  
        // 2. 派发 Action
        dispatch({
          type: ActionType.SEND_MESSAGE,
          message: newMessage,
        });
  
        // 3. 清空输入框
        setInputContent("");
  
        //TODO: 4. 服务器响应
        //getAiResponse(newMessage);
      }
    };


  const [inputContent, setInputContent] = useState("");
  return (
    <div className="flex flex-1 flex-col h-full w-full bg-background">
      {/* 1. 顶部栏 */}
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <CardTitle className="text-xl font-semibold">新对话</CardTitle>
      </CardHeader>

      <WelcomeCard />

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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleMessageSend();
                }
              }}
              placeholder="请输入您的消息..."
              maxRows={MAX_ROWS} // 限制最大行数 (达到后出现滚动条)
              className="w-full resize-none bg-transparent focus:outline-none p-0 text-base"
            />
          </div>

          {/* 附件和发送按钮区域 */}
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
              disabled={isLoading || !inputContent.trim()}
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
