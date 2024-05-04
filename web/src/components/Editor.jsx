import { createEffect, onMount, useContext } from "solid-js";
import * as monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { GlobalContext } from "../context/GlobalContext";

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

export default function Monaco() {
  const { global } = useContext(GlobalContext);

  let editorObj;
  let editorRef;

  onMount(() => {
    console.log("hello editor");
    editorRef = document.getElementById("editor");
    editorObj = monaco.editor.create(editorRef, { language: "go" });

    monaco.editor.get;
    editorObj.updateOptions({
      fontSize: 16,
      tabSize: 4,
      insertSpaces: true,
      theme: "vs",
    });
    // editorObj.setValue(content())
  });

  createEffect(() => {
    editorObj.updateOptions({
      theme: global.theme,
    });
  });

  return (
    <div
      id="editor"
      style={{
        height: "600px",
        width: "100vw",
      }}
    ></div>
  );
}
