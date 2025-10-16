"use client";
import {
  Calendar,
  Home,
  Inbox,
  Plus,
  Search,
  SearchIcon,
  Settings,
} from "lucide-react";
import * as SidebarComponents from "@/components/ui/sidebar";
import ConversationItemDragger from "./conversationItemDragger";
import { ThemeModeToggle } from "./themeModeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { useAppContext } from "./AppContext";
import { ActionType } from "@/reducers/AppReducer";

const {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupAction,
  SidebarSeparator,
  SidebarFooter,
} = SidebarComponents;

export default function AppSidebar() {
  const { state, isSidebarOpen, dispatch } = useAppContext();
  const items = state.conversations;
  // 处理标题更新
  const handleRenameConversation = (oldTitle: string, newTitle: string, id: string) => {
    // 假设您的 Reducer/Context 提供了 updateConversationTitle 的 dispatch 或函数
    console.log(`正在修改标题: ${oldTitle} -> ${newTitle}`);

    // 假设 items 列表就是 state.conversations

    if (newTitle && newTitle !== oldTitle) {
      // 示例：这里应该调用 dispatch 或 API 来更新状态/数据库
      // dispatch({ type: 'RENAME_CONVERSATION', payload: { oldTitle, newTitle } });
      dispatch({
        type: ActionType.RENAME_CONVERSATION,
        oldTitle: oldTitle,
        newTitle: newTitle,
        id: id,
      });
      console.log(`已派发重命名 Action: ${oldTitle} -> ${newTitle}`);
    } else {
      console.log("新标题无效或未更改，操作取消。");
    }
  };
  //删除对话
  const handleDeleteConversation = (id: string) => {
        dispatch({
            type: ActionType.DELETE_CONVERSATION,
            id: id,
        });
    };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="relative flex items-center space-x-3">
          <SidebarTrigger />
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            {isSidebarOpen && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="secondary"
                  onClick={() => {
                    console.log("搜索对话");
                  }}
                >
                  <SearchIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Conversation</SidebarGroupLabel>
          <SidebarGroupAction
            title="Add a Conversation"
            onClick={() => {
              console.log("添加对话");
            }}
          >
            <Plus /> <span className="sr-only">Add a Conversation</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  <ConversationItemDragger
                    title={item.title}
                    url={item.url}
                    id={item.id}
                    onRename={handleRenameConversation}
                    onDelete={handleDeleteConversation}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <ThemeModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
