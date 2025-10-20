"use client";

import { MessageSquare, Send, Bot, User, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import MessageBubble from "@/components/chatWindow/MessageBubble";
import { useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useAppContext } from "../AppContext";
import { ActionType, Message } from "@/reducers/AppReducer";
import WelcomeCard from "../welcomeWindow/WelcomeCard";

const welcomeMessage = [
  "我们先从哪里开始呢？",
  "今天有什么计划？",
  "时刻准备着。",
  "您今天在想什么？",
  "一得阁拉米你怎么这么自私！",
];

export default function ChatWindow() {
  const { state, dispatch } = useAppContext();
  const [inputContent, setInputContent] = useState("");
  const MAX_ROWS = 8; // 设置最大行数，用于限制高度
  const [isLoading, setIsLoading] = useState(false); //消息加载状态

  const currentId = state.currentConversationId;

  // 过滤出当前会话的消息 (state 中有 currentConversationId)
  const currentMessages = state.messages.filter(
    (msg) => msg.conversationId === state.currentConversationId
  );

  // 构造当前标题
  const currentConversation = state.conversations.find(
    (conv) => conv.id === state.currentConversationId
  );
  const currentTitle = currentConversation
    ? currentConversation.title
    : "新对话";

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

  //处理消息接收
  const getAiResponse = async (userMessage: Message) => {
    try {
      // 1. 调用你的 API 端点
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: state.currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("AI 响应失败");
      }

      const data = await response.json(); // 假设 API 返回 { reply: "..." }

      // 2. 构造 AI 消息对象
      const aiResponse: Message = {
        id: data.id || Date.now().toString() + "-ai", // 使用后端提供的 ID 或临时 ID
        sender: "ai",
        content: data.reply || "抱歉，AI 未能提供有效回复。", // 假设回复在 data.reply 字段
        timestamp: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        conversationId: state.currentConversationId,
      };

      // 3. 派发 Action 将 AI 消息添加到状态中
      dispatch({
        type: ActionType.SEND_MESSAGE,
        message: aiResponse,
      });
    } catch (error) {
      console.error("发送消息给 AI 时出错:", error);

      // 💡 错误处理：派发一个错误消息给用户
      dispatch({
        type: ActionType.SEND_MESSAGE,
        message: {
          id: Date.now().toString() + "-error",
          sender: "ai",
          content: "网络或服务器错误，请稍后再试。",
          timestamp: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          conversationId: state.currentConversationId,
        } as Message, // 强制断言类型，因为这只是一个错误提示
      });
    } finally {
      setIsLoading(false); // 结束加载
    }
  };

  //消息内容展示
  function MessageCardContent() {
    return (
      <div className="flex-grow overflow-y-auto p-6 space-y-4">
        {currentMessages.map((msg) => (
          <MessageBubble key={msg.id} {...msg} />
        ))}
        {/* 滚动占位符，确保消息在底部 */}
        <div className="h-4" />
      </div>
    );
  }

  // 使用 useEffect 在消息列表更新后执行滚动
  // useEffect(() => {
  //     // 检查 ref 是否存在
  //     if (messagesEndRef.current) {
  //         // 使用 scrollIntoView() 方法平滑滚动到这个元素
  //         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //     }
  // }, [currentMessages]); // 依赖项是 currentMessages，当消息数量变化时触发
  return (
    <div key={currentId} className="flex flex-1 flex-col h-full w-full bg-background">
      {/* 1. 顶部栏 */}
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <CardTitle className="text-xl font-semibold">{currentTitle}</CardTitle>
        <Button variant="outline" size="icon">
          <MessageSquare className="w-5 h-5" />
        </Button>
      </CardHeader>

      {/* 2. 消息内容区 */}
      {state.currentConversationId === ""
        ? <WelcomeCard/>
        : <MessageCardContent/>}

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
