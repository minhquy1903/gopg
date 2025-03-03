import { createEffect, onMount, createSignal } from "solid-js";
import * as monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { helloWorld } from "../constant/template";

const IMPORTED_PACKAEG = {
  EXIST: true,
  NOT_EXIST: false,
};

self.MonacoEnvironment = {
  getWorker(_, label) {
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
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Check if the user is typing "fm"
        const match = textUntilPosition.match(/fm/);
        if (!match) {
          return { suggestions: [] };
        }

        // Get the entire code
        const fullText = model.getValue();

        // Check if there is an existing import block
        const additionalTextEdits = [];
        const importBlockRegex =
          /import\s*\(\s*([\s\S]*?)\s*\)|import\s+"([^"]+)"/g;

        const importedPackages = getImportedPackages(
          importBlockRegex,
          fullText,
        );

        console.log("adsa", importedPackages);

        switch (Boolean(importedPackages.length)) {
          case IMPORTED_PACKAEG.EXIST:
            if (importedPackages.find((el) => el === "fmt")) {
              break;
            }
            importedPackages.push("fmt");
            // If an import block exists, append the new package to it
            const importBlockRange = findImportBlockRange(fullText);

            const newImports = importedPackages.reduce((s, item, index) => {
              if (index === importedPackages.length - 1) return `${s}"${item}"`;
              return `${s}"${item}"\n\t`;
            }, "");

            additionalTextEdits.push({
              range: importBlockRange,
              text: `import (\n\t${newImports}\n)`,
            });
            break;
          case IMPORTED_PACKAEG.NOT_EXIST:
            // If no import block exists, create a new one
            const insertPosition = findInsertPosition(fullText);
            additionalTextEdits.push({
              range: new monaco.Range(
                insertPosition.line + 1,
                1,
                insertPosition.line + 1,
                1,
              ),
              text: 'import (\n\t"fmt"\n)\n\n',
            });
            break;
          default:
            return;
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
      const importBlockRegex =
        /import\s*\(\s*([\s\S]*?)\s*\)|import\s+"([^"]+)"/g;
      const match = text.match(importBlockRegex);

      if (match) {
        const start = text.indexOf(match[0]);
        const end = start + match[0].length;

        const linesBefore = text.substring(0, start).split("\n");
        const startLine = linesBefore.length;
        const startColumn = linesBefore[linesBefore.length - 1].length + 1;
        const linesAfter = text.substring(0, end).split("\n");
        const endLine = linesAfter.length;
        const endColumn = linesAfter[linesAfter.length - 1].length + 1;
        return new monaco.Range(startLine, startColumn, endLine, endColumn);
      }
      return null;
    }

    function getImportedPackages(regex, code) {
      const matches = [];
      let match;
      while ((match = regex.exec(code)) !== null) {
        if (match[2]) {
          matches.push(match[2]); // Single-line import
        } else if (match[1]) {
          const multiLineImports = match[1].match(/"([^"]+)"/g) || [];
          matches.push(...multiLineImports.map((pkg) => pkg.replace(/"/g, ""))); // Multi-line import
        }
      }

      return matches;
    }

    // Helper function to find the position to insert a new import block
    function findInsertPosition(text) {
      const packageLineRegex = /package\s+\w+/;
      const match = text.match(packageLineRegex);
      if (match) {
        const lines = text.split("\n");
        const packageLineIndex = lines.findIndex((line) =>
          line.match(packageLineRegex),
        );

        return { line: packageLineIndex + 2, column: 1 }; // Insert after the package line
      }
      return { line: 3, column: 1 }; // Default to the top of the file
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
