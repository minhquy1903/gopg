import { useContext } from "solid-js";
import { GlobalContext } from "../context/GlobalContext";

export default function Header() {
  const { global, setGlobal } = useContext(GlobalContext);

  const changeTheme = (e) => {
    setGlobal("theme", e.target.value);
  };

  const runCode = () => {
    console.log("run code");
  };

  return (
    <header class="h-12 bg-slate-400">
      <div class="container mx-auto flex justify-between items-center h-full">
        <a href="/" class="text-white text-lg font-bold">
          GoPG
        </a>
        <nav>
          <ul class="flex space-x-4">
            <ul>
              <select
                onChange={(e) => changeTheme(e)}
                name="theme-select"
                id="theme-select"
              >
                Theme
                <option value="vs">Light</option>
                <option value="vs-dark">Dark</option>
              </select>
            </ul>
            <ul>
              <button onClick={() => {}}>Run</button>
            </ul>
            <ul>
              <button>Share</button>
            </ul>
            <ul>
              <button>Capture</button>
            </ul>
            <ul>
              <button>Format</button>
            </ul>
            <ul>
              <select name="template-select" id="template-select">
                Theme
                <option value="hello_world">Hello world</option>
                <option value="http">HTTP</option>
                <option value="tcp">TCP</option>
              </select>
            </ul>
          </ul>
        </nav>
      </div>
    </header>
  );
}
