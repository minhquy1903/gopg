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

    monaco.languages.registerCompletionItemProvider("go", {
      provideCompletionItems: function (model, position) {
        var textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Check if the user is typing "fm"
        var match = textUntilPosition.match(/fm/);
        if (!match) {
          return { suggestions: [] };
        }

        // Get the entire code
        var fullText = model.getValue();

        // Check if there is an existing import block
        var importBlockRegex = /import\s*\(\s*([^)]+)\s*\)/;
        var importBlockMatch = fullText.match(importBlockRegex);

        var additionalTextEdits = [];
        if (importBlockMatch) {
          // If an import block exists, append the new package to it
          var importBlockRange = findImportBlockRange(fullText);
          var existingImports = importBlockMatch[1].trim();
          var newImports = existingImports + '\n\t"fmt"';

          additionalTextEdits.push({
            range: importBlockRange,
            text: `import (\n\t${newImports}\n)`,
          });
        } else {
          // If no import block exists, create a new one
          var insertPosition = findInsertPosition(fullText);
          additionalTextEdits.push({
            range: new monaco.Range(
              insertPosition.line,
              1,
              insertPosition.line,
              1,
            ),
            text: 'import (\n\t"fmt"\n)\n\n',
          });
        }

        return {
          suggestions: [
            {
              label: "fmt",
              kind: monaco.languages.CompletionItemKind.Module,
              insertText: "fmt",
              detail: "Package fmt",
              documentation:
                "Package fmt implements formatted I/O with functions analogous to C's printf and scanf.",
              range: new monaco.Range(
                position.lineNumber,
                position.column - match[0].length,
                position.lineNumber,
                position.column,
              ),
              additionalTextEdits: additionalTextEdits,
            },
          ],
        };
      },
    });

    // Helper function to find the range of the existing import block
    function findImportBlockRange(text) {
      var importBlockRegex = /import\s*\(\s*([^)]+)\s*\)/;
      var match = text.match(importBlockRegex);
      if (match) {
        var start = text.indexOf(match[0]);
        var end = start + match[0].length;
        var linesBefore = text.substring(0, start).split("\n");
        var startLine = linesBefore.length;
        var startColumn = linesBefore[linesBefore.length - 1].length + 1;
        var linesAfter = text.substring(0, end).split("\n");
        var endLine = linesAfter.length;
        var endColumn = linesAfter[linesAfter.length - 1].length + 1;
        return new monaco.Range(startLine, startColumn, endLine, endColumn);
      }
      return null;
    }

    // Helper function to find the position to insert a new import block
    function findInsertPosition(text) {
      var packageLineRegex = /package\s+\w+/;
      var match = text.match(packageLineRegex);
      if (match) {
        var lines = text.split("\n");
        var packageLineIndex = lines.findIndex((line) =>
          line.match(packageLineRegex),
        );
        return { line: packageLineIndex + 2, column: 1 }; // Insert after the package line
      }
      return { line: 1, column: 1 }; // Default to the top of the file
    }
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
          height: "1000px",
          width: "100vw",
        }}
      ></div>
    </>
  );
}
