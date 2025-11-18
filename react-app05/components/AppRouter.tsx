"use client"

import { useEffect } from 'react'; 
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from "@/components/AppContext";
import { Loader2 } from 'lucide-react';

const LOGIN_PATH = '/login';
const ROOT_PATH = '/';
const STUDENT_PATH_PREFIX = '/student';
const ADMIN_PATH_PREFIX = '/admin';

export function AppRouter({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const currentPath = usePathname();
    const { state } = useAppContext();
    
    // 1. 只获取 role 和 isInitialized。
    // 绝对不要再使用 useRef 来缓存 role 了！
    const { role, isInitialized } = state; 

    useEffect(() => {
        // 2. 初始化检查：如果还在读取 LocalStorage，什么都不做，等待。
        if (!isInitialized) return;

        const isProtectedPath = 
            currentPath.startsWith(STUDENT_PATH_PREFIX) || 
            currentPath.startsWith(ADMIN_PATH_PREFIX);
        
        // 3. [关键修复] 用户未登录检查
        // 直接检查 role 是否为 null。
        // 当您点击登出 -> role 变 null -> 这个 if 成立 -> 执行跳转。
        if (!role) {
            if (isProtectedPath) {
                console.log("[AppRouter] No user role found. Redirecting to LOGIN.");
                router.replace(LOGIN_PATH);
            }
            // 如果已经在 /login，就留在这里
            return; 
        }

        // --- 以下逻辑仅在 role 存在（用户已登录）时执行 ---

        const isStudentPath = currentPath.startsWith(STUDENT_PATH_PREFIX);
        const isAdminPath = currentPath.startsWith(ADMIN_PATH_PREFIX);
        
        const expectedPathPrefix = role === 'student' ? STUDENT_PATH_PREFIX : ADMIN_PATH_PREFIX;
        
        const isValidPathForRole = 
            (role === 'student' && isStudentPath) || 
            (role === 'admin' && isAdminPath);
            
        const isPublicPath = currentPath === LOGIN_PATH || currentPath === ROOT_PATH;

        let redirectHomePath: string | null = null;
        
        // 4. 越权访问或已登录用户访问登录页的处理
        if (!isValidPathForRole || isPublicPath) {
            redirectHomePath = expectedPathPrefix;
        }

        if (redirectHomePath && currentPath !== redirectHomePath) {
            console.log(`[AppRouter] Redirecting ${role} to ${redirectHomePath}`);
            router.replace(redirectHomePath);
        }

    }, [role, currentPath, router, isInitialized]); // 依赖项非常干净

    // 5. 全局 Loading 遮罩
    // 防止 F5 刷新时，role 还没从 LocalStorage 恢复就显示登录页
    if (!isInitialized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">正在恢复会话...</p>
                </div>
            </div>
        );
    }

    // 布局逻辑
    const isDashboardLayout = currentPath.startsWith(STUDENT_PATH_PREFIX) || currentPath.startsWith(ADMIN_PATH_PREFIX);
    if (isDashboardLayout) {
        return <>{children}</>;
    }

    return <>{children}</>;
}