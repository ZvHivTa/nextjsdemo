"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { useRouter } from "next/navigation";
interface SubItem {
    title: string;
    url: string;
}

interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType; 
    isActive: boolean;
    items: SubItem[];
}

// NavMain 组件的 Props 接口
interface NavMainProps {
    items: NavItem[];
    currentPath: string;
    // 这是一个 dispatch 函数，用于通知 AppContext 更改路径
    navigate: (newPath: string) => void; 
}

export default function NavMain({ items, currentPath, navigate }: NavMainProps) {
   const router = useRouter();
    
    // 侧边栏子项点击处理器
    const handleItemClick = (url: string) => {
        navigate(url);
        router.push(url);
    }
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link 
                          href={subItem.url}
                          onClick={(e) => {
                            
                            e.preventDefault(); 
                            handleItemClick(subItem.url); 
                          }}
                        >
                          <span>{subItem.title}</span>
                        </Link>
                        
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
