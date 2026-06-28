"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getViewerProfileId, getHoverCard } from "@/lib/kudos/queries";
import { sanitizeKudoHtml, htmlToPlainText } from "@/lib/kudos/sanitize-html";
import {
  MAX_KUDO_HASHTAGS,
  MAX_KUDO_IMAGES,
  MAX_KUDO_IMAGE_BYTES,
  MAX_KUDO_TITLE_LENGTH,
  MAX_HASHTAG_LENGTH,
  type HoverCardData,
} from "@/lib/kudos/types";

// Mime → file extension (don't trust the user-supplied file name for the ext).
const IMAGE_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
};

/** Upload up to MAX_KUDO_IMAGES attachments to Storage, return public URLs.
 * Skips any file with a disallowed mime type, oversized, or that fails to upload. */
async function uploadKudoImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  for (const [i, file] of files.slice(0, MAX_KUDO_IMAGES).entries()) {
    const ext = IMAGE_EXT_BY_TYPE[file.type];
    if (!ext) continue; // disallowed mime type
    if (file.size > MAX_KUDO_IMAGE_BYTES) continue; // oversized
    const path = `${profileId}/${Date.now()}-${i}.${ext}`;
    const { error } = await supabase.storage
      .from("kudos-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("uploadKudoImages failed:", error.message);
      continue;
    }
    urls.push(supabase.storage.from("kudos-images").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

/** Resolve the caller's own profile id, or null if unauthenticated / no profile. */
async function currentProfileId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getViewerProfileId(user.id);
}

/**
 * Toggle the current user's heart on a kudos. One heart per (kudos, user);
 * a sender cannot heart their own kudos. Returns the new like state + count.
 * RLS (0001) only lets a user insert/delete their OWN heart row.
 */
export async function toggleHeart(
  kudosId: string,
): Promise<{ liked: boolean; heartCount: number }> {
  const supabase = await createClient();
  const profileId = await currentProfileId();
  if (!profileId) return { liked: false, heartCount: await countHearts(kudosId) };

  // Guard: cannot heart your own kudos.
  const { data: kudos } = await supabase
    .from("kudos")
    .select("sender_id")
    .eq("id", kudosId)
    .maybeSingle();
  if (!kudos || kudos.sender_id === profileId) {
    return { liked: false, heartCount: await countHearts(kudosId) };
  }

  const { data: existing } = await supabase
    .from("kudos_hearts")
    .select("kudos_id")
    .eq("kudos_id", kudosId)
    .eq("user_id", profileId)
    .maybeSingle();

  let liked: boolean;
  if (existing) {
    const { error } = await supabase
      .from("kudos_hearts")
      .delete()
      .eq("kudos_id", kudosId)
      .eq("user_id", profileId);
    liked = error ? true : false; // delete failed → still liked
  } else {
    const { error } = await supabase
      .from("kudos_hearts")
      .insert({ kudos_id: kudosId, user_id: profileId });
    liked = !error; // insert failed → not liked
  }

  const heartCount = await countHearts(kudosId);
  revalidatePath("/kudos");
  return { liked, heartCount };
}

async function countHearts(kudosId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("kudos_hearts")
    .select("*", { count: "exact", head: true })
    .eq("kudos_id", kudosId);
  return count ?? 0;
}

/**
 * Create a kudos from the current user to a receiver. RLS (0002) enforces
 * that sender_id maps to the caller's own profile.
 *
 * `message` is rich-text HTML from the editor — it is sanitized (XSS) before
 * persistence. Required: receiver, title, non-empty content, 1–5 hashtags.
 * Images (max 5, jpg/png) are uploaded to Storage; URLs are stored on the row.
 */
export async function createKudos(input: {
  receiverId: string;
  title: string;
  message: string;
  hashtags: string[];
  images?: File[];
  isAnonymous?: boolean;
  anonymousName?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const profileId = await currentProfileId();
  if (!profileId) return { ok: false, error: "unauthenticated" };

  if (!input.receiverId) return { ok: false, error: "no_receiver" };
  // Cannot send a kudos to yourself.
  if (input.receiverId === profileId) return { ok: false, error: "self_kudos" };

  const title = input.title.trim().slice(0, MAX_KUDO_TITLE_LENGTH);
  if (!title) return { ok: false, error: "empty_title" };

  const messageHtml = sanitizeKudoHtml(input.message);
  if (!htmlToPlainText(messageHtml)) return { ok: false, error: "empty_message" };

  // Normalize hashtags: strip leading '#', trim, length-cap, drop blanks, de-dupe, cap count.
  const hashtags = Array.from(
    new Set(
      input.hashtags
        .map((h) => h.replace(/^#/, "").trim().slice(0, MAX_HASHTAG_LENGTH))
        .filter(Boolean),
    ),
  ).slice(0, MAX_KUDO_HASHTAGS);
  if (hashtags.length === 0) return { ok: false, error: "no_hashtag" };

  const isAnonymous = Boolean(input.isAnonymous);
  const anonymousName = isAnonymous ? (input.anonymousName?.trim() || null) : null;

  const supabase = await createClient();

  const images = input.images?.length
    ? await uploadKudoImages(supabase, profileId, input.images)
    : [];

  const { error } = await supabase.from("kudos").insert({
    sender_id: profileId,
    receiver_id: input.receiverId,
    title,
    message: messageHtml,
    hashtags,
    images,
    is_anonymous: isAnonymous,
    anonymous_name: anonymousName,
  });
  if (error) {
    // Log full detail server-side; return an opaque code (never leak DB internals).
    console.error("createKudos failed:", error.message);
    return { ok: false, error: "server_error" };
  }

  revalidatePath("/kudos");
  return { ok: true };
}

/** Lazily load avatar hover-card data (called from the client on hover). */
export async function loadHoverCard(profileId: string): Promise<HoverCardData | null> {
  return getHoverCard(profileId);
}
