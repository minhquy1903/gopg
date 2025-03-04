import { getLastWord } from "../utils";

export function inferCompletionProvider(model, position) {
  console.log("inferCompletionProvider");
  const textBeforeCursor = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: position.column - 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  });
  console.log("inferCompletionProvider", { textBeforeCursor });

  // Only suggest if the previous character is "."
  if (textBeforeCursor !== ".") {
    return { suggestions: [] };
  }

  const suggestions = [
    {
      label: "Println",
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'Println(${1:"Hello"})',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: "Printf",
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'Printf(${1:"%s"}, ${2:value})',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
  ];

  return { suggestions };
}
