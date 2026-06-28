"use client";

/**
 * RichTextEditor — contentEditable editor with formatting toolbar and
 * @mention popup. Toolbar is split into RichTextToolbar to stay < 200 lines.
 * Calls onChange with the current innerHTML on every input event.
 * Shows a "X/1.000" plain-text counter bottom-right; enforces MAX_KUDO_MESSAGE_LENGTH.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import RichTextToolbar from "./rich-text-toolbar";
import { MAX_KUDO_MESSAGE_LENGTH } from "@/lib/kudos/types";

interface MentionUser {
  id: string;
  displayName: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  hasError?: boolean;
  mentionableUsers?: MentionUser[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
  hasError = false,
  mentionableUsers = [],
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPos, setMentionPos] = useState<{ top: number; left: number } | null>(null);
  const [charCount, setCharCount] = useState(() => stripHtml(value).trim().length);

  // Seed initial HTML once — parent remounts via `key` to reset
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      setIsEmpty(false);
      setCharCount(stripHtml(value).trim().length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncChange() {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    const plain = stripHtml(html).trim();
    setIsEmpty(!plain.length);
    setCharCount(plain.length);
    onChange(html === "<br>" ? "" : html);
  }

  function checkMentionTrigger(el: HTMLDivElement) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setMentionOpen(false); return; }
    const range = sel.getRangeAt(0);
    const text = range.startContainer.textContent ?? "";
    const beforeCaret = text.slice(0, range.startOffset);
    const atIdx = beforeCaret.lastIndexOf("@");
    if (atIdx === -1) { setMentionOpen(false); return; }
    const query = beforeCaret.slice(atIdx + 1);
    if (/\s/.test(query)) { setMentionOpen(false); return; }
    setMentionQuery(query);
    const rect = range.getBoundingClientRect();
    const editorRect = el.getBoundingClientRect();
    setMentionPos({ top: rect.bottom - editorRect.top + 4, left: rect.left - editorRect.left });
    setMentionOpen(true);
  }

  function handleInput() {
    syncChange();
    if (editorRef.current) checkMentionTrigger(editorRef.current);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") { setMentionOpen(false); return; }

    // Block typing when at limit (allow navigation/deletion keys)
    const navKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (charCount >= MAX_KUDO_MESSAGE_LENGTH && !navKeys.includes(e.key) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const text = e.clipboardData.getData("text/plain");
    const el = editorRef.current;
    if (!el) return;
    const currentPlain = stripHtml(el.innerHTML).trim();
    const remaining = MAX_KUDO_MESSAGE_LENGTH - currentPlain.length;
    if (remaining <= 0) { e.preventDefault(); return; }
    if (text.length > remaining) {
      e.preventDefault();
      const truncated = text.slice(0, remaining);
      document.execCommand("insertText", false, truncated);
      syncChange();
    }
  }

  const insertMention = useCallback(
    (user: MentionUser) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      const beforeCaret = (node.textContent ?? "").slice(0, range.startOffset);
      const atIdx = beforeCaret.lastIndexOf("@");
      if (atIdx === -1) return;
      const del = document.createRange();
      del.setStart(node, atIdx);
      del.setEnd(node, range.startOffset);
      del.deleteContents();
      const span = document.createElement("span");
      span.textContent = `@${user.displayName} `;
      span.className = "mention";
      del.insertNode(span);
      const after = document.createRange();
      after.setStartAfter(span);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      setMentionOpen(false);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        setIsEmpty(false);
      }
    },
    [onChange],
  );

  const filteredMentions = mentionableUsers.filter((u) =>
    u.displayName.toLowerCase().includes(mentionQuery.toLowerCase()),
  );

  const borderColor = hasError ? "#D4271D" : "#998C5F";
  const atLimit = charCount >= MAX_KUDO_MESSAGE_LENGTH;

  return (
    <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${borderColor}`, background: "#fff" }}>
      <RichTextToolbar
        editorRef={editorRef}
        onFormat={() => {
          editorRef.current?.focus();
          syncChange();
        }}
      />

      <div className="relative">
        {isEmpty && (
          <span className="pointer-events-none absolute left-3 top-3 select-none text-sm text-gray-400" aria-hidden>
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Nội dung Kudo"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="min-h-45 px-3 py-3 text-sm text-gray-700 outline-none"
          style={{ wordBreak: "break-word" }}
        />

        {mentionOpen && filteredMentions.length > 0 && mentionPos && (
          <ul
            role="listbox"
            className="absolute z-50 overflow-auto rounded-lg border border-[#998C5F] bg-white shadow-lg"
            style={{ top: mentionPos.top, left: mentionPos.left, maxHeight: 180, minWidth: 160 }}
          >
            {filteredMentions.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#FFFAE8]"
                >
                  {u.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom row: hint left, counter right */}
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <span className="text-xs text-gray-500">
          Bạn có thể &ldquo;@ + tên&rdquo; để nhắc tới đồng nghiệp khác
        </span>
        <span
          className="shrink-0 text-xs font-medium tabular-nums"
          style={{ color: atLimit ? "#D4271D" : "#6B7280" }}
          aria-live="polite"
          aria-label={`${charCount} / ${MAX_KUDO_MESSAGE_LENGTH.toLocaleString("vi-VN")} ký tự`}
        >
          {charCount.toLocaleString("vi-VN")}/{MAX_KUDO_MESSAGE_LENGTH.toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  );
}
