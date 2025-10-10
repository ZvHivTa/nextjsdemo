import Image from "next/image";
import Board from "@/components/Board";
import Game from "@/components/Game";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <Game/>
    </main>
  );
}
