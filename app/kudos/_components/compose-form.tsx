"use client";

/**
 * ComposeForm — the scrollable inner body of the Viết Kudo modal.
 * Rendered by ComposeDialog; split here to keep each file under 200 lines.
 */

import type { Receiver } from "./recipient-autocomplete";
import RecipientAutocomplete from "./recipient-autocomplete";
import RichTextEditor from "./rich-text-editor";
import HashtagInput from "./hashtag-input";
import ImageUploader from "./image-uploader";

interface MentionUser { id: string; displayName: string }

export interface ComposeFormState {
  selectedReceiver: Receiver | null;
  title: string;
  messageHtml: string;
  hashtags: string[];
  images: File[];
  isAnonymous: boolean;
  anonymousName: string;
}

interface ComposeFormProps {
  state: ComposeFormState;
  onChange: <K extends keyof ComposeFormState>(key: K, val: ComposeFormState[K]) => void;
  showErrors: boolean;
  serverError: string | null;
  effectiveReceiver: Receiver | null | undefined;
  plainText: string;
  receivers: Receiver[];
  mentionableUsers: MentionUser[];
  hashtagSuggestions: string[];
  preselected?: Receiver;
}

function FieldRow({
  label,
  required,
  children,
  errorMsg,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  errorMsg?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-4">
        <span className="w-28 shrink-0 pt-3.5 text-sm font-bold text-gray-800">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      {errorMsg && <p className="ml-32 text-xs text-red-500">{errorMsg}</p>}
    </div>
  );
}

export default function ComposeForm({
  state,
  onChange,
  showErrors,
  serverError,
  effectiveReceiver,
  plainText,
  receivers,
  mentionableUsers,
  hashtagSuggestions,
  preselected,
}: ComposeFormProps) {
  const { selectedReceiver, title, messageHtml, hashtags, images, isAnonymous, anonymousName } = state;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Người nhận */}
      <FieldRow
        label="Người nhận"
        required
        errorMsg={showErrors && !effectiveReceiver ? "Vui lòng chọn người nhận" : null}
      >
        <RecipientAutocomplete
          options={receivers}
          value={selectedReceiver}
          onSelect={(r) => onChange("selectedReceiver", r)}
          placeholder="Tìm kiếm"
          hasError={showErrors && !effectiveReceiver}
          preselected={preselected}
        />
      </FieldRow>

      {/* 2. Danh hiệu */}
      <FieldRow
        label="Danh hiệu"
        required
        errorMsg={showErrors && !title.trim() ? "Vui lòng nhập danh hiệu" : null}
      >
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Dành tặng một danh hiệu cho đồng đội"
            className="h-14 w-full rounded-lg px-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#998C5F]"
            style={{
              background: "#fff",
              border: `1px solid ${showErrors && !title.trim() ? "#D4271D" : "#998C5F"}`,
            }}
          />
          <p className="text-xs text-gray-500">Ví dụ: Người truyền động lực cho tôi.</p>
          <p className="text-xs text-gray-500">Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.</p>
        </div>
      </FieldRow>

      {/* 3. Rich-text message */}
      <div className="flex flex-col gap-1.5">
        <RichTextEditor
          value={messageHtml}
          onChange={(html) => onChange("messageHtml", html)}
          hasError={showErrors && plainText.length === 0}
          mentionableUsers={mentionableUsers}
        />
        {showErrors && plainText.length === 0 && (
          <p className="text-xs text-red-500">Vui lòng nhập nội dung</p>
        )}
        <p className="text-sm font-medium text-gray-700">
          Bạn có thể &ldquo;@ + tên&rdquo; để nhắc tới đồng nghiệp khác
        </p>
      </div>

      {/* 4. Hashtag */}
      <FieldRow
        label="Hashtag"
        required
        errorMsg={showErrors && hashtags.length === 0 ? "Vui lòng thêm ít nhất 1 hashtag" : null}
      >
        <HashtagInput
          suggestions={hashtagSuggestions}
          tags={hashtags}
          onChange={(t) => onChange("hashtags", t)}
          hasError={showErrors && hashtags.length === 0}
        />
      </FieldRow>

      {/* 5. Image */}
      <FieldRow label="Image">
        <ImageUploader files={images} onChange={(f) => onChange("images", f)} />
      </FieldRow>

      {/* 6. Anonymous */}
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer select-none items-center gap-3">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => onChange("isAnonymous", e.target.checked)}
            className="h-4 w-4 rounded border-gray-400 accent-[#998C5F]"
          />
          <span className="text-sm text-gray-700">Gửi lời cám ơn và ghi nhận ẩn danh</span>
        </label>
        {isAnonymous && (
          <input
            type="text"
            value={anonymousName}
            onChange={(e) => onChange("anonymousName", e.target.value)}
            placeholder="Tên hiển thị ẩn danh"
            className="ml-7 h-10 w-full max-w-sm rounded-lg border border-[#998C5F] bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#998C5F]"
          />
        )}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
    </div>
  );
}
