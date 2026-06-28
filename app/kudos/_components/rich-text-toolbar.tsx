"use client";

/**
 * RichTextToolbar — formatting toolbar for the rich-text editor.
 * Buttons: Bold, Italic, Strikethrough, Ordered List, Link, Blockquote.
 * The link button opens LinkInsertDialog instead of window.prompt.
 * Also renders the "Tiêu chuẩn cộng đồng" link on the right.
 */

import { useState } from "react";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  ListNumberedIcon,
  LinkIcon,
  QuoteIcon,
} from "@/app/_components/home/icons";
import LinkInsertDialog from "./link-insert-dialog";

type FormatCommand =
  | "bold"
  | "italic"
  | "strikeThrough"
  | "insertOrderedList"
  | "formatBlock";

const BUTTONS: {
  cmd: FormatCommand;
  arg?: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}[] = [
  { cmd: "bold", label: "Đậm (Bold)", Icon: BoldIcon },
  { cmd: "italic", label: "Nghiêng (Italic)", Icon: ItalicIcon },
  { cmd: "strikeThrough", label: "Gạch ngang", Icon: StrikethroughIcon },
  { cmd: "insertOrderedList", label: "Danh sách có thứ tự", Icon: ListNumberedIcon },
  { cmd: "formatBlock", arg: "blockquote", label: "Trích dẫn", Icon: QuoteIcon },
];

function execFmt(cmd: FormatCommand, arg?: string) {
  try {
    document.execCommand(cmd, false, arg ?? "");
  } catch {
    // execCommand may throw in sandboxed envs; fail silently
  }
}

interface RichTextToolbarProps {
  /** Ref to the editor div — needed to read selection text for the link dialog. */
  editorRef: React.RefObject<HTMLDivElement | null>;
  onFormat: () => void; // called after each command so parent can re-read innerHTML
}

export default function RichTextToolbar({ editorRef, onFormat }: RichTextToolbarProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [selectionText, setSelectionText] = useState("");

  function handleFormatClick(cmd: FormatCommand, arg?: string) {
    execFmt(cmd, arg);
    onFormat();
  }

  function handleLinkButtonMouseDown(e: React.MouseEvent) {
    // Save selection BEFORE the button steals focus from the editor
    e.preventDefault();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      setSavedSelection(range.cloneRange());
      setSelectionText(sel.toString());
    } else {
      setSavedSelection(null);
      setSelectionText("");
    }
    setLinkDialogOpen(true);
  }

  function restoreSelection(range: Range | null) {
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function handleLinkSave(url: string, text: string) {
    setLinkDialogOpen(false);
    // Re-focus editor and restore selection, then insert link HTML
    editorRef.current?.focus();
    restoreSelection(savedSelection);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
      // Wrap selected text
      try { document.execCommand("createLink", false, url); } catch { /* noop */ }
    } else {
      // Insert link node at caret
      const range = sel?.getRangeAt(0) ?? null;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.textContent = text;
      if (range) {
        range.deleteContents();
        range.insertNode(anchor);
        const after = document.createRange();
        after.setStartAfter(anchor);
        after.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(after);
      } else {
        editorRef.current?.appendChild(anchor);
      }
    }
    onFormat();
  }

  return (
    <>
      <div
        className="flex items-center border-b px-2"
        style={{ borderColor: "#E5DFC8", minHeight: 44 }}
      >
        <div className="flex items-center gap-0.5">
          {BUTTONS.map(({ cmd, arg, label, Icon }) => (
            <button
              key={cmd + (arg ?? "")}
              type="button"
              aria-label={label}
              title={label}
              onMouseDown={(e) => {
                e.preventDefault(); // keep editor focus
                handleFormatClick(cmd, arg);
              }}
              className="flex h-8 w-8 items-center justify-center rounded text-gray-600 hover:bg-[#FFFAE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
            >
              <Icon size={16} />
            </button>
          ))}

          {/* Link button — opens dialog instead of prompt */}
          <button
            type="button"
            aria-label="Chèn link"
            title="Chèn link"
            onMouseDown={handleLinkButtonMouseDown}
            className="flex h-8 w-8 items-center justify-center rounded text-gray-600 hover:bg-[#FFFAE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
          >
            <LinkIcon size={16} />
          </button>
        </div>

        <div className="ml-auto">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-medium text-red-500 hover:underline"
          >
            Tiêu chuẩn cộng đồng
          </a>
        </div>
      </div>

      {linkDialogOpen && (
        <LinkInsertDialog
          initialText={selectionText}
          onSave={handleLinkSave}
          onClose={() => setLinkDialogOpen(false)}
        />
      )}
    </>
  );
}
