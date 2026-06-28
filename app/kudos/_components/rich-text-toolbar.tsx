"use client";

/**
 * RichTextToolbar — formatting toolbar for the rich-text editor.
 * Buttons: Bold, Italic, Strikethrough, Ordered List, Link, Blockquote.
 * Uses document.execCommand (still cross-browser; wrapped in try/catch).
 * Also renders the "Tiêu chuẩn cộng đồng" link on the right.
 */

import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  ListNumberedIcon,
  LinkIcon,
  QuoteIcon,
} from "@/app/_components/home/icons";

type FormatCommand =
  | "bold"
  | "italic"
  | "strikeThrough"
  | "insertOrderedList"
  | "createLink"
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
  { cmd: "createLink", label: "Chèn link", Icon: LinkIcon },
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
  onFormat: () => void; // called after each command so parent can re-read innerHTML
}

export default function RichTextToolbar({ onFormat }: RichTextToolbarProps) {
  function handleClick(cmd: FormatCommand, arg?: string) {
    if (cmd === "createLink") {
      const url = window.prompt("Nhập URL:");
      if (url) execFmt("createLink", url);
    } else {
      execFmt(cmd, arg);
    }
    onFormat();
  }

  return (
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
              handleClick(cmd, arg);
            }}
            className="flex h-8 w-8 items-center justify-center rounded text-gray-600 hover:bg-[#FFFAE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
          >
            <Icon size={16} />
          </button>
        ))}
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
  );
}
