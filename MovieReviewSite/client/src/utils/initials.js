// Shared movie title initials — skips articles "The", "A", "An"
export function getInitials(title) {
  if (!title) return '?';
  const cleaned = title.replace(/^(The|A|An)\s+/i, '');
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}
