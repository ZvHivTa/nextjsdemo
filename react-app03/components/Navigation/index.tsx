"use client";
import { useAppContext } from "../AppContext";
import ChatList from "./ChatList";
import Menubar from "./Menubar";
import Toolbar from "./Toolbar";

export default function Navigation() {
    const {
        state: {displayNavigation},
    } = useAppContext()!;

     // 侧边栏显示/隐藏逻辑
    const navClasses = `
        flex flex-col dark relative h-full w-[260px] bg-gray-900 text-gray-300 p-2
        fixed top-0 left-0 transition-transform transform z-40
        ${displayNavigation ? "translate-x-0" : "-translate-x-full"}
    `;


    return (
        // 应用 transform 逻辑的 navClasses (并清理空格)
        <nav className={navClasses.replace(/\s+/g, ' ').trim()}>
            <Menubar/>
            <ChatList/>
            <Toolbar/>
        </nav>
    );
}