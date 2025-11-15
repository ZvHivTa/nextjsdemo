"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAppContext } from "@/components/AppContext"

// 1. 定义 Zod 验证 schema
const formSchema = z.object({
  // 验证规则：8-100 字符，至少一个大写字母，至少一个小写字母
  password: z.string()
    .min(8, { message: "密码必须至少为8个字符" })
    .max(100, { message: "密码不能超过100个字符" })
    .regex(/(?=.*[a-z])/, { message: "密码必须包含至少一个小写字母" })
    .regex(/(?=.*[A-Z])/, { message: "密码必须包含至少一个大写字母" }),
  confirmPassword: z.string()
  
  // 2. 使用 refine 来检查两次密码是否一致
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"], // 将错误信息附加到 confirmPassword 字段
});

export default function PwdChangePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state } = useAppContext();
  
  // 从 Context 中获取学号
  // 假设学号存在 state.user.id (基于我们上一个界面的设计)
  const studentId = state.user?.id || "---";

  // 3. 设置表单 hook，就像 login-form.tsx 一样
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // 4. 定义提交处理函数
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("提交的数据:", values);

    // TODO: 在这里添加调用 API 修改密码的逻辑
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("密码修改成功！");
    setIsSubmitting(false);
    
    // 成功后可以重置表单
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
        <CardDescription>请设置您的新密码。密码必须包含大小写字母，且长度在8到100之间。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* 只读的学号显示 */}
        <div className="space-y-2">
          <Label htmlFor="studentId">学号</Label>
          <Input id="studentId" value={studentId} disabled />
        </div>
        
        {/* 5. 渲染表单 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* 新密码字段 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="请输入新密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 确认新密码字段 */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认新密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="请再次输入新密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 提交按钮，带加载状态 */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认修改
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}