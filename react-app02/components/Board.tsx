
import Square from './Square';

interface BoardProps {
  value: string;
  hasOver: boolean;
  marks: string[];
  handlePlay: (nextSquares:string[]) => void;
}

export default function Board({value, hasOver, marks, handlePlay}: BoardProps) {
  
  function handleClick(i: number) {
    if(marks[i] !== ''|| hasOver){
      return; // 如果格子已经有标记，直接返回
    }
    const nextMarks = marks.slice();
    nextMarks[i] = value;
    handlePlay(nextMarks);
  }

 

  return(
    <>
    
      {/* // 使用 grid 网格布局，3列，中间间隙为 0 */}
      <div className="grid grid-cols-3 gap-0 w-64 h-64 border border-gray-400">  
        {/* 棋子按钮：用 w-full h-full 填满各自的网格单元 */}
          <Square value={marks[0]} onSquareClick = {()=>handleClick(0)}/>
          <Square value={marks[1]} onSquareClick = {()=>handleClick(1)}/>
          <Square value={marks[2]} onSquareClick = {()=>handleClick(2)}/>
          <Square value={marks[3]} onSquareClick = {()=>handleClick(3)}/>
          <Square value={marks[4]} onSquareClick = {()=>handleClick(4)}/>
          <Square value={marks[5]} onSquareClick = {()=>handleClick(5)}/>
          <Square value={marks[6]} onSquareClick = {()=>handleClick(6)}/>
          <Square value={marks[7]} onSquareClick = {()=>handleClick(7)}/>
          <Square value={marks[8]} onSquareClick = {()=>handleClick(8)}/>
      </div>
    </>
  )
}