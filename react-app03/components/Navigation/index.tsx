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
        flex flex-col dark relative h-full bg-gray-900 text-gray-300
        top-0 left-0 transition-transform transform z-40
        transition-all duration-300 ease-in-out
        ${displayNavigation ? "translate-x-0 w-[260px] p-2" : "-translate-x-full w-[0px] overflow-hidden p-0"}
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