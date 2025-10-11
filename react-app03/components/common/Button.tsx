import { ComponentPropsWithoutRef } from "react";
import { IconType } from "react-icons";

// 下面两种定义类型的方式是等价的
// type ButtonProps{
//     icon?:IconType;
//     variant?:"default"| "outline"| "text";

// } & ComponentPropsWithoutRef<"button">;

//border border-gray-600 rounded px-3 py-1.5 hover:bg-gray-800 active:bg-gray-700 
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
    icon?: IconType;
    variant?: "default" | "outline" | "text";
}

export default function Button({
    children,
    className = "",
    icon : Icon,
    variant = "default",
    ...props
}:ButtonProps) {
    const defaultCLass = "text-black dark:text-gray-300 bg-gray-50 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-900";
    const outlineClass = "border border-gray-300 dark:border-gray-600 text-black dark:text-gray-300 bg-gray-50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700";
    const textClass = "text-black dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700";
    const buttonCSSclass = variant === "default"
        ? defaultCLass
        : variant === "outline"
        ? outlineClass
        : textClass;
    return (
        <button
        className={`inline-flex items-center min-w-[38px] min-h-[38px] rounded px-3 py-1.5 
                    ${buttonCSSclass} 
                    ${className}`} 
        {...props}
        >
            {Icon && <Icon className={`text-lg ${children ? "mr-1" : ""}`} />}
            {children}
        </button>
    );
}