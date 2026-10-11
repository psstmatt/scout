/**
 * Role geography is evidence about a particular opportunity, never a company HQ,
 * recruiter's address, interview venue, calendar timezone, or user's home city.
 * Coordinates identify an approximate city centre, not an office address.
 */
export type GeographyRecord = { id: string; company: string; role: string };
export type GeoPoint = [number, number];
export type RolePlace = { id: string; label: string; coordinates: GeoPoint };
export type RoleLocationEvidence = { label: string; detail: string };
export type RoleGeography =
  | { kind: "located"; location: RolePlace; evidence: RoleLocationEvidence; workMode?: string }
  | { kind: "remote"; region?: string; evidence: RoleLocationEvidence }
  | { kind: "unknown"; reason?: string };
export type GeographyEvidenceMap = Readonly<Record<string, RoleGeography>>;

const seattle: RolePlace = { id: "seattle", label: "Seattle", coordinates: [47.61, -122.33] };
const losAngeles: RolePlace = { id: "los-angeles", label: "Los Angeles", coordinates: [34.05, -118.24] };

/** Public-safe evidence summaries only. Private source destinations stay out of the prototype. */
export const roleGeographyEvidence: GeographyEvidenceMap = {
  "lab37": {
    kind: "unknown", reason: "An onsite Monday–Friday arrangement is recorded, but the role city is not confirmed.",
  },
  "dialpad": {
    kind: "remote",
    evidence: { label: "Recruiter role conversation", detail: "The role was described as fully remote, with working from Seattle explicitly acceptable and no relocation required." },
  },
  "walmart": {
    kind: "located", location: { id: "bentonville", label: "Bentonville", coordinates: [36.37, -94.21] }, workMode: "Preferred location · five days onsite",
    evidence: { label: "Recruiter role conversation", detail: "Bentonville was described as the preferred role location with five days onsite. Other offices were discussed, but no alternate placement was confirmed." },
  },
  "applied-intuition": {
    kind: "located", location: { id: "sunnyvale", label: "Sunnyvale", coordinates: [37.37, -122.04] }, workMode: "Five days onsite",
    evidence: { label: "Agency role conversation", detail: "The agency-introduced defense role was described as Sunnyvale-based, onsite five days a week." },
  },
  "bank-of-america-career-call": {
    kind: "located", location: seattle, workMode: "Hybrid · four days initially",
    evidence: { label: "Recruiter role conversation", detail: "The Staff Product Designer role was described as Seattle-based, with four office days for the first six months and three thereafter." },
  },
  "hubscale-principal-product-designer": {
    kind: "located", location: { id: "maple-valley", label: "Maple Valley · Seattle area", coordinates: [47.39, -122.05] }, workMode: "Hybrid · three days onsite",
    evidence: { label: "Recruiter role conversation · Oct 2", detail: "The recruiter identified the client as based in Maple Valley, in the Seattle area, with three days a week onsite." },
  },
  "grove-collaborative": {
    kind: "remote",
    evidence: { label: "Role conversation · Sep 8", detail: "The role was explicitly described as fully remote." },
  },
  "calm-principal-product-designer": {
    kind: "remote", region: "United States",
    evidence: { label: "Role description · Sep 23", detail: "The role was described as remote-first, anywhere in the United States." },
  },
  "apfm": {
    kind: "remote",
    evidence: { label: "Role conversation · Sep 29", detail: "The role was described as remote with quarterly team offsites. No home-office city was specified." },
  },
  "ezcater-principal-supply": {
    kind: "remote",
    evidence: { label: "Application receipt", detail: "The application receipt explicitly names the role Principal Product Designer, Supply (Remote)." },
  },
  "coupang": {
    kind: "unknown", reason: "The openings were described as Korea-based, but a specific role city is not recorded.",
  },
  "starbucks-digital-ux": {
    kind: "located", location: seattle,
    evidence: { label: "Recorded role title", detail: "The Digital UX & Design role is explicitly labelled Seattle in the application record." },
  },
  "housing-connector-senior-product-designer": {
    kind: "located", location: seattle,
    evidence: { label: "Recorded role title", detail: "The Senior Product Designer role is explicitly labelled Seattle in the application record." },
  },
  "atoms-otter-platform-designer": {
    kind: "located", location: losAngeles, workMode: "Five days in the office",
    evidence: { label: "Recruiter role description · Sep 14", detail: "The recruiter described this platform role as Los Angeles-based with a five-day office expectation." },
  },
};

export type GeographyEntry = { record: GeographyRecord; geography: RoleGeography; groupId: string };
export type GeographyGroup = { id: string; kind: RoleGeography["kind"]; label: string; recordIds: string[]; location?: RolePlace };
export type GeographySnapshot = {
  records: GeographyRecord[];
  entries: GeographyEntry[];
  groups: GeographyGroup[];
  total: number;
  counts: { located: number; remote: number; unknown: number };
};
export type GlobePreset = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  markers: Array<{ id: string; location: GeoPoint; size: number; color: string; label: string; count: number }>;
  arcs: Array<{ from: GeoPoint; to: GeoPoint }>;
};

const unknown: RoleGeography = { kind: "unknown", reason: "No role-specific location has been recorded." };
const hasOwn = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

