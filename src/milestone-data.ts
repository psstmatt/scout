/** A source-verified event, never a step inferred from a recruiting stage. */
export type MilestoneKind = "contact" | "nda" | "offer-discussion" | "written-offer" | "signed" | "starting";
export type Milestone = {
  kind: MilestoneKind;
  /** ISO day, or a timestamp. Omit when a pending milestone has no confirmed date. */
  date?: string;
  label: string;
  detail: string;
  state: "complete" | "scheduled" | "pending";
};

export const milestoneMeta: Record<MilestoneKind, { title: string; track: string; note?: string }> = {
  contact: { title: "Contact", track: "Contact" },
  nda: { title: "Confidentiality", track: "NDA", note: "An NDA covers confidentiality. It does not indicate an employment offer." },
  "offer-discussion": { title: "Offer conversation", track: "Discussion", note: "Written offers and employment acceptance are separate milestones." },
  "written-offer": { title: "Written offer", track: "Offer", note: "A written offer is recorded here. Acceptance is a separate milestone." },
  signed: { title: "Employment commitment", track: "Signed" },
  starting: { title: "New beginning", track: "Start" },
};

export const milestoneStateLabel: Record<Milestone["state"], string> = {
  complete: "Recorded",
  scheduled: "Scheduled",
  pending: "Pending",
};

/** Preserve the author's chronological ordering, including undated pending events. */
export function getMilestoneJourney(milestones?: readonly Milestone[]): readonly Milestone[] {
  return milestones ?? [];
}

export function currentMilestone(milestones?: readonly Milestone[]): Milestone | undefined {
  const latest = milestones?.[milestones.length - 1];
  if (!latest || !milestones) return undefined;
  const significance: Record<MilestoneKind, number> = { contact: 0, nda: 1, "offer-discussion": 2, "written-offer": 3, signed: 4, starting: 5 };
  // Later logistical contact does not erase a recorded NDA or employment step.
  const achieved = milestones.filter((item) => item.state === "complete")
    .reduce<Milestone | undefined>((best, item) => !best || significance[item.kind] >= significance[best.kind] ? item : best, undefined);
  if (!achieved) return latest;
  // An upcoming start or signature must not become an achieved commitment.
  if (latest.state !== "complete" && (latest.kind === "starting" || latest.kind === "signed")) return achieved;
  // A scheduled offer conversation is meaningful without implying an offer exists.
  return significance[latest.kind] > significance[achieved.kind] ? latest : achieved;
}

export function milestoneSummary(milestone: Milestone): string {
  const summaries: Record<MilestoneKind, Record<Milestone["state"], string>> = {
    contact: { complete: "In conversation", scheduled: "Contact scheduled", pending: "Contact pending" },
    nda: { complete: "NDA signed", scheduled: "NDA scheduled", pending: "NDA pending" },
    "offer-discussion": { complete: "Offer discussed", scheduled: "Offer discussion scheduled", pending: "Offer discussion pending" },
    "written-offer": { complete: "Written offer received", scheduled: "Written offer scheduled", pending: "Written offer pending" },
    signed: { complete: "Signed", scheduled: "Signing scheduled", pending: "Signature pending" },
    starting: { complete: "Started", scheduled: "Start scheduled", pending: "Start pending" },
  };
  // Authored labels preserve signed versus accepted, and avoid implying that a
  // completed contact is still an active conversation after a closed process.
  if ((milestone.kind === "signed" || milestone.kind === "contact") && milestone.state === "complete") return milestone.label;
  return summaries[milestone.kind][milestone.state];
}

export function milestoneDate(date?: string): string {
  if (!date) return "Date to confirm";
  const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const parsed = new Date(dayOnly ? `${date}T12:00:00Z` : date);
  if (Number.isNaN(parsed.getTime())) return "Date to confirm";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: dayOnly ? "UTC" : "America/Los_Angeles" });
}

export type PlaybackState = { index: number; playing: boolean };
export type PlaybackAction =
  | { type: "replay"; reducedMotion: boolean }
  | { type: "pause" }
  | { type: "resume"; count: number }
  | { type: "select"; index: number; count: number }
  | { type: "tick"; count: number };

export function initialPlayback(count: number): PlaybackState {
  return { index: Math.max(0, count - 1), playing: false };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case "replay": return { index: 0, playing: !action.reducedMotion };
    case "pause": return { ...state, playing: false };
    case "resume": return { ...state, playing: state.index < action.count - 1 };
    case "select": return { index: Math.max(0, Math.min(action.index, action.count - 1)), playing: false };
    case "tick": {
      if (!state.playing) return state;
      const index = Math.min(state.index + 1, Math.max(0, action.count - 1));
      return { index, playing: index < action.count - 1 };
    }
  }
}
