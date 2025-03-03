import { ALL_GO_PKG } from "../constant/allGoPackage";
import {
  IMPORT_BLOCK_REGEX,
  IMPORTED_PACKAEG,
  PACKAGE_LINE_REGEX,
} from "../constant/monaco";
import * as monaco from "monaco-editor";

export function packageCompletionProvider(model, position) {
  let textUntilPosition = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: 0,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  });

  textUntilPosition = getLastWord(textUntilPosition);

  const matchPkg = ALL_GO_PKG.filter(({ name }) =>
    name.startsWith(textUntilPosition),
  );

  if (!Boolean(matchPkg.length)) {
    return { suggestions: [] };
  }

  // Get the entire code
  const fullText = model.getValue();

  // Check if there is an existing import block

  const importedPackages = getImportedPackages(IMPORT_BLOCK_REGEX, fullText);
  const importBlockRange = findImportBlockRange(fullText);
  const insertPosition = findInsertPosition(fullText);

  const suggestions = matchPkg.map(({ name, path }) => {
    const additionalTextEdits = [];

    switch (Boolean(importedPackages.length)) {
      case IMPORTED_PACKAEG.EXIST:
        const currentImportedPackages = [...importedPackages];
        if (currentImportedPackages.find((el) => el === path)) {
          break;
        }
        currentImportedPackages.push(path);
        currentImportedPackages.sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" }),
        );

        // If an import block exists, append the new package to it
        const newImports = currentImportedPackages.reduce((s, item, index) => {
          if (index === currentImportedPackages.length - 1)
            return `${s}"${item}"`;
          return `${s}"${item}"\n\t`;
        }, "");

        additionalTextEdits.push({
          range: importBlockRange,
          text: `import (\n\t${newImports}\n)`,
        });
        break;
      case IMPORTED_PACKAEG.NOT_EXIST:
        // If no import block exists, create a new one
        additionalTextEdits.push({
          range: new monaco.Range(
            insertPosition.line + 1,
            1,
            insertPosition.line + 1,
            1,
          ),
          text: `import (\n\t"${path}"\n)\n\n`,
        });
        break;
      default:
        return;
    }

    return {
      label: name,
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: name,
      detail: `Package ${name}`,
      documentation:
        "Package fmt implements formatted I/O with functions analogous to C's printf and scanf.",
      range: new monaco.Range(
        position.lineNumber,
        position.column - textUntilPosition.length,
        position.lineNumber,
        position.column,
      ),
      additionalTextEdits: additionalTextEdits,
    };
  });

  return {
    suggestions: suggestions,
  };
}

// Helper function to get all the imported packages as an array
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

// Helper function to find the range of the existing import block
function findImportBlockRange(text) {
  const match = text.match(IMPORT_BLOCK_REGEX);

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

// Helper function to find the position to insert a new import block
function findInsertPosition(text) {
  const match = text.match(PACKAGE_LINE_REGEX);
  if (match) {
    const lines = text.split("\n");
    const packageLineIndex = lines.findIndex((line) =>
      line.match(PACKAGE_LINE_REGEX),
    );

    return { line: packageLineIndex + 2, column: 1 }; // Insert after the package line
  }
  return { line: 3, column: 1 }; // Default to the top of the file
}

function getLastWord(str) {
  const match = str.match(/\b\w+$/);
  return match ? match[0] : null;
}
