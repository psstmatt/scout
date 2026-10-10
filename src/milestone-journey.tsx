"use client";

import { useEffect, useId, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { currentMilestone, getMilestoneJourney, initialPlayback, milestoneDate, milestoneMeta, milestoneStateLabel, milestoneSummary, playbackReducer, type Milestone, type MilestoneKind } from "./milestone-data";

export function MilestoneMark({ kind, className = "" }: { kind: MilestoneKind; className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === "contact" && <><circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" /><path d="M10 9a9 9 0 0 0 0 14M22 9a9 9 0 0 1 0 14M6 5a15 15 0 0 0 0 22M26 5a15 15 0 0 1 0 22" /></>}
    {kind === "nda" && <><path d="M9 5h10l5 5v6M19 5v6h5M9 5H7v22h6" /><rect x="15" y="19" width="12" height="10" rx="2" /><path d="M18 19v-3a3 3 0 0 1 6 0v3M21 23v2" /></>}
    {kind === "offer-discussion" && <><path d="M5 6h17v12H12l-6 4v-4H5zM26 12h2v14h-4v4l-6-4h-4v-4" /><path d="M10 11h7M10 14h4" /></>}
    {kind === "written-offer" && <><path d="M8 4h12l5 5v19H8zM19 4v6h6M12 15h9M12 19h9M12 23h5" /><path d="m5 8-2 1 1 2M27 3l1-2M29 7h2" /></>}
    {kind === "signed" && <><path d="m19 6 4 4M11 22l-5 2 2-5L23 4a2.8 2.8 0 0 1 4 4L12 23M4 28h24" /><path d="M15 23c1-4 3-4 3-1 0 2 2 2 3-1 0 3 2 3 4 1" /></>}
    {kind === "starting" && <><path d="M3 24h26M8 24a8 8 0 0 1 16 0M16 3v6M5 9l4 4M27 9l-4 4M3 17l4 1M29 17l-4 1M11 29h10" /><path d="m13 7 3-4 3 4" /></>}
  </svg>;
}

export function MilestoneBadge({ milestones }: { milestones?: readonly Milestone[] }) {
  const current = currentMilestone(milestones);
  if (!current) return null;
  return <span className="milestone-badge" data-kind={current.kind} data-state={current.state}>
    <MilestoneMark kind={current.kind} /><span>{milestoneSummary(current)}</span>
  </span>;
}

export function MilestoneJourney({ milestones, company }: { milestones?: readonly Milestone[]; company: string }) {
  const journey = getMilestoneJourney(milestones);
  if (journey.length === 0) return null;
  return <JourneyPlayer key={`${company}-${journey.length}`} journey={journey} company={company} />;
}

function JourneyPlayer({ journey, company }: { journey: readonly Milestone[]; company: string }) {
  const current = currentMilestone(journey)!;
  const [playback, dispatch] = useReducer(playbackReducer, { ...initialPlayback(journey.length), index: journey.indexOf(current) });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasReplayed, setHasReplayed] = useState(false);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headingId = useId();
  const frameId = useId();
  const moment = journey[playback.index];
  const meta = milestoneMeta[moment.kind];
  const isLatest = playback.index === journey.length - 1;
  const hasHistory = journey.length > 1;
  const upcoming = journey.slice(journey.indexOf(current) + 1).find((item) => item.state !== "complete");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) dispatch({ type: "pause" });
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playback.playing || reducedMotion) return;
    const timer = window.setTimeout(() => dispatch({ type: "tick", count: journey.length }), 5500);
    return () => window.clearTimeout(timer);
  }, [playback.playing, playback.index, journey.length, reducedMotion]);

  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) dispatch({ type: "pause" }); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  function select(index: number, focus = false) {
    const nextIndex = Math.max(0, Math.min(index, journey.length - 1));
    dispatch({ type: "select", index: nextIndex, count: journey.length });
    if (focus) nodeRefs.current[nextIndex]?.focus();
  }

  function onTrackKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = index + 1;
    if (event.key === "ArrowLeft") nextIndex = index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = journey.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    select(nextIndex, true);
  }

  function togglePlayback() {
    if (playback.playing) dispatch({ type: "pause" });
    else if (hasReplayed && !reducedMotion && !isLatest) dispatch({ type: "resume", count: journey.length });
    else { setHasReplayed(true); dispatch({ type: "replay", reducedMotion }); }
  }

  const playbackLabel = reducedMotion ? "Review journey" : playback.playing ? "Pause replay" : hasReplayed && !isLatest ? "Continue replay" : "Replay journey";

  return <section className="milestone-journey" aria-labelledby={headingId} data-kind={moment.kind} data-playing={playback.playing}>
    <header className="journey-heading">
      <h2 id={headingId}>Journey</h2>
      <span className="journey-current" data-kind={current.kind}><span>Now</span><span>{milestoneSummary(current)}</span></span>
    </header>

    <div className="journey-frame" id={frameId} aria-live="polite" aria-atomic="true">
      <div className="journey-scene" key={`${playback.index}-${moment.kind}`}>
        <div className="milestone-seal" data-state={moment.state}>
          <span className="seal-orbit" aria-hidden="true" />
          <MilestoneMark kind={moment.kind} />
          <span className="seal-state" aria-hidden="true">{moment.state === "complete" ? "✓" : moment.state === "scheduled" ? "◷" : "·"}</span>
        </div>
        <div className="journey-title">
          <p>{meta.title} <span>· {milestoneStateLabel[moment.state]}</span></p>
          <h3>{moment.label}</h3>
          <span className="journey-moment-date">{moment.date ? <time dateTime={moment.date}>{milestoneDate(moment.date)}</time> : <span>Date to confirm</span>}<span aria-hidden="true"> / </span><span>{moment.state !== "complete" ? "Up next" : moment === current ? "Latest recorded milestone" : "Earlier in the journey"}</span></span>
        </div>
      </div>
      <p className="journey-detail">{moment.detail}</p>
      {meta.note && <p className="journey-note">{meta.note}</p>}
      <span className="sr-only">Milestone {playback.index + 1} of {journey.length} for {company}.</span>
    </div>

    {upcoming && <div className="journey-up-next"><span>Up next</span><span>{upcoming.label}<span className="journey-up-next-date">{milestoneStateLabel[upcoming.state]}{upcoming.date ? ` · ${milestoneDate(upcoming.date)}` : " · Date to confirm"}</span></span></div>}

    {hasHistory && <>
      <ol className="journey-track" aria-label="Recorded milestones, oldest to newest">
        {journey.map((item, index) => <li key={`${item.kind}-${item.date}-${index}`} data-kind={item.kind} data-state={item.state} data-active={index === playback.index} data-past={index < playback.index}>
          <button ref={(node) => { nodeRefs.current[index] = node; }} onClick={() => select(index)} onKeyDown={(event) => onTrackKey(event, index)} aria-current={index === playback.index ? "step" : undefined} aria-controls={frameId} aria-label={`${index + 1} of ${journey.length}: ${item.label}. ${milestoneStateLabel[item.state]}. ${milestoneDate(item.date)}`}>
            <span className="journey-node"><MilestoneMark kind={item.kind} /></span>
            <span className="journey-node-label">{milestoneMeta[item.kind].track}</span>
          </button>
        </li>)}
      </ol>
      <div className="journey-controls">
        <button className="journey-replay" onClick={togglePlayback} aria-controls={frameId} aria-label={`${playbackLabel} for ${company}`}><span aria-hidden="true">{reducedMotion ? "↶" : playback.playing ? "Ⅱ" : "▷"}</span>{playbackLabel}</button>
        <div className="journey-step-controls" role="group" aria-label="Step through journey">
          <button onClick={() => select(playback.index - 1)} disabled={playback.index === 0} aria-label="Previous milestone" aria-controls={frameId}>←</button>
          <span aria-label={`Milestone ${playback.index + 1} of ${journey.length}`}>{String(playback.index + 1).padStart(2, "0")}<span aria-hidden="true"> / </span>{String(journey.length).padStart(2, "0")}</span>
          <button onClick={() => select(playback.index + 1)} disabled={isLatest} aria-label="Next milestone" aria-controls={frameId}>→</button>
        </div>
      </div>
      {reducedMotion && <p className="journey-motion-note">Motion off. Step through at your own pace.</p>}
    </>}
  </section>;
}
