"use client";
import Button from "@/components/common/Button";
import { useAppContext } from "../AppContext";
import { MdDarkMode, MdInfo, MdLight, MdLightMode } from "react-icons/md";
import { ActionType } from "@/reducers/Appreducer";

export default function Toolbar() {
    const {state:{themeMode},dispatch} = useAppContext()!;
    return (
        <div className = "absolute bottom-0 left-0 right-0 flex bg-gray-800 p-2 justify-between">
            <Button 
            icon ={themeMode === "light" ? MdDarkMode : MdLightMode}
            variant = "text"
            onClick={() => {
                const newTheme = themeMode === "dark" ? "light" : "dark";
                console.log("切换主题到:", newTheme);
                dispatch({
                    type:ActionType.UPDATE,
                    field:"themeMode",
                    value:newTheme
                });
            }}
            ></Button>

             <Button 
            icon ={MdInfo}
            variant = "text"
            
            ></Button>
        </div>
    );
}