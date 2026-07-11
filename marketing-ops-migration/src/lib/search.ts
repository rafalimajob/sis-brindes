function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Every whitespace-separated word in `query` must appear somewhere in
// `parts`, in any order, accent-insensitive.
export function matchesSearch(parts: (string | null | undefined)[], query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize(parts.filter(Boolean).join(" "));
  return q.split(/\s+/).every((word) => haystack.includes(word));
}
