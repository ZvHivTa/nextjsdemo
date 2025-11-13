"use client"

import { useEffect, useRef } from 'react'; // 引入 useRef
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from "@/components/AppContext";

// 定义应用的公共路径和角色前缀
const LOGIN_PATH = '/login';
const ROOT_PATH = '/';
const STUDENT_PATH_PREFIX = '/student';
const MANAGER_PATH_PREFIX = '/manager';

/**
 * AppRouter：负责全局权限检查和 Context 状态与路由的同步。
 */
export function AppRouter({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const currentPath = usePathname();
    const { state } = useAppContext();
    const { role } = state;

    // 使用 useRef 存储最近一次成功的角色状态。
    // 这可以防止在组件重新渲染/重新挂载时，role 状态短暂丢失。
    const lastValidRole = useRef(role);
    if (role) {
        lastValidRole.current = role;
    }
    const currentStableRole = lastValidRole.current;


    useEffect(() => {
        // --- 核心权限和跳转逻辑 ---
        
        // 1. 检查当前是否为受保护路径
        const isProtectedPath = 
            currentPath.startsWith(STUDENT_PATH_PREFIX) || 
            currentPath.startsWith(MANAGER_PATH_PREFIX);
        
        // 2. 检查当前用户是否应该被重定向
        // A. 用户未登录逻辑 (仅在没有稳定角色时执行)
        if (!currentStableRole) {
            // 如果用户未登录，但尝试访问受保护页面
            if (isProtectedPath) {
                console.log("[AppRouter] 🛑 UNSTABLE STATE DETECTED! Forcing redirect to LOGIN.");
                router.replace(LOGIN_PATH);
                return;
            }
            return; 
        }

        // --- 以下逻辑只针对已认证用户 (currentStableRole != null) ---

        // 3. 角色路径不匹配检查 (Role Mismatch Check)
        const isStudentPath = currentPath.startsWith(STUDENT_PATH_PREFIX);
        const isManagerPath = currentPath.startsWith(MANAGER_PATH_PREFIX);

        // 使用 stable role 来判断正确的路径前缀
        const expectedPathPrefix = currentStableRole === 'student' ? STUDENT_PATH_PREFIX : MANAGER_PATH_PREFIX;
        
        const isValidPathForRole = 
            (currentStableRole === 'student' && isStudentPath) || 
            (currentStableRole === 'manager' && isManagerPath);
            
        const isPublicPath = currentPath === LOGIN_PATH || currentPath === ROOT_PATH;

        let redirectHomePath: string | null = null;
        
        // 如果当前路径不合法（角色不匹配或停留在公共路径）
        if (!isValidPathForRole || isPublicPath) {
            redirectHomePath = expectedPathPrefix;
        }

        // 执行跳转（如果需要）
        if (redirectHomePath && currentPath !== redirectHomePath) {
            // 确保只在目标路径不同时才跳转
            console.log(`[AppRouter] Redirecting ${currentStableRole} from ${currentPath} to ${redirectHomePath}`);
            router.replace(redirectHomePath);
        }

    }, [role, currentPath, router]); // 依赖项仍是 role (原始状态) 和 currentPath

    // 4. 布局包裹逻辑 (保持不变)
    // 注意：这个逻辑块实际上没有包裹任何东西，
    // 它只是根据路径决定是否返回 {children}。
    // 真正的布局切换通常在 app/layout.tsx 或嵌套的 layout.tsx (如 student/layout.tsx) 中完成。
    const isDashboardLayout = currentPath.startsWith(STUDENT_PATH_PREFIX) || currentPath.startsWith(MANAGER_PATH_PREFIX);
    
    if (isDashboardLayout) {
        return <>{children}</>;
    }

    // 非 Dashboard 页面 (Login/Root)
    return (
        <>
            {children}
        </>
    );
}