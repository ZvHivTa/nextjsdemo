import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { Message
    
 } from "@/reducers/AppReducer";
// **子组件：消息气泡**
export default function MessageBubble({ id ,sender, content, timestamp }: Message){
    const isUser = sender === 'user';
    
    return (
        
        <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            
            {/* AI Avatar (左侧) */}
            {!isUser && (
                <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="w-4 h-4" />
                    </AvatarFallback>
                </Avatar>
            )}

            {/* 消息内容卡片 */}
            <Card 
                className={`max-w-[75%] shadow-md ${isUser ? 'bg-muted' : 'bg-muted'}`}
            >
                <CardContent className="p-3">
                    <p>{content}</p>
                </CardContent>
                <p className={`text-xs p-1 ${isUser ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{timestamp}</p>
            </Card>

            {/* User Avatar (右侧) */}
            {isUser && (
                <Avatar className="w-8 h-8 ml-3">
                    <AvatarFallback className="bg-blue-600 text-white">
                        <User className="w-4 h-4" />
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
};