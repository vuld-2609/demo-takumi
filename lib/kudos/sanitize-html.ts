/**
 * Conservative server-side sanitizer for the Kudo rich-text editor output.
 *
 * The compose modal stores `contentEditable` innerHTML (bold/italic/strike/lists/
 * link/quote + @mention spans). That HTML is later rendered on board cards, so it
 * MUST be sanitized before persistence to prevent stored XSS.
 *
 * Strategy (allowlist): drop <script>/<style> with their contents, then re-emit
 * only allowed tags, stripping every attribute except a validated href on <a>
 * and class="mention" on <span>. Disallowed tags are removed but their text is kept.
 *
 * NOTE: This is a dependency-free allowlist suitable for an internal app. For a
 * public-facing product, prefer a vetted library (e.g. DOMPurify/sanitize-html).
 */

const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "s", "strike", "u",
  "ol", "ul", "li", "blockquote", "p", "br", "span", "a",
]);

/** Tags whose inner content must be discarded entirely, not just unwrapped. */
const STRIP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript)\b[\s\S]*?<\/\1\s*>/gi;

function safeHref(raw: string): string | null {
  // Strip ALL whitespace and control chars (incl. embedded newlines/tabs) before
  // the protocol test so "https://ok\njavascript:..." cannot slip past.
  const value = raw.replace(/[\s\x00-\x1F]/g, "").replace(/&amp;/g, "&");
  // Only allow absolute http(s) and mailto links; block javascript:, data:, etc.
  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value;
  return null;
}

/** Escape a bare attribute value for safe re-insertion. */
function escapeAttr(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sanitizeKudoHtml(input: string): string {
  if (!input) return "";

  // 1. Remove dangerous element blocks (tag + content) and HTML comments.
  let html = input.replace(STRIP_WITH_CONTENT, "").replace(/<!--[\s\S]*?-->/g, "");

  // 2. Rewrite every remaining tag through the allowlist.
  html = html.replace(/<\/?([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (match, rawName, rawAttrs) => {
    const name = String(rawName).toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return ""; // drop tag, keep surrounding text
    const isClosing = match.startsWith("</");
    if (isClosing) return `</${name}>`;
    if (name === "br") return "<br>";

    // <a> keeps a validated href; <span> keeps only class="mention" (for @mentions).
    if (name === "a") {
      const hrefMatch = String(rawAttrs).match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const rawHref = hrefMatch ? hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? "" : "";
      const href = safeHref(rawHref);
      return href
        ? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer nofollow">`
        : "<a>";
    }
    if (name === "span") {
      return /class\s*=\s*("mention"|'mention'|mention)\b/i.test(String(rawAttrs))
        ? `<span class="mention">`
        : "<span>";
    }
    return `<${name}>`;
  });

  return html.trim();
}

/** Plain-text projection of the editor HTML — used for the required-field check. */
export function htmlToPlainText(input: string): string {
  return sanitizeKudoHtml(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
