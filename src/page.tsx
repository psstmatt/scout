import { profileLinks } from "./profile-links";
"use client";

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { RoleGeography } from "./role-geography";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSounds } from "./use-sounds";
import { refresh } from "./refresh-metadata";
import { MilestoneBadge, MilestoneJourney } from "./milestone-journey";
import { opportunities, relationshipArchive, stageMeta, statusMeta, type Evidence, type Status } from "./interview-data";

const PipelineSankey = lazy(() => import("./pipeline-sankey").then((module) => ({ default: module.PipelineSankey })));

function evidenceLabel(value: Evidence) {
  if (value === "fact") return "Confirmed";
  if (value === "inference") return "Best next move";
  return "Needs confirmation";
}

export default function Home() {
  const sound = useSounds();
  const inspector = useRef<HTMLElement>(null);
  const totalButton = useRef<HTMLButtonElement>(null);
  const [sankeyOpen, setSankeyOpen] = useState(false);
  const conversationButtons = useRef(new Map<string, HTMLButtonElement>());
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Status[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return opportunities.filter((item) => {
      const statusMatch = activeStatuses.length === 0 || activeStatuses.includes(item.status);
      const haystack = [item.company, item.role, ...item.tags, ...item.people.map((person) => person.name)]
        .join(" ")
        .toLowerCase();
      return statusMatch && (!needle || haystack.includes(needle));
    });
  }, [query, activeStatuses]);

  const selected = selectedId ? opportunities.find((item) => item.id === selectedId) : undefined;
  const ordered = useMemo(() => {
    const priority: Record<Status, number> = { action: 0, signed: 1, scheduled: 2, waiting: 3, paused: 4, unknown: 5, applied: 6, closed: 7 };
    return [...filtered].sort((a, b) => b.lastTouch.localeCompare(a.lastTouch) || priority[a.status] - priority[b.status]);
  }, [filtered]);

  function toggleStatus(status: Status) {
    sound.play("filter");
    setActiveStatuses((current) => current.includes(status)
      ? current.filter((item) => item !== status)
      : [...current, status]);
  }

  function closeInspector() {
    const returnTarget = conversationButtons.current.get(selectedId) ?? totalButton.current;
    setSelectedId(""); sound.play("close");
    requestAnimationFrame(() => returnTarget?.focus());
  }
  useEffect(() => {
    if (selectedId) {
      inspector.current?.scrollTo({ top: 0, behavior: "instant" });
      inspector.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 760px)").matches) inspector.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [selectedId]);
  useEffect(() => {
    if (!selectedId || sankeyOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); const returnTarget = conversationButtons.current.get(selectedId) ?? totalButton.current; setSelectedId(""); requestAnimationFrame(() => returnTarget?.focus()); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, sankeyOpen]);

  function closeSankey() {
    setSankeyOpen(false);
    requestAnimationFrame(() => totalButton.current?.focus());
  }
  function inspectFromSankey(id: string) {
    setSankeyOpen(false);
    setSelectedId(id);
    sound.play("select");
    requestAnimationFrame(() => {
      inspector.current?.scrollTo({ top: 0, behavior: "instant" });
      inspector.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 760px)").matches) inspector.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }

  return (
    <main className="app-shell">
      <header className="masthead">
        <a href="https://psstmatt.com" className="brand">Matt Reynolds <span>/ Scout</span></a>
        <Button variant="scout" size="scout" className="sound-toggle" onClick={sound.toggle} aria-pressed={sound.enabled} aria-label={sound.enabled ? "Mute interaction sounds" : "Enable interaction sounds"}>
          <span aria-hidden="true">{sound.enabled ? "◖))" : "◖×"}</span> Sound {sound.enabled ? "on" : "off"}
        </Button>
      </header>
      <div className="page-heading"><div><p className="eyebrow">Career conversations</p><h1>What&apos;s next.</h1></div>
        <div className="freshness"><time dateTime={refresh.completedAt}>Updated {new Date(refresh.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" })}</time><span>Gmail + Calendar · Pacific time</span></div>
      </div>
      <section className="controls" aria-label="Conversation controls">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <Input className="scout-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company, person, role, or theme" aria-label="Search conversations" />
          {query && <Button variant="scout" size="scout" onClick={() => setQuery("")} aria-label="Clear search">×</Button>}
        </label>
        <div className="filter-group" role="group" aria-label="Filter by status">
          {(Object.keys(statusMeta) as Status[]).map((status) => {
            const active = activeStatuses.includes(status);
            return <Button variant="scout" size="scout" key={status} className={`filter-chip ${active ? "active" : ""}`} onClick={() => toggleStatus(status)} aria-pressed={active}><i style={{ backgroundColor: statusMeta[status].color }} />{statusMeta[status].label}</Button>;
          })}
        </div>
        <Button variant="scout" size="scout" ref={totalButton} className="result-count" aria-haspopup="dialog" aria-expanded={sankeyOpen} aria-label={`Open pipeline Sankey for ${filtered.length} shown conversations`} onClick={() => { sound.play("select"); setSankeyOpen(true); }}><span>{filtered.length} shown</span></Button>
      </section>

      <details className="relationship-archive"><summary>{relationshipArchive.length} other conversations outside role totals</summary><p>Networking and hiring relationships are retained separately.</p><ul>{relationshipArchive.map((item) => <li key={item.id}><strong>{item.company}</strong><span>{item.role}</span></li>)}</ul></details>

      <div className={`workspace-grid ${selected ? "inspecting" : ""}`}>
        <section className="conversation-panel" aria-label="Interview conversations"><div className="list-heading"><span>Conversations</span><span>{filtered.length.toString().padStart(2, "0")}</span></div>
          {ordered.length === 0 ? <div className="empty-list">No conversations match those filters.</div> : ordered.map((item) => (
            <Button variant="scout" size="scout" key={item.id} ref={(node) => { if (node) conversationButtons.current.set(item.id, node); else conversationButtons.current.delete(item.id); }} className={`conversation-row ${selected?.id === item.id ? "selected" : ""}`} aria-pressed={selected?.id === item.id} onClick={() => { setSelectedId(item.id); sound.play("select"); }}>
              <i className="status-dot" style={{ backgroundColor: statusMeta[item.status].color }} />
              <span className="conversation-copy"><strong>{item.company}</strong><small>{item.role}</small><MilestoneBadge milestones={item.milestones} /></span>
              <span className="conversation-state"><strong>{statusMeta[item.status].label}</strong><small className={item.status === "scheduled" ? "schedule-note" : ""}>{item.lastTouchLabel}</small></span>
              <time dateTime={item.lastTouch}>{item.lastTouch.slice(5).replace("-", "/")}</time><span aria-hidden="true">→</span>
            </Button>
          ))}
        </section>

        <aside ref={inspector} data-escape-layer={selected ? "open" : undefined} className="detail-panel" tabIndex={-1} aria-label={selected ? `${selected.company} conversation details` : "Conversation details"}>
          <div className="inspector-top"><span>{selected ? "Inspecting conversation" : "Interview geography"}</span>{selected && <Button variant="scout" size="scout" onClick={closeInspector}>Close ×</Button>}</div>
          {selected && <MilestoneJourney key={selected.id} milestones={selected.milestones} company={selected.company} />}
          <RoleGeography filteredOpportunities={filtered} selectedOpportunityId={selected?.id} onSelectOpportunity={(id) => { setSelectedId(id); sound.play("select"); }} />
          {!selected ? <div className="empty-detail"><h2>{filtered.length === 0 ? "No matching conversations" : "A world of possibilities."}</h2><p>{filtered.length === 0 ? "Try a different search or clear a filter." : "Your next move starts with a conversation."}</p></div> : (<>
            <div className="detail-header">
              <div className="company-avatar" style={{ backgroundColor: statusMeta[selected.status].color }}>{selected.company.slice(0, 2).toUpperCase()}</div>
              <div><div className="status-line"><i style={{ backgroundColor: statusMeta[selected.status].color }} />{statusMeta[selected.status].label} · {stageMeta[selected.stage].label}</div><h2>{selected.company}</h2><p>{selected.role}</p></div>
            </div>
            <section className="signal-card"><span>The read</span><p>{selected.signal}</p></section>
            <section className="next-card">
              <div className="section-label-row"><span>Next move</span><em className={`evidence ${selected.next.evidence}`}>{evidenceLabel(selected.next.evidence)}</em></div>
              <p>{selected.next.action}</p>
              <dl><div><dt>Owner</dt><dd>{selected.next.owner}</dd></div><div><dt>When</dt><dd>{selected.next.due}</dd></div></dl>
            </section>
            <section className="people-section">
              <div className="section-label-row"><span>Who’s who</span><small>{selected.people.length}</small></div>
              <div className="people-list">{selected.people.map((person) => <article className="person-card" key={`${selected.id}-${person.name}`}><i /><div><strong>{profileLinks[person.name] ? <a href={profileLinks[person.name]} target="_blank" rel="noreferrer">{person.name} ↗</a> : person.name}</strong><small>{person.role}</small></div><em>{person.relationship}</em></article>)}</div>
            </section>
            <section className="history-section">
              <div className="section-label-row"><span>What happened</span><small>{selected.moments.length}</small></div>
              <ol>{selected.moments.map((moment, index) => <li key={`${selected.id}-${moment.sortDate}-${index}`}><time>{moment.date}</time><div><strong>{moment.href ? <a href={moment.href} target="_blank" rel="noreferrer">{moment.title}</a> : moment.title}</strong><p>{moment.detail}</p></div>{moment.evidence && <em className={`evidence ${moment.evidence}`}>{evidenceLabel(moment.evidence)}</em>}</li>)}</ol>
            </section>
            <footer className="source-footer"><span>Sources</span><div>{selected.sources.map((source) => <em key={source}>{source}</em>)}</div></footer>
          </>)}
        </aside>
      </div>
      {sankeyOpen && <Suspense fallback={<p role="status" className="pipeline-loading">Opening pipeline overview…</p>}><PipelineSankey filteredOpportunities={filtered} allOpportunities={opportunities} onClose={closeSankey} onSelectOpportunity={inspectFromSankey} scopeLabel={query || activeStatuses.length ? "Current search and filters" : "All conversations"} /></Suspense>}
    </main>
  );
}
