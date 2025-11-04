"use client"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"

// import { useRouter } from "next/navigation"; 

// 导入 AppContext 和 Reducer 的类型/枚举
import { useAppContext } from "@/components/AppContext";
import { ActionType, UserRole } from "@/reducers/AppReducer";


const formSchema = z.object({
  login: z.union([
    z.string()
      .length(6, "ID 必须是 6 位数字或 8 位数字。")
      .regex(/^\d+$/, "ID 必须只包含数字。"), 
      
    z.string()
      .length(8, "ID 必须是 6 位数字或 8 位数字。")
      .regex(/^\d+$/, "ID 必须只包含数字。"),
  ]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.") 
    .max(100, "Password must be at most 100 characters."),
})

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  // 使用 useAppContext 获取 dispatch
  const { dispatch } = useAppContext(); 
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });



  // 完善 onSubmit 逻辑
  const onSubmit = async (data: LoginFormValues) => {
    // 1. 根据 ID 长度确定角色和跳转路径
    const userRole: UserRole = data.login.length === 6 ? 'student' : 'manager';
    const redirectPath = userRole === 'student' ? '/student' : '/manager';

    console.log("正在执行登录请求...");

    // 2. 模拟异步登录操作 (实际中应替换为 fetch 或 axios)
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    // 3. 派发 LOGIN Action，更新全局状态
    dispatch({ 
        type: ActionType.LOGIN, 
        payload: { 
            role: userRole, 
            user: { name: data.login, email: `${data.login}@school.edu` }, // 示例 UserData
            redirectPath: redirectPath 
        } 
    });

    // 4. 用户反馈
    alert(`登录成功! 身份: ${userRole === 'student' ? '学生' : '管理员/教师'}! 即将跳转到 ${redirectPath} 界面.`);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your Student ID or Staff ID to login to your account
          </p>
        </div>

        <Controller
          name="login"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-login">Your ID</FieldLabel>
              <Input
                {...field}
                id="form-rhf-login"
                aria-invalid={fieldState.invalid}
                placeholder="your student ID or staff ID…"
                autoComplete="off"
              />
              {fieldState.invalid && fieldState.error?.message && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-password">Password</FieldLabel>
              <Input
                {...field}
                id="form-rhf-password"
                aria-invalid={fieldState.invalid}
                type="password"
                placeholder="your password..."
                autoComplete="off"
              />
              {fieldState.invalid && fieldState.error?.message && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        
        <Field>
          <Button type="submit">Login</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
