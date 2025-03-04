export function getLastWord(str) {
  const match = str.match(/\b\w+$/);
  return match ? match[0] : null;
}
