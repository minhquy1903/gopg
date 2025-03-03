import { languages } from "monaco-editor";
import { GO_KEYWORD, GO_PRIMITIVE_TYPE } from "../constant";

export function keywordCompeletionProvider() {
  const suggestions = [];

  // Add keywords
  GO_KEYWORD.forEach((keyword) => {
    suggestions.push({
      label: keyword,
      kind: languages.CompletionItemKind.Keyword,
      insertText: keyword,
    });
  });

  // Add primitive types
  GO_PRIMITIVE_TYPE.forEach((type) => {
    suggestions.push({
      label: type,
      kind: languages.CompletionItemKind.TypeParameter,
      insertText: type,
    });
  });

  return { suggestions };
}
