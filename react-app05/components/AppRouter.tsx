"use client"

import { useEffect } from "react";
// 引入 Next.js 客户端路由钩子
import { useRouter, usePathname } from "next/navigation";
// 引入我们自己的全局状态 Context
import { useAppContext } from "@/components/AppContext";

// 定义不受保护的公共路径
const PUBLIC_PATHS = ['/login']; 
// 根路径 '/' 现在被视为受保护路径，除非它是一个专门的公共主页

/**
 * AppRouter 组件：
 * 负责监听应用状态（认证和角色），并执行 Next.js 的客户端路由跳转。
 */
export function AppRouter({ children }: { children: React.ReactNode }) {
    const { state } = useAppContext();
    const router = useRouter();
    const currentPath = usePathname();

    useEffect(() => {
        const { role } = state;
        
        // 任何不是 '/login' 的路径都被视为受保护路径。
        // 因为 /login/page.tsx 会在 mount 时运行 AppRouter。
        const isProtectedPath = !PUBLIC_PATHS.some(p => currentPath === p);

        // --- 1. 权限检查：未登录用户处理 ---
        if (!role) {
            // 如果用户未登录，并且当前路径不是 /login，则重定向到 /login
            if (currentPath !== '/login') {
                console.log("[Auth] Not logged in, redirecting to /login.");
                // 强制推到登录页，打破任何其他页面的循环
                router.push('/login'); 
            }
            // 如果用户已在 /login，不做任何操作，让登录表单组件渲染
            return;
        }

        // --- 2. 权限检查：角色不匹配重定向 (仅当已登录时执行) ---
        if (role) {
            let targetPath = null;
            
            // 确保认证用户不在登录页
            if (currentPath === '/login') {
                 targetPath = (role === 'student' ? '/student' : '/manager');
            } 
            // 检查角色是否与当前路由匹配
            else if (role === 'student' && currentPath.startsWith('/manager')) {
                 targetPath = '/student';
            } else if (role === 'manager' && currentPath.startsWith('/student')) {
                 targetPath = '/manager';
            }
            
            if (targetPath && targetPath !== currentPath) {
                console.log(`[Auth] Redirecting to authorized route: ${targetPath}.`);
                router.push(targetPath);
                return;
            }
        }
        
        // 3. 移除基于 state.path 的同步逻辑，所有导航由 login-form 或 sidebar 直接执行 router.push

    }, [state.role, currentPath, router]); // 仅监听角色变化和当前路径

    return <>{children}</>;
}
