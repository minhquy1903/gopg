import { createContext, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export const GlobalContext = createContext();

export default function GlobalContextProvider(props) {
  const [global, setGlobal] = createStore({
    theme: "vs",
  });

  const [code, setCode] = createSignal("");

  return (
    <GlobalContext.Provider value={{ global, setGlobal, code, setCode }}>
      {props.children}
    </GlobalContext.Provider>
  );
}
