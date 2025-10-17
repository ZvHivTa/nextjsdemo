import { MessageSquare, Paperclip, Send } from "lucide-react";
import { Button } from "../ui/button";
import { CardFooter, CardHeader, CardTitle } from "../ui/card";
import TextareaAutosize from "react-textarea-autosize";

const welcomeMessage = [
  "我们先从哪里开始呢？",
  "今天有什么计划？",
  "时刻准备着。",
  "您今天在想什么？",
  "一得阁拉米你怎么这么自私！",
];

export default function WelcomeWindow() {
  return (
    <div className="flex flex-1 flex-col h-full w-full bg-background">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <CardTitle className="text-xl font-semibold">TestChatAI</CardTitle>
        <Button variant="outline" size="icon">
          <MessageSquare className="w-5 h-5" />
        </Button>
      </CardHeader>

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
