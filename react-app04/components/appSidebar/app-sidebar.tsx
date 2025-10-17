"use client";
import {
  Calendar,
  Home,
  Inbox,
  MessageSquare,
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
} from "../ui/input-group";
import { useAppContext } from "../AppContext";
import { ActionType } from "@/reducers/AppReducer";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import { IconMap } from "@/reducers/AppReducer";
import { useRouter } from "next/navigation";

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
  //使用路由
  const router = useRouter();
  const handleNavigation = (conversationId: string) => {
    if(conversationId === ""){
      router.push(`/`);
      dispatch({ type: ActionType.SIDEBAR_NAVIGATION, id: conversationId });
      return;
    }
    if (conversationId === state.currentConversationId) {
      return;
    }
    router.push(`/chat/${conversationId}`);
    dispatch({ type: ActionType.SIDEBAR_NAVIGATION, id: conversationId });
  };

  const items = state.conversations;

  //新建对话
  const handleCreateConversation = ()=>{


  };
  // 处理标题更新
  const handleRenameConversation = (
    oldTitle: string,
    newTitle: string,
    id: string
  ) => {
    // 假设您的 Reducer/Context 提供了 updateConversationTitle 的 dispatch 或函数
    console.log(`正在修改标题: ${oldTitle} -> ${newTitle}`);

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
    //TODO 服务器端删除对话
    dispatch({
      type: ActionType.DELETE_CONVERSATION,
      id: id,
    });
  };

  return (
    <Sidebar collapsible="icon">
      {/* 头部 */}
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
        <SidebarSeparator className = "w-full"/>
      </SidebarHeader>



           
            
      {/* 内容 */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Function</SidebarGroupLabel>
             <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                      <a
                        onClick={() => {
                          //切换到新建对话界面
                          handleNavigation("");
                        }}
                      >
                        <Plus />
                        <span>New conversation</span>
                      </a>
                </SidebarMenuButton>
                
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Conversation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const IconComponent = IconMap[item.icon] || MessageSquare;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <a
                        onClick={() => {
                          handleNavigation(item.id);
                        }}
                      >
                        <IconComponent />
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      

      {/* 底部 */}
      <SidebarFooter>
        <SidebarSeparator className = "w-full"/>
        <ThemeModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
