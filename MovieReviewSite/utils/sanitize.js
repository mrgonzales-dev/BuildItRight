// Regex-based HTML tag stripper. Not a full sanitizer, but prevents
// stored XSS from user-submitted text fields (names, comments, etc.).
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

module.exports = { stripHtml };
