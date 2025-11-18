"use client"

import { Action, initialState, reducer, State, ActionType, UserRole } from "@/reducers/AppReducer";
import React, { createContext, Dispatch, ReactNode, useContext, useEffect, useMemo, useReducer } from "react";

interface AppContextProps{
    state: State;
    dispatch: Dispatch<Action>;
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

    // 初始化时检查 LocalStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('app_user');
        const storedRole = localStorage.getItem('app_role');
        
        if (storedUser && storedRole) {
            try {
                const user = JSON.parse(storedUser);
                // 恢复会话，且保持当前浏览器 URL 路径 (window.location.pathname)
                dispatch({
                    type: ActionType.RESTORE_SESSION,
                    payload: {
                        user: user,
                        role: storedRole as UserRole,
                        path: window.location.pathname
                    }
                });
            } catch (e) {
                console.error("Failed to parse user data from local storage", e);
                dispatch({ type: ActionType.INITIALIZE_END });
            }
        } else {
            // 没有找到登录信息，标记初始化结束
            dispatch({ type: ActionType.INITIALIZE_END });
        }
    }, []);

    const contextValue = useMemo(()=>{
        return {state, dispatch};
    },[state, dispatch]);
    
    return (
        <AppContext.Provider  value = {contextValue}>
        {children}
        </AppContext.Provider>
    )
};