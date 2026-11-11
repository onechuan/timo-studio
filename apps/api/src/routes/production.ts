import { Hono } from 'hono';
import { z } from 'zod';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import type { ProductionService } from '@timotv/core';
import { DomainError } from '@timotv/core';
import { filmHtml, validateFilmTiming } from '@timotv/renderer/preview';
const uuid = (s: string) => z.string().uuid().parse(s);
export function productionRoutes(service: ProductionService, root: string) {
  const app = new Hono();
  app.get('/production/capabilities', async (c) =>
    c.json(await service.getCapabilities()),
  );
  app.get('/projects/:id/production', async (c) =>
    c.json(await service.get(uuid(c.req.param('id')))),
  );
  app.post('/projects/:id/production', async (c) =>
    c.json(
      await service.create(uuid(c.req.param('id')), await c.req.json()),
      201,
    ),
  );
  app.put('/projects/:id/production', async (c) =>
    c.json(await service.update(uuid(c.req.param('id')), await c.req.json())),
  );
  app.post('/projects/:id/production/actions', async (c) =>
    c.json(await service.act(uuid(c.req.param('id')), await c.req.json()), 202),
  );
  app.get('/projects/:id/production/files/*', async (c) => {
    const id = uuid(c.req.param('id'));
    const p = await service.get(id);
    const key = decodeURIComponent(
      c.req.path.split('/production/files/')[1] || '',
    );
    const allowed = p
      ? [
          ...Object.values(p.artifacts),
          ...p.scenes.flatMap((s) => s.cues.map((q) => q.audioKey)),
          ...p.scenes.flatMap((s) => s.review?.frames.map((f) => f.key) ?? []),
        ]
      : [];
    if (!p || !allowed.includes(key) || !key.startsWith(`production/${id}/`))
      throw new DomainError('NOT_FOUND', '文件不存在', 404);
    let bytes: Buffer;
    try {
      const base = await realpath(resolve(root)),
        file = await realpath(resolve(root, key));
      if (!file.startsWith(base + sep)) throw new Error();
      bytes = await readFile(file);
    } catch {
      throw new DomainError('NOT_FOUND', '文件不存在或尚未完成', 404);
    }
    const ext = extname(key);
    // Upgrade the preview UI for existing artifacts without rewriting files or calling AI.
    // Ownership and on-disk availability have already been checked above.
    if (key === p.artifacts.preview && ext === '.html') {
      validateFilmTiming(p);
      bytes = Buffer.from(filmHtml(p));
    }
    const types: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.srt': 'application/x-subrip; charset=utf-8',
      '.mp4': 'video/mp4',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    };
    const headers = new Headers({
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': 'bytes',
    });
    if (ext === '.html')
      headers.set(
        'Content-Security-Policy',
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; media-src 'self'; img-src data:; connect-src 'none'; frame-ancestors 'self'",
      );
    else if (ext === '.srt')
      headers.set(
        'Content-Disposition',
        'attachment; filename="subtitles.srt"',
      );
    const range = c.req.header('range');
    if (range && ext !== '.html' && ext !== '.srt') {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1]
        ? Number(match[1])
        : match?.[2]
          ? Math.max(0, bytes.length - Number(match[2]))
          : NaN;
      const end =
        match?.[1] && match[2]
          ? Math.min(Number(match[2]), bytes.length - 1)
          : bytes.length - 1;
      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        end < start ||
        start >= bytes.length
      )
        return new Response(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${bytes.length}` },
        });
      headers.set('Content-Range', `bytes ${start}-${end}/${bytes.length}`);
      headers.set('Content-Length', String(end - start + 1));
      return new Response(new Uint8Array(bytes.subarray(start, end + 1)), {
        status: 206,
        headers,
      });
    }
    headers.set('Content-Length', String(bytes.length));
    return new Response(new Uint8Array(bytes), { headers });
  });
  return app;
}
