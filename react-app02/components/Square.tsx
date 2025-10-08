'use client';
import { useState } from "react";

interface SquareProps {
    value: string;
}

export default function Square({value}: SquareProps,onSquareClick: () => void) {
    const [mark, setMark] = useState<string | null>(null);

    const buttonClass = "w-full h-full text-4xl font-bold border border-gray-400 flex items-center justify-center hover:bg-gray-100";
    function handleClick() {
        setMark('X');
    }
  return(
     <button 
     className = {buttonClass}
     onClick = {handleClick}
     >{value}</button>
  )
}