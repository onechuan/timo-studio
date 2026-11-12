import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  EditClip,
  Production,
  ProductionCapabilities,
  StoryboardPlan,
} from '@timotv/contracts';
import { api } from '../../lib/api.js';
import { initialBrief } from './BriefFields.js';

/** Keep revisions and recovery in one place so switching studio panels never resets a job. */
export function useProduction(id: string) {
  const [doc, setDoc] = useState<Production | null>();
  const [caps, setCaps] = useState<ProductionCapabilities>();
  const [brief, setBrief] = useState(initialBrief);
  const [board, setBoard] = useState<StoryboardPlan>();
  const [script, setScript] = useState<Production['scenes']>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const reload = () => {
    setError('');
    setReloadAttempt((attempt) => attempt + 1);
  };
  const live = useRef(true);
  const path = '/projects/' + id + '/production';
  const receive = useCallback((next: Production | null) => {
    if (!live.current) return;
    setDoc(next);
    if (next) {
      setBrief(next.brief);
      setBoard(next.storyboard);
      setScript(next.scenes);
    }
  }, []);
  useEffect(() => {
    live.current = true;
    let active = true;
    Promise.all([
      api<Production | null>(path),
      api<ProductionCapabilities>('/production/capabilities'),
    ])
      .then(([next, capabilities]) => {
        if (!active) return;
        receive(next);
        setCaps(capabilities);
      })
      .catch((e: Error) => active && setError(e.message));
    return () => {
      active = false;
      live.current = false;
    };
  }, [path, receive, reloadAttempt]);
  useEffect(() => {
    if (!doc?.jobId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await api<Production>(path);
        if (!active) return;
        receive(next);
        setError('');
      } catch (e) {
        if (active) {
          setError((e as Error).message);
          timer = setTimeout(poll, 1500);
        }
      }
    };
    timer = setTimeout(poll, 1500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [doc, path, receive]);
  async function run(fn: () => Promise<Production>) {
    setBusy(true);
    setError('');
    try {
      receive(await fn());
    } catch (e) {
      if (!live.current) return;
      setError((e as Error).message);
      // A failed queue submission can still have saved a new revision server-side.
      try {
        receive(await api<Production | null>(path));
      } catch {
        /* keep original actionable error */
      }
    } finally {
      if (live.current) setBusy(false);
    }
  }
  const action = (
    action:
      | 'plan'
      | 'approve'
      | 'produce'
      | 'illustrate'
      | 'export'
      | 'edit-export'
      | 'review'
      | 'repair'
      | 'accept'
      | 'accept-duration',
    feedback?: string,
    restart?: boolean,
    sceneId?: string,
  ) =>
    run(() =>
      api<Production>(path + '/actions', {
        method: 'POST',
        body: JSON.stringify({
          revision: doc!.revision,
          action,
          ...(action === 'plan' && feedback ? { feedback } : {}),
          ...(action === 'illustrate' && restart ? { restart } : {}),
          ...(['illustrate', 'review', 'repair', 'accept'].includes(action) &&
          sceneId
            ? { sceneId }
            : {}),
        }),
      }),
    );
  const saveBrief = () =>
    run(() =>
      api<Production>(path, {
        method: doc ? 'PUT' : 'POST',
        body: JSON.stringify(doc ? { revision: doc.revision, brief } : brief),
      }),
    );
  const saveBoard = () =>
    run(() =>
      api<Production>(path, {
        method: 'PUT',
        body: JSON.stringify({ revision: doc!.revision, storyboard: board }),
      }),
    );
  const saveScript = () =>
    run(async () => {
      const saved = await api<Production>(path, {
        method: 'PUT',
        body: JSON.stringify({ revision: doc!.revision, scenes: script }),
      });
      receive(saved);
      return api<Production>(path + '/actions', {
        method: 'POST',
        body: JSON.stringify({ revision: saved.revision, action: 'produce' }),
      });
    });
  const saveEdit = (clips: EditClip[]) =>
    run(() =>
      api<Production>(path, {
        method: 'PUT',
        body: JSON.stringify({ revision: doc!.revision, edit: { clips } }),
      }),
    );
  const resetEdit = () =>
    run(() =>
      api<Production>(path, {
        method: 'PUT',
        body: JSON.stringify({ revision: doc!.revision, edit: null }),
      }),
    );
  const exportEdit = (clips: EditClip[]) =>
    run(async () => {
      const saved = await api<Production>(path, {
        method: 'PUT',
        body: JSON.stringify({ revision: doc!.revision, edit: { clips } }),
      });
      receive(saved);
      return api<Production>(path + '/actions', {
        method: 'POST',
        body: JSON.stringify({
          revision: saved.revision,
          action: 'edit-export',
        }),
      });
    });
  const file = (key: string) =>
    '/api' +
    path +
    '/files/' +
    key.split('/').map(encodeURIComponent).join('/');
  return {
    doc,
    caps,
    reload,
    brief,
    setBrief,
    board,
    setBoard,
    script,
    setScript,
    error,
    locked: busy || !!doc?.jobId,
    action,
    saveBrief,
    saveBoard,
    saveScript,
    saveEdit,
    resetEdit,
    exportEdit,
    file,
    boardDirty:
      !!doc && JSON.stringify(board) !== JSON.stringify(doc.storyboard),
    briefDirty: !!doc && JSON.stringify(brief) !== JSON.stringify(doc.brief),
  };
}
