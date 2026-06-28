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

interface MentionUser { id: string; displayName: string; avatarUrl?: string; rank?: string }

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

  const missingReceiver = !effectiveReceiver;
  const missingMessage = plainText.length === 0;
  const missingHashtag = hashtags.length === 0;
  const missingAnonymousName = isAnonymous && !anonymousName.trim();

  const showCombinedError = showErrors && (missingReceiver || missingMessage || missingHashtag || missingAnonymousName);

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Người nhận */}
      <FieldRow
        label="Người nhận"
        required
        errorMsg={showErrors && missingReceiver ? "Vui lòng chọn người nhận" : null}
      >
        <RecipientAutocomplete
          options={receivers}
          value={selectedReceiver}
          onSelect={(r) => onChange("selectedReceiver", r)}
          placeholder="Tìm kiếm"
          hasError={showErrors && missingReceiver}
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
          hasError={showErrors && missingMessage}
          mentionableUsers={mentionableUsers}
        />
        {showErrors && missingMessage && (
          <p className="text-xs text-red-500">Vui lòng nhập nội dung</p>
        )}
      </div>

      {/* 4. Hashtag */}
      <FieldRow
        label="Hashtag"
        required
        errorMsg={showErrors && missingHashtag ? "Vui lòng thêm ít nhất 1 hashtag" : null}
      >
        <HashtagInput
          suggestions={hashtagSuggestions}
          tags={hashtags}
          onChange={(t) => onChange("hashtags", t)}
          hasError={showErrors && missingHashtag}
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
          <div className="ml-7 flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700">
              Nickname ẩn danh<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              type="text"
              value={anonymousName}
              onChange={(e) => onChange("anonymousName", e.target.value)}
              placeholder="Tên hiển thị ẩn danh"
              className="h-10 w-full max-w-sm rounded-lg px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#998C5F]"
              style={{
                background: "#fff",
                border: `1px solid ${showErrors && missingAnonymousName ? "#D4271D" : "#998C5F"}`,
              }}
            />
            {showErrors && missingAnonymousName && (
              <p className="text-xs text-red-500">Vui lòng nhập nickname ẩn danh</p>
            )}
          </div>
        )}
      </div>

      {/* Combined validation message — shown above footer buttons */}
      {showCombinedError && (
        <p className="rounded-lg px-3 py-2 text-sm font-medium text-red-600" style={{ background: "#FFF0F0" }}>
          Bạn cần điền đủ Người nhận, Lời nhắn gửi và Hashtag để gửi Kudos!
        </p>
      )}

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
    </div>
  );
}
