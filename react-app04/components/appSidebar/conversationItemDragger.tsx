"use client";

import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import { DropdownMenuItem,DropdownMenuContent} from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react"; // 导入 useState

// 导入 Dialog/Input/Button 组件 (假设路径正确)
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConversationItem {
  title: string;
  url: string;
  id: string;
  // 用于更新标题的回调函数，它接收旧标题和新标题
  onRename: (oldTitle: string, newTitle: string, id: string) => void;
  // 用于删除对话的函数
  onDelete: (id: string)=>void;
}

export default function ConversationItemDragger({ title, url, id, onRename, onDelete}: ConversationItem) {
  // 状态 1: 控制对话框的打开/关闭
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // 状态 2: 存储用户在对话框中输入的新标题
  const [newTitle, setNewTitle] = useState(title);

  const handleRename = () => {
    // 1. 调用父组件传入的更新函数，执行实际的标题修改操作
    onRename(title, newTitle, id);
    // 2. 关闭对话框
    setIsDialogOpen(false);
    // 3. （可选）重置输入框，如果需要
    setNewTitle(newTitle); 
  };

  return (
    // 使用 Dialog 包裹 DropdownMenu，允许它们相互嵌套
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction>
            <MoreHorizontal />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent side="right" align="start">
          
          {/* 第一个 DropdownMenuItem 用于触发 Dialog 
            这里使用 DialogTrigger 将 DropdownMenuItem 变成触发器
            必须在外部包裹 Dialog.
          */}
          <DialogTrigger asChild>
            <DropdownMenuItem 
              onSelect={(e) => {
                // 阻止 DropdownMenu 在点击时关闭，以便 Dialog 可以打开
                e.preventDefault(); 
                // 初始化对话框中的输入值为当前标题
                setNewTitle(title);
              }}
            >
              <span>Update Title</span>
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuItem>
            <span
              onClick={() => {
                console.log(`删除会话: ${title}`);
                // 这里执行删除操作
                onDelete(id);
              }}
            >
              Delete Conversation
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 对话框本体 */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>修改会话标题</DialogTitle>
          <p className="text-sm text-muted-foreground">
            当前标题: {title}
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="newTitle"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleRename}>保存更改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}