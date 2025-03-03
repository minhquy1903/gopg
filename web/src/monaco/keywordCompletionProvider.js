import { languages } from "monaco-editor";

export function keywordCompeletionProvider() {
  const suggestions = [];

  // Add keywords
  goKeywords.forEach((keyword) => {
    suggestions.push({
      label: keyword,
      kind: languages.CompletionItemKind.Keyword,
      insertText: keyword,
    });
  });

  // Add primitive types
  goPrimitiveTypes.forEach((type) => {
    suggestions.push({
      label: type,
      kind: languages.CompletionItemKind.TypeParameter,
      insertText: type,
    });
  });

  return { suggestions };
}
