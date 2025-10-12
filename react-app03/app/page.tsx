"use client"
import Navigation from "../components/Navigation";
import Main from "../components/home/Main";
import { useAppContext } from "../components/AppContext";

export default function Home() {
  return (
    <div  className={`h-full flex`}>
      <Navigation/>
      <Main/>
    </div>
  );
}
