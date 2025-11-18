"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

// --- 1. 修改 Schema ---
const formSchema = z.object({
  login: z.string()
    // 使用正则：^ 表示开始，$ 表示结束
    // \d{6} 表示6个数字，\d{8} 表示8个数字
    // | 表示或者
    .regex(/^(\d{6}|\d{8})$/, {
      message: "ID必须是6位或8位数字 (ID must be a 6 or 8 digit number)",
    }),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .max(100, "密码不能超过100个字符"),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { dispatch } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log("Login attempt:", values)

    // 模拟网络请求延迟
    setTimeout(() => {
      // 简单的模拟认证逻辑
      let role: "student" | "admin" = "student";
      
      // 如果 ID 是 6 位，假设是管理员 (示例逻辑)
      if (values.login.length === 6) {
        role = "admin";
      } else {
        role = "student";
      }

      // 构建用户数据 (模拟从后端返回)
      // TODO: 登录向后端发送请求
      const mockStudent = {
        name: "张三" ,
        email: `${values.login}@example.com`,
        avatar: "/placeholder-user.jpg",
        // 补充 reducer 中定义的字段
        id: values.login,
        year: "2025",
        subject: "计算机科学",
        college: "信息学院"
      };
      
      const mockAdmin = {
        name: "李管理员",
        email: `${values.login}@example.com`,
        avatar: "/placeholder-user.jpg",
        // 补充 reducer 中定义的字段
        id: values.login,
        subject: "计算机科学",
        college: "信息学院"

      };
      
      // 登录成功，保存到 LocalStorage
      if(role === "admin"){
        localStorage.setItem('app_user', JSON.stringify(mockAdmin));
      }else if(role === "student"){
        localStorage.setItem('app_user', JSON.stringify(mockStudent));
      }
      
      localStorage.setItem('app_role', role);
      // 派发登录动作
      dispatch({
        type: ActionType.LOGIN,
        payload: {
          role: role,
          user: role === 'student' ? mockStudent : mockAdmin,
          redirectPath: role === 'student' ? '/student' : '/admin',
        },
      });
      
      
      setLoading(false);
    }, 1000);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Course Management System</CardTitle>
          <CardDescription>
            Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              
              {/* Login Field */}
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>student or staff (ID)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="6 bits or 8 bits number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>password</FormLabel>
  
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
