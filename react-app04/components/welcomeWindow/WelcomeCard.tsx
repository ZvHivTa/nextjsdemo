"use client";

import { useEffect, useMemo, useState } from "react";

const welcomeMessage = [
  "我们先从哪里开始呢？",
  "今天有什么计划？",
  "时刻准备着。",
  "您今天在想什么？",
  "一得阁拉米你怎么这么自私！",
];


  //欢迎界面展示
  export default function WelcomeCard() {

   // 使用 useState 存储消息，初始值为 null 或一个占位符
    const [displayedMessage, setDisplayedMessage] = useState<string | null>(null); 

    // 使用 useEffect 来设置随机消息
    useEffect(() => {
        // 这段代码保证只在客户端（浏览器）环境运行一次，即组件挂载时
        const randomIndex = Math.floor(Math.random() * welcomeMessage.length);
        setDisplayedMessage(welcomeMessage[randomIndex]);
    }, []); // 依赖项为空数组 []，确保只运行一次

  
    return (
      <div className="relative basis-auto flex-col shrink flex flex-col justify-end max-sm:grow max-sm:justify-center sm:min-h-[42svh]">
        <div className="flex justify-center">
          <div className="px-1 text-pretty whitespace-pre-wrap">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center">{displayedMessage}</h1>
          </div>
        </div>
      </div>
    );
  }