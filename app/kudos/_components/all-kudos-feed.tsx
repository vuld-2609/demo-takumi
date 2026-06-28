/**
 * AllKudosFeed — the vertical list of KudosPostCards (C.2). The "ALL KUDOS"
 * section header lives in kudos-board so the cards align with the sidebar top.
 * Empty state → kudos.emptyKudos.
 * Server component — KudosPostCard is also a server component with client children.
 */

import { useTranslations } from "next-intl";
import type { BoardKudos } from "@/lib/kudos/types";
import KudosPostCard from "./kudos-post-card";

interface AllKudosFeedProps {
  items: BoardKudos[];
  onSendKudo: (receiverId: string) => void;
}

export default function AllKudosFeed({ items, onSendKudo }: AllKudosFeedProps) {
  const t = useTranslations("kudos");

  if (items.length === 0) {
    return <p className="text-sm text-white/40">{t("emptyKudos")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((kudos) => (
        <KudosPostCard key={kudos.id} kudos={kudos} onSendKudo={onSendKudo} />
      ))}
    </div>
  );
}
