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
      url: "/student",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Search Course",
          url: "#",
        },
        {
          title: "Recommended Course",
          url: "#",
        },
        {
          title: "Selected Course",
          url: "#",
        },
      ],
    },
  ],
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
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  typeOfRole: 'student' | 'staff' | string; 
}

export function AppSidebar({ typeOfRole, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                      <ThemeModeToggle/>
                    </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={typeOfRole === "student" ? data.navMainStudent : data.navMainStaff} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
