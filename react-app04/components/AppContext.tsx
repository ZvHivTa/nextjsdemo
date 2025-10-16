"use client"

import { Action, initialState, reducer, State } from "@/reducers/AppReducer";
import { init } from "next/dist/compiled/webpack/webpack";
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { useSidebar } from "./ui/sidebar";



interface AppContextProps{
    state: State;
    dispatch: Dispatch<Action>;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const AppContext = createContext<AppContextProps | null>(null);

export function useAppContext(){
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
}
export default function AppContextProvider(
    {children}:{children:ReactNode}
){  
   
    const [state,dispatch] = useReducer(reducer,initialState);
     // 2. 调用 Sidebar 的 Context Hook 来获取 Sidebar 状态和函数
    // 注意：这只有在 AppContextProvider 被 SidebarProvider 包裹时才有效！
    const sidebarContext = useSidebar();
    // useMemo函数，参数是一个函数和一个依赖项数组
    // 只有当state或者setState发生变化时，才会重新计算contextValue的值
    // 这样可以避免不必要的重新渲染，提高性能
    // 这里的依赖项是state和setState，因为setState是React保证不会变的，所以实际上只有state变化时才会触发重新计算
    const contextValue = useMemo(()=>{
        return {state,
           dispatch,
           isSidebarOpen: sidebarContext.open,
           toggleSidebar: sidebarContext.toggleSidebar,
        };
    }
    ,[state, dispatch, sidebarContext.open, sidebarContext.toggleSidebar]);
    
    // AppContext.Provider 是一个组件，用于提供context值给子组件
    // 通过AppContext.Provider将contextValue传递给子组件
    // 这样子组件就可以通过useContext(AppContext)来访问state和setState
    // 注意这里的value属性值是contextValue，而不是一个对象字面量
    // 这样可以避免每次渲染都创建一个新的对象，导致子组件不必要的重新渲染
    // 只有当contextValue真正变化时，子组件才会重新渲染

    return (
        <AppContext.Provider  value = {contextValue}>
        {children}
        </AppContext.Provider>
    )
};