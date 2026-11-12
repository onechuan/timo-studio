import { useEffect, useState } from 'react';
import type { EditClip } from '@timotv/contracts';

export type ClipThumbs = Record<string, string[]>;

/**
 * Real frames from the film, several per clip, saved as small JPEG data URLs.
 * Trimming emits a new signature on every pointer move, so thumbnails settle
 * only after the drag pauses.
 */
export function useClipThumbnails(
  src: string,
  clips: Pick<EditClip, 'id' | 'sourceInMs' | 'sourceOutMs'>[],
): ClipThumbs {
  const [thumbnails, setThumbnails] = useState<ClipThumbs>({});
  const signature = clips
    .map((clip) => `${clip.id}:${clip.sourceInMs}:${clip.sourceOutMs}`)
    .join('|');
  const [settledSignature, setSettledSignature] = useState(signature);

  useEffect(() => {
    const timer = setTimeout(() => setSettledSignature(signature), 320);
    return () => clearTimeout(timer);
  }, [signature]);

  useEffect(() => {
    if (!src || !clips.length) {
      setThumbnails({});
      return;
    }
    let cancelled = false;
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const context = canvas.getContext('2d');
    video.muted = true;
    video.preload = 'auto';
    video.src = src;
    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };
    if (!context) return cleanup;

    const waitForSeek = (milliseconds: number) =>
      new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (ok: boolean) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          video.removeEventListener('seeked', onSeeked);
          video.removeEventListener('error', onError);
          resolve(ok);
        };
        const onSeeked = () => finish(true);
        const onError = () => finish(false);
        const timer = setTimeout(() => finish(false), 2500);
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);
        try {
          const limit = Math.max(0, (video.duration || 0) * 1000 - 80);
          video.currentTime = Math.min(milliseconds, limit) / 1000;
        } catch {
          finish(false);
        }
      });

    void (async () => {
      await new Promise<void>((resolve) => {
        const ready = () => resolve();
        if (video.readyState >= 1) return ready();
        video.addEventListener('loadedmetadata', ready, { once: true });
        video.addEventListener('error', ready, { once: true });
      });
      if (cancelled || video.readyState < 1) return cleanup();
      const next: ClipThumbs = {};
      let made = 0;
      for (const clip of clips) {
        const span = Math.max(1, clip.sourceOutMs - clip.sourceInMs);
        const count = Math.min(6, Math.max(2, Math.round(span / 4000)));
        next[clip.id] = [];
        for (let index = 0; index < count; index++) {
          if (cancelled || made >= 40) break;
          const at = clip.sourceInMs + (span * (index + 0.5)) / count;
          if (!(await waitForSeek(at))) {
            if (cancelled) return;
            continue;
          }
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          next[clip.id]!.push(canvas.toDataURL('image/jpeg', 0.66));
          made += 1;
          if (!cancelled) setThumbnails({ ...next });
        }
        if (cancelled) return;
      }
      cleanup();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // Thumbnails only need to reload when the film or cut points settle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, settledSignature]);

  return thumbnails;
}
