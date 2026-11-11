import type {
  Production,
  ProductionFailureContext,
  ProductionPhase,
  ReviewIssue,
} from '@timotv/contracts';
import { ProductionFailureError } from '@timotv/core';
import { access } from 'node:fs/promises';
import {
  chromium,
  type Browser,
  type BrowserType,
  type LaunchOptions,
  type Page,
} from 'playwright-core';
import { browserMeasureScript } from './browser-measure-script.js';
import { filmHtml } from './preview.js';

export interface ReviewMeasureInput {
  atMs: number;
  decorativeIds: string[];
}

export interface BrowserRenderResult {
  thrown: string | null;
  engine: { page?: string; message?: string }[];
  pageErrors: string[];
}

export interface BrowserRuntimePage {
  renderAt(timeMs: number): Promise<BrowserRenderResult>;
  measure(input: ReviewMeasureInput): Promise<ReviewIssue[]>;
  screenshot(path: string): Promise<void>;
  close(): Promise<void>;
}

export interface BrowserRuntime {
  preflight(): Promise<void>;
  newFilmPage(
    production: Production,
    signal?: AbortSignal,
  ): Promise<BrowserRuntimePage>;
  close(): Promise<void>;
}

export interface BrowserRuntimeOptions {
  phase?: ProductionPhase;
  context?: ProductionFailureContext;
  executablePath?: string;
  headless?: boolean;
  timeoutMs?: number;
  launch?: (options: LaunchOptions) => Promise<Browser>;
}

const chromeCandidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

async function findChrome(explicit?: string): Promise<string> {
  for (const candidate of [
    explicit,
    process.env.CHROME_PATH,
    ...chromeCandidates,
  ]) {
    if (!candidate) continue;
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error('Chrome not found; set CHROME_PATH');
}

function runtimeCode(phase: ProductionPhase) {
  if (phase === 'reviewing') return 'REVIEW_BROWSER_RUNTIME_FAILED';
  if (phase === 'rendering') return 'RENDER_BROWSER_RUNTIME_FAILED';
  return 'BROWSER_RUNTIME_FAILED';
}

function runtimeFailure(
  phase: ProductionPhase,
  context: ProductionFailureContext | undefined,
  operation: string,
  error: unknown,
) {
  const aborted = error instanceof DOMException && error.name === 'AbortError';
  const timeout =
    error instanceof Error && /timeout|timed out/i.test(error.message);
  const label =
    operation === 'discover'
      ? '未找到可用 Chrome'
      : operation === 'launch'
        ? '无法启动 Chrome'
        : operation === 'page'
          ? '无法初始化渲染页面'
          : operation === 'evaluate'
            ? '页面执行失败'
            : operation === 'screenshot'
              ? '截图失败'
              : '运行失败';
  return new ProductionFailureError(
    {
      code: runtimeCode(phase),
      phase,
      retryable: !aborted,
      publicMessage: aborted
        ? '浏览器任务已取消，可重新发起'
        : `${label}${timeout ? '（超时）' : ''}，请重试；若持续失败，请检查浏览器诊断`,
      context,
    },
    {
      cause: new Error(
        `[${operation}] ${error instanceof Error ? error.message : String(error)}`,
      ),
    },
  );
}

export function createBrowserRuntime(
  options: BrowserRuntimeOptions = {},
): BrowserRuntime {
  const phase = options.phase ?? 'rendering';
  const launch =
    options.launch ??
    ((launchOptions: LaunchOptions) =>
      (chromium as BrowserType).launch(launchOptions));
  let browser: Browser | undefined;
  let opening: Promise<Browser> | undefined;
  const pages = new Set<Page>();

  const getBrowser = async () => {
    if (browser?.isConnected()) return browser;
    if (!opening)
      opening = (async () => {
        let executablePath: string;
        try {
          executablePath = await findChrome(options.executablePath);
        } catch (error) {
          throw runtimeFailure(phase, options.context, 'discover', error);
        }
        try {
          browser = await launch({
            executablePath,
            headless: options.headless ?? true,
            timeout: options.timeoutMs ?? 15_000,
          });
          return browser;
        } catch (error) {
          throw runtimeFailure(phase, options.context, 'launch', error);
        } finally {
          opening = undefined;
        }
      })();
    return opening;
  };

  return {
    async preflight() {
      await getBrowser();
    },

    async newFilmPage(production, signal) {
      signal?.throwIfAborted();
      const current = await getBrowser();
      let page: Page;
      try {
        page = await current.newPage({
          viewport:
            production.aspectRatio === '9:16'
              ? { width: 1080, height: 1920 }
              : { width: 1920, height: 1080 },
          deviceScaleFactor: 1,
        });
        pages.add(page);
        page.setDefaultTimeout(options.timeoutMs ?? 15_000);
        await page.route('**/*', (route) => route.abort());
        await page.setContent(
          filmHtml(production, {
            mode: phase === 'reviewing' ? 'review' : 'export',
          }),
        );
        await page.addScriptTag({ content: browserMeasureScript });
        await page.evaluate(
          'Promise.resolve(globalThis.__ready ?? document.fonts.ready)',
        );
      } catch (error) {
        throw runtimeFailure(phase, options.context, 'page', error);
      }

      const pageErrors: string[] = [];
      page.on('pageerror', (error) =>
        pageErrors.push(error.message.slice(0, 600)),
      );
      const closeForAbort = () => void page.close().catch(() => {});
      signal?.addEventListener('abort', closeForAbort, { once: true });

      const evaluate = async <T>(expression: string): Promise<T> => {
        signal?.throwIfAborted();
        try {
          return (await page.evaluate(expression)) as T;
        } catch (error) {
          throw runtimeFailure(phase, options.context, 'evaluate', error);
        }
      };
      let closed = false;
      const close = async () => {
        if (closed) return;
        closed = true;
        signal?.removeEventListener('abort', closeForAbort);
        pages.delete(page);
        await page.close().catch(() => {});
      };

      return {
        async renderAt(timeMs) {
          if (!Number.isFinite(timeMs) || timeMs < 0)
            throw new Error('Invalid render time');
          const result = await evaluate<
            Omit<BrowserRenderResult, 'pageErrors'>
          >(
            `globalThis.TIMO_BROWSER_RUNTIME.renderAt(${JSON.stringify(timeMs)})`,
          );
          return { ...result, pageErrors: pageErrors.splice(0) };
        },
        measure(input) {
          return evaluate<ReviewIssue[]>(
            `globalThis.TIMO_BROWSER_RUNTIME.measure(${JSON.stringify(input)})`,
          );
        },
        async screenshot(path) {
          signal?.throwIfAborted();
          try {
            if (phase === 'reviewing')
              // Chrome can rasterize freshly replaced SVG text differently in
              // the same compositor tick. Let it settle before determinism captures.
              await new Promise((resolve) => setTimeout(resolve, 100));
            await page.screenshot({ path });
          } catch (error) {
            throw runtimeFailure(phase, options.context, 'screenshot', error);
          }
        },
        close,
      };
    },

    async close() {
      await Promise.all([...pages].map((page) => page.close().catch(() => {})));
      pages.clear();
      if (browser) await browser.close().catch(() => {});
      browser = undefined;
    },
  };
}
