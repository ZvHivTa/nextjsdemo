"use client"

import { Action, initialState, reducer, State } from "@/reducers/Appreducer";
import { init } from "next/dist/compiled/webpack/webpack";
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useReducer, useState } from "react";



interface AppContextProps{
    state: State;
    dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContextProps | null>(null);

export function useAppContext(){
    return useContext(AppContext);
}
export default function AppContextProvider(
    {children}:{children:ReactNode}
){
    const [state,dispatch] = useReducer(reducer,initialState);
    // useMemo函数，参数是一个函数和一个依赖项数组
    // 只有当state或者setState发生变化时，才会重新计算contextValue的值
    // 这样可以避免不必要的重新渲染，提高性能
    // 这里的依赖项是state和setState，因为setState是React保证不会变的，所以实际上只有state变化时才会触发重新计算
    const contextValue = useMemo(()=>{
        return {state,dispatch}
    }
    ,[state,dispatch]);

    //监听主题状态并更新 <html> 元素
    useEffect(() => {
        const root = document.documentElement; // 获取根 HTML 标签
        root.classList.remove('light');
        root.classList.remove('dark');
        root.classList.add(state.themeMode || 'light'); // 默认使用 'light' 模式
    }, [state.themeMode]);
    
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