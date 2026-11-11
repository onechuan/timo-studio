export interface PageLane {
  id: string;
  sceneIds: string[];
}

export function pageLanePlan(
  sceneIds: string[],
  maxConcurrent: number,
): PageLane[] {
  if (sceneIds.length === 0) return [];
  const limit = Number.isFinite(maxConcurrent)
    ? Math.max(1, Math.floor(maxConcurrent))
    : 1;
  const count = Math.max(1, Math.min(limit, Math.ceil(sceneIds.length / 3)));
  const size = Math.ceil(sceneIds.length / count);
  return Array.from({ length: count }, (_, index) => ({
    id: `lane-${index + 1}`,
    sceneIds: sceneIds.slice(index * size, (index + 1) * size),
  })).filter((lane) => lane.sceneIds.length > 0);
}
