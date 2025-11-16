"use client"

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar/app-sidebar'; 
import {
  SidebarInset,
  SidebarProvider, 
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ⚠️ 如果您要使用 AppSidebar，它依赖于 AppContext，所以它必须在 AppContextProvider 下。
    // 假设 SidebarProvider/Context 是 AppContext 外部的独立 UI 状态管理。
    <SidebarProvider>
            <AppSidebar/> 
      
      {/* 主要内容区域容器 */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {/* 可以在这里添加面包屑导航或页面标题 */}
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
        </header>
        
        {/* 子页面内容 (app/student/page.tsx 的内容将显示在这里) */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}