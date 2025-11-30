"use client"

import * as React from "react"
import {
  BookOpen,
  Info,
  Users,
  ShieldCheck
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

// 1. 引入 Skeleton 组件
import { Skeleton } from "@/components/ui/skeleton"

import NavMain from "./nav-main"
import NavUser from "./nav-user"
import { ThemeModeToggle } from "@/components/theme-toggle/thememode-toggle"
import { useAppContext } from "../AppContext"
import { ActionType } from "@/reducers/AppReducer"

// ... (接口和 data 定义保持不变，为了节省篇幅省略) ...
interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType; 
    isActive: boolean;
    items: { title: string; url: string }[];
}

const data = {
  // ... (保持不变)
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMainStudent: [
    {
      title: "Personal",
      url: "/student",
      icon: Info,
      isActive: true,
      items: [
        { title: "Personal Info", url: "/student/info" },
        { title: "Password Change", url: "/student/PwdChange" },
      ],
    },
    {
      title: "Course",
      url: "/student",
      icon: BookOpen,
      isActive: true,
      items: [
        { title: "Search Course", url: "/student/search" },
        { title: "Recommended Course", url: "/student/recommend" },
        { title: "Selected Course", url: "/student/selected" },
      ],
    },
  ] as NavItem[],
  navMainAdmin: [
    {
      title: "Management",
      url: "/admin",
      icon: ShieldCheck,
      isActive: true,
      items: [
        { title: "Personal Info", url: "/admin/info" },
        { title: "Password Change", url: "/admin/password" },
      ],
    },
    {
      title: "Course",
      url: "/admin/courses",
      icon: BookOpen,
      isActive: true,
      items: [
        { title: "Course List", url: "/admin/courses" }, 
        { title: "Create Course", url: "/admin/courses/create" }, 
      ],
    },
    {
      title: "Student",
      url: "/admin/students",
      icon: Users,
      isActive: true,
      items: [
        { title: "Student List", url: "/admin/students" },
      ],
    },
  ] as NavItem[],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const router = useRouter(); 
    const { state, dispatch } = useAppContext();
    
    // 2. 获取 isInitialized 状态
    const { role, user, path, isInitialized } = state; 

    const handleLogout = () => {
        try {
            localStorage.removeItem('app_user');
            localStorage.removeItem('app_role');
            localStorage.removeItem('app_token');
        } catch (e) {
            console.error("Error clearing local storage:", e);
        }
        dispatch({ type: ActionType.LOGOUT });
        router.replace('/login');
    };

    const handleNavigate = (newPath: string) => {
        dispatch({ type: ActionType.NAVIGATE, route: newPath });
    };

    const currentRole = role ? role.toLowerCase() : null;
    let navItems: NavItem[] = [];
    
    // 只有在初始化完成且有角色时才计算菜单
    if (isInitialized) {
        if (currentRole === 'student') {
            navItems = data.navMainStudent;
        } else if (currentRole === 'admin') {
            navItems = data.navMainAdmin;
        }
    }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <ThemeModeToggle/>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* 3. 根据初始化状态切换显示 */}
        {!isInitialized ? (
            // 加载状态：显示骨架屏
            <div className="px-4 py-2 space-y-6">
                {/* 模拟两个分组 */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-20 bg-sidebar-accent/50" />
                    <Skeleton className="h-8 w-full bg-sidebar-accent/50" />
                    <Skeleton className="h-8 w-full bg-sidebar-accent/50" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24 bg-sidebar-accent/50" />
                    <Skeleton className="h-8 w-full bg-sidebar-accent/50" />
                    <Skeleton className="h-8 w-full bg-sidebar-accent/50" />
                </div>
            </div>
        ) : (
            // 完成状态：显示真实菜单
            <NavMain items={navItems} 
                    currentPath={path}
                    navigate={handleNavigate}/>
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* 4. 底部用户信息也加上骨架屏 */}
        {!isInitialized || !user ? (
            <div className="p-2">
                <Skeleton className="h-12 w-full rounded-lg bg-sidebar-accent/50" />
            </div>
        ) : (
            <NavUser user={user} onLogout = {handleLogout}/>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}