/** Invalid evidence never becomes a pin, and absent data never becomes remote. */
export function roleGeographyFor(id: string, evidence: GeographyEvidenceMap = roleGeographyEvidence): RoleGeography {
  const value = hasOwn(evidence, id) ? evidence[id] : undefined;
  if (!value) return unknown;
  if (value.kind === "unknown") return value;
  if (!value.evidence?.label?.trim() || !value.evidence?.detail?.trim()) return unknown;
  if (value.kind === "remote") return value;
  if (value.kind !== "located") return unknown;
  const place = value.location;
  if (!place?.id?.trim() || !place.label?.trim() || !Array.isArray(place.coordinates) || place.coordinates.length !== 2) return unknown;
  const [latitude, longitude] = place.coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return unknown;
  return value;
}

/** Each unique opportunity appears in exactly one group, so all counts are additive. */
export function buildGeography(input: readonly GeographyRecord[], evidence: GeographyEvidenceMap = roleGeographyEvidence): GeographySnapshot {
  const byId = new Map<string, GeographyRecord>();
  for (const record of input) if (!byId.has(record.id)) byId.set(record.id, record);
  const records = [...byId.values()];
  const groups = new Map<string, GeographyGroup>();
  const counts = { located: 0, remote: 0, unknown: 0 };
  const entries = records.map((record): GeographyEntry => {
    const geography = roleGeographyFor(record.id, evidence);
    counts[geography.kind] += 1;
    // Coordinates are part of the identity so conflicting city IDs cannot silently
    // merge distinct positions. The authored place ID otherwise keeps labels stable.
    const groupId = geography.kind === "located"
      ? `place:${geography.location.id}:${geography.location.coordinates.join(",")}`
      : geography.kind;
    let group = groups.get(groupId);
    if (!group) {
      group = { id: groupId, kind: geography.kind, label: geography.kind === "located" ? geography.location.label : geography.kind === "remote" ? "Remote" : "Location unknown", recordIds: [], ...(geography.kind === "located" ? { location: geography.location } : {}) };
      groups.set(groupId, group);
    }
    group.recordIds.push(record.id);
    return { record, geography, groupId };
  });
  const order = { located: 0, remote: 1, unknown: 2 };
  return { total: records.length, records, entries, counts, groups: [...groups.values()].sort((a, b) => order[a.kind] - order[b.kind] || b.recordIds.length - a.recordIds.length || a.label.localeCompare(b.label)) };
}

export function geographyMatches(snapshot: GeographySnapshot, groupId = "all") {
  if (groupId === "all") return snapshot.entries;
  if (groupId === "located") return snapshot.entries.filter((entry) => entry.geography.kind === "located");
  return snapshot.entries.filter((entry) => entry.groupId === groupId);
}

/** Explicit focus wins; selecting an unlocated role never borrows another role's pin. */
export function geographyPreset(snapshot: GeographySnapshot, selectedOpportunityId?: string, focusGroupId = "all"): GlobePreset {
  const places = snapshot.groups.filter((group) => group.location);
  const selectedEntry = snapshot.entries.find((entry) => entry.record.id === selectedOpportunityId);
  const focusedGroup = snapshot.groups.find((group) => group.id === focusGroupId && group.location);
  const selectedGroup = focusGroupId === "all" ? places.find((group) => group.id === selectedEntry?.groupId) : undefined;
  const focus = focusedGroup ?? selectedGroup;
  // A spherical average avoids a false Greenwich centre for places around the date line.
  const vectors = places.reduce((sum, group) => {
    const [latitude, longitude] = group.location!.coordinates.map((angle) => angle * Math.PI / 180);
    const weight = group.recordIds.length;
    return [sum[0] + Math.cos(latitude) * Math.cos(longitude) * weight, sum[1] + Math.cos(latitude) * Math.sin(longitude) * weight, sum[2] + Math.sin(latitude) * weight];
  }, [0, 0, 0]);
  const length = Math.hypot(...vectors);
  const overview: GeoPoint = length > .001 ? [Math.atan2(vectors[2], Math.hypot(vectors[0], vectors[1])) * 180 / Math.PI, Math.atan2(vectors[1], vectors[0]) * 180 / Math.PI] : [20, -30];
  const [latitude, longitude] = focus?.location?.coordinates ?? overview;
  return {
    id: `roles:${focus?.id ?? "overview"}:${places.map((place) => `${place.id}=${place.recordIds.length}`).join(";")}`,
    title: focus?.label ?? "Documented role locations",
    description: `${snapshot.counts.located} of ${snapshot.total} shown conversations have a documented city. Remote and unknown locations have no geographic pin.`,
    latitude, longitude,
    markers: places.map((group) => ({ id: group.id, location: [...group.location!.coordinates], label: group.label, count: group.recordIds.length, size: Math.min(.095, .035 + Math.sqrt(group.recordIds.length) * .012) + (focus?.id === group.id ? .015 : 0), color: focus ? focus.id === group.id ? "#efa6c2" : "#92988b" : "#bfcaa6" })),
    arcs: [],
  };
}

export function geographySummary(geography: RoleGeography) {
  if (geography.kind === "located") return `${geography.location.label}${geography.workMode ? ` · ${geography.workMode}` : ""}`;
  if (geography.kind === "remote") return `Remote${geography.region ? ` · ${geography.region}` : ""}`;
  return "Location unknown";
}
