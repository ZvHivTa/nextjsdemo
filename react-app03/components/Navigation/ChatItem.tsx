import React, { useEffect, useState } from "react";
import { Chat } from "@/types/chat";
import { PiChatBold, PiTrashBold } from "react-icons/pi";
import { AiOutlineEdit } from "react-icons/ai";
import { MdCheck, MdClose, MdDeleteOutline } from "react-icons/md";

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelected: (chat: Chat) => void;
}
export default function ChatItem(ChatItemProps: ChatItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleting,setDeleting] = useState(false);
  useEffect(()=>{
    setEditing(false);
    setDeleting(false);
  },[ChatItemProps.isSelected])
  return (
    <li
      key={ChatItemProps.chat.id}
      className={`flex items-center p-3 hover:bg-gray-800 rounded space-x-3 cursor-pointer
                                    ${
                                      ChatItemProps.isSelected
                                        ? "bg-gray-800 pr-[3.5em]"
                                        : ""
                                    }`}
      onClick={() => ChatItemProps.onSelected(ChatItemProps.chat)}
    >
      <div>
        {deleting?<PiTrashBold/>:<PiChatBold />}
      </div>

      {/* 输入框和正常的标题只能显现一个 */}
      {ChatItemProps.isSelected && editing ? (
        <input
        autoFocus = {true}
          className="flex-1 min-w-0 bg-transparent outline-none"
          defaultValue={ChatItemProps.chat.title}
        ></input>
      ) : (
        <div className="relative flex-1 whitespace-nowrap overflow-hidden">
          {ChatItemProps.chat.title}
          <span
            className={`relative right-0 inset-y-0 w-8 from-gray-900 bg-gradient-to-l
                                        ${
                                          ChatItemProps.isSelected
                                            ? "from-gray-800"
                                            : "from-gray-900"
                                        }`}
          ></span>
        </div>
      )}

      {ChatItemProps.isSelected && (
        <div className="absolute right-1 flex">
          {editing || deleting ? (
            <>
              <button
                onClick={(e) => {
                    if(deleting){
                        console.log("deleted")
                    }else{
                        console.log("edited")
                    }
                  setEditing(false);
                  setDeleting(false);
                  e.stopPropagation();
                }}
                className="p-1 hover:text-white"
              >
                <MdCheck />
              </button>
              <button
                onClick={(e) => {
                  setEditing(false);
                  setDeleting(false);
                  e.stopPropagation();
                }}
                className="p-1 hover:text-white"
              >
                <MdClose />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  setEditing(true);
                  // 事件冒泡，网页中，当一个元素上的事件被触发时，该事件会首先在该元素上执行。
                  // 然后，这个事件会依次向它的父元素、祖父元素，直到 document 对象和 window 对象“冒泡”或“传播”上去。
                  // 调用 e.stopPropagation() 会立即停止这个事件在 DOM 树中的进一步传播
                  e.stopPropagation();
                }}
                className="p-1 hover:text-white"
              >
                <AiOutlineEdit />
              </button>
              <button onClick={(e) => {
                  setDeleting(false);
                  e.stopPropagation();
                }} className="p-1 hover:text-white">
                <MdDeleteOutline />
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
