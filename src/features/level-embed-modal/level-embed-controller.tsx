import { useEffect, useMemo, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ExternalLink, X } from "lucide-react";
import { ensureShadowHost } from "~/platform/content-script/shadow-host";
import { logInfo } from "~/platform/content-script/logger";

const LEVEL_EMBED_HOST_ID = "tuf-level-helper-embed-host";
const EMBED_BASE_URL = "https://web-adofai.impl1113.dev/levels";
const PRETENDARD_FONT_STACK =
  '"Pretendard", ui-sans-serif, system-ui, sans-serif';

let root: Root | null = null;
let host: HTMLElement | null = null;
let activeLevelId: string | null = null;

export function mountOrUpdateLevelEmbedButton(levelId: string): void {
  activeLevelId = levelId;
  ensureLevelEmbedRoot();

  root?.render(<LevelEmbedRoot levelId={levelId} />);
}

export function clearLevelEmbedModal(): void {
  activeLevelId = null;
  root?.unmount();
  root = null;
  host?.remove();
  host = null;
}

export function getTuforumsLevelId(location: Location): string | null {
  if (location.hostname !== "tuforums.com") {
    return null;
  }

  const match = /^\/levels\/([^/]+)\/?$/.exec(location.pathname);
  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function LevelEmbedRoot({ levelId }: { levelId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const iframeSrc = useMemo(() => getEmbedUrl(levelId), [levelId]);

  useEffect(() => {
    setIsOpen(false);
  }, [levelId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    updateHostInteraction();
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Open embedded level viewer"
        className="pointer-events-auto fixed right-4 bottom-5 z-[2147483001] flex h-12 items-center gap-2 rounded-full bg-[#5339B2] px-5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(47,5,101,0.35)] transition hover:bg-[#6148C6] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        onClick={() => {
          logInfo("Opening embedded level viewer", { levelId, iframeSrc });
          setIsOpen(true);
        }}
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        Web ADOFAI
      </button>

      {isOpen ? (
        <div
          className="pointer-events-auto fixed inset-0 z-[2147483002] flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Embedded level viewer"
            className="relative flex aspect-video h-auto max-h-[calc(100vh-96px)] w-[min(calc(100vw-96px),calc((100vh-96px)*16/9))] overflow-hidden rounded-lg border border-white/15 bg-[#111118] shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close embedded level viewer"
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <iframe
              title="Embedded level viewer"
              src={iframeSrc}
              className="h-full w-full border-0 bg-white"
              allow="autoplay; fullscreen"
            />
          </section>
        </div>
      ) : null}
    </>
  );
}

function ensureLevelEmbedRoot(): void {
  if (root && host?.isConnected) {
    return;
  }

  const { host: nextHost, mountNode } = ensureShadowHost({
    hostId: LEVEL_EMBED_HOST_ID,
    onHostCreate: applyHostStyle,
    onMountNodeCreate: applyMountNodeStyle,
  });

  host = nextHost;
  root = createRoot(mountNode);
}

function applyHostStyle(element: HTMLElement): void {
  element.style.setProperty("position", "fixed");
  element.style.setProperty("inset", "0");
  element.style.setProperty("z-index", "2147483001");
  element.style.setProperty("pointer-events", "none");
  element.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  element.style.setProperty("font-size", "16px");
  element.style.setProperty("line-height", "1.5");
  element.style.setProperty("color-scheme", "dark");
  element.style.setProperty("--spacing", "4px");
  element.style.setProperty("--text-sm", "14px");
  element.style.setProperty("--text-sm--line-height", "20px");
}

function applyMountNodeStyle(element: HTMLElement): void {
  element.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  element.style.setProperty("font-size", "16px");
  element.style.setProperty("line-height", "1.5");
}

function updateHostInteraction(): void {
  host?.style.setProperty("pointer-events", "none");
}

function getEmbedUrl(levelId: string): string {
  return `${EMBED_BASE_URL}/${encodeURIComponent(levelId)}?embed=true`;
}
