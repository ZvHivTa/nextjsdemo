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
import { toast } from "sonner"
import { api } from "@/lib/api" // 引入 API 客户端
import { ApiResponse } from "@/types"

// 1. 定义 Zod 验证 schema
const formSchema = z.object({
  // [新增] 旧密码字段
  oldPassword: z.string().min(1, "请输入当前密码"),
  
  // 新密码
  password: z.string()
    .min(8, { message: "密码必须至少为8个字符" })
    .max(100, { message: "密码不能超过100个字符" })
    .regex(/(?=.*[a-z])/, { message: "密码必须包含至少一个小写字母" })
    .regex(/(?=.*[A-Z])/, { message: "密码必须包含至少一个大写字母" }),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的新密码不一致",
  path: ["confirmPassword"],
}).refine((data) => data.oldPassword !== data.password, {
  message: "新密码不能与旧密码相同",
  path: ["password"],
});

export default function PwdChangeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state } = useAppContext();
  
  const studentId = state.user?.id || "---";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  })

  // 4. 提交处理函数
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // 发起真实请求 (假设接口是 /user/password)
      // Body 只需要传 oldPassword 和 newPassword
      await api.post<ApiResponse<null>>('/pwdChange', {
        oldPassword: values.oldPassword,
        newPassword: values.password
      });

      // 成功处理
      toast.success("密码修改成功", {
        description: "下次登录请使用新密码。",
      });
      
      form.reset(); // 清空表单

    } catch (error: any) {
      // 错误处理 (api.ts 会抛出后端返回的错误信息)
      console.error("修改密码失败:", error);
      toast.error("修改密码失败", {
        description: error.message || "请检查旧密码是否正确。",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
        <CardDescription>为了账号安全，建议定期更换密码。新密码必须包含大小写字母，长度8-100位。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* 只读的学号显示 */}
        <div className="space-y-2">
          <Label htmlFor="studentId">账号 (ID)</Label>
          <Input id="studentId" value={studentId} disabled className="bg-muted" />
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* [新增] 旧密码字段 */}
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当前密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="请输入当前使用的密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 新密码字段 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="设置新密码" {...field} />
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
                    <Input type="password" placeholder="再次输入新密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                确认修改
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}