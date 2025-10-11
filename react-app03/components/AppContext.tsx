"use client"

import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useMemo, useState } from "react";

interface State{
    displayNavigation:boolean;
}

interface AppContextProps{
    state: State;
    setState: Dispatch<SetStateAction<State>>;
}

const AppContext = createContext<AppContextProps | null>(null);

export function useAppContext(){
    return useContext(AppContext);
}
export default function AppContextProvider(
    {children}:{children:ReactNode}
){
    const [state,setState] = useState<State>({
        displayNavigation:true,
    });
    // useMemo函数，参数是一个函数和一个依赖项数组
    // 只有当state或者setState发生变化时，才会重新计算contextValue的值
    // 这样可以避免不必要的重新渲染，提高性能
    // 这里的依赖项是state和setState，因为setState是React保证不会变的，所以实际上只有state变化时才会触发重新计算
    const contextValue = useMemo(()=>{
        return {state,setState}
    }
    ,[state,setState]);

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