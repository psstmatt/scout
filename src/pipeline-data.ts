import { stageMeta, statusMeta, type Stage, type Status } from "./interview-data";

/** The diagram only reads the current snapshot, never inferring a recruiting history. */
export type PipelineRecord = {
  id: string;
  company: string;
  role: string;
  stage?: string | null;
  status?: string | null;
  lastTouch?: string;
};

export type PipelineNode = {
  id: string;
  kind: "total" | "stage" | "status";
  key: string;
  label: string;
  color: string;
  value: number;
  recordIds: string[];
};

export type PipelineLink = {
  id: string;
  source: string;
  target: string;
  label: string;
  color: string;
  value: number;
  recordIds: string[];
};

export type PipelineGraph = {
  total: number;
  records: PipelineRecord[];
  nodes: PipelineNode[];
  links: PipelineLink[];
};

const stageOrder = ["applied", "screen", "interview", "portfolio", "decision", "closed", "unknown"];
const statusOrder = ["signed", "action", "scheduled", "waiting", "paused", "applied", "closed", "unknown"];
const stageColors: Record<string, string> = {
  applied: "#a7b7cb",
  screen: "#bfcaa6",
  interview: "#efa6c2",
  portfolio: "#c4b2d5",
  decision: "#dbc190",
  closed: "#a6a6a0",
  unknown: "#c0b7a9",
};

const hasOwn = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

export function pipelineStageLabel(stage?: string | null) {
  if (stage === "closed") return "Closed / previous stage unspecified";
  return stage && hasOwn(stageMeta, stage) ? stageMeta[stage as Stage].label : "Stage unknown";
}

export function pipelineStatusLabel(status?: string | null) {
  return status && hasOwn(statusMeta, status) ? statusMeta[status as Status].label : "Status unknown";
}

function stageKey(value?: string | null) {
  return value && hasOwn(stageMeta, value) ? value : "unknown";
}

function statusKey(value?: string | null) {
  return value && hasOwn(statusMeta, value) ? value : "unknown";
}

/** Duplicate IDs count once; the first record is authoritative, matching app selection. */
export function buildPipeline(input: readonly PipelineRecord[]): PipelineGraph {
  const byId = new Map<string, PipelineRecord>();
  for (const record of input) if (!byId.has(record.id)) byId.set(record.id, record);
  const records = [...byId.values()];
  const total: PipelineNode = { id: "total", kind: "total", key: "total", label: "Conversations", color: "#e2ddd3", value: records.length, recordIds: records.map((item) => item.id) };
  if (!records.length) return { total: 0, records, nodes: [total], links: [] };

  const stages = stageOrder.flatMap((key): PipelineNode[] => {
    const recordIds = records.filter((item) => stageKey(item.stage) === key).map((item) => item.id);
    return recordIds.length ? [{ id: `stage:${key}`, kind: "stage", key, label: pipelineStageLabel(key), color: stageColors[key], value: recordIds.length, recordIds }] : [];
  });
  const statuses = statusOrder.flatMap((key): PipelineNode[] => {
    const recordIds = records.filter((item) => statusKey(item.status) === key).map((item) => item.id);
    const color = key === "unknown" ? "#c0b7a9" : statusMeta[key as Status].color;
    return recordIds.length ? [{ id: `status:${key}`, kind: "status", key, label: pipelineStatusLabel(key), color, value: recordIds.length, recordIds }] : [];
  });
  const links: PipelineLink[] = stages.map((stage) => ({ id: `total>${stage.id}`, source: total.id, target: stage.id, label: `Conversations → ${stage.label}`, color: stage.color, value: stage.value, recordIds: [...stage.recordIds] }));
  for (const stage of stages) {
    for (const status of statuses) {
      const statusIds = new Set(status.recordIds);
      const recordIds = stage.recordIds.filter((id) => statusIds.has(id));
      if (recordIds.length) links.push({ id: `${stage.id}>${status.id}`, source: stage.id, target: status.id, label: `${stage.label} → ${status.label}`, color: stage.color, value: recordIds.length, recordIds });
    }
  }
  return { total: records.length, records, nodes: [total, ...stages, ...statuses], links };
}

export function pipelineMatches(graph: PipelineGraph, selectionId: string = "total") {
  const selection = graph.nodes.find((node) => node.id === selectionId) ?? graph.links.find((link) => link.id === selectionId);
  const ids = new Set(selection?.recordIds ?? []);
  return graph.records.filter((record) => ids.has(record.id));
}

export type PositionedPipelineNode = PipelineNode & { x: number; y: number; height: number; width: number };
export type PositionedPipelineLink = PipelineLink & { path: string; centerPath: string; thickness: number };

/** One shared scale for all ribbons and bars preserves exact count proportions. */
export function layoutPipeline(graph: PipelineGraph) {
  const scale = graph.total ? 240 / graph.total : 0;
  const gap = 10;
  const minimumSlot = 46;
  const top = 50;
  const columns = ["total", "stage", "status"] as const;
  const columnNodes = columns.map((kind) => graph.nodes.filter((node) => node.kind === kind));
  const columnHeight = (nodes: PipelineNode[]) => nodes.reduce((sum, node) => sum + Math.max(minimumSlot, node.value * scale), 0) + Math.max(0, nodes.length - 1) * gap;
  const contentHeight = Math.max(240, ...columnNodes.map(columnHeight));
  const x = [30, 430, 850];
  const nodes: PositionedPipelineNode[] = [];
  columnNodes.forEach((column, index) => {
    let cursor = top + (contentHeight - columnHeight(column)) / 2;
    for (const node of column) {
      const height = node.value * scale;
      const slot = Math.max(minimumSlot, height);
      nodes.push({ ...node, x: x[index], y: cursor + (slot - height) / 2, width: 10, height });
      cursor += slot + gap;
    }
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();
  const links: PositionedPipelineLink[] = graph.links.map((link) => {
    const source = byId.get(link.source)!;
    const target = byId.get(link.target)!;
    const thickness = link.value * scale;
    const sourceY = source.y + (sourceOffsets.get(source.id) ?? 0);
    const targetY = target.y + (targetOffsets.get(target.id) ?? 0);
    const sourceX = source.x + source.width;
    const targetX = target.x;
    const curve = (targetX - sourceX) * .46;
    sourceOffsets.set(source.id, (sourceOffsets.get(source.id) ?? 0) + thickness);
    targetOffsets.set(target.id, (targetOffsets.get(target.id) ?? 0) + thickness);
    const path = `M ${sourceX},${sourceY} C ${sourceX + curve},${sourceY} ${targetX - curve},${targetY} ${targetX},${targetY} L ${targetX},${targetY + thickness} C ${targetX - curve},${targetY + thickness} ${sourceX + curve},${sourceY + thickness} ${sourceX},${sourceY + thickness} Z`;
    const centerPath = `M ${sourceX},${sourceY + thickness / 2} C ${sourceX + curve},${sourceY + thickness / 2} ${targetX - curve},${targetY + thickness / 2} ${targetX},${targetY + thickness / 2}`;
    return { ...link, thickness, path, centerPath };
  });
  return { width: 1120, height: contentHeight + top + 20, scale, nodes, links };
}
