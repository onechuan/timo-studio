import type { Production } from '@timotv/contracts';
/** Artwork-only revisions reuse measured audio from an earlier revision of this project. */
export function projectAudioKey(p: Production): string {
  const key = p.artifacts?.audio;
  const match = key?.match(
    /^production\/([\w-]+)\/r(0|[1-9]\d*)\/(audio(?:-[a-f0-9]{24})?\.wav)$/,
  );
  if (
    !match ||
    match[1] !== p.projectId ||
    !Number.isSafeInteger(p.revision) ||
    Number(match[2]) > p.revision
  )
    throw new Error('Invalid project audio key');
  return key!;
}
export function previewAudioUrl(p: Production): string {
  const key = projectAudioKey(p);
  const [, , revision, name] = key.match(
    /^production\/([\w-]+)\/(r(?:0|[1-9]\d*))\/(audio(?:-[a-f0-9]{24})?\.wav)$/,
  )!;
  return `../${revision}/${name}`;
}
