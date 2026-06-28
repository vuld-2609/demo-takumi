"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getViewerProfileId, getHoverCard } from "@/lib/kudos/queries";
import type { HoverCardData } from "@/lib/kudos/types";

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
    await supabase.from("kudos_hearts").delete().eq("kudos_id", kudosId).eq("user_id", profileId);
    liked = false;
  } else {
    await supabase.from("kudos_hearts").insert({ kudos_id: kudosId, user_id: profileId });
    liked = true;
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
 */
export async function createKudos(input: {
  receiverId: string;
  message: string;
  hashtags: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const profileId = await currentProfileId();
  if (!profileId) return { ok: false, error: "unauthenticated" };

  const message = input.message.trim();
  if (!message) return { ok: false, error: "empty_message" };
  if (!input.receiverId) return { ok: false, error: "no_receiver" };
  // Cannot send a kudos to yourself.
  if (input.receiverId === profileId) return { ok: false, error: "self_kudos" };

  const supabase = await createClient();
  const { error } = await supabase.from("kudos").insert({
    sender_id: profileId,
    receiver_id: input.receiverId,
    message,
    hashtags: input.hashtags.filter(Boolean),
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
