import { createEffect, onMount, createSignal } from "solid-js";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

import {
  packageCompletionProvider,
  keywordCompeletionProvider,
} from "../monaco-provider";
import { HELLO_WORLD } from "../constant/";

self.MonacoEnvironment = {
  getWorker(_, label) {
    return new editorWorker();
  },
};

const apiRunCode = (code) => {
  fetch("http://localhost:8000/api/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/text",
    },
    body: code,
  })
    .then((res) => res.text())
    .then((data) => {
      console.log(data);
    });
};

export default function Monaco() {
  const [theme, setTheme] = createSignal("vs-dark");

  let editor;

  onMount(() => {
    const editorRef = document.getElementById("editor");
    editor = monaco.editor.create(editorRef, {
      language: "go",
      value: HELLO_WORLD,
    });

    editor.updateOptions({
      fontSize: 16,
      tabSize: 4,
      insertSpaces: true,
      theme: theme,
    });

    monaco.languages.registerCompletionItemProvider("go", {
      provideCompletionItems: packageCompletionProvider,
    });

    // Register a completion provider for Go
    monaco.languages.registerCompletionItemProvider("go", {
      provideCompletionItems: keywordCompeletionProvider,
    });
  });

  createEffect(() => {
    editor.updateOptions({
      theme: theme(),
    });
  });

  const changeTheme = (e) => {
    setTheme(e.target.value);
  };

  const runCode = () => {
    apiRunCode(editor.getValue());
  };

  return (
    <>
      <nav class="pr-20">
        <ul class="flex space-x-4 justify-end">
          <li>
            <select
              onChange={(e) => changeTheme(e)}
              name="theme-select"
              id="theme-select"
            >
              Theme
              <option value="vs">Light</option>
              <option value="vs-dark">Dark</option>
            </select>
          </li>
          <li>
            <button
              onClick={() => {
                runCode();
              }}
            >
              Run
            </button>
          </li>
          <li>
            <button>Share</button>
          </li>
          <li>
            <button>Capture</button>
          </li>
          <li>
            <button>Format</button>
          </li>
          <li>
            <select name="template-select" id="template-select">
              Theme
              <option value="hello_world"></option>
              <option value="http">HTTP</option>
              <option value="tcp">TCP</option>
            </select>
          </li>
        </ul>
      </nav>
      <div
        id="editor"
        style={{
          height: "1000px",
          width: "100vw",
        }}
      ></div>
    </>
  );
}
