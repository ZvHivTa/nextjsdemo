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

// --- 模拟数据 ---
// 在实际应用中，您应该从 AppContext 中获取这些数据
// const { state } = useAppContext();
// const student = state.user;
// (您还需要更新 AppReducer.tsx 中的 UserData 类型以包含这些字段)
const mockStudentData = {
  id: "20250001",
  name: "张三",
  email: "zhangsan@example.com",
  avatarUrl: "/placeholder-user.jpg", // 您可以放一个占位符图片在 public 目录下
  year: "大三",
  major: "计算机科学与技术",
  college: "信息工程学院",
};
// ---------------

export default function Page() {
  
  // 在实际应用中，请替换为 context 中的数据
  const { state } = useAppContext();
  const student = state.user;

  // 简单的 fallback，用于在 student 为 null 时显示
  if (!student) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>错误</CardTitle>
          <CardDescription>无法加载学生信息。</CardDescription>
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
          <AvatarImage src={student.avatarUrl} alt={student.name} />
          {/* Fallback 显示名字的前两个字 */}
          <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl">{student.name}</CardTitle>
          <CardDescription>{student.email}</CardDescription>
        </div>
      </CardHeader>
      
      {/* 2. 卡片内容：包含所有只读信息 */}
      <CardContent className="space-y-4">
        <Separator />
        
        {/* 我们使用 grid 布局来整齐地显示标签和值 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* 信息项：学号 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">学号</p>
            <p className="text-lg font-medium">{student.id}</p>
          </div>
          
          {/* 信息项：学年 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">学年</p>
            <p className="text-lg font-medium">{student.year}</p>
          </div>
          
          {/* 信息项：所在专业 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">所在专业</p>
            <p className="text-lg font-medium">{student.major}</p>
          </div>

          {/* 信息项：所在学院 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">所在学院</p>
            <p className="text-lg font-medium">{student.college}</p>
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}