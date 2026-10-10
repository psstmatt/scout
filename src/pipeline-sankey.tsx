"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { buildPipeline, layoutPipeline, pipelineMatches, pipelineStageLabel, pipelineStatusLabel, type PipelineRecord } from "./pipeline-data";

type PipelineSankeyProps = {
  filteredOpportunities: readonly PipelineRecord[];
  allOpportunities: readonly PipelineRecord[];
  onClose: () => void;
  onSelectOpportunity: (id: string) => void;
  scopeLabel?: string;
};

export function PipelineSankey({ filteredOpportunities, allOpportunities, onClose, onSelectOpportunity, scopeLabel }: PipelineSankeyProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scope, setScope] = useState<"filtered" | "all">("filtered");
  const [view, setView] = useState<"diagram" | "list">("diagram");
  const [selectionId, setSelectionId] = useState("total");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const resultsId = useId();
  const graph = useMemo(() => buildPipeline(scope === "all" ? allOpportunities : filteredOpportunities), [scope, allOpportunities, filteredOpportunities]);
  const layout = useMemo(() => layoutPipeline(graph), [graph]);
  const allCount = useMemo(() => new Set(allOpportunities.map((item) => item.id)).size, [allOpportunities]);
  const filteredCount = useMemo(() => new Set(filteredOpportunities.map((item) => item.id)).size, [filteredOpportunities]);
  const entities = [...graph.nodes, ...graph.links];
  const selection = entities.find((item) => item.id === selectionId) ?? graph.nodes[0];
  const preview = entities.find((item) => item.id === previewId) ?? selection;
  const matches = useMemo(() => pipelineMatches(graph, selection.id), [graph, selection.id]);
  const selectedIds = new Set(selection.recordIds);
  const percent = (count: number) => graph.total ? `${Math.round(count / graph.total * 100)}%` : "0%";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  function changeScope(next: "filtered" | "all") {
    setScope(next);
    setSelectionId("total");
    setPreviewId(null);
  }

  function select(id: string) {
    setSelectionId(id);
    setPreviewId(id);
  }

  function activate(event: KeyboardEvent<SVGElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(id);
    }
  }

  const selectionLabel = selection.id === "total" ? (scope === "all" ? "All conversations" : "Shown conversations") : selection.label;
  const previewLabel = preview.id === "total" ? "All conversations in this view" : preview.label;

  return <dialog
    ref={dialogRef}
    className="pipeline-dialog"
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    aria-modal="true"
    onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }}
    onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
    }}
  >
    <div className="pipeline-header">
      <div><p className="eyebrow">Scout / Pipeline overview</p><h2 id={titleId}>Every conversation, in view.</h2></div>
      <button className="pipeline-close" autoFocus onClick={onClose} aria-label="Close pipeline overview"><span>Back to Scout</span><span aria-hidden="true">×</span></button>
    </div>
    <div className="pipeline-body">
      <div className="pipeline-intro">
        <div className="pipeline-total"><strong>{graph.total}</strong><div><span>conversations</span><p>Showing {graph.total} of {allCount}</p></div></div>
        <p id={descriptionId} className="pipeline-description"><strong>Current snapshot, not historical transitions</strong><span>Each conversation appears once per column. Flow width shows count.</span></p>
      </div>
      <div className="pipeline-toolbar">
        <div className="pipeline-segment" role="group" aria-label="Diagram scope">
          <button onClick={() => changeScope("filtered")} aria-pressed={scope === "filtered"}>Shown <span>{filteredCount}</span></button>
          <button onClick={() => changeScope("all")} aria-pressed={scope === "all"}>All conversations <span>{allCount}</span></button>
        </div>
        <div className="pipeline-segment" role="group" aria-label="Pipeline display">
          <button onClick={() => { setView("diagram"); setPreviewId(null); }} aria-pressed={view === "diagram"}><span aria-hidden="true">⌁</span> Diagram</button>
          <button onClick={() => { setView("list"); setPreviewId(null); }} aria-pressed={view === "list"}><span aria-hidden="true">≡</span> List</button>
        </div>
      </div>
      <p className="pipeline-scope-note">{scope === "filtered" ? scopeLabel ?? "Using the search and status filters in your conversation list." : "Viewing all conversations. Your original list filters are unchanged."}</p>

      {graph.total === 0 ? <div className="pipeline-empty"><span aria-hidden="true">⌁</span><h3>No conversations in this view</h3><p>Try all conversations, or return to Scout and adjust your filters.</p>{allCount > 0 && <button onClick={() => changeScope("all")}>Show all {allCount} conversations →</button>}</div> : <>
        {view === "diagram" ? <>
          <div className="pipeline-chart-scroll" tabIndex={0} role="region" aria-label="Sankey diagram. Scroll horizontally on smaller screens.">
            <svg className="pipeline-chart" viewBox={`0 0 ${layout.width} ${layout.height}`} role="group" aria-label={`Current snapshot of ${graph.total} conversations by recorded stage and current status`}>
              <title>Conversations → Current recorded stage → Current status</title>
              <text className="pipeline-column-label" x="30" y="26">01 / CONVERSATIONS</text>
              <text className="pipeline-column-label" x="430" y="26">02 / CURRENT RECORDED STAGE</text>
              <text className="pipeline-column-label" x="850" y="26">03 / CURRENT STATUS</text>
              <g className="pipeline-links">
                {layout.links.map((link) => {
                  const related = selection.id === "total" || link.recordIds.some((id) => selectedIds.has(id));
                  return <path key={link.id} d={link.path} fill={link.color} className="pipeline-link" data-related={related} data-selected={selection.id === link.id} role="button" tabIndex={0} aria-label={`${link.label}: ${link.value} conversations. Show matching conversations.`} aria-pressed={selection.id === link.id} aria-controls={resultsId} onClick={() => select(link.id)} onKeyDown={(event) => activate(event, link.id)} onMouseEnter={() => setPreviewId(link.id)} onMouseLeave={() => setPreviewId(null)} onFocus={() => setPreviewId(link.id)} onBlur={() => setPreviewId(null)}><title>{`${link.label}: ${link.value} conversations (${percent(link.value)})`}</title></path>;
                })}
              </g>
              <g className="pipeline-nodes">
                {layout.nodes.map((node) => {
                  const middle = node.y + node.height / 2;
                  const closedStage = node.kind === "stage" && node.key === "closed";
                  const related = selection.id === "total" || node.recordIds.some((id) => selectedIds.has(id));
                  return <g key={node.id} className="pipeline-node" role="button" tabIndex={0} aria-label={`${node.kind === "total" ? "Total" : node.kind === "stage" ? "Stage" : "Status"}: ${node.label}, ${node.value} conversations. Show matching conversations.`} aria-pressed={selection.id === node.id} aria-controls={resultsId} data-selected={selection.id === node.id} data-related={related} onClick={() => select(node.id)} onKeyDown={(event) => activate(event, node.id)} onMouseEnter={() => setPreviewId(node.id)} onMouseLeave={() => setPreviewId(null)} onFocus={() => setPreviewId(node.id)} onBlur={() => setPreviewId(null)}>
                    <title>{`${node.label}: ${node.value} conversations (${percent(node.value)})`}</title>
                    <rect className="pipeline-node-target" x={node.x - 10} y={middle - 23} width={node.kind === "total" ? 220 : 262} height="46" rx="4" fill="transparent" />
                    <rect className="pipeline-node-bar" x={node.x} y={node.y} width={node.width} height={node.height} fill={node.color} rx="2" />
                    <text className="pipeline-node-label" x={node.x + 22} y={middle + (closedStage ? -5 : 5)}>{closedStage ? "Closed" : node.label}</text>
                    {closedStage && <text className="pipeline-node-note" x={node.x + 22} y={middle + 15}>previous stage unspecified</text>}
                    <text className="pipeline-node-count" x={node.x + (node.kind === "total" ? 192 : 244)} y={middle + (closedStage ? -5 : 5)} textAnchor="end" fill={node.color}>{node.value}</text>
                  </g>;
                })}
              </g>
            </svg>
          </div>
          <p className="pipeline-chart-hint"><span>Click a stage, status, or flow to explore its conversations.</span><span className="pipeline-mobile-hint">Scroll sideways to explore →</span></p>
        </> : <div className="pipeline-list-view">
          {(["stage", "status", "routes"] as const).map((kind) => <section key={kind} aria-label={kind === "stage" ? "Current recorded stages" : kind === "status" ? "Current statuses" : "Stage and status connections"}>
            <h3>{kind === "stage" ? "Current recorded stage" : kind === "status" ? "Current status" : "Stage → status"}</h3>
            {(kind === "routes" ? graph.links.filter((link) => link.source !== "total") : graph.nodes.filter((node) => node.kind === kind)).map((item) => <button key={item.id} className="pipeline-list-choice" aria-pressed={selection.id === item.id} aria-controls={resultsId} onClick={() => select(item.id)} onFocus={() => setPreviewId(item.id)} onBlur={() => setPreviewId(null)}><i style={{ backgroundColor: item.color }} /><span>{item.label}</span><strong>{item.value}</strong></button>)}
          </section>)}
        </div>}

        <div className="pipeline-context" aria-live="polite" aria-atomic="true"><i style={{ backgroundColor: preview.color }} /><span>{previewLabel}</span><strong>{preview.value} <span>{preview.value === 1 ? "conversation" : "conversations"} · {percent(preview.value)} of this view</span></strong></div>
        <section className="pipeline-results" id={resultsId} aria-label="Matching conversations">
          <div className="pipeline-results-heading"><div><p className="eyebrow">Explore the records</p><h3>{selectionLabel} <span>{matches.length}</span></h3></div>{selection.id !== "total" && <button onClick={() => select("total")}>Reset selection ×</button>}</div>
          <div className="pipeline-records">{matches.map((record) => <button key={record.id} className="pipeline-record" onClick={() => onSelectOpportunity(record.id)} aria-label={`Open ${record.company}, ${record.role}`}><span className="pipeline-record-main"><strong>{record.company}</strong><span>{record.role}</span></span><span className="pipeline-record-meta"><span>{pipelineStageLabel(record.stage)}</span><span>{pipelineStatusLabel(record.status)}</span></span><span className="pipeline-record-arrow" aria-hidden="true">↗</span></button>)}</div>
        </section>
      </>}
      <p className="pipeline-footnote">“Closed” does not identify the preceding recruiting stage. This view uses recorded stages and statuses only.</p>
    </div>
  </dialog>;
}
