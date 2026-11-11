import type { Production } from '@timotv/contracts';
import { posix } from 'node:path';
/** Artwork-only revisions reuse measured audio from an earlier revision of this project. */
export function projectAudioKey(p: Production): string {
  const key = p.artifacts?.audio;
  const projectPrefix = `production/${p.projectId}/`;
  const relative = key?.startsWith(projectPrefix)
    ? key.slice(projectPrefix.length)
    : undefined;
  const segments = relative?.split('/');
  const revision = relative?.match(/^r(0|[1-9]\d*)\//)?.[1];
  if (
    !/^[\w-]+$/.test(p.projectId) ||
    !key ||
    !relative ||
    !segments?.length ||
    segments.some(
      (segment) =>
        !segment ||
        segment === '.' ||
        segment === '..' ||
        !/^[A-Za-z0-9_.-]+$/.test(segment),
    ) ||
    !segments.at(-1)?.endsWith('.wav') ||
    !Number.isSafeInteger(p.revision) ||
    p.revision < 0 ||
    (revision !== undefined && Number(revision) > p.revision)
  )
    throw new Error('Invalid project audio key');
  return key;
}
export function previewAudioUrl(p: Production): string {
  const key = projectAudioKey(p);
  return posix.relative(`production/${p.projectId}/r${p.revision}`, key);
}
