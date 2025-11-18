"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "@/components/AppContext";

export default function Page() {
  
  // 在实际应用中，请替换为 context 中的数据
  const { state } = useAppContext();
  const admin = state.user;

  // 简单的 fallback，用于在 student 为 null 时显示
  if (!admin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Null</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    // 您 app/student/layout.tsx 中已经有了 p-4
    // 所以这里不需要额外的 padding
    <Card>
      {/* 1. 卡片头部：包含头像、姓名和描述（如邮箱） */}
      <CardHeader className="flex flex-row items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={admin.avatar} alt={admin.name} />
          {/* Fallback 显示名字的前两个字 */}
          <AvatarFallback>{admin.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl">{admin.name}</CardTitle>
          <CardDescription>{admin.email}</CardDescription>
        </div>
      </CardHeader>
      
      {/* 2. 卡片内容：包含所有只读信息 */}
      <CardContent className="space-y-4">
        <Separator />
        
        {/* 我们使用 grid 布局来整齐地显示标签和值 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* 信息项：学号 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Admin ID</p>
            <p className="text-lg font-medium">{admin.id}</p>
          </div>
          
          
          {/* 信息项：所在专业 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Subject</p>
            <p className="text-lg font-medium">{admin.subject}</p>
          </div>

          {/* 信息项：所在学院 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">College</p>
            <p className="text-lg font-medium">{admin.college}</p>
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}