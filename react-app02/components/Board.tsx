
import Square from './Square';
import { useState } from 'react'; 

export default function Board() {
  const [marks, setMarks] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // true表示下一个是X，false表示下一个是O
  function handleClick() {
    value = isXNext ? 'X' : 'O';
    setIsXNext(!isXNext);
  }
  return(
     // 使用 grid 网格布局，3列，中间间隙为 0
    <div className="grid grid-cols-3 gap-0 w-64 h-64 border border-gray-400">
      
      {/* 棋子按钮：用 w-full h-full 填满各自的网格单元 */}
        <Square value={marks[0]} />
        <Square value={marks[1]} />
        <Square value={marks[2]} />
        <Square value={marks[3]} />
        <Square value={marks[4]} />
        <Square value={marks[5]} />
        <Square value={marks[6]} />
        <Square value={marks[7]} />
        <Square value={marks[8]} />
    </div>
  )
}