'use client';
import { useState } from "react";
import Board from "./Board";

export default function Game() {
    const [marks, setMarks] = useState(Array(9).fill('')); // 9个格子，初始值为空字符串
    const [history, setHistory] = useState([Array(9).fill('')]);
    const [currentMove, setCurrentMove] = useState(0);
    const currentMarks = history[currentMove];
    const isXNext = currentMove % 2 === 0; // X先手，偶数步是X，奇数步是O
    const winner = calculateWinner(marks);


    let value = isXNext ? 'X' : 'O';
    let hasOver = false;
    let status;

    if (winner) {
        status = "Winner: " + winner;
        } else {
        status = "Next player: " + (isXNext ? "X" : "O");
    }

    const moves = history.map((marks, move) => {
        let description;
        if (move > 0) {
        description = 'Go to move #' + move;
        } else {
        description = 'Go to game start';
        }
        return (
        <li key = {move}>
            <button className="" onClick={() => jumpTo(move)}>{description}</button>
        </li>
        );
    });
    
    function handlePlay(nextSquares: string[]) {
        if(calculateWinner(marks)){
            hasOver = true;
            return;
        }

        const nextHistory = [...history.slice(0,currentMove+1), nextSquares];
        setHistory(nextHistory);
        setMarks(nextSquares);
        setCurrentMove(nextHistory.length - 1);
    }
    
    function jumpTo(nextMove : number) {
     setCurrentMove(nextMove);
    }
     function calculateWinner(marks: string[]) {
        const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (marks[a] && marks[a] === marks[b] && marks[a] === marks[c]) {
            return marks[a];
        }
        }
        return null;
    } 

    return(
        <>
            <div className="status mb-4 text-xl">{status}</div>
            <div>
                <Board value = {value} marks = {currentMarks} hasOver = {hasOver} handlePlay = {handlePlay}/>
            </div>

            <div>
                <ol>{moves}</ol>
            </div>
        </>
    )
}