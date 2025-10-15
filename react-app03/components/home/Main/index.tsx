"use client";
import { useAppContext } from "@/components/AppContext";
import Menu from "./Menu";

export default function Main() {
    const { state: { displayNavigation } } = useAppContext()!;

    const paddingClass = displayNavigation ? "ml-[260px]" : "ml-[0px]";

    // const mainClasses = `
    //     relative flex-1 
    //     bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 
    //     transition-all duration-300 ease-in-out 
    //     ${paddingClass}
    // `;
    const mainClasses = `relative flex-1 min-w-0
            bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 
            transition-all duration-300 ease-in-out`
    return (
        <main className={mainClasses.replace(/\s+/g, ' ').trim()}>
            <Menu></Menu>
        </main>
    );
}