import { useContext } from "solid-js";
import { GlobalContext } from "../context/GlobalContext";

export default function Header() {
  const { global, setGlobal, code } = useContext(GlobalContext);

  return (
    <header class="h-12 bg-slate-400">
      <div class="container mx-auto flex justify-between items-center h-full">
        <a href="/" class="text-white text-lg font-bold">
          GoPG
        </a>
      </div>
    </header>
  );
}
