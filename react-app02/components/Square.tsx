
interface SquareProps {
    value: string;
    onSquareClick: () => void;
}

export default function Square({ value, onSquareClick }: SquareProps) {
    
    const buttonClass = "w-full h-full text-4xl font-bold border border-gray-400 flex items-center justify-center hover:bg-gray-100";
  return(
     <button 
     className = {buttonClass}
     onClick = {onSquareClick}
     >{value}</button>
  )
}