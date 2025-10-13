import React, { useMemo } from "react";
import { Chat } from "@/types/chat";
import ChatItem from "./ChatItem";
import { groupByDate } from "@/common/util";

export default function ChatList() {
  const [chatList, setChatList] = React.useState<Chat[]>([
    { id: "1", title: "Chat 1", updateTime: Date.now() },
    { id: "2", title: "Chat 2", updateTime: Date.now() },
    { id: "3", title: "Chat 3", updateTime: Date.now() },
    { id: "4", title: "Chat 4", updateTime: Date.now() - 86400000 },
    { id: "5", title: "Chat 5", updateTime: Date.now() - 86400000 * 2 },
    { id: "6", title: "Chat 6", updateTime: Date.now() - 86400000 * 10 },
    { id: "7", title: "Chat 7", updateTime: Date.now() - 86400000 * 20 },
    { id: "8", title: "Chat 8", updateTime: Date.now() - 86400000 * 40 },
    { id: "9", title: "Chat 9", updateTime: Date.now() - 86400000 * 400 },
    { id: "10", title: "Chat 10", updateTime: Date.now() - 86400000 * 800 },
    { id: "11", title: "Chat 11", updateTime: Date.now() - 86400000 * 1000 },
    { id: "12", title: "Chat 12", updateTime: Date.now() - 86400000 * 2000 },
    { id: "13", title: "Chat 13", updateTime: Date.now() - 86400000 * 3000 },
    { id: "14", title: "Chat 14", updateTime: Date.now() - 86400000 * 5000 },
    { id: "15", title: "Chat 15", updateTime: Date.now() - 86400000 * 8000 },
    { id: "16", title: "Chat 16", updateTime: Date.now() - 86400000 * 10000 },
    { id: "17", title: "Chat 17", updateTime: Date.now() - 86400000 * 15000 },
    { id: "18", title: "Chat 18", updateTime: Date.now() - 86400000 * 20000 },
    { id: "19", title: "Chat 19", updateTime: Date.now() - 86400000 * 30000 },
    { id: "20", title: "Chat 20", updateTime: Date.now() - 86400000 * 50000 },
  ]);

  const [selectedChat, setSelectedChat] = React.useState<Chat>();
  const groupList = useMemo(() => {
    return groupByDate(chatList);
  }, [chatList]);

  return (
    <div className="flex-1 mt-2 flex flex-col overflow-y-auto mb-[48px]">
      {groupList.map(([date, chatList]) => {
        return (
          <div key={date}>
            <div className="sticky top-0 z-10 p-3 text-sm bg-gray-900 text-gray">
              {date}
            </div>
            <ul>
              {chatList.map((chat) => {
                const isSelected = selectedChat?.id === chat.id;
                return (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={isSelected}
                    onSelected={(chat) => {
                      setSelectedChat(chat);
                    }}
                  />
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
