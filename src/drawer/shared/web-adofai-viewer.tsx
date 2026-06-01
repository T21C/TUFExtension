import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { WebAdofaiIcon } from "~/drawer/shared/level-icons";
import {
  interactiveSurfaceClassName,
  softGlowBorderStyle,
} from "~/drawer/shared/level-surface";
import { ensureShadowHost } from "~/platform/content-script/shadow-host";
import { t } from "~/platform/chrome/i18n";

const WEB_ADOFAI_LEVEL_URL = "https://web-adofai.impl1113.dev/levels";
export const WEB_ADOFAI_MODAL_HOST_ID =
  "tuf-level-helper-web-adofai-modal-host";
const PRETENDARD_FONT_STACK =
  '"Pretendard", ui-sans-serif, system-ui, sans-serif';

export function WebAdofaiViewerAction({
  className = "h-12",
  levelId,
}: {
  className?: string;
  levelId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMountNode, setModalMountNode] = useState<HTMLElement | null>(
    null,
  );
  const label = t("openInWebAdofai");
  const iframeSrc = useMemo(() => {
    if (!levelId) {
      return null;
    }

    return `${WEB_ADOFAI_LEVEL_URL}/${encodeURIComponent(levelId)}?embed=true`;
  }, [levelId]);

  useEffect(() => {
    setIsOpen(false);
  }, [levelId]);

  useEffect(() => {
    if (!isOpen) {
      document.getElementById(WEB_ADOFAI_MODAL_HOST_ID)?.remove();
      setModalMountNode(null);
      return;
    }

    const { mountNode } = ensureShadowHost({
      hostId: WEB_ADOFAI_MODAL_HOST_ID,
      onHostCreate: applyModalHostStyle,
      onMountNodeCreate: applyModalMountNodeStyle,
    });

    setModalMountNode(mountNode);

    return () => {
      document.getElementById(WEB_ADOFAI_MODAL_HOST_ID)?.remove();
      setModalMountNode(null);
    };
  }, [isOpen]);

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

  if (!iframeSrc) {
    return null;
  }

  return (
    <>
      <button
        aria-label={label}
        className={`${interactiveSurfaceClassName} grid place-items-center ${className}`}
        onClick={() => setIsOpen(true)}
        style={softGlowBorderStyle}
        title={label}
        type="button"
      >
        <WebAdofaiIcon size={28} />
      </button>

      {isOpen && modalMountNode
        ? createPortal(
            <div
              className="pointer-events-auto fixed inset-0 z-[2147483003] flex items-center justify-center bg-black/70 p-4"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setIsOpen(false);
                }
              }}
            >
              <section
                aria-label={t("webAdofaiLevelViewer")}
                aria-modal="true"
                className="relative flex aspect-video h-auto max-h-[calc(100vh-96px)] w-[min(calc(100vw-96px),calc((100vh-96px)*16/9))] overflow-hidden rounded-lg border border-white/15 bg-[#111118] shadow-2xl"
                role="dialog"
              >
                <button
                  aria-label={t("closeWebAdofaiViewer")}
                  className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
                <iframe
                  allow="autoplay; fullscreen"
                  className="h-full w-full border-0 bg-white"
                  src={iframeSrc}
                  title={t("webAdofaiLevelViewer")}
                />
              </section>
            </div>,
            modalMountNode,
          )
        : null}
    </>
  );
}

function applyModalHostStyle(element: HTMLElement): void {
  element.style.setProperty("position", "fixed");
  element.style.setProperty("inset", "0");
  element.style.setProperty("z-index", "2147483003");
  element.style.setProperty("pointer-events", "none");
  element.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  element.style.setProperty("font-size", "16px");
  element.style.setProperty("line-height", "1.5");
  element.style.setProperty("color-scheme", "dark");
}

function applyModalMountNodeStyle(element: HTMLElement): void {
  element.style.setProperty("height", "100%");
  element.style.setProperty("font-family", PRETENDARD_FONT_STACK);
  element.style.setProperty("font-size", "16px");
  element.style.setProperty("line-height", "1.5");
}
