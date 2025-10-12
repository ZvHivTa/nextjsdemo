import Button from "@/components/common/Button";
import { HiPlus } from "react-icons/hi";
import { LuPanelLeft } from "react-icons/lu";
import { useAppContext } from "../AppContext";
import { ActionType } from "@/reducers/Appreducer";

export default function Menubar() {
    const {dispatch} = useAppContext()!;
    return (
        <div className = "flex space-x-3 w-full">
            <Button 
            icon ={HiPlus}
            variant = "outline"
            className = "flex-1"
            >新建对话</Button>

             <Button 
            icon ={LuPanelLeft}
            variant = "outline"
            
            onClick={() => {
                dispatch({
                    type:ActionType.UPDATE,
                    field:"displayNavigation",
                    value:false
                })
            }}></Button>
        </div>
    );
}