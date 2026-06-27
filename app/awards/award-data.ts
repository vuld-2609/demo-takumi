/**
 * Static metadata for the 6 SAA 2025 award categories (screen zFYDgyj_pD).
 * Display copy (title, description, unit, prize notes) lives in i18n under
 * `awardSystem.*`; only locale-independent values (image, quantity number,
 * prize amounts) are kept here. `note` keys map to `awardSystem.prizeNotes.*`.
 */
export type AwardPrize = {
  /** Locale-independent amount, e.g. "7.000.000 VNĐ". */
  value: string;
  /** Key into `awardSystem.prizeNotes` (perAward | individual | team | none). */
  note: "perAward" | "individual" | "team" | "none";
};

export type Award = {
  /** Key into `awardSystem.nav` / `awardSystem.awards` and the section anchor id. */
  key: string;
  /** Basename of the visual in /public/awards (without extension). */
  image: string;
  /** Quantity number shown next to the unit, e.g. "10", "02". */
  quantity: string;
  /** Key into `awardSystem.units` for the quantity unit. */
  unit: "individual" | "team" | "individualOrTeam";
  prizes: AwardPrize[];
};

export const AWARDS: Award[] = [
  {
    key: "topTalent",
    image: "award-top-talent",
    quantity: "10",
    unit: "individual",
    prizes: [{ value: "7.000.000 VNĐ", note: "perAward" }],
  },
  {
    key: "topProject",
    image: "award-top-project",
    quantity: "02",
    unit: "team",
    prizes: [{ value: "15.000.000 VNĐ", note: "perAward" }],
  },
  {
    key: "topProjectLeader",
    image: "award-top-project-leader",
    quantity: "03",
    unit: "individual",
    prizes: [{ value: "7.000.000 VNĐ", note: "perAward" }],
  },
  {
    key: "bestManager",
    image: "award-best-manager",
    quantity: "01",
    unit: "individual",
    prizes: [{ value: "10.000.000 VNĐ", note: "none" }],
  },
  {
    key: "signature",
    image: "award-signature-2025",
    quantity: "01",
    unit: "individualOrTeam",
    prizes: [
      { value: "5.000.000 VNĐ", note: "individual" },
      { value: "8.000.000 VNĐ", note: "team" },
    ],
  },
  {
    key: "mvp",
    image: "award-mvp",
    quantity: "01",
    unit: "individual",
    prizes: [{ value: "15.000.000 VNĐ", note: "none" }],
  },
];
