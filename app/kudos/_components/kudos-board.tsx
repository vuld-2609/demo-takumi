"use client";

/**
 * KudosBoard — client shell that owns the compose-dialog state and wires the
 * "Gửi KUDO" / input-pill actions across the banner, Highlight section and feed.
 * All data is fetched on the server and passed in via props.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { BoardData } from "@/lib/kudos/types";
import KudosBanner from "./kudos-banner";
import HighlightSection from "./highlight-section";
import SpotlightBoard from "./spotlight-board";
import AllKudosFeed from "./all-kudos-feed";
import KudosSidebar from "./kudos-sidebar";
import ComposeDialog from "./compose-dialog";

type Receiver = { id: string; displayName: string };

interface KudosBoardProps {
  data: BoardData;
  receivers: Receiver[];
}

export default function KudosBoard({ data, receivers }: KudosBoardProps) {
  const tk = useTranslations("kudos");
  const [composeOpen, setComposeOpen] = useState(false);
  const [receiver, setReceiver] = useState<Receiver | undefined>(undefined);
  // Bumped on each open so ComposeDialog remounts with fresh field state.
  const [composeKey, setComposeKey] = useState(0);

  /** Input pill → compose with a free receiver picker. */
  function openCompose() {
    setReceiver(undefined);
    setComposeKey((k) => k + 1);
    setComposeOpen(true);
  }

  /** "Gửi KUDO" on a hover card → compose with that person preselected. */
  function sendKudoTo(receiverId: string) {
    setReceiver(receivers.find((r) => r.id === receiverId));
    setComposeKey((k) => k + 1);
    setComposeOpen(true);
  }

  return (
    <>
      <KudosBanner onCompose={openCompose} />

      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-16 px-4 pb-24 pt-12">
        <HighlightSection
          items={data.highlight}
          hashtagOptions={data.hashtagOptions}
          departmentOptions={data.departmentOptions}
          onSendKudo={sendKudoTo}
        />

        <SpotlightBoard data={data.spotlight} />

        {/* All Kudos: header above, then feed (≈680px) aligned with sidebar (422px) */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <p className="m-0 text-sm font-medium text-[#FFEA9E]">{tk("awardsCaption")}</p>
            <h2
              className="m-0 text-3xl font-bold uppercase tracking-wide text-[#FFEA9E]"
              style={{ textShadow: "0 0 6px #FAE287" }}
            >
              {tk("allKudosTitle")}
            </h2>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-[50px]">
            <div className="min-w-0 flex-1 lg:max-w-[680px]">
              <AllKudosFeed items={data.feed} onSendKudo={sendKudoTo} />
            </div>
            <div className="w-full shrink-0 lg:w-[422px]">
              <KudosSidebar
                stats={data.stats}
                rankUps={data.rankUps}
                giftReceivers={data.giftReceivers}
              />
            </div>
          </div>
        </section>
      </main>

      <ComposeDialog
        key={composeKey}
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        receiver={receiver}
        receivers={receivers}
      />
    </>
  );
}
