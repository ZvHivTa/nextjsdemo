"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Info,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import NavMain from "./nav-main"
import  NavUser  from './nav-user'
import { ThemeModeToggle } from "@/components/theme-toggle/thememode-toggle"
import { useAppContext } from "../AppContext"
import { ActionType } from "@/reducers/AppReducer"

// --- 1. 导航数据定义 (保留并完善类型) ---
interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType; // LucideIcon type
    isActive: boolean;
    items: { title: string; url: string }[];
}

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMainStudent: [
    {
      title: "Personal",
      url: "/student",
      icon: Info,
      isActive: true,
      items: [
        {
          title: "Personal Info",
          url: "/student/info",
        },
        {
          title: "Password Change",
          url: "/student/PwdChange",
        },
      ],
    },
    {
      title: "Course",
      url: "/student",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Search Course",
          url: "/student/search",
        },
        {
          title: "Recommended Course",
          url: "/student/recommend",
        },
        {
          title: "Selected Course",
          url: "/student/selected",
        },
      ],
    },
  ] as NavItem[],
  
  navMainStaff: [
    {
      title: "Personal",
      url: "/manager",
      icon: Info,
      isActive: true,
      items: [
        {
          title: "Personal Info",
          url: "#",
        },
        {
          title: "Password Change",
          url: "#",
        },
      ],
    },
    {
      title: "Course",
      url: "/manager",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Search Course",
          url: "#",
        },
        {
          title: "Create Course",
          url: "#",
        },
      ],
    },

     {
      title: "Student",
      url: "/manager",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Management",
          url: "#",
        }
      ],
    },
  ] as NavItem[],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   // ✅ 1. 从 AppContext 中获取状态和 dispatch
    const { state, dispatch } = useAppContext();
    const { role, user, path } = state;

    // 2. 登出逻辑
    const handleLogout = () => {
        dispatch({ type: ActionType.LOGOUT });
        // 🚨 注意：AppRouter 应该会检测到 LOGOUT 并跳转到 /login
    };

    // 3. 导航逻辑
    // 🚨 修正：为了配合最新的 AppRouter.tsx 逻辑（AppRouter负责导航），
    // 侧边栏点击只需要更新 Context 中的 path 即可，AppRouter 会处理 router.push
    const handleNavigate = (newPath: string) => {
        dispatch({ type: ActionType.NAVIGATE, route: newPath });
    };

    // 4. 根据角色选择导航菜单
    const navItems = role === 'student' ? data.navMainStudent : data.navMainStaff;
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                      <ThemeModeToggle/>
                    </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} 
                    currentPath={path}
                    navigate={handleNavigate}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout = {handleLogout}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
