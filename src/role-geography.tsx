"use client";

import { Button } from "./ui/button";

import { useId, useMemo, useState } from "react";
import { Globe } from "./globe";
import { buildGeography, geographyMatches, geographyPreset, geographySummary, type GeographyEvidenceMap, type GeographyRecord } from "./geography-data";

type RoleGeographyProps = {
  filteredOpportunities: readonly GeographyRecord[];
  selectedOpportunityId?: string;
  onSelectOpportunity: (id: string) => void;
  locationEvidence?: GeographyEvidenceMap;
};

export function RoleGeography({ filteredOpportunities, selectedOpportunityId, onSelectOpportunity, locationEvidence }: RoleGeographyProps) {
  const id = useId();
  const snapshot = useMemo(() => buildGeography(filteredOpportunities, locationEvidence), [filteredOpportunities, locationEvidence]);
  const scope = snapshot.records.map((record) => record.id).join("\0");
  const selectedEntry = snapshot.entries.find((entry) => entry.record.id === selectedOpportunityId);
  const [focus, setFocus] = useState<{ scope: string; selectedId?: string; groupId: string } | null>(null);
  // A previous local focus cannot outlive a changed external selection or filter scope.
  const rememberedFocus = focus?.scope === scope && focus.selectedId === selectedOpportunityId ? focus.groupId : undefined;
  const groupId = String(rememberedFocus ?? selectedEntry?.groupId ?? "all");
  const activeGroup = snapshot.groups.find((group) => group.id === groupId);
  const activeLabel = activeGroup?.label ?? (groupId === "located" ? "Documented cities" : "All shown conversations");
  const matches = geographyMatches(snapshot, groupId);
  const sortedMatches = [...matches].sort((a, b) => Number(b.record.id === selectedOpportunityId) - Number(a.record.id === selectedOpportunityId) || a.record.company.localeCompare(b.record.company));
  const preset = useMemo(() => geographyPreset(snapshot, selectedOpportunityId, groupId), [snapshot, selectedOpportunityId, groupId]);
  const selectGroup = (nextGroup: string) => setFocus({ scope, selectedId: selectedOpportunityId, groupId: nextGroup });

  return <section className="role-geography globe-workspace" aria-labelledby={`${id}-title`} aria-describedby={`${id}-note`}>
    <div className="geography-heading"><div><p className="eyebrow">Same search + filters</p><h2 id={`${id}-title`}>Role locations</h2></div><span>{snapshot.total} shown</span></div>
    <Globe preset={preset} />
    <div className="geography-counts" role="group" aria-label="Geography groups">
      {([['located', 'With a city', '●'], ['remote', 'Remote', '↗'], ['unknown', 'Unknown', '?']] as const).map(([kind, label, symbol]) => <Button variant="scout" size="scout" key={kind} type="button" data-kind={kind} aria-pressed={groupId === kind || (kind === "located" && activeGroup?.kind === "located")} disabled={snapshot.counts[kind] === 0} onClick={() => selectGroup(kind)} aria-controls={`${id}-list`}><span><i aria-hidden="true">{symbol}</i>{label}</span><strong>{snapshot.counts[kind]}</strong></Button>)}
    </div>
    <p id={`${id}-note`} className="geography-note">Only documented role locations get a pin. Remote and unknown stay unpinned. Company offices and interview venues aren’t role locations.</p>
    <div className="geography-places" role="group" aria-label="Focus a documented role location">
      <Button variant="scout" size="scout" type="button" aria-pressed={groupId === "all"} onClick={() => selectGroup("all")} aria-controls={`${id}-list`}>All shown <span>{snapshot.total}</span></Button>
      {snapshot.groups.filter((group) => group.kind === "located").map((group) => <Button variant="scout" size="scout" key={group.id} type="button" className="geography-place" aria-pressed={groupId === group.id} onClick={() => selectGroup(group.id)} aria-controls={`${id}-list`}><i aria-hidden="true" />{group.label} <span>{group.recordIds.length}</span></Button>)}
    </div>
    <div className="geography-focus" aria-live="polite" aria-atomic="true">
      {snapshot.total === 0 ? <p>No conversations match these filters. No locations are plotted.</p> : selectedEntry ? <><strong>{selectedEntry.record.company} · {geographySummary(selectedEntry.geography)}</strong><p>{selectedEntry.geography.kind === "unknown" ? selectedEntry.geography.reason ?? "No role-specific location has been recorded." : selectedEntry.geography.evidence.detail}</p>{selectedEntry.geography.kind !== "located" && snapshot.counts.located > 0 ? <p>The pins show other documented roles in this filtered view.</p> : null}</> : selectedOpportunityId ? <p>The selected conversation is outside these filters. The globe only includes the {snapshot.total} shown here.</p> : <p>{snapshot.counts.located === 0 ? "No documented cities in this view yet." : `${snapshot.counts.located} conversation${snapshot.counts.located === 1 ? "" : "s"} across ${snapshot.groups.filter((group) => group.kind === "located").length} documented ${snapshot.groups.filter((group) => group.kind === "located").length === 1 ? "city" : "cities"}.`} Each conversation is counted once.</p>}
    </div>
    {snapshot.total > 0 ? <details className="geography-details" key={`${scope}:${groupId}`} open={groupId !== "all"}>
      <summary>{activeLabel}<span>{matches.length} <span className="sr-only">conversations</span><span aria-hidden="true">↗</span></span></summary>
      <ul id={`${id}-list`} className="geography-role-list" aria-label={`${activeLabel}, matching conversations`}>
        {sortedMatches.map(({ record, geography }) => <li key={record.id}><Button variant="scout" size="scout" type="button" aria-pressed={record.id === selectedOpportunityId} aria-label={`Open ${record.company}, ${record.role}`} onClick={() => onSelectOpportunity(record.id)}><span><strong>{record.company}</strong><small>{record.role}</small></span><em>{geographySummary(geography)}</em></Button></li>)}
      </ul>
    </details> : <div id={`${id}-list`} className="geography-empty">Try a different search or clear a filter.</div>}
  </section>;
}
