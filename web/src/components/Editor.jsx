import { createEffect, onMount, createSignal } from "solid-js";
import * as monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { helloWorld } from "../constant/template";

self.MonacoEnvironment = {
  getWorker(_, label) {
    console.log("label: ", label);
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

const apiRunCode = (code) => {
  fetch("http://localhost:8000/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: code,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
};

export default function Monaco() {
  const [theme, setTheme] = createSignal("vs");

  let editor;

  onMount(() => {
    const editorRef = document.getElementById("editor");
    editor = monaco.editor.create(editorRef, {
      language: "go",
      value: helloWorld,
    });

    editor.updateOptions({
      fontSize: 16,
      tabSize: 4,
      insertSpaces: true,
      theme: theme,
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
              <option value="hello_world">Hello world</option>
              <option value="http">HTTP</option>
              <option value="tcp">TCP</option>
            </select>
          </li>
        </ul>
      </nav>
      <div
        id="editor"
        style={{
          height: "600px",
          width: "100vw",
        }}
      ></div>
    </>
  );
}
