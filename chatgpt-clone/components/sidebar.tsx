"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  X,
  Search,
  Edit2,
  Check,
  XIcon,
  MoreHorizontal,
} from "lucide-react";
import type { Conversation } from "@/types/chat";
import { useState } from "react";
import { SidebarHeader, Sidebar, SidebarContent } from "./ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  searchQuery: string;
  onNewConversation: () => void;
  onSwitchConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSearchChange: (query: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export function CustomizedSidebar({
  conversations,
  currentConversationId,
  searchQuery,
  onNewConversation,
  onSwitchConversation,
  onDeleteConversation,
  onSearchChange,
  onRenameConversation,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleDeleteConversation = (conversationId: string) => {
    if (confirm("确定要删除这个对话吗？")) {
      onDeleteConversation(conversationId);
    }
  };

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      onRenameConversation(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <>
        <Sidebar>
          <SidebarHeader>
            <div className="p-4 space-y-3">
              <SidebarTrigger />

              <Button
                onClick={onNewConversation}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                新对话
              </Button>
              
            </div>

            {/* Header */}
            <div className="p-4 border-b border-gray-700 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索对话..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                />
              </div>
            </div>
          </SidebarHeader>

          {/* Conversations List */}
          <SidebarContent>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`
                  group relative flex items-center p-3 rounded-lg cursor-pointer
                  transition-colors duration-200
                  ${
                    currentConversationId === conversation.id
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }
                `}
                    onClick={() =>
                      !editingId && onSwitchConversation(conversation.id)
                    }
                  >
                    {/* 左侧图标 - 固定宽度 */}
                    <MessageSquare className="w-4 h-4 flex-shrink-0 mr-3" />

                    {/* 中间内容区域 - 限制最大宽度 */}
                    <div className="flex-1 min-w-0 max-w-[140px]">
                      {editingId === conversation.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="text-sm bg-gray-800 border-gray-600 text-white h-6 px-2 w-full"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex gap-1 ml-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 text-green-400 hover:text-green-300 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit();
                              }}
                              title="保存"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 text-red-400 hover:text-red-300 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              title="取消"
                            >
                              <XIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium truncate">
                            {conversation.title}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {conversation.updatedAt.toLocaleDateString()}
                          </div>
                        </>
                      )}
                    </div>

                    {/* 右侧菜单按钮 - 固定宽度，不可压缩 */}
                    {editingId !== conversation.id && (
                      <div className="flex-shrink-0 ml-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 text-gray-400 hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(conversation);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}

                {conversations.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? "没有找到匹配的对话" : "还没有对话"}
                    </p>
                    <p className="text-xs">
                      {searchQuery
                        ? "尝试其他关键词"
                        : "点击上方按钮开始新对话"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SidebarContent>

          {/* Overlay for mobile */}
          {!isCollapsed && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setIsCollapsed(true)}
            />
          )}
        </Sidebar>
    </>
  );
}